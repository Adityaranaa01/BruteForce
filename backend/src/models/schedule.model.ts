export interface Schedule {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  room: string;
  course_id: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduleRequest {
  date: string;
  start_time: string;
  end_time: string;
  room: string;
  course_id: string;
  teacher_id: string;
}

export interface ScheduleOptimizationRequest {
  teachers: string[];
  rooms: string[];
  constraints: {
    max_hours_per_day?: number;
    preferred_times?: string[];
    avoid_conflicts?: boolean;
  };
}

export interface ScheduleOptimizationResponse {
  optimized_schedule: Schedule[];
  conflicts: string[];
  suggestions: string[];
  total_score: number;
}

export interface ScheduleResponse {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  room: string;
  course_id: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
}
