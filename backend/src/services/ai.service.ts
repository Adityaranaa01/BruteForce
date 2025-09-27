import axios from "axios";
import { config } from "../config";
import { supabase } from "../config";
import { CreateSummaryRequest } from "../models/summary.model";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatResponse {
  conversationId: string;
  message: string;
  timestamp: string;
}

interface SummaryResponse {
  bullets: string[];
  transcript: string;
}

class AiService {
  private openaiApiKey: string;

  constructor() {
    this.openaiApiKey = config.openai.apiKey;
  }

  async chat(
    userId: string,
    message: string,
    conversationId?: string
  ): Promise<ChatResponse> {
    try {
      // Get or create conversation
      let convId = conversationId;
      if (!convId) {
        const { data: newConversation, error } = await supabase
          .from("ai_conversations")
          .insert({
            user_id: userId,
            title: message.substring(0, 50) + "...",
            messages: [],
          })
          .select()
          .single();

        if (error) {
          throw new Error("Failed to create conversation");
        }
        convId = newConversation.id;
      }

      // Get conversation history
      const { data: conversation, error: fetchError } = await supabase
        .from("ai_conversations")
        .select("messages")
        .eq("id", convId)
        .single();

      if (fetchError) {
        throw new Error("Failed to fetch conversation");
      }

      // Prepare messages for OpenAI
      const messages: ChatMessage[] = [
        {
          role: "system",
          content:
            "You are a helpful AI assistant for a campus digitization platform. Help students and teachers with educational questions, course materials, and academic support.",
        },
        ...(conversation?.messages || []),
        { role: "user", content: message },
      ];

      // Call OpenAI API
      const response = await this.callOpenAI(messages);

      // Update conversation with new messages
      const updatedMessages = [
        ...(conversation?.messages || []),
        { role: "user", content: message },
        { role: "assistant", content: response },
      ];

      await supabase
        .from("ai_conversations")
        .update({
          messages: updatedMessages,
          updated_at: new Date().toISOString(),
        })
        .eq("id", convId);

      return {
        conversationId: convId,
        message: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (this.openaiApiKey === "REPLACE_ME" || !this.openaiApiKey) {
        // Return mock response if API key is not configured
        return {
          conversationId: conversationId || "mock-conversation-id",
          message:
            "This is a mock AI response. Please configure your OpenAI API key to enable real AI functionality.",
          timestamp: new Date().toISOString(),
        };
      }
      throw error;
    }
  }

  async transcribe(recordingUrl: string): Promise<string> {
    try {
      if (this.openaiApiKey === "REPLACE_ME" || !this.openaiApiKey) {
        return "This is a mock transcription. Please configure your OpenAI API key to enable real transcription functionality.";
      }

      // For demo purposes, return a mock transcription
      // In production, you would:
      // 1. Download the audio file from recordingUrl
      // 2. Convert it to the required format for Whisper API
      // 3. Call OpenAI Whisper API
      return "Mock transcription of the lecture recording. This would contain the actual transcribed text from the audio file.";
    } catch (error) {
      throw new Error("Failed to transcribe recording");
    }
  }

  async summarizeTranscript(transcript: string): Promise<string[]> {
    try {
      if (this.openaiApiKey === "REPLACE_ME" || !this.openaiApiKey) {
        return [
          "This is a mock summary bullet point 1.",
          "This is a mock summary bullet point 2.",
          "This is a mock summary bullet point 3.",
        ];
      }

      const messages: ChatMessage[] = [
        {
          role: "system",
          content:
            "You are an AI that creates concise bullet-point summaries of lecture transcripts. Return only the bullet points, one per line, without numbering or bullet symbols.",
        },
        {
          role: "user",
          content: `Please summarize this lecture transcript into 5-7 key bullet points:\n\n${transcript}`,
        },
      ];

      const response = await this.callOpenAI(messages);
      return response.split("\n").filter((line) => line.trim().length > 0);
    } catch (error) {
      throw new Error("Failed to summarize transcript");
    }
  }

  async getEmbeddings(text: string): Promise<number[]> {
    try {
      if (this.openaiApiKey === "REPLACE_ME" || !this.openaiApiKey) {
        // Return mock embeddings
        return Array(1536)
          .fill(0)
          .map(() => Math.random() - 0.5);
      }

      const response = await axios.post(
        "https://api.openai.com/v1/embeddings",
        {
          input: text,
          model: "text-embedding-ada-002",
        },
        {
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.data[0].embedding;
    } catch (error) {
      throw new Error("Failed to get embeddings");
    }
  }

  async summarizeLecture(lectureId: string): Promise<any> {
    try {
      // Get lecture details
      const { data: lecture, error: lectureError } = await supabase
        .from("lectures")
        .select("*")
        .eq("id", lectureId)
        .single();

      if (lectureError || !lecture) {
        throw new Error("Lecture not found");
      }

      // Check if summary already exists
      const { data: existingSummary } = await supabase
        .from("summaries")
        .select("*")
        .eq("lecture_id", lectureId)
        .single();

      if (existingSummary) {
        return existingSummary;
      }

      let transcript = lecture.transcript;

      // If no transcript exists but recording URL is available, transcribe it
      if (!transcript && lecture.recording_url) {
        transcript = await this.transcribe(lecture.recording_url);

        // Update lecture with transcript
        await supabase
          .from("lectures")
          .update({ transcript })
          .eq("id", lectureId);
      }

      if (!transcript) {
        throw new Error("No transcript available for summarization");
      }

      // Generate summary
      const bullets = await this.summarizeTranscript(transcript);

      // Store summary
      const { data: summary, error: summaryError } = await supabase
        .from("summaries")
        .insert({
          lecture_id: lectureId,
          bullets,
          transcript,
          generated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (summaryError) {
        throw new Error("Failed to store summary");
      }

      // Update lecture with summary reference
      await supabase
        .from("lectures")
        .update({ summary_id: summary.id })
        .eq("id", lectureId);

      return summary;
    } catch (error) {
      throw new Error("Failed to summarize lecture");
    }
  }

  private async callOpenAI(messages: ChatMessage[]): Promise<string> {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${this.openaiApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  }
}

export const AiService = new AiService();
