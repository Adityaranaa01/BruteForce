import { Request, Response, NextFunction } from "express";
import { JwtService } from "../services/jwt.service";
import { supabase } from "../config";
import { User } from "../models/user.model";

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res
        .status(401)
        .json({ status: "error", message: "Authorization header required" });
      return;
    }

    const token = JwtService.extractTokenFromHeader(authHeader);
    const payload = JwtService.verifyToken(token);

    // Fetch user from Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", payload.userId)
      .single();

    if (error || !user) {
      res.status(401).json({ status: "error", message: "User not found" });
      return;
    }

    req.user = user as User;
    next();
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: error instanceof Error ? error.message : "Authentication failed",
    });
  }
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res
        .status(401)
        .json({ status: "error", message: "Authentication required" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: "error",
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
      return;
    }

    next();
  };
};

export const adminMiddleware = roleMiddleware(["admin"]);
export const teacherMiddleware = roleMiddleware(["teacher", "admin"]);
export const studentMiddleware = roleMiddleware([
  "student",
  "teacher",
  "admin",
]);
