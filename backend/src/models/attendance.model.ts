export interface Attendance {
  attendance_id: number;
  usn: string;
  course_id: number;
  date: string; // ISO date string
  status: "Present" | "Absent" | "Late";
}

export interface CreateAttendanceRequest {
  usn: string;
  course_id: number;
  date?: string; // Optional, defaults to current date
  status: "Present" | "Absent" | "Late";
}

export interface AttendanceStats {
  usn: string;
  course_id: number;
  total_classes: number;
  present: number;
  absent: number;
  late: number;
  attendance_percentage: number;
}

export interface BulkAttendanceRequest {
  course_id: number;
  date: string;
  students: {
    usn: string;
    status: "Present" | "Absent" | "Late";
  }[];
}
