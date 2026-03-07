export interface Contact {
  id: string;
  email: string;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  tags: string[] | null;
  status: string;
  engagement_score: number | null;
  created_at: string | null;
  metadata: Record<string, unknown> | null;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  from_name: string;
  from_email: string;
  status: string;
  html_content: string | null;
  text_content: string | null;
  preview_text: string | null;
  ai_prompt: string | null;
  send_at: string | null;
  sent_at: string | null;
  created_at: string | null;
  campaign_stats?: CampaignStats[];
}

export interface CampaignStats {
  id: string;
  campaign_id: string | null;
  total_sent: number | null;
  total_delivered: number | null;
  total_opens: number | null;
  unique_opens: number | null;
  total_clicks: number | null;
  unique_clicks: number | null;
  total_bounces: number | null;
  total_unsubscribes: number | null;
}

export interface Sequence {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  status: string;
  created_at: string | null;
  sequence_steps?: SequenceStep[];
}

export interface SequenceStep {
  id: string;
  sequence_id: string;
  step_order: number;
  delay_hours: number;
  subject: string;
  ai_prompt: string | null;
  html_content: string | null;
}

export interface EmailSend {
  id: string;
  to_email: string;
  subject: string;
  status: string;
  resend_id: string | null;
  campaign_id: string | null;
  contact_id: string | null;
  sent_at: string | null;
  queued_at: string | null;
}

export interface TrackingEvent {
  id: string;
  contact_id: string | null;
  email_send_id: string | null;
  event_type: string;
  url: string | null;
  occurred_at: string | null;
  contacts?: { email: string; name: string | null } | null;
}

export interface QueueJob {
  id: string;
  job_type: string;
  payload: Record<string, unknown>;
  status: string;
  attempts: number | null;
  max_attempts: number | null;
  error_message: string | null;
  scheduled_for: string | null;
  completed_at: string | null;
  created_at: string | null;
}

export interface AIGeneratedEmail {
  subject: string;
  html: string;
  text: string;
  preview_text: string;
}
