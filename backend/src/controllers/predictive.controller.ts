import { Request, Response } from "express";
import { supabase } from "../config";
import { asyncHandler, AppError } from "../middleware/error.middleware";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { PredictiveService } from "../services/predictive.service";

interface AssessRequest {
  userId?: string;
  batch?: boolean;
}

export const assessStudentRisk = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const currentUser = req.user!;
    const { userId, batch }: AssessRequest = req.body;

    // Only admins and teachers can assess student risk
    if (!["admin", "teacher"].includes(currentUser.role)) {
      throw new AppError("Access denied", 403);
    }

    try {
      if (batch) {
        // Batch assessment for all students
        const result = await PredictiveService.batchAssessStudents();
        res.json({
          status: "success",
          data: result,
        });
      } else if (userId) {
        // Single student assessment
        const result = await PredictiveService.assessStudentRisk(userId);
        res.json({
          status: "success",
          data: result,
        });
      } else {
        throw new AppError("Either userId or batch=true is required", 400);
      }
    } catch (error) {
      throw new AppError("Failed to assess student risk", 500);
    }
  }
);

export const getStudentInsights = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const currentUser = req.user!;

    // Users can only view their own insights unless they're admin/teacher
    if (currentUser.role === "student" && currentUser.id !== userId) {
      throw new AppError("Access denied", 403);
    }

    try {
      const insights = await PredictiveService.getStudentInsights(userId);

      res.json({
        status: "success",
        data: insights,
      });
    } catch (error) {
      throw new AppError("Failed to fetch student insights", 500);
    }
  }
);

export const getInterventions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { page = 1, limit = 10, status, student_id } = req.query;
    const currentUser = req.user!;

    let query = supabase
      .from("interventions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (student_id) {
      query = query.eq("student_id", student_id);
    }

    // Students can only see their own interventions
    if (currentUser.role === "student") {
      query = query.eq("student_id", currentUser.id);
    }

    // Apply pagination
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;
    query = query.range(from, to);

    const { data: interventions, error, count } = await query;

    if (error) {
      throw new AppError("Failed to fetch interventions", 500);
    }

    res.json({
      status: "success",
      data: {
        interventions: interventions || [],
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

export const createIntervention = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const currentUser = req.user!;
    const interventionData = req.body;

    if (!interventionData.student_id || !interventionData.reason) {
      throw new AppError("Student ID and reason are required", 400);
    }

    // Only teachers and admins can create interventions
    if (!["teacher", "admin"].includes(currentUser.role)) {
      throw new AppError("Access denied", 403);
    }

    const { data: intervention, error } = await supabase
      .from("interventions")
      .insert({
        ...interventionData,
        triggered_by: currentUser.id,
        status: "open",
      })
      .select()
      .single();

    if (error) {
      throw new AppError("Failed to create intervention", 500);
    }

    // Send notification to student about the intervention
    const { data: notification } = await supabase
      .from("notifications")
      .insert({
        title: "Academic Support Intervention",
        body: `An intervention has been created for you: ${interventionData.reason}`,
        to: interventionData.student_id,
        link: `/interventions/${intervention.id}`,
      })
      .select()
      .single();

    if (notification) {
      // Emit Socket.IO notification
      const { SocketService } = await import("@/services/socket.service");
      SocketService.emitToUser(
        interventionData.student_id,
        "notification",
        notification
      );
    }

    res.status(201).json({
      status: "success",
      data: {
        intervention,
      },
    });
  }
);

export const updateIntervention = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const currentUser = req.user!;
    const updateData = req.body;

    // Get existing intervention
    const { data: existingIntervention, error: fetchError } = await supabase
      .from("interventions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingIntervention) {
      throw new AppError("Intervention not found", 404);
    }

    // Check permissions
    if (
      currentUser.role === "student" &&
      existingIntervention.student_id !== currentUser.id
    ) {
      throw new AppError("Access denied", 403);
    }

    const { data: intervention, error } = await supabase
      .from("interventions")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new AppError("Failed to update intervention", 500);
    }

    res.json({
      status: "success",
      data: {
        intervention,
      },
    });
  }
);
