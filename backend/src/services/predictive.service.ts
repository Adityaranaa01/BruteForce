import { supabase } from "../config";

interface RiskAssessment {
  userId: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  reasons: string[];
  recommendations: string[];
}

interface StudentInsights {
  userId: string;
  attendanceRate: number;
  performanceMetrics: {
    averageGrade?: number;
    assignmentCompletionRate?: number;
    participationScore?: number;
  };
  riskFactors: string[];
  strengths: string[];
  recommendations: string[];
}

class PredictiveService {
  async assessStudentRisk(userId: string): Promise<RiskAssessment> {
    try {
      // Get user data
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError || !user) {
        throw new Error("User not found");
      }

      // Get additional performance data
      const performanceData = await this.getPerformanceData(userId);

      // Calculate risk score
      const riskScore = this.calculateRiskScore(user, performanceData);

      // Determine risk level
      const riskLevel = this.determineRiskLevel(riskScore);

      // Generate reasons
      const reasons = this.generateRiskReasons(
        user,
        performanceData,
        riskScore
      );

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        user,
        performanceData,
        riskScore
      );

      return {
        userId,
        riskScore,
        riskLevel,
        reasons,
        recommendations,
      };
    } catch (error) {
      throw new Error("Failed to assess student risk");
    }
  }

  async batchAssessStudents(): Promise<{
    assessments: RiskAssessment[];
    summary: any;
  }> {
    try {
      // Get all students
      const { data: students, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "student");

      if (error) {
        throw new Error("Failed to fetch students");
      }

      const assessments: RiskAssessment[] = [];
      let highRiskCount = 0;
      let mediumRiskCount = 0;
      let lowRiskCount = 0;

      for (const student of students || []) {
        try {
          const assessment = await this.assessStudentRisk(student.id);
          assessments.push(assessment);

          switch (assessment.riskLevel) {
            case "high":
              highRiskCount++;
              break;
            case "medium":
              mediumRiskCount++;
              break;
            case "low":
              lowRiskCount++;
              break;
          }
        } catch (error) {
          console.error(`Failed to assess student ${student.id}:`, error);
        }
      }

      const summary = {
        totalStudents: students?.length || 0,
        highRiskStudents: highRiskCount,
        mediumRiskStudents: mediumRiskCount,
        lowRiskStudents: lowRiskCount,
        highRiskPercentage: students?.length
          ? (highRiskCount / students.length) * 100
          : 0,
      };

      return { assessments, summary };
    } catch (error) {
      throw new Error("Failed to batch assess students");
    }
  }

  async getStudentInsights(userId: string): Promise<StudentInsights> {
    try {
      // Get user data
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError || !user) {
        throw new Error("User not found");
      }

      // Get performance data
      const performanceData = await this.getPerformanceData(userId);

      // Calculate attendance rate
      const attendanceRate = user.attendance_rate || 0;

      // Identify risk factors
      const riskFactors = this.identifyRiskFactors(user, performanceData);

      // Identify strengths
      const strengths = this.identifyStrengths(user, performanceData);

      // Generate recommendations
      const recommendations = this.generateInsightRecommendations(
        user,
        performanceData
      );

      return {
        userId,
        attendanceRate,
        performanceMetrics: {
          averageGrade: performanceData.averageGrade,
          assignmentCompletionRate: performanceData.assignmentCompletionRate,
          participationScore: performanceData.participationScore,
        },
        riskFactors,
        strengths,
        recommendations,
      };
    } catch (error) {
      throw new Error("Failed to get student insights");
    }
  }

  private async getPerformanceData(userId: string): Promise<any> {
    try {
      // Get attendance events for the student
      const { data: attendanceEvents } = await supabase
        .from("attendance_events")
        .select("students")
        .contains("students", [{ user_id: userId }]);

      // Get assignments (mock data for demo)
      const assignments = [
        { completed: true, grade: 85, dueDate: "2024-01-15" },
        { completed: true, grade: 92, dueDate: "2024-01-22" },
        { completed: false, grade: 0, dueDate: "2024-01-29" },
        { completed: true, grade: 78, dueDate: "2024-02-05" },
        { completed: true, grade: 88, dueDate: "2024-02-12" },
      ];

      // Calculate metrics
      const completedAssignments = assignments.filter((a) => a.completed);
      const averageGrade =
        completedAssignments.length > 0
          ? completedAssignments.reduce((sum, a) => sum + a.grade, 0) /
            completedAssignments.length
          : 0;

      const assignmentCompletionRate =
        (completedAssignments.length / assignments.length) * 100;

      // Mock participation score
      const participationScore = Math.random() * 100;

      return {
        averageGrade,
        assignmentCompletionRate,
        participationScore,
        totalAssignments: assignments.length,
        completedAssignments: completedAssignments.length,
        attendanceEvents: attendanceEvents || [],
      };
    } catch (error) {
      return {
        averageGrade: 0,
        assignmentCompletionRate: 0,
        participationScore: 0,
        totalAssignments: 0,
        completedAssignments: 0,
        attendanceEvents: [],
      };
    }
  }

  private calculateRiskScore(user: any, performanceData: any): number {
    // Weighted risk calculation
    const attendanceWeight = 0.5;
    const assignmentWeight = 0.3;
    const gradeWeight = 0.2;

    const attendanceScore = 1 - (user.attendance_rate || 0) / 100;
    const assignmentScore = 1 - performanceData.assignmentCompletionRate / 100;
    const gradeScore =
      performanceData.averageGrade > 0
        ? 1 - performanceData.averageGrade / 100
        : 1;

    const riskScore =
      attendanceScore * attendanceWeight +
      assignmentScore * assignmentWeight +
      gradeScore * gradeWeight;

    return Math.min(Math.max(riskScore, 0), 1); // Clamp between 0 and 1
  }

  private determineRiskLevel(riskScore: number): "low" | "medium" | "high" {
    if (riskScore >= 0.7) return "high";
    if (riskScore >= 0.4) return "medium";
    return "low";
  }

  private generateRiskReasons(
    user: any,
    performanceData: any,
    riskScore: number
  ): string[] {
    const reasons: string[] = [];

    if ((user.attendance_rate || 0) < 70) {
      reasons.push(`Low attendance rate: ${user.attendance_rate || 0}%`);
    }

    if (performanceData.assignmentCompletionRate < 70) {
      reasons.push(
        `Low assignment completion rate: ${performanceData.assignmentCompletionRate.toFixed(
          1
        )}%`
      );
    }

    if (performanceData.averageGrade < 70 && performanceData.averageGrade > 0) {
      reasons.push(
        `Below-average grades: ${performanceData.averageGrade.toFixed(1)}%`
      );
    }

    if (performanceData.participationScore < 50) {
      reasons.push("Low participation in class activities");
    }

    if (reasons.length === 0) {
      reasons.push("Overall academic performance needs improvement");
    }

    return reasons;
  }

  private generateRecommendations(
    user: any,
    performanceData: any,
    riskScore: number
  ): string[] {
    const recommendations: string[] = [];

    if ((user.attendance_rate || 0) < 70) {
      recommendations.push(
        "Improve class attendance by setting up reminders and prioritizing class schedules"
      );
    }

    if (performanceData.assignmentCompletionRate < 70) {
      recommendations.push(
        "Complete pending assignments and establish a regular study schedule"
      );
    }

    if (performanceData.averageGrade < 70 && performanceData.averageGrade > 0) {
      recommendations.push(
        "Seek additional academic support and tutoring resources"
      );
    }

    if (performanceData.participationScore < 50) {
      recommendations.push("Increase class participation and engagement");
    }

    recommendations.push(
      "Meet with academic advisor to discuss improvement strategies"
    );
    recommendations.push("Utilize campus learning resources and study groups");

    return recommendations;
  }

  private identifyRiskFactors(user: any, performanceData: any): string[] {
    const factors: string[] = [];

    if ((user.attendance_rate || 0) < 70) {
      factors.push("Poor attendance record");
    }

    if (performanceData.assignmentCompletionRate < 70) {
      factors.push("Incomplete assignments");
    }

    if (performanceData.averageGrade < 70 && performanceData.averageGrade > 0) {
      factors.push("Below-average academic performance");
    }

    if (performanceData.participationScore < 50) {
      factors.push("Low class participation");
    }

    return factors;
  }

  private identifyStrengths(user: any, performanceData: any): string[] {
    const strengths: string[] = [];

    if ((user.attendance_rate || 0) >= 90) {
      strengths.push("Excellent attendance record");
    }

    if (performanceData.assignmentCompletionRate >= 90) {
      strengths.push("High assignment completion rate");
    }

    if (
      performanceData.averageGrade >= 85 &&
      performanceData.averageGrade > 0
    ) {
      strengths.push("Strong academic performance");
    }

    if (performanceData.participationScore >= 70) {
      strengths.push("Active class participation");
    }

    if (strengths.length === 0) {
      strengths.push("Consistent effort in coursework");
    }

    return strengths;
  }

  private generateInsightRecommendations(
    user: any,
    performanceData: any
  ): string[] {
    const recommendations: string[] = [];

    // Build on strengths
    if ((user.attendance_rate || 0) >= 90) {
      recommendations.push("Maintain your excellent attendance record");
    }

    if (performanceData.averageGrade >= 85) {
      recommendations.push("Continue your strong academic performance");
    }

    // Address weaknesses
    if ((user.attendance_rate || 0) < 70) {
      recommendations.push("Focus on improving attendance");
    }

    if (performanceData.assignmentCompletionRate < 70) {
      recommendations.push("Prioritize assignment completion");
    }

    // General recommendations
    recommendations.push("Set up regular study sessions");
    recommendations.push("Join study groups for collaborative learning");
    recommendations.push("Utilize office hours for additional support");

    return recommendations;
  }
}

export const PredictiveService = new PredictiveService();
