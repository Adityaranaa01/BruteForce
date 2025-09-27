export interface Course {
  course_id: number;
  name: string;
  credits: number;
}

export interface CreateCourseRequest {
  name: string;
  credits: number;
}

export interface UpdateCourseRequest {
  name?: string;
  credits?: number;
}
