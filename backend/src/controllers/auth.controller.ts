import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { supabase } from "../config";
import { JwtService } from "../services/jwt.service";
import { CreateUserRequest, UserResponse } from "../models/user.model";
import { asyncHandler, AppError } from "../middleware/error.middleware";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest extends CreateUserRequest {}

export const login = asyncHandler(
  async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    // Find user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    // Generate JWT token
    const token = JwtService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const { password_hash, ...userResponse } = user;

    res.json({
      status: "success",
      data: {
        token,
        user: userResponse as UserResponse,
      },
    });
  }
);

export const register = asyncHandler(
  async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
    const { name, email, password, role, courses, metadata } = req.body;

    if (!name || !email || !password || !role) {
      throw new AppError("Name, email, password, and role are required", 400);
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      throw new AppError("User with this email already exists", 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        name,
        email,
        password_hash: passwordHash,
        role,
        courses: courses || [],
        metadata: metadata || {},
        attendance_rate: 0,
      })
      .select()
      .single();

    if (error) {
      throw new AppError("Failed to create user", 500);
    }

    // Generate JWT token
    const token = JwtService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const { password_hash, ...userResponse } = user;

    res.status(201).json({
      status: "success",
      data: {
        token,
        user: userResponse as UserResponse,
      },
    });
  }
);

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // User is attached by authMiddleware
  const user = (req as any).user;

  if (!user) {
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
});
