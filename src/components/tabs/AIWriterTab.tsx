"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/supabase";
import { Btn, Card, Input, Textarea } from "@/components/ui";
import type { AIGeneratedEmail } from "@/types";

const TONE_OPTIONS = ["professional", "friendly", "urgent", "playful", "formal", "conversational", "empathetic", "bold"];

const TEMPLATES = [
  { label: "🎉 Welcome", prompt: "Write a warm welcome email for a new subscriber who just signed up. Make them feel excited and explain what to expect from our newsletter." },
  { label: "💤 Re-engage", prompt: "Write a re-engagement email for users who haven't opened our emails in 60 days. Be honest, offer value, give them an easy way to stay or unsubscribe." },
  { label: "🚀 Product Launch", prompt: "Write a product launch announcement email. Build excitement, highlight 3 key features, and include a strong call-to-action button." },
  { label: "⚡ Flash Sale", prompt: "Write an urgent flash sale email with a 24-hour limited offer. Create FOMO without being spammy. Include a countdown urgency hook." },
  { label: "🙏 Thank You", prompt: "Write a sincere thank you email for customers who made their first purchase. Build loyalty and gently introduce the next step." },
  { label: "🛒 Abandoned Cart", prompt: "Write an abandoned cart recovery email. Be helpful not pushy. Remind them what they left behind and offer light reassurance." },
  { label: "📊 Monthly Update", prompt: "Write a monthly product update newsletter. Summarize key improvements, upcoming features, and include a community highlight." },
  { label: "🎁 Referral Ask", prompt: "Write an email asking existing happy customers to refer a friend. Make it feel natural and include an incentive for both parties." },
];

export default function AIWriterTab() {
  const [prompt, setPrompt] = useState("");
  const [subject, setSubject] = useState("");
  const [tone, setTone] = useState("professional");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIGeneratedEmail | null>(null);
  const [history, setHistory] = useState<AIGeneratedEmail[]>([]);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<"html" | "text" | "raw">("html");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await apiFetch("/ai/generate", {
        method: "POST",
        body: JSON.stringify({ prompt, subject, tone, audience }),
      });
      const generated = data.generated as AIGeneratedEmail;
      setResult(generated);
      setHistory(h => [generated, ...h.slice(0, 4)]);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const loadHistory = (item: AIGeneratedEmail) => {
    setResult(item);
    setPreview("html");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="fade-in">
      {savedToast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 1000,
          background: "var(--green-soft)", border: "1px solid var(--green)",
          color: "var(--green)", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
        }}>✓ Copied to clipboard!</div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>✦ AI Email Writer</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Powered by Claude · Generate professional emails in seconds</div>
        </div>
      </div>

      {/* Template shortcuts */}
      <Card style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Quick Templates</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TEMPLATES.map(t => (
            <button key={t.label} onClick={() => setPrompt(t.prompt)} style={{
              background: prompt === t.prompt ? "var(--accent-soft)" : "#0d0d14",
              color: prompt === t.prompt ? "var(--accent)" : "var(--text-muted)",
              border: `1px solid ${prompt === t.prompt ? "var(--accent-glow)" : "var(--border)"}`,
              padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
              fontWeight: prompt === t.prompt ? 700 : 400, transition: "all 0.15s",
            }}>{t.label}</button>
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
            placeholder="Describe what this email should accomplish. Be specific about the goal, any offers, key points, and desired outcome."
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Subject Line Hint (optional)" value={subject} onChange={setSubject} placeholder="We miss you! Here's 20% off" />
            <Input label="Target Audience" value={audience} onChange={setAudience} placeholder="SaaS founders, 25–45, churned 30d" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tone</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TONE_OPTIONS.map(t => (
                <button key={t} onClick={() => setTone(t)} style={{
                  background: tone === t ? "var(--accent-soft)" : "transparent",
                  color: tone === t ? "var(--accent)" : "var(--text-muted)",
                  border: `1px solid ${tone === t ? "var(--accent)" : "var(--border)"}`,
                  padding: "5px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                  fontWeight: tone === t ? 700 : 400, transition: "all 0.15s",
                }}>{t}</button>
              ))}
            </div>
          </div>

          <Btn onClick={generate} disabled={loading || !prompt.trim()} style={{ justifyContent: "center" }}>
            {loading ? (
              <>
                <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                Generating with Claude…
              </>
            ) : "✦ Generate Email"}
          </Btn>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {error && (
            <div style={{ background: "var(--red-soft)", border: "1px solid var(--red)", borderRadius: 8, padding: "10px 14px", color: "var(--red)", fontSize: 13 }}>
              {error.includes("ANTHROPIC_API_KEY") || error.includes("401") || error.includes("403")
                ? "⚠ AI generation requires ANTHROPIC_API_KEY to be set in Supabase Edge Function secrets."
                : error}
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Recent Generations</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {history.map((h, i) => (
                  <button key={i} onClick={() => loadHistory(h)} style={{
                    background: "var(--surface-hover)", border: "1px solid var(--border)", borderRadius: 8,
                    padding: "8px 12px", cursor: "pointer", textAlign: "left", color: "var(--text-muted)",
                    fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {h.subject || "No subject"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Output panel */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Generated Email</div>
              <div style={{ display: "flex", gap: 6 }}>
                {(["html", "text", "raw"] as const).map(v => (
                  <button key={v} onClick={() => setPreview(v)} style={{
                    background: preview === v ? "var(--accent-soft)" : "transparent",
                    color: preview === v ? "var(--accent)" : "var(--text-muted)",
                    border: `1px solid ${preview === v ? "var(--accent)" : "var(--border)"}`,
                    padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 600,
                  }}>{v.toUpperCase()}</button>
                ))}
              </div>
            </div>

            {result.subject && (
              <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-glow)", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 10, color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Subject Line</div>
                <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 700 }}>{result.subject}</div>
              </div>
            )}

            {result.preview_text && (
              <div style={{ background: "var(--surface-hover)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 14px" }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Preview Text</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{result.preview_text}</div>
              </div>
            )}

            <div style={{ flex: 1, background: "#0d0d14", border: "1px solid var(--border)", borderRadius: 8, overflow: "auto", maxHeight: 400 }}>
              {preview === "html" ? (
                <div dangerouslySetInnerHTML={{ __html: result.html ?? result.text ?? "" }} style={{ padding: 16, background: "#fff", minHeight: 200 }} />
              ) : (
                <pre style={{ padding: 16, fontSize: 12, color: "var(--text)", whiteSpace: "pre-wrap", margin: 0, lineHeight: 1.6 }}>
                  {preview === "text" ? result.text : JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Btn variant="ghost" small onClick={() => copy(result.html ?? "", "html")} style={{ justifyContent: "center" }}>
                {copiedField === "html" ? "✓ Copied!" : "Copy HTML"}
              </Btn>
              <Btn variant="ghost" small onClick={() => copy(result.subject ?? "", "subject")} style={{ justifyContent: "center" }}>
                {copiedField === "subject" ? "✓ Copied!" : "Copy Subject"}
              </Btn>
              <Btn variant="ghost" small onClick={() => copy(result.text ?? "", "text")} style={{ justifyContent: "center" }}>
                {copiedField === "text" ? "✓ Copied!" : "Copy Plain Text"}
              </Btn>
              <Btn variant="ghost" small onClick={() => setResult(null)} style={{ justifyContent: "center" }}>
                Clear
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
