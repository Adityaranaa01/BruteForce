export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "student" | "teacher" | "admin";
  courses?: string[];
  attendance_rate?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: "student" | "teacher" | "admin";
  courses?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  courses?: string[];
  attendance_rate?: number;
  metadata?: Record<string, any>;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  courses?: string[];
  attendance_rate?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}
