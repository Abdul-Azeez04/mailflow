"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/supabase";
import { Btn, Card, Input, Textarea } from "@/components/ui";
import type { AIGeneratedEmail } from "@/types";

const TONE_OPTIONS = ["professional", "friendly", "urgent", "playful", "formal", "conversational", "empathetic", "bold"];

const TEMPLATES = [
  { label: "Welcome Email", prompt: "Write a warm welcome email for a new subscriber who just signed up for our newsletter." },
  { label: "Re-engagement", prompt: "Write a re-engagement email for users who haven't opened our emails in 60 days." },
  { label: "Product Launch", prompt: "Write a product launch announcement email. Build excitement, highlight key features." },
  { label: "Flash Sale", prompt: "Write an urgent flash sale email with a 24-hour limited offer." },
  { label: "Thank You", prompt: "Write a sincere thank you email for customers who made their first purchase." },
  { label: "Abandoned Cart", prompt: "Write an abandoned cart recovery email. Be helpful not pushy." },
];

export default function AIWriterTab() {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIGeneratedEmail | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"subject" | "body" | null>(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await apiFetch("email-automation", { action: "generate_email", prompt, tone, subject });
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Failed to generate email");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, field: "subject" | "body") => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">AI Email Writer</h2>
        <p className="text-gray-400">Generate high-converting emails with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <h3 className="text-white font-semibold">Quick Templates</h3>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.label}
                onClick={() => setPrompt(t.prompt)}
                className="text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 transition-all"
              >
                <span className="text-sm text-gray-300">{t.label}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Subject Line (optional)</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject or leave blank to auto-generate"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    tone === t
                      ? "bg-purple-600 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Describe your email</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what email you want to write..."
              rows={4}
            />
          </div>

          <Btn onClick={generate} disabled={loading || !prompt.trim()} className="w-full">
            {loading ? "Generating..." : "Generate Email"}
          </Btn>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </Card>

        <Card className="space-y-4">
          <h3 className="text-white font-semibold">Generated Email</h3>
          {result ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-400">Subject Line</label>
                  <button
                    onClick={() => copy(result.subject, "subject")}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    {copied === "subject" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white font-medium">{result.subject}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-400">Email Body</label>
                  <button
                    onClick={() => copy(result.body, "body")}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    {copied === "body" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 max-h-80 overflow-y-auto">
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">{result.body}</pre>
                </div>
              </div>

              {result.tips && result.tips.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Writing Tips</label>
                  <ul className="space-y-1">
                    {result.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-purple-400 mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">
              {loading ? "Generating your email..." : "Your generated email will appear here"}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
