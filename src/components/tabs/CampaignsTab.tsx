"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/supabase";
import { Badge, Btn, Card, Input, Textarea, StatCard } from "@/components/ui";
import type { Campaign } from "@/types";

interface Props {
  campaigns: Campaign[];
  onRefresh: () => void;
}

interface CampaignForm {
  name: string; subject: string; from_name: string; from_email: string;
  preview_text: string; html_content: string; text_content: string;
}

const EMPTY: CampaignForm = {
  name: "", subject: "", from_name: "My Brand", from_email: "",
  preview_text: "", html_content: "", text_content: "",
};

type FilterStatus = "all" | "draft" | "sent" | "sending" | "paused";

export default function CampaignsTab({ campaigns, onRefresh }: Props) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CampaignForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const set = (k: keyof CampaignForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const create = async () => {
    if (!form.name || !form.subject || !form.from_email) return;
    setLoading(true);
    try {
      await apiFetch("/campaigns", { method: "POST", body: JSON.stringify(form) });
      setCreating(false);
      setForm(EMPTY);
      onRefresh();
      showToast("✓ Campaign created successfully");
    } catch (e) {
      showToast(`✗ ${e}`);
    } finally {
      setLoading(false);
    }
  };

  const send = async (id: string) => {
    setSending(id);
    try {
      await apiFetch("/campaigns/send", { method: "POST", body: JSON.stringify({ campaign_id: id }) });
      onRefresh();
      showToast("✓ Campaign queued for sending");
    } catch (e) {
      showToast(`✗ ${e}`);
    } finally {
      setSending(null);
    }
  };

  const filtered = campaigns.filter(c => {
    const matchFilter = filter === "all" || c.status === filter;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.subject.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalSent = campaigns.filter(c => c.status === "sent").length;
  const totalDraft = campaigns.filter(c => c.status === "draft").length;
  const totalRecipients = campaigns.reduce((s, c) => s + (c.campaign_stats?.[0]?.total_sent ?? 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="fade-in">
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 1000,
          background: toast.startsWith("✓") ? "var(--green-soft)" : "var(--red-soft)",
          border: `1px solid ${toast.startsWith("✓") ? "var(--green)" : "var(--red)"}`,
          color: toast.startsWith("✓") ? "var(--green)" : "var(--red)",
          padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
          boxShadow: "var(--shadow)", animation: "fadeIn 0.2s ease",
        }}>{toast}</div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Total Campaigns" value={campaigns.length} color="var(--text)" />
        <StatCard label="Drafts" value={totalDraft} color="var(--amber)" />
        <StatCard label="Sent" value={totalSent} color="var(--green)" />
        <StatCard label="Total Recipients" value={totalRecipients.toLocaleString()} color="var(--blue)" />
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          placeholder="Search campaigns…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, background: "var(--surface-hover)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "8px 12px", color: "var(--text)", fontSize: 13,
          }}
        />
        <div style={{ display: "flex", gap: 4 }}>
          {(["all", "draft", "sent", "sending"] as FilterStatus[]).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
              border: "1px solid var(--border)", cursor: "pointer",
              background: filter === f ? "var(--accent-soft)" : "transparent",
              color: filter === f ? "var(--accent)" : "var(--text-muted)",
              outline: filter === f ? "1px solid var(--accent-glow)" : "none",
            }}>{f}</button>
          ))}
        </div>
        <Btn onClick={() => { setCreating(!creating); setSelected(null); }}>
          {creating ? "✕ Cancel" : "+ New Campaign"}
        </Btn>
      </div>

      {/* Create form */}
      {creating && (
        <Card style={{ borderColor: "var(--accent-glow)", borderWidth: 1 }} className="fade-in">
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 18 }}>✦ Create New Campaign</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Input label="Campaign Name *" value={form.name} onChange={set("name")} placeholder="Black Friday 2025" />
            <Input label="Subject Line *" value={form.subject} onChange={set("subject")} placeholder="🔥 Up to 50% off today only" />
            <Input label="From Name" value={form.from_name} onChange={set("from_name")} />
            <Input label="From Email *" value={form.from_email} onChange={set("from_email")} placeholder="hello@yourdomain.com" type="email" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <Input label="Preview Text" value={form.preview_text} onChange={set("preview_text")} placeholder="Don't miss our biggest sale of the year…" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <Textarea label="HTML Content  · use {{name}} {{email}} for personalisation" value={form.html_content} onChange={set("html_content")} rows={6} placeholder="<h1>Hey {{name}}!</h1><p>…</p>" />
          </div>
          <div style={{ marginBottom: 18 }}>
            <Textarea label="Plain Text Fallback" value={form.text_content} onChange={set("text_content")} rows={3} placeholder="Plain text version…" />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={create} disabled={loading || !form.name || !form.subject || !form.from_email}>
              {loading ? "Creating…" : "Create Campaign"}
            </Btn>
            <Btn variant="ghost" onClick={() => setCreating(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {/* Campaign list */}
      {filtered.length === 0 ? (
        <Card>
          <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 48, fontSize: 14 }}>
            {search || filter !== "all" ? "No campaigns match your filter." : "No campaigns yet. Create your first one above."}
          </div>
        </Card>
      ) : (
        filtered.map((c) => (
          <Card key={c.id} style={{
            cursor: "pointer",
            borderColor: selected?.id === c.id ? "var(--accent-glow)" : "var(--border)",
            transition: "border-color 0.15s",
          }} onClick={() => setSelected(selected?.id === c.id ? null : c)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>{c.name}</span>
                  <Badge status={c.status} />
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{c.subject}</div>
                <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                  From: {c.from_name} &lt;{c.from_email}&gt;
                  {c.sent_at && ` · Sent ${new Date(c.sent_at).toLocaleDateString()}`}
                  {c.created_at && ` · Created ${new Date(c.created_at).toLocaleDateString()}`}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                {c.campaign_stats?.[0] && (
                  <div style={{ display: "flex", gap: 16, marginRight: 4 }}>
                    <MiniStat label="Sent" value={(c.campaign_stats[0].total_sent ?? 0).toLocaleString()} />
                    <MiniStat label="Opens" value={`${c.campaign_stats[0].total_sent ? Math.round(((c.campaign_stats[0].unique_opens ?? 0) / c.campaign_stats[0].total_sent) * 100) : 0}%`} color="var(--blue)" />
                    <MiniStat label="Clicks" value={`${c.campaign_stats[0].total_sent ? Math.round(((c.campaign_stats[0].unique_clicks ?? 0) / c.campaign_stats[0].total_sent) * 100) : 0}%`} color="var(--green)" />
                  </div>
                )}
                {c.status === "draft" && (
                  <Btn variant="success" small onClick={(e) => { e.stopPropagation(); send(c.id); }} disabled={sending === c.id}>
                    {sending === c.id ? "⏳ Sending…" : "▶ Send Now"}
                  </Btn>
                )}
              </div>
            </div>

            {selected?.id === c.id && (
              <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 16 }} className="fade-in">
                <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                  {c.campaign_stats?.[0] && (
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {[
                        { l: "Total Sent", v: c.campaign_stats[0].total_sent ?? 0 },
                        { l: "Delivered", v: c.campaign_stats[0].total_delivered ?? 0 },
                        { l: "Opens", v: c.campaign_stats[0].total_opens ?? 0 },
                        { l: "Unique Opens", v: c.campaign_stats[0].unique_opens ?? 0 },
                        { l: "Clicks", v: c.campaign_stats[0].unique_clicks ?? 0 },
                        { l: "Bounces", v: c.campaign_stats[0].total_bounces ?? 0 },
                        { l: "Unsubs", v: c.campaign_stats[0].total_unsubscribes ?? 0 },
                      ].map(({ l, v }) => (
                        <div key={l} style={{ background: "var(--surface-hover)", borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>{v.toLocaleString()}</div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>{l}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {c.html_content && (
                  <>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>HTML Preview</div>
                    <div
                      style={{ background: "#fff", borderRadius: 8, padding: 16, maxHeight: 300, overflow: "auto", border: "1px solid var(--border)" }}
                      dangerouslySetInnerHTML={{ __html: c.html_content }}
                    />
                  </>
                )}
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}

const MiniStat = ({ label, value, color = "var(--text)" }: { label: string; value: string | number; color?: string }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: 14, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
  </div>
);
