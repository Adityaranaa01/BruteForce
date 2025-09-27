export interface Notification {
  id: string;
  title: string;
  body: string;
  recipient_id: string | "all"; // user ID or 'all' for broadcast
  read_by: string[]; // array of user IDs who have read this
  link?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationRequest {
  title: string;
  body: string;
  recipient_id: string | "all";
  link?: string;
}

export interface NotificationResponse {
  id: string;
  title: string;
  body: string;
  recipient_id: string | "all";
  read_by: string[];
  link?: string;
  created_at: string;
  updated_at: string;
  is_read?: boolean; // computed field for current user
}
