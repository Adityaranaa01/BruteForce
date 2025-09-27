import { Request, Response } from "express";
import { supabase } from "../config";
import { asyncHandler, AppError } from "../middleware/error.middleware";
import {
  Teacher,
  CreateTeacherRequest,
  UpdateTeacherRequest,
} from "../models/teacher.model";

export const getTeachers = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, branch } = req.query;

  let query = supabase
    .from("teacher")
    .select("*", { count: "exact" })
    .order("teacher_id", { ascending: true });

  // Apply filters
  if (branch) {
    query = query.eq("branch", branch);
  }

  // Apply pagination
  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;
  query = query.range(from, to);

  const { data: teachers, error, count } = await query;

  if (error) {
    throw new AppError("Failed to fetch teachers", 500);
  }

  res.json({
    success: true,
    data: teachers,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count || 0,
      pages: Math.ceil((count || 0) / Number(limit)),
    },
  });
});

export const getTeacher = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: teacher, error } = await supabase
    .from("teacher")
    .select("*")
    .eq("teacher_id", id)
    .single();

  if (error || !teacher) {
    throw new AppError("Teacher not found", 404);
  }

  res.json({
    success: true,
    data: teacher,
  });
});

export const createTeacher = asyncHandler(
  async (req: Request, res: Response) => {
    const teacherData: CreateTeacherRequest = req.body;

    // Validate required fields
    if (!teacherData.name || !teacherData.branch) {
      throw new AppError("Name and branch are required", 400);
    }

    const { data: teacher, error } = await supabase
      .from("teacher")
      .insert(teacherData)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new AppError("Teacher with this email already exists", 400);
      }
      throw new AppError("Failed to create teacher", 500);
    }

    res.status(201).json({
      success: true,
      data: teacher,
    });
  }
);

export const updateTeacher = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData: UpdateTeacherRequest = req.body;

    const { data: teacher, error } = await supabase
      .from("teacher")
      .update(updateData)
      .eq("teacher_id", id)
      .select()
      .single();

    if (error || !teacher) {
      throw new AppError("Teacher not found or update failed", 404);
    }

    res.json({
      success: true,
      data: teacher,
    });
  }
);

export const deleteTeacher = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const { error } = await supabase
      .from("teacher")
      .delete()
      .eq("teacher_id", id);

    if (error) {
      throw new AppError("Failed to delete teacher", 500);
    }

    res.json({
      success: true,
      message: "Teacher deleted successfully",
    });
  }
);
