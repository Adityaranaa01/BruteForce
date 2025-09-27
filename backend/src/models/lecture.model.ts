export interface Lecture {
  id: string;
  course_id: string;
  teacher_id: string;
  date: string;
  recording_url?: string;
  transcript?: string;
  summary_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLectureRequest {
  course_id: string;
  teacher_id: string;
  date: string;
  recording_url?: string;
  transcript?: string;
}

export interface LectureResponse {
  id: string;
  course_id: string;
  teacher_id: string;
  date: string;
  recording_url?: string;
  transcript?: string;
  summary_id?: string;
  created_at: string;
  updated_at: string;
}
