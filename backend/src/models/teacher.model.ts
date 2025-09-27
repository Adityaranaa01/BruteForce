export interface Teacher {
  teacher_id: number;
  branch: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface CreateTeacherRequest {
  branch: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface UpdateTeacherRequest {
  branch?: string;
  name?: string;
  phone?: string;
  email?: string;
}
