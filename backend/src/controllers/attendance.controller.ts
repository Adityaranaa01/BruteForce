import { Request, Response } from "express";
import { supabase } from "../config";
import { asyncHandler, AppError } from "../middleware/error.middleware";
import {
  Attendance,
  CreateAttendanceRequest,
  AttendanceStats,
  BulkAttendanceRequest,
} from "../models/attendance.model";

export const getAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const { usn, course_id, date, page = 1, limit = 10 } = req.query;

    let query = supabase
      .from("attendance")
      .select("*", { count: "exact" })
      .order("date", { ascending: false });

    // Apply filters
    if (usn) {
      query = query.eq("usn", usn);
    }
    if (course_id) {
      query = query.eq("course_id", course_id);
    }
    if (date) {
      query = query.eq("date", date);
    }

    // Apply pagination
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;
    query = query.range(from, to);

    const { data: attendance, error, count } = await query;

    if (error) {
      throw new AppError("Failed to fetch attendance", 500);
    }

    res.json({
      success: true,
      data: attendance,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  }
);

export const createAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const attendanceData: CreateAttendanceRequest = req.body;

    // Validate required fields
    if (
      !attendanceData.usn ||
      !attendanceData.course_id ||
      !attendanceData.status
    ) {
      throw new AppError("USN, course ID, and status are required", 400);
    }

    const { data: attendance, error } = await supabase
      .from("attendance")
      .insert(attendanceData)
      .select()
      .single();

    if (error) {
      throw new AppError("Failed to create attendance record", 500);
    }

    res.status(201).json({
      success: true,
      data: attendance,
    });
  }
);

export const createBulkAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const bulkData: BulkAttendanceRequest = req.body;

    // Validate required fields
    if (!bulkData.course_id || !bulkData.date || !bulkData.students?.length) {
      throw new AppError(
        "Course ID, date, and students list are required",
        400
      );
    }

    // Prepare attendance records
    const attendanceRecords = bulkData.students.map((student) => ({
      usn: student.usn,
      course_id: bulkData.course_id,
      date: bulkData.date,
      status: student.status,
    }));

    const { data: attendance, error } = await supabase
      .from("attendance")
      .insert(attendanceRecords)
      .select();

    if (error) {
      throw new AppError("Failed to create bulk attendance records", 500);
    }

    res.status(201).json({
      success: true,
      data: attendance,
      message: `${attendance.length} attendance records created`,
    });
  }
);

export const getAttendanceStats = asyncHandler(
  async (req: Request, res: Response) => {
    const { usn, course_id } = req.query;

    if (!usn && !course_id) {
      throw new AppError("Either USN or course_id is required", 400);
    }

    let query = supabase.from("attendance").select("usn, course_id, status");

    if (usn) {
      query = query.eq("usn", usn);
    }
    if (course_id) {
      query = query.eq("course_id", course_id);
    }

    const { data: attendance, error } = await query;

    if (error) {
      throw new AppError("Failed to fetch attendance statistics", 500);
    }

    // Calculate statistics
    const stats: { [key: string]: AttendanceStats } = {};

    attendance.forEach((record) => {
      const key = `${record.usn}-${record.course_id}`;

      if (!stats[key]) {
        stats[key] = {
          usn: record.usn,
          course_id: record.course_id,
          total_classes: 0,
          present: 0,
          absent: 0,
          late: 0,
          attendance_percentage: 0,
        };
      }

      stats[key].total_classes++;

      switch (record.status) {
        case "Present":
          stats[key].present++;
          break;
        case "Absent":
          stats[key].absent++;
          break;
        case "Late":
          stats[key].late++;
          break;
      }
    });

    // Calculate percentages
    Object.values(stats).forEach((stat) => {
      stat.attendance_percentage =
        stat.total_classes > 0
          ? Math.round(((stat.present + stat.late) / stat.total_classes) * 100)
          : 0;
    });

    res.json({
      success: true,
      data: Object.values(stats),
    });
  }
);

export const updateAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["Present", "Absent", "Late"].includes(status)) {
      throw new AppError(
        "Valid status (Present, Absent, Late) is required",
        400
      );
    }

    const { data: attendance, error } = await supabase
      .from("attendance")
      .update({ status })
      .eq("attendance_id", id)
      .select()
      .single();

    if (error || !attendance) {
      throw new AppError("Attendance record not found or update failed", 404);
    }

    res.json({
      success: true,
      data: attendance,
    });
  }
);

export const deleteAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const { error } = await supabase
      .from("attendance")
      .delete()
      .eq("attendance_id", id);

    if (error) {
      throw new AppError("Failed to delete attendance record", 500);
    }

    res.json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  }
);
