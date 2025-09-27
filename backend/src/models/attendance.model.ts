export interface AttendanceEvent {
  class_id: string;
  timestamp: string;
  students: AttendanceRecord[];
}

export interface AttendanceRecord {
  user_id: string;
  status: "present" | "absent" | "late" | "excused";
}

export interface AttendanceStats {
  user_id: string;
  total_classes: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  attendance_rate: number;
  last_updated: string;
}
