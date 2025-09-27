export interface Recommendation {
  id: string;
  user_id: string;
  resource_title: string;
  resource_url: string;
  reason: string;
  feedback?: {
    useful: boolean;
    created_at: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateRecommendationRequest {
  user_id: string;
  resource_title: string;
  resource_url: string;
  reason: string;
}

export interface RecommendationFeedbackRequest {
  useful: boolean;
}

export interface RecommendationResponse {
  id: string;
  user_id: string;
  resource_title: string;
  resource_url: string;
  reason: string;
  feedback?: {
    useful: boolean;
    created_at: string;
  };
  created_at: string;
  updated_at: string;
}
