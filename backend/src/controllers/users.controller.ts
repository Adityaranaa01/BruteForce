import { Request, Response } from "express";
import { supabase } from "../config";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
} from "../models/user.model";
import { asyncHandler, AppError } from "../middleware/error.middleware";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const getUsers = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { page = 1, limit = 10, role, search } = req.query;

    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply filters
    if (role) {
      query = query.eq("role", role);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;
    query = query.range(from, to);

    const { data: users, error, count } = await query;

    if (error) {
      throw new AppError("Failed to fetch users", 500);
    }

    // Remove passwords from response
    const usersResponse = users?.map(
      ({ password_hash, ...user }) => user
    ) as UserResponse[];

    res.json({
      status: "success",
      data: {
        users: usersResponse,
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

export const getUserById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const currentUser = req.user!;

    // Users can only view their own profile unless they're admin
    if (currentUser.role !== "admin" && currentUser.id !== id) {
      throw new AppError("Access denied", 403);
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !user) {
      throw new AppError("User not found", 404);
    }

    // Remove password from response
    const { password_hash, ...userResponse } = user;

    res.json({
      status: "success",
      data: {
        user: userResponse as UserResponse,
      },
    });
  }
);

export const updateUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const currentUser = req.user!;
    const updateData: UpdateUserRequest = req.body;

    // Users can only update their own profile unless they're admin
    if (currentUser.role !== "admin" && currentUser.id !== id) {
      throw new AppError("Access denied", 403);
    }

    // Non-admin users cannot change certain fields
    if (currentUser.role !== "admin") {
      delete (updateData as any).role;
      delete (updateData as any).email;
    }

    const { data: user, error } = await supabase
      .from("users")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !user) {
      throw new AppError("Failed to update user", 500);
    }

    // Remove password from response
    const { password_hash, ...userResponse } = user;

    res.json({
      status: "success",
      data: {
        user: userResponse as UserResponse,
      },
    });
  }
);

export const deleteUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const currentUser = req.user!;

    // Only admins can delete users
    if (currentUser.role !== "admin") {
      throw new AppError("Access denied", 403);
    }

    // Prevent self-deletion
    if (currentUser.id === id) {
      throw new AppError("Cannot delete your own account", 400);
    }

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      throw new AppError("Failed to delete user", 500);
    }

    res.json({
      status: "success",
      message: "User deleted successfully",
    });
  }
);
