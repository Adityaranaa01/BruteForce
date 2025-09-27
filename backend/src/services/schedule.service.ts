import { supabase } from "../config";
import {
  ScheduleOptimizationRequest,
  ScheduleOptimizationResponse,
  Schedule,
} from "../models/schedule.model";

interface TimeSlot {
  start: string;
  end: string;
  day: string;
}

interface ScheduleConstraint {
  teacherId: string;
  roomId: string;
  courseId: string;
  preferredTimes?: TimeSlot[];
  maxHoursPerDay?: number;
}

class ScheduleService {
  async optimizeSchedule(
    request: ScheduleOptimizationRequest
  ): Promise<ScheduleOptimizationResponse> {
    try {
      const { teachers, rooms, constraints } = request;

      // Get available time slots (simplified for demo)
      const timeSlots = this.generateTimeSlots();

      // Get existing schedules to check for conflicts
      const { data: existingSchedules } = await supabase
        .from("schedules")
        .select("*");

      // Simple optimization algorithm (for demo purposes)
      const optimizedSchedule = this.generateOptimizedSchedule(
        teachers,
        rooms,
        timeSlots,
        constraints,
        existingSchedules || []
      );

      // Check for conflicts
      const conflicts = this.detectConflicts(
        optimizedSchedule,
        existingSchedules || []
      );

      // Generate suggestions
      const suggestions = this.generateSuggestions(
        optimizedSchedule,
        conflicts
      );

      // Calculate optimization score
      const totalScore = this.calculateOptimizationScore(
        optimizedSchedule,
        conflicts
      );

      return {
        optimized_schedule: optimizedSchedule,
        conflicts,
        suggestions,
        total_score: totalScore,
      };
    } catch (error) {
      throw new Error("Failed to optimize schedule");
    }
  }

  private generateTimeSlots(): TimeSlot[] {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots: TimeSlot[] = [];

    for (const day of days) {
      timeSlots.push(
        { start: "08:00", end: "09:30", day },
        { start: "09:45", end: "11:15", day },
        { start: "11:30", end: "13:00", day },
        { start: "14:00", end: "15:30", day },
        { start: "15:45", end: "17:15", day },
        { start: "17:30", end: "19:00", day }
      );
    }

    return timeSlots;
  }

  private generateOptimizedSchedule(
    teachers: string[],
    rooms: string[],
    timeSlots: TimeSlot[],
    constraints: any,
    existingSchedules: Schedule[]
  ): Schedule[] {
    const optimizedSchedule: Schedule[] = [];
    const usedTimeSlots = new Set<string>();
    const teacherHours = new Map<string, number>();
    const roomUsage = new Map<string, string[]>();

    // Initialize teacher hours tracking
    teachers.forEach((teacherId) => {
      teacherHours.set(teacherId, 0);
    });

    // Initialize room usage tracking
    rooms.forEach((roomId) => {
      roomUsage.set(roomId, []);
    });

    // Get courses for each teacher
    const teacherCourses = new Map<string, string[]>();

    // Mock course assignments (in real implementation, fetch from database)
    teachers.forEach((teacherId) => {
      teacherCourses.set(teacherId, [
        `course-${teacherId}-1`,
        `course-${teacherId}-2`,
      ]);
    });

    // Generate schedule assignments
    for (const teacherId of teachers) {
      const courses = teacherCourses.get(teacherId) || [];

      for (const courseId of courses) {
        // Find available time slot
        const availableSlot = this.findAvailableSlot(
          timeSlots,
          usedTimeSlots,
          teacherId,
          teacherHours,
          constraints
        );

        if (availableSlot) {
          // Find available room
          const availableRoom = this.findAvailableRoom(
            rooms,
            roomUsage,
            availableSlot
          );

          if (availableRoom) {
            // Create schedule entry
            const scheduleEntry: Schedule = {
              id: `schedule-${teacherId}-${courseId}-${Date.now()}`,
              date: availableSlot.day,
              start_time: availableSlot.start,
              end_time: availableSlot.end,
              room: availableRoom,
              course_id: courseId,
              teacher_id: teacherId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            optimizedSchedule.push(scheduleEntry);

            // Update tracking
            usedTimeSlots.add(`${availableSlot.day}-${availableSlot.start}`);
            teacherHours.set(
              teacherId,
              (teacherHours.get(teacherId) || 0) + 1.5
            );
            roomUsage.set(availableRoom, [
              ...(roomUsage.get(availableRoom) || []),
              `${availableSlot.day}-${availableSlot.start}`,
            ]);
          }
        }
      }
    }

    return optimizedSchedule;
  }

  private findAvailableSlot(
    timeSlots: TimeSlot[],
    usedTimeSlots: Set<string>,
    teacherId: string,
    teacherHours: Map<string, number>,
    constraints: any
  ): TimeSlot | null {
    // Check max hours per day constraint
    const maxHoursPerDay = constraints.maxHoursPerDay || 8;

    for (const slot of timeSlots) {
      const slotKey = `${slot.day}-${slot.start}`;

      if (!usedTimeSlots.has(slotKey)) {
        // Check if teacher has exceeded daily hours
        const currentHours = teacherHours.get(teacherId) || 0;
        if (currentHours < maxHoursPerDay) {
          return slot;
        }
      }
    }

    return null;
  }

  private findAvailableRoom(
    rooms: string[],
    roomUsage: Map<string, string[]>,
    timeSlot: TimeSlot
  ): string | null {
    const slotKey = `${timeSlot.day}-${timeSlot.start}`;

    for (const room of rooms) {
      const usage = roomUsage.get(room) || [];
      if (!usage.includes(slotKey)) {
        return room;
      }
    }

    return null;
  }

  private detectConflicts(
    optimizedSchedule: Schedule[],
    existingSchedules: Schedule[]
  ): string[] {
    const conflicts: string[] = [];

    // Check for teacher conflicts
    const teacherSchedules = new Map<string, Set<string>>();

    [...existingSchedules, ...optimizedSchedule].forEach((schedule) => {
      const key = `${schedule.date}-${schedule.start_time}`;
      if (!teacherSchedules.has(schedule.teacher_id)) {
        teacherSchedules.set(schedule.teacher_id, new Set());
      }

      if (teacherSchedules.get(schedule.teacher_id)?.has(key)) {
        conflicts.push(
          `Teacher ${schedule.teacher_id} has conflicting schedule on ${schedule.date} at ${schedule.start_time}`
        );
      } else {
        teacherSchedules.get(schedule.teacher_id)?.add(key);
      }
    });

    // Check for room conflicts
    const roomSchedules = new Map<string, Set<string>>();

    [...existingSchedules, ...optimizedSchedule].forEach((schedule) => {
      const key = `${schedule.date}-${schedule.start_time}`;
      if (!roomSchedules.has(schedule.room)) {
        roomSchedules.set(schedule.room, new Set());
      }

      if (roomSchedules.get(schedule.room)?.has(key)) {
        conflicts.push(
          `Room ${schedule.room} has conflicting booking on ${schedule.date} at ${schedule.start_time}`
        );
      } else {
        roomSchedules.get(schedule.room)?.add(key);
      }
    });

    return conflicts;
  }

  private generateSuggestions(
    optimizedSchedule: Schedule[],
    conflicts: string[]
  ): string[] {
    const suggestions: string[] = [];

    if (conflicts.length === 0) {
      suggestions.push(
        "Schedule optimization completed successfully with no conflicts"
      );
    } else {
      suggestions.push("Consider adjusting time slots to resolve conflicts");
      suggestions.push("Review teacher availability and room capacity");
    }

    suggestions.push(
      "Implement buffer time between classes for room transitions"
    );
    suggestions.push(
      "Consider student travel time between different buildings"
    );
    suggestions.push("Balance workload distribution among teachers");

    return suggestions;
  }

  private calculateOptimizationScore(
    optimizedSchedule: Schedule[],
    conflicts: string[]
  ): number {
    let score = 100;

    // Deduct points for conflicts
    score -= conflicts.length * 10;

    // Deduct points for empty time slots (inefficient scheduling)
    const totalPossibleSlots = 30; // 5 days * 6 time slots
    const usedSlots = optimizedSchedule.length;
    const utilizationRate = usedSlots / totalPossibleSlots;

    if (utilizationRate < 0.7) {
      score -= 20;
    }

    return Math.max(score, 0);
  }

  async commitOptimizedSchedule(schedules: Schedule[]): Promise<void> {
    try {
      // Insert optimized schedules into database
      const { error } = await supabase.from("schedules").insert(schedules);

      if (error) {
        throw new Error("Failed to commit optimized schedule");
      }
    } catch (error) {
      throw new Error("Failed to commit optimized schedule");
    }
  }
}

export const ScheduleService = new ScheduleService();
