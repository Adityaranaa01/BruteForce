export interface Summary {
  id: string;
  lecture_id: string;
  bullets: string[];
  transcript: string;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSummaryRequest {
  lecture_id: string;
  bullets: string[];
  transcript: string;
}

export interface SummaryResponse {
  id: string;
  lecture_id: string;
  bullets: string[];
  transcript: string;
  generated_at: string;
  created_at: string;
  updated_at: string;
}
