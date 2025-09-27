import { Request, Response } from "express";
import { supabase } from "../config";
import { asyncHandler, AppError } from "../middleware/error.middleware";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AiService } from "../services/ai.service";

interface ChatRequest {
  userId: string;
  message: string;
  conversationId?: string;
}

interface SummarizeRequest {
  lectureId: string;
}

export const chat = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { userId, message, conversationId }: ChatRequest = req.body;
    const currentUser = req.user!;

    if (!userId || !message) {
      throw new AppError("User ID and message are required", 400);
    }

    // Verify user can access this conversation
    if (currentUser.role !== "admin" && currentUser.id !== userId) {
      throw new AppError("Access denied", 403);
    }

    try {
      const response = await AiService.chat(userId, message, conversationId);

      res.json({
        status: "success",
        data: response,
      });
    } catch (error) {
      throw new AppError("Failed to process chat message", 500);
    }
  }
);

export const getConversations = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.query;
    const currentUser = req.user!;

    if (!userId) {
      throw new AppError("User ID is required", 400);
    }

    // Verify user can access conversations
    if (currentUser.role !== "admin" && currentUser.id !== userId) {
      throw new AppError("Access denied", 403);
    }

    const { data: conversations, error } = await supabase
      .from("ai_conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      throw new AppError("Failed to fetch conversations", 500);
    }

    res.json({
      status: "success",
      data: {
        conversations: conversations || [],
      },
    });
  }
);

export const summarizeLecture = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id: lectureId } = req.params;
    const currentUser = req.user!;

    // Get lecture details
    const { data: lecture, error: lectureError } = await supabase
      .from("lectures")
      .select("*")
      .eq("id", lectureId)
      .single();

    if (lectureError || !lecture) {
      throw new AppError("Lecture not found", 404);
    }

    // Check if user has access to this lecture
    if (currentUser.role === "student") {
      const { data: course } = await supabase
        .from("courses")
        .select("students")
        .eq("id", lecture.course_id)
        .single();

      if (!course?.students?.includes(currentUser.id)) {
        throw new AppError("Access denied", 403);
      }
    }

    try {
      const summary = await AiService.summarizeLecture(lectureId);

      res.json({
        status: "success",
        data: {
          summary,
        },
      });
    } catch (error) {
      throw new AppError("Failed to generate summary", 500);
    }
  }
);

export const getLectureSummary = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id: lectureId } = req.params;
    const currentUser = req.user!;

    // Get lecture details
    const { data: lecture, error: lectureError } = await supabase
      .from("lectures")
      .select("*")
      .eq("id", lectureId)
      .single();

    if (lectureError || !lecture) {
      throw new AppError("Lecture not found", 404);
    }

    // Check if user has access to this lecture
    if (currentUser.role === "student") {
      const { data: course } = await supabase
        .from("courses")
        .select("students")
        .eq("id", lecture.course_id)
        .single();

      if (!course?.students?.includes(currentUser.id)) {
        throw new AppError("Access denied", 403);
      }
    }

    // Get summary
    const { data: summary, error } = await supabase
      .from("summaries")
      .select("*")
      .eq("lecture_id", lectureId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      throw new AppError("Failed to fetch summary", 500);
    }

    res.json({
      status: "success",
      data: {
        summary: summary || null,
      },
    });
  }
);
