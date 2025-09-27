import { Request, Response } from "express";
import { supabase } from "../config";
import { asyncHandler, AppError } from "../middleware/error.middleware";
import {
  Timetable,
  CreateTimetableRequest,
  UpdateTimetableRequest,
} from "../models/timetable.model";

export const getTimetable = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      course_id,
      teacher_id,
      day_of_week,
      page = 1,
      limit = 10,
    } = req.query;

    let query = supabase
      .from("timetable")
      .select("*", { count: "exact" })
      .order("day_of_week", { ascending: true })
      .order("time_slot", { ascending: true });

    // Apply filters
    if (course_id) {
      query = query.eq("course_id", course_id);
    }
    if (teacher_id) {
      query = query.eq("teacher_id", teacher_id);
    }
    if (day_of_week) {
      query = query.eq("day_of_week", day_of_week);
    }

    // Apply pagination
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;
    query = query.range(from, to);

    const { data: timetable, error, count } = await query;

    if (error) {
      throw new AppError("Failed to fetch timetable", 500);
    }

    res.json({
      success: true,
      data: timetable,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  }
);

export const getTimetableById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const { data: timetable, error } = await supabase
      .from("timetable")
      .select("*")
      .eq("timetable_id", id)
      .single();

    if (error || !timetable) {
      throw new AppError("Timetable entry not found", 404);
    }

    res.json({
      success: true,
      data: timetable,
    });
  }
);

export const createTimetable = asyncHandler(
  async (req: Request, res: Response) => {
    const timetableData: CreateTimetableRequest = req.body;

    // Validate required fields
    if (
      !timetableData.course_id ||
      !timetableData.teacher_id ||
      !timetableData.day_of_week ||
      !timetableData.time_slot
    ) {
      throw new AppError(
        "Course ID, teacher ID, day of week, and time slot are required",
        400
      );
    }

    // Validate day_of_week
    const validDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    if (!validDays.includes(timetableData.day_of_week)) {
      throw new AppError(
        "Invalid day of week. Must be one of: Mon, Tue, Wed, Thu, Fri, Sat",
        400
      );
    }

    const { data: timetable, error } = await supabase
      .from("timetable")
      .insert(timetableData)
      .select()
      .single();

    if (error) {
      throw new AppError("Failed to create timetable entry", 500);
    }

    res.status(201).json({
      success: true,
      data: timetable,
    });
  }
);

export const updateTimetable = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData: UpdateTimetableRequest = req.body;

    // Validate day_of_week if provided
    if (updateData.day_of_week) {
      const validDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      if (!validDays.includes(updateData.day_of_week)) {
        throw new AppError(
          "Invalid day of week. Must be one of: Mon, Tue, Wed, Thu, Fri, Sat",
          400
        );
      }
    }

    const { data: timetable, error } = await supabase
      .from("timetable")
      .update(updateData)
      .eq("timetable_id", id)
      .select()
      .single();

    if (error || !timetable) {
      throw new AppError("Timetable entry not found or update failed", 404);
    }

    res.json({
      success: true,
      data: timetable,
    });
  }
);

export const deleteTimetable = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const { error } = await supabase
      .from("timetable")
      .delete()
      .eq("timetable_id", id);

    if (error) {
      throw new AppError("Failed to delete timetable entry", 500);
    }

    res.json({
      success: true,
      message: "Timetable entry deleted successfully",
    });
  }
);
