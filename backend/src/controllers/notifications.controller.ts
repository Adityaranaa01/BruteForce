import { Request, Response } from "express";
import { supabase } from "../config";
import {
  CreateNotificationRequest,
  NotificationResponse,
} from "../models/notification.model";
import { asyncHandler, AppError } from "../middleware/error.middleware";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { SocketService } from "../services/socket.service";

export const getNotifications = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { page = 1, limit = 10, unread_only } = req.query;
    const currentUser = req.user!;

    let query = supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .or(`recipient_id.eq.${currentUser.id},recipient_id.eq.all`)
      .order("created_at", { ascending: false });

    // Filter for unread only if requested
    if (unread_only === "true") {
      query = query.not("read_by", "cs", `{${currentUser.id}}`);
    }

    // Apply pagination
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;
    query = query.range(from, to);

    const { data: notifications, error, count } = await query;

    if (error) {
      throw new AppError("Failed to fetch notifications", 500);
    }

    // Add computed is_read field
    const notificationsResponse: NotificationResponse[] =
      notifications?.map((notification) => ({
        ...notification,
        is_read: notification.read_by.includes(currentUser.id),
      })) || [];

    res.json({
      status: "success",
      data: {
        notifications: notificationsResponse,
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

export const createNotification = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const currentUser = req.user!;
    const notificationData: CreateNotificationRequest = req.body;

    if (
      !notificationData.title ||
      !notificationData.body ||
      !notificationData.recipient_id
    ) {
      throw new AppError("Title, body, and recipient are required", 400);
    }

    // Create notification
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        ...notificationData,
        read_by: [],
      })
      .select()
      .single();

    if (error) {
      throw new AppError("Failed to create notification", 500);
    }

    // Send Socket.IO notification to recipients
    if (notificationData.recipient_id === "all") {
      SocketService.emitToAll("notification", notification);
    } else {
      SocketService.emitToUser(
        notificationData.recipient_id,
        "notification",
        notification
      );
    }

    res.status(201).json({
      status: "success",
      data: {
        notification: notification as NotificationResponse,
      },
    });
  }
);

export const markNotificationAsRead = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const currentUser = req.user!;

    // Get current notification
    const { data: notification, error: fetchError } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !notification) {
      throw new AppError("Notification not found", 404);
    }

    // Check if user is recipient
    if (
      notification.recipient_id !== "all" &&
      notification.recipient_id !== currentUser.id
    ) {
      throw new AppError("Access denied", 403);
    }

    // Add user to read_by array if not already present
    const readBy = notification.read_by.includes(currentUser.id)
      ? notification.read_by
      : [...notification.read_by, currentUser.id];

    const { data: updatedNotification, error } = await supabase
      .from("notifications")
      .update({
        read_by: readBy,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new AppError("Failed to mark notification as read", 500);
    }

    res.json({
      status: "success",
      data: {
        notification: {
          ...updatedNotification,
          is_read: true,
        } as NotificationResponse,
      },
    });
  }
);
