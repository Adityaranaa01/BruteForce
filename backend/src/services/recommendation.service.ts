import { supabase } from "../config";
import { AiService } from "./ai.service";
import { CreateRecommendationRequest } from "../models/recommendation.model";

interface RecommendationRule {
  condition: (user: any) => boolean;
  generateRecommendation: (user: any) => CreateRecommendationRequest;
}

class RecommendationService {
  private aiService: AiService;

  constructor() {
    this.aiService = new AiService();
  }

  async generateRecommendations(userId: string): Promise<any[]> {
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

      const recommendations: CreateRecommendationRequest[] = [];

      // Rule-based recommendations
      const ruleBasedRecs = await this.generateRuleBasedRecommendations(user);
      recommendations.push(...ruleBasedRecs);

      // Embedding-based recommendations (if user has course data)
      if (user.courses && user.courses.length > 0) {
        const embeddingRecs = await this.generateEmbeddingBasedRecommendations(
          user
        );
        recommendations.push(...embeddingRecs);
      }

      // Store recommendations in database
      const storedRecommendations = await Promise.all(
        recommendations.map(async (rec) => {
          const { data: recommendation, error } = await supabase
            .from("recommendations")
            .insert(rec)
            .select()
            .single();

          if (error) {
            console.error("Failed to store recommendation:", error);
            return null;
          }

          return recommendation;
        })
      );

      return storedRecommendations.filter((rec) => rec !== null);
    } catch (error) {
      throw new Error("Failed to generate recommendations");
    }
  }

  private async generateRuleBasedRecommendations(
    user: any
  ): Promise<CreateRecommendationRequest[]> {
    const recommendations: CreateRecommendationRequest[] = [];

    const rules: RecommendationRule[] = [
      {
        condition: (user) => (user.attendance_rate || 0) < 70,
        generateRecommendation: (user) => ({
          user_id: user.id,
          resource_title: "Attendance Improvement Guide",
          resource_url: "/resources/attendance-guide",
          reason: `Your attendance rate is ${
            user.attendance_rate || 0
          }%. Consider reviewing attendance policies and setting up reminders.`,
        }),
      },
      {
        condition: (user) =>
          user.role === "student" && (user.attendance_rate || 0) < 50,
        generateRecommendation: (user) => ({
          user_id: user.id,
          resource_title: "Academic Support Resources",
          resource_url: "/resources/academic-support",
          reason:
            "Low attendance detected. Access academic support resources and consider reaching out to your advisor.",
        }),
      },
      {
        condition: (user) => user.courses && user.courses.length === 0,
        generateRecommendation: (user) => ({
          user_id: user.id,
          resource_title: "Course Registration Guide",
          resource_url: "/resources/course-registration",
          reason:
            "You are not enrolled in any courses. Review available courses and register for the upcoming semester.",
        }),
      },
      {
        condition: (user) => user.role === "student",
        generateRecommendation: (user) => ({
          user_id: user.id,
          resource_title: "Study Skills Workshop",
          resource_url: "/resources/study-skills",
          reason:
            "Improve your study techniques with our comprehensive study skills workshop.",
        }),
      },
    ];

    for (const rule of rules) {
      if (rule.condition(user)) {
        recommendations.push(rule.generateRecommendation(user));
      }
    }

    return recommendations;
  }

  private async generateEmbeddingBasedRecommendations(
    user: any
  ): Promise<CreateRecommendationRequest[]> {
    try {
      // Get user's course data
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .in("id", user.courses);

      if (coursesError || !courses) {
        return [];
      }

      // Create user profile text
      const userProfile = `Student interested in: ${courses
        .map((c: any) => c.name)
        .join(", ")}`;

      // Get embeddings for user profile
      const userEmbeddings = await this.aiService.getEmbeddings(userProfile);

      // Get all available resources
      const resources = [
        {
          title: "Advanced Mathematics Tutorials",
          url: "/resources/math-tutorials",
          description:
            "Comprehensive mathematics tutorials for advanced courses",
        },
        {
          title: "Programming Fundamentals",
          url: "/resources/programming-basics",
          description: "Learn programming fundamentals and best practices",
        },
        {
          title: "Research Methods Guide",
          url: "/resources/research-methods",
          description: "Guide to academic research and writing methods",
        },
        {
          title: "Time Management for Students",
          url: "/resources/time-management",
          description: "Effective time management strategies for students",
        },
        {
          title: "Group Study Techniques",
          url: "/resources/group-study",
          description:
            "Learn effective group study and collaboration techniques",
        },
      ];

      // Calculate similarity scores
      const recommendations: CreateRecommendationRequest[] = [];

      for (const resource of resources) {
        try {
          const resourceEmbeddings = await this.aiService.getEmbeddings(
            `${resource.title} ${resource.description}`
          );

          const similarity = this.calculateCosineSimilarity(
            userEmbeddings,
            resourceEmbeddings
          );

          // Only recommend if similarity is above threshold
          if (similarity > 0.3) {
            recommendations.push({
              user_id: user.id,
              resource_title: resource.title,
              resource_url: resource.url,
              reason: `Based on your course interests, this resource has a ${(
                similarity * 100
              ).toFixed(1)}% relevance match.`,
            });
          }
        } catch (error) {
          console.error("Error processing resource:", resource.title, error);
        }
      }

      return recommendations.slice(0, 3); // Return top 3 recommendations
    } catch (error) {
      console.error("Error generating embedding-based recommendations:", error);
      return [];
    }
  }

  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error("Vectors must have the same length");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  async recordFeedback(
    recommendationId: string,
    useful: boolean
  ): Promise<void> {
    try {
      await supabase
        .from("recommendations")
        .update({
          feedback: {
            useful,
            created_at: new Date().toISOString(),
          },
        })
        .eq("id", recommendationId);
    } catch (error) {
      throw new Error("Failed to record feedback");
    }
  }
}

export const RecommendationService = new RecommendationService();
