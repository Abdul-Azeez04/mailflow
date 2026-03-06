export interface Contact {
  id: string;
  email: string;
  name: string | null;
  tags: string[] | null;
  status: string;
  engagement_score: number | null;
  created_at: string | null;
}