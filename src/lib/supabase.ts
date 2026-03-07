import { createClient } from "@supabase/supabase-js";

// Hardcoded for reliability — env vars are also set in Vercel as backup
const SUPABASE_URL = "https://mnwjyqhrkyfstplewhzz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ud2p5cWhya3lmc3RwbGV3aHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MjczMzcsImV4cCI6MjA4ODIwMzMzN30.gFdsZOcfsw3Y0ajyfiSelr1eA9q1qdLv3euDuH3AJzE";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const API_BASE = `${supabaseUrl}/functions/v1/email-automation`;

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
};
