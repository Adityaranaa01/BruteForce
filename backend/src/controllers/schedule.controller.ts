import { Request, Response } from "express";
import { supabase } from "../config";
import {
  CreateScheduleRequest,
  ScheduleOptimizationRequest,
} from "../models/schedule.model";
import { asyncHandler, AppError } from "../middleware/error.middleware";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { ScheduleService } from "../services/schedule.service";

export const getSchedules = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { page = 1, limit = 10, date, course_id, teacher_id } = req.query;
    const currentUser = req.user!;

    let query = supabase
      .from("schedules")
      .select("*", { count: "exact" })
      .order("date", { ascending: true });

    // Apply filters
    if (date) {
      query = query.eq("date", date);
    }
    if (course_id) {
      query = query.eq("course_id", course_id);
    }
    if (teacher_id) {
      query = query.eq("teacher_id", teacher_id);
    }

    // Students can only see schedules for their courses
    if (currentUser.role === "student") {
      const { data: userCourses } = await supabase
        .from("users")
        .select("courses")
        .eq("id", currentUser.id)
        .single();

      if (userCourses?.courses?.length) {
        query = query.in("course_id", userCourses.courses);
      }
    }

    // Apply pagination
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;
    query = query.range(from, to);

    const { data: schedules, error, count } = await query;

    if (error) {
      throw new AppError("Failed to fetch schedules", 500);
    }

    res.json({
      status: "success",
      data: {
        schedules: schedules || [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / Number(limit)),
        },
      },
    });
  }
);

export const createSchedule = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const currentUser = req.user!;
    const scheduleData: CreateScheduleRequest = req.body;

    if (
      !scheduleData.date ||
      !scheduleData.start_time ||
      !scheduleData.end_time ||
      !scheduleData.room ||
      !scheduleData.course_id ||
      !scheduleData.teacher_id
    ) {
      throw new AppError("All schedule fields are required", 400);
    }

    // Only teachers and admins can create schedules
    if (!["teacher", "admin"].includes(currentUser.role)) {
      throw new AppError("Access denied", 403);
    }

    // Teachers can only create schedules for their own courses
    if (
      currentUser.role === "teacher" &&
      scheduleData.teacher_id !== currentUser.id
    ) {
      throw new AppError("Access denied", 403);
    }

    const { data: schedule, error } = await supabase
      .from("schedules")
      .insert(scheduleData)
      .select()
      .single();

    if (error) {
      throw new AppError("Failed to create schedule", 500);
    }

    res.status(201).json({
      status: "success",
      data: {
        schedule,
      },
    });
  }
);

export const optimizeSchedule = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const currentUser = req.user!;
    const optimizationData: ScheduleOptimizationRequest = req.body;

    if (!optimizationData.teachers || !optimizationData.rooms) {
      throw new AppError(
        "Teachers and rooms are required for optimization",
        400
      );
    }

    // Only admins can optimize schedules
    if (currentUser.role !== "admin") {
      throw new AppError("Access denied", 403);
    }

    try {
      const result = await ScheduleService.optimizeSchedule(optimizationData);

      res.json({
        status: "success",
        data: result,
      });
    } catch (error) {
      throw new AppError("Failed to optimize schedule", 500);
    }
  }
);

export const getScheduleById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const currentUser = req.user!;

    const { data: schedule, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !schedule) {
      throw new AppError("Schedule not found", 404);
    }

    // Check access permissions
    if (currentUser.role === "student") {
      const { data: userCourses } = await supabase
        .from("users")
        .select("courses")
        .eq("id", currentUser.id)
        .single();

      if (!userCourses?.courses?.includes(schedule.course_id)) {
        throw new AppError("Access denied", 403);
      }
    }

    res.json({
      status: "success",
      data: {
        schedule,
      },
    });
  }
);

export const updateSchedule = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const currentUser = req.user!;
    const updateData = req.body;

    // Get existing schedule
    const { data: existingSchedule, error: fetchError } = await supabase
      .from("schedules")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingSchedule) {
      throw new AppError("Schedule not found", 404);
    }

    // Check permissions
    if (
      currentUser.role === "teacher" &&
      existingSchedule.teacher_id !== currentUser.id
    ) {
      throw new AppError("Access denied", 403);
    }

    if (currentUser.role === "student") {
      throw new AppError("Students cannot modify schedules", 403);
    }

    const { data: schedule, error } = await supabase
      .from("schedules")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new AppError("Failed to update schedule", 500);
    }

    res.json({
      status: "success",
      data: {
        schedule,
      },
    });
  }
);

export const deleteSchedule = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const currentUser = req.user!;

    // Get existing schedule
    const { data: existingSchedule, error: fetchError } = await supabase
      .from("schedules")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingSchedule) {
      throw new AppError("Schedule not found", 404);
    }

    // Only admins can delete schedules
    if (currentUser.role !== "admin") {
      throw new AppError("Access denied", 403);
    }

    const { error } = await supabase.from("schedules").delete().eq("id", id);

    if (error) {
      throw new AppError("Failed to delete schedule", 500);
    }

    res.json({
      status: "success",
      message: "Schedule deleted successfully",
    });
  }
);
