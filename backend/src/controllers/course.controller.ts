import { Request, Response } from "express";
import { supabase } from "../config";
import { asyncHandler, AppError } from "../middleware/error.middleware";
import {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
} from "../models/course.model";

export const getCourses = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;

  const query = supabase
    .from("course")
    .select("*", { count: "exact" })
    .order("course_id", { ascending: true });

  // Apply pagination
  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;
  query.range(from, to);

  const { data: courses, error, count } = await query;

  if (error) {
    throw new AppError("Failed to fetch courses", 500);
  }

  res.json({
    success: true,
    data: courses,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count || 0,
      pages: Math.ceil((count || 0) / Number(limit)),
    },
  });
});

export const getCourse = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: course, error } = await supabase
    .from("course")
    .select("*")
    .eq("course_id", id)
    .single();

  if (error || !course) {
    throw new AppError("Course not found", 404);
  }

  res.json({
    success: true,
    data: course,
  });
});

export const createCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const courseData: CreateCourseRequest = req.body;

    // Validate required fields
    if (!courseData.name || !courseData.credits) {
      throw new AppError("Course name and credits are required", 400);
    }

    const { data: course, error } = await supabase
      .from("course")
      .insert(courseData)
      .select()
      .single();

    if (error) {
      throw new AppError("Failed to create course", 500);
    }

    res.status(201).json({
      success: true,
      data: course,
    });
  }
);

export const updateCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData: UpdateCourseRequest = req.body;

    const { data: course, error } = await supabase
      .from("course")
      .update(updateData)
      .eq("course_id", id)
      .select()
      .single();

    if (error || !course) {
      throw new AppError("Course not found or update failed", 404);
    }

    res.json({
      success: true,
      data: course,
    });
  }
);

export const deleteCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const { error } = await supabase
      .from("course")
      .delete()
      .eq("course_id", id);

    if (error) {
      throw new AppError("Failed to delete course", 500);
    }

    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  }
);
