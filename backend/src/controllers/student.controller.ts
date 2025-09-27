import { Request, Response } from "express";
import { supabase } from "../config";
import { asyncHandler, AppError } from "../middleware/error.middleware";
import {
  Student,
  CreateStudentRequest,
  UpdateStudentRequest,
} from "../models/student.model";

export const getStudents = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, branch, year, sem } = req.query;

  let query = supabase
    .from("student")
    .select("*", { count: "exact" })
    .order("usn", { ascending: true });

  // Apply filters
  if (branch) {
    query = query.eq("branch", branch);
  }
  if (year) {
    query = query.eq("year", year);
  }
  if (sem) {
    query = query.eq("sem", sem);
  }

  // Apply pagination
  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;
  query = query.range(from, to);

  const { data: students, error, count } = await query;

  if (error) {
    throw new AppError("Failed to fetch students", 500);
  }

  res.json({
    success: true,
    data: students,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count || 0,
      pages: Math.ceil((count || 0) / Number(limit)),
    },
  });
});

export const getStudent = asyncHandler(async (req: Request, res: Response) => {
  const { usn } = req.params;

  const { data: student, error } = await supabase
    .from("student")
    .select("*")
    .eq("usn", usn)
    .single();

  if (error || !student) {
    throw new AppError("Student not found", 404);
  }

  res.json({
    success: true,
    data: student,
  });
});

export const createStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const studentData: CreateStudentRequest = req.body;

    // Validate required fields
    if (
      !studentData.usn ||
      !studentData.name ||
      !studentData.branch ||
      !studentData.year ||
      !studentData.sem
    ) {
      throw new AppError(
        "USN, name, branch, year, and semester are required",
        400
      );
    }

    const { data: student, error } = await supabase
      .from("student")
      .insert(studentData)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new AppError(
          "Student with this USN or email already exists",
          400
        );
      }
      throw new AppError("Failed to create student", 500);
    }

    res.status(201).json({
      success: true,
      data: student,
    });
  }
);

export const updateStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { usn } = req.params;
    const updateData: UpdateStudentRequest = req.body;

    const { data: student, error } = await supabase
      .from("student")
      .update(updateData)
      .eq("usn", usn)
      .select()
      .single();

    if (error || !student) {
      throw new AppError("Student not found or update failed", 404);
    }

    res.json({
      success: true,
      data: student,
    });
  }
);

export const deleteStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { usn } = req.params;

    const { error } = await supabase.from("student").delete().eq("usn", usn);

    if (error) {
      throw new AppError("Failed to delete student", 500);
    }

    res.json({
      success: true,
      message: "Student deleted successfully",
    });
  }
);
