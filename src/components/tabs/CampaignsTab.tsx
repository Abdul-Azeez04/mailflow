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
  name: string;
  subject: string;
  from_name: string;
  from_email: string;
  preview_text: string;
  html_content: string;
  text_content: string;
}

const EMPTY: CampaignForm = {
  name: "", subject: "", from_name: "My Brand", from_email: "",
  preview_text: "", html_content: "", text_content: "",
};

export default function CampaignsTab({ campaigns, onRefresh }: Props) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CampaignForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [selected, setSelected] = useState<Campaign | null>(null);

  const set = (k: keyof CampaignForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const create = async () => {
    if (!form.name || !form.subject || !form.from_email) return;
    setLoading(true);
    try {
      await apiFetch("/campaigns", { method: "POST", body: JSON.stringify(form) });
      setCreating(false);
      setForm(EMPTY);
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const send = async (id: string) => {
    setSending(id);
    try {
      await apiFetch("/campaigns/send", { method: "POST", body: JSON.stringify({ campaign_id: id }) });
      onRefresh();
    } finally {
      setSending(null);
    }
  };

  const totalSent = campaigns.filter(c => c.status === "sent").length;
  const totalDraft = campaigns.filter(c => c.status === "draft").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16 }}>
        <StatCard label="Total Campaigns" value={campaigns.length} color="var(--text)" />
        <StatCard label="Drafts" value={totalDraft} color="var(--amber)" />
        <StatCard label="Sent" value={totalSent} color="var(--green)" />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>All Campaigns</div>
        <Btn onClick={() => { setCreating(!creating); setSelected(null); }}>+ New Campaign</Btn>
      </div>

      {creating && (
        <Card style={{ borderColor: "var(--accent-glow)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Create Campaign</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Input label="Campaign Name *" value={form.name} onChange={set("name")} placeholder="Black Friday 2025" />
            <Input label="Subject Line *" value={form.subject} onChange={set("subject")} placeholder="🔥 Up to 50% off today only" />
            <Input label="From Name" value={form.from_name} onChange={set("from_name")} />
            <Input label="From Email *" value={form.from_email} onChange={set("from_email")} placeholder="hello@yourdomain.com" type="email" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <Input label="Preview Text" value={form.preview_text} onChange={set("preview_text")} placeholder="Don't miss our biggest sale of the year………" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <Textarea label="HTML Content (use {{name}} {{email}} for personalisation)" value={form.html_content} onChange={set("html_content")} rows={6} placeholder="<h1>Hey {{name}}!</h1><p>…</p>" />
          </div>
          <div style={{ marginBottom: 16 }}>
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

      {campaigns.length === 0 ? (
        <Card><div style={{ color: "var(--text-muted)", textAlign: "center", padding: 48 }}>No campaigns yet. Create your first one above.</div></Card>
      ) : (
        campaigns.map((c) => (
          <Card
            key={c.id}
            style={{
              cursor: "pointer",
              borderColor: selected?.id === c.id ? "var(--accent-glow)" : "var(--border)",
            }}
            onClick={() => setSelected(selected?.id === c.id ? null : c)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>{c.name}</span>
                  <Badge status={c.status} />
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{c.subject}</div>
                <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                  From: {c.from_name} &lt;{c.from_email}&gt;
                  {c.sent_at && ` · Sent ${new Date(c.sent_at).toLocaleDateString()}`}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {c.campaign_stats?.[0] && (
                  <div style={{ display: "flex", gap: 12, marginRight: 8 }}>
                    <MiniStat label="Sent" value={c.campaign_stats[0].total_sent ?? 0} />
                    <MiniStat label="Opens" value={`${c.campaign_stats[0].total_sent ? Math.round(((c.campaign_stats[0].unique_opens ?? 0) / c.campaign_stats[0].total_sent) * 100) : 0}%`} />
                  </div>
                )}
                {c.status === "draft" && (
                  <Btn
                    variant="success"
                    small
                    onClick={(e} => { e.stopPropagation(); send(c.id); }}
                    disabled={sending === c.id}
                  >
                    {sending === c.id ? "⏳ Sending……" : "▶ Send Now"}
                  </Btn>
                )}
              </div>
            </div>

            {selected?.id === c.id && c.html_content && (
              <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>HTML Preview</div>
                <div
                  style={{ background: "#fff", borderRadius: 8, padding: 16, maxHeight: 300, overflow: "auto" }}
                  dangerouslySetInnerHTML={{ __html: c.html_content }}
                />
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}

const MiniStat = ({ label, value }: { label: string; value: string | number }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{value}</div>
    <div style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase" }}>{label}</div>
  </div>
);
