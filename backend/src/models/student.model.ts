export interface Student {
  usn: string;
  branch: string;
  name: string;
  phone?: string;
  email?: string;
  year: number;
  sem: number;
}

export interface CreateStudentRequest {
  usn: string;
  branch: string;
  name: string;
  phone?: string;
  email?: string;
  year: number;
  sem: number;
}

export interface UpdateStudentRequest {
  branch?: string;
  name?: string;
  phone?: string;
  email?: string;
  year?: number;
  sem?: number;
}
