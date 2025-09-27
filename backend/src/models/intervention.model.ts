export interface Intervention {
  id: string;
  student_id: string;
  triggered_by: string; // user ID who created the intervention
  reason: string;
  status: "open" | "closed";
  actions: InterventionAction[];
  created_at: string;
  updated_at: string;
}

export interface InterventionAction {
  type: "notification" | "meeting" | "resource" | "assignment";
  description: string;
  completed: boolean;
  created_at: string;
  completed_at?: string;
}

export interface CreateInterventionRequest {
  student_id: string;
  triggered_by: string;
  reason: string;
  actions: Omit<InterventionAction, "created_at" | "completed_at">[];
}

export interface UpdateInterventionRequest {
  status?: "open" | "closed";
  actions?: InterventionAction[];
}

export interface InterventionResponse {
  id: string;
  student_id: string;
  triggered_by: string;
  reason: string;
  status: "open" | "closed";
  actions: InterventionAction[];
  created_at: string;
  updated_at: string;
}
