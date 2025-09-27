export interface Timetable {
  timetable_id: number;
  course_id: number;
  teacher_id: number;
  day_of_week: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
  time_slot: string;
  room_no?: string;
}

export interface CreateTimetableRequest {
  course_id: number;
  teacher_id: number;
  day_of_week: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
  time_slot: string;
  room_no?: string;
}

export interface UpdateTimetableRequest {
  course_id?: number;
  teacher_id?: number;
  day_of_week?: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
  time_slot?: string;
  room_no?: string;
}
