import { Request, Response } from "express";
import { supabase } from "../config";
import { AttendanceEvent } from "../models/attendance.model";
import { asyncHandler, AppError } from "../middleware/error.middleware";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const receiveAttendanceEvent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const currentUser = req.user!;
    const attendanceEvent: AttendanceEvent = req.body;

    // Only admins and teachers can receive attendance events
    if (!["admin", "teacher"].includes(currentUser.role)) {
      throw new AppError("Access denied", 403);
    }

    if (
      !attendanceEvent.class_id ||
      !attendanceEvent.timestamp ||
      !attendanceEvent.students
    ) {
      throw new AppError(
        "Class ID, timestamp, and students data are required",
        400
      );
    }

    try {
      // Store attendance event
      const { data: event, error: eventError } = await supabase
        .from("attendance_events")
        .insert({
          class_id: attendanceEvent.class_id,
          timestamp: attendanceEvent.timestamp,
          students: attendanceEvent.students,
          recorded_by: currentUser.id,
        })
        .select()
        .single();

      if (eventError) {
        throw new AppError("Failed to store attendance event", 500);
      }

      // Update student attendance rates
      const studentIds = attendanceEvent.students.map((s) => s.user_id);
      const { data: students, error: studentsError } = await supabase
        .from("users")
        .select("id, attendance_rate")
        .in("id", studentIds);

      if (studentsError) {
        throw new AppError("Failed to fetch student data", 500);
      }

      // Calculate updated attendance rates
      const updates = await Promise.all(
        students?.map(async (student) => {
          // Get all attendance events for this student
          const { data: allEvents, error: eventsError } = await supabase
            .from("attendance_events")
            .select("students")
            .contains("students", [{ user_id: student.id }]);

          if (eventsError) {
            return null;
          }

          // Calculate attendance rate
          let presentCount = 0;
          let totalCount = 0;

          allEvents?.forEach((event) => {
            const studentRecord = event.students.find(
              (s: any) => s.user_id === student.id
            );
            if (studentRecord) {
              totalCount++;
              if (studentRecord.status === "present") {
                presentCount++;
              }
            }
          });

          const attendanceRate =
            totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

          // Update user attendance rate
          const { error: updateError } = await supabase
            .from("users")
            .update({ attendance_rate: attendanceRate })
            .eq("id", student.id);

          return updateError
            ? null
            : { id: student.id, attendance_rate: attendanceRate };
        }) || []
      );

      // Filter out failed updates
      const successfulUpdates = updates.filter((update) => update !== null);

      res.json({
        status: "success",
        data: {
          event,
          updated_students: successfulUpdates,
        },
      });
    } catch (error) {
      throw new AppError("Failed to process attendance event", 500);
    }
  }
);

export const getAttendanceStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { student_id, class_id, date_from, date_to } = req.query;
    const currentUser = req.user!;

    let query = supabase
      .from("attendance_events")
      .select("*")
      .order("timestamp", { ascending: false });

    // Apply filters
    if (student_id) {
      query = query.contains("students", [{ user_id: student_id }]);
    }
    if (class_id) {
      query = query.eq("class_id", class_id);
    }
    if (date_from) {
      query = query.gte("timestamp", date_from);
    }
    if (date_to) {
      query = query.lte("timestamp", date_to);
    }

    // Students can only see their own attendance
    if (currentUser.role === "student") {
      query = query.contains("students", [{ user_id: currentUser.id }]);
    }

    const { data: events, error } = await query;

    if (error) {
      throw new AppError("Failed to fetch attendance data", 500);
    }

    // Calculate statistics
    const stats = new Map<string, any>();

    events?.forEach((event) => {
      event.students.forEach((student: any) => {
        if (!stats.has(student.user_id)) {
          stats.set(student.user_id, {
            user_id: student.user_id,
            total_classes: 0,
            present_count: 0,
            absent_count: 0,
            late_count: 0,
            excused_count: 0,
            attendance_rate: 0,
          });
        }

        const userStats = stats.get(student.user_id);
        userStats.total_classes++;

        switch (student.status) {
          case "present":
            userStats.present_count++;
            break;
          case "absent":
            userStats.absent_count++;
            break;
          case "late":
            userStats.late_count++;
            break;
          case "excused":
            userStats.excused_count++;
            break;
        }
      });
    });

    // Calculate attendance rates
    stats.forEach((userStats) => {
      userStats.attendance_rate =
        userStats.total_classes > 0
          ? (userStats.present_count / userStats.total_classes) * 100
          : 0;
    });

    res.json({
      status: "success",
      data: {
        stats: Array.from(stats.values()),
        events: events || [],
      },
    });
  }
);
