export type Contact = {
  id: string;
  name: string;
  email: string;
  status: "subscribed" | "unsubscribed" | "bounced";
  tags: string[];
  engagement_score: number;
  last_opened_at: string | null;
  last_clicked_at: string | null;
  created_at: string;
};

export type Campaign = {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  status: "draft" | "scheduled" | "sent" | "failed";
  sent_at: string | null;
  scheduled_at: string | null;
  target_segment: object;
  total_sent: number;
  total_opens: number;
  total_clicks: number;
  created_at: string;
};

export type EmailEvent = {
  id: string;
  contact_id: string | null;
  campaign_id: string | null;
  type: "sent" | "opened" | "clicked" | "bounced" | "unsubscribed";
  meta: object;
  occurred_at: string;
};

export type Sequence = {
  id: string;
  name: string;
  trigger_type: string;
  status: "active" | "paused" | "draft";
  steps: SequenceStep[];
  enrollment_count: number;
  created_at: string;
};

export type SequenceStep = {
  id: string;
  sequence_id: string;
  step_order: number;
  subject: string;
  body_html: string;
  delay_hours: number;
  created_at: string;
};

export type QueueJob = {
  id: string;
  name: string;
  data: object;
  opts: object;
  progress: number;
  attemptsMade: number;
  timestamp: number;
  processedOn: number | null;
  finishedOn: number | null;
  failedReason: string | null;
  status: "waiting" | "active" | "completed" | "failed";
};
