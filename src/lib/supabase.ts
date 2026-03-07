import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const EFN_URL = `${SUPABASE_URL}/functions/v1/email-automation`;

export async function apiFetch(
  path: string,
  options?: RequestInit
) {
  const res = await fetch(`${EFJ_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      ...(options?.headers as Record<string, string> || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`x ${res.status} ${text}`);
  }
  return res.json();
}
