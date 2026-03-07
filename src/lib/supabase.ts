import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let _client: ReturnType<typeof createClient> | null = null;
function getClient() {
  if (!_client) {
    if (!supabaseUrl || !supabaseAnonKey) throw new Error("Supabase env vars missing");
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_t, prop) { return (getClient() as Record<string | symbol, unknown>)[prop]; }
});

export const API_BASE = supabaseUrl ? supabaseUrl + "/functions/v1/email-automation" : "";

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "HTTP " + res.status);
  }
  return res.json();
};
