"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/supabase";
import { Btn, Card, Input, Textarea } from "@/components/ui";
import type { AIGeneratedEmail } from "@/types";

const TONE_OPTIONS = ["professional", "friendly", "urgent", "playful", "formal", "conversational", "empathetic", "bold"];

const TEMPLATES = [
  { label: "Welcome Email", prompt: "Write a warm welcome email for a new subscriber who just signed up for our newsletter. Make them feel excited and explain what to expect." },
  { label: "Re-engagement", prompt: "Write a re-engagement email for users who haven't opened our emails in 60 days. Be honest, offer value, give them an easy way to stay or unsubscribe." },
  { label: "Product Launch", prompt: "Write a product launch announcement email. Build excitement, highlight key features, and include a strong call-to-action." },
  { label: "Flash Sale", prompt: "Write an urgent flash sale email with a 24-hour limited offer. Create FOMO without being spammy." },
  { label: "Thank You", prompt: "Write a sincere thank you email for customers who made their first purchase. Build loyalty and gently introduce the next step." },
  { label: "Abandoned Cart", prompt: "Write an abandoned cart recovery email. Be helpful not pushy. Remind them what they left behind and offer light reassurance." },
];

export default function AIWriterTab() {
  const [prompt, setPrompt] = useState("");
  const [subject, setSubject] = useState("");
  const [tone, setTone] = useState("professional");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIGeneratedEmail | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<"html" | "text" | "raw">("html");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await apiFetch("/ai/generate", { method: "POST", body: JSON.stringify({ prompt, subject, tone, audience }) });
      setResult(data.generated);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>AI Email Writer</div>

      {/* Template shortcuts */}
      <Card>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Quick Templates</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TEMPLATES.map(t => (
            <button
              key={t.label}
              onClick={() => setPrompt(t.prompt)}
              style={{
                background: prompt === t.prompt ? "var(--accent-soft)" : "#0d0d14",
                color: prompt === t.prompt ? "var(--accent)" : "var(--text-muted)",
                border: `1px solid ${prompt === t.prompt ? "var(--accent-glow)" : "var(--border)"}`,
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 12,
                cursor: "pointer",
                fontWeight: prompt === t.prompt ? 700 : 400,
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: 20 }}>
        {/* Input panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Textarea
            label="Campaign Brief *"
            value={prompt}
            onChange={setPrompt}
            rows={5}
            placeholder="Describe what this email should accomplish. Be specific about the goal, any offers, key points to hit, and the desired outcome."
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Subject Line (optional hint)" value={subject} onChange={setSubject} placeholder="We miss you! Here's 20% off" />
            <Input label="Target Audience" value={audience} onChange={setAudience} placeholder="SaaS users, 25–45, churned 30 days ago" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tone</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TONE_OPTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  style={{
                    background: tone === t ? "var(--accent-soft)" : "transparent",
                    color: tone === t ? "var(--accent)" : "var(--text-muted)",
                    border: `1px solid ${tone === t ? "var(--accent)" : "var(--border)"}`,
                    padding: "5px 14px",
                    borderRadius: 20,
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: tone === t ? 700 : 400,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={generate} disabled={loading || !prompt.trim()} style={{ flex: 1, justifyContent: "center" }}>
              {loading ? (
                <>
                  <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                  Generating…
                </>
              ) : (
                <>✨ Generate Email</>
              )}
            </Btn>
            {result && (
              <Btn variant="ghost" onClick={() => setResult(null)}>Clear</Btn>
            )}
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {error && (
            <div style={{ background: "var(--red-soft)", border: "1px solid var(--red)", borderRadius: 8, padding: "10px 14px", color: "var(--red)", fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>

        {/* Output panel */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Generated Email</div>
              <div style={{ display: "flex", gap: 6 }}>
                {(["html", "text", "raw"] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setPreview(v)}
                    style={{
                      background: preview === v ? "var(--accent-soft)" : "transparent",
                      color: preview === v ? "var(--accent)" : "var(--text-muted)",
                      border: `1px solid ${preview === v ? "var(--accent)" : "var(--border)"}`,
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    {v.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {result.subject && (
              <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-glow)", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 10, color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Subject Line</div>
                <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 600 }}>{result.subject}</div>
              </div>
            )}

            {result.preview_text && (
              <div style={{ background: "#0d0d14", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 14px" }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Preview Text</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{result.preview_text}</div>
              </div>
            )}

            <div style={{ flex: 1, background: "#0d0d14", border: "1px solid var(--border)", borderRadius: 8, overflow: "auto", maxHeight: 380 }}>
              {preview === "html" ? (
                <div dangerouslySetInnerHTML={{ __html: result.html ?? result.text ?? "" }} style={{ padding: 16, color: "var(--text)", background: "#fff", minHeight: 200 }} />
              ) : (
                <pre style={{ padding: 16, fontSize: 12, color: "var(--text)", whiteSpace: "pre-wrap", margin: 0 }}>
                  {preview === "text" ? result.text : JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" small onClick={() => copy(result.html ?? "")} style={{ flex: 1, justifyContent: "center" }}>
                {copied ? "✓ Copied!" : "Copy HTML"}
              </Btn>
              <Btn variant="ghost" small onClick={() => copy(result.subject ?? "")} style={{ flex: 1, justifyContent: "center" }}>
                Copy Subject
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
