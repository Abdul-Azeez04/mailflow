"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/supabase";
import { Badge, Btn, Card, Input, Table, Td, Empty, StatCard } from "@/components/ui";
import type { Contact } from "@/types";

interface Props {
  contacts: Contact[];
  onRefresh: () => void;
}

export default function ContactsTab({ contacts, onRefresh }: Props) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", tags: "" });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const add = async () => {
    if (!form.email) return;
    setLoading(true);
    try {
      const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      await apiFetch("/contacts", { method: "POST", body: JSON.stringify({ ...form, tags }) });
      setAdding(false);
      setForm({ email: "", name: "", tags: "" });
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const filtered = contacts.filter(c => {
    const matchSearch = !search || c.email.toLowerCase().includes(search.toLowerCase()) || (c.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const active = contacts.filter(c => c.status === "active").length;
  const unsub = contacts.filter(c => c.status === "unsubscribed").length;
  const bounced = contacts.filter(c => c.status === "bounced").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stats */}
      <div style={{ display: "flex", gap: 16 }}>
        <StatCard label="Total" value={contacts.length} color="var(--text)" />
        <StatCard label="Active" value={active} color="var(--green)" />
        <StatCard label="Unsubscribed" value={unsub} color="var(--amber)" />
        <StatCard label="Bounced" value={bounced} color="var(--red)" />
      </div>

      {/* Header + search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flex: 1 }}>
          <input
            placeholder="Search by email or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: "#0d0d14", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "var(--text)", fontSize: 13, flex: 1 }}
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ background: "#0d0d14", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "var(--text)", fontSize: 13 }}
          >
            {["all", "active", "unsubscribed", "bounced", "complained"].map(s => (
              <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>
            ))}
          </select>
        </div>
        <Btn onClick={() => setAdding(!adding)}>+ Add Contact</Btn>
      </div>

      {/* Add form */}
      {adding && (
        <Card style={{ borderColor: "var(--accent-glow)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Input label="Email *" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" placeholder="user@example.com" />
            <Input label="Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Jane Doe" />
            <Input label="Tags (comma-separated)" value={form.tags} onChange={v => setForm(f => ({ ...f, tags: v }))} placeholder="vip, newsletter" />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={add} disabled={loading || !form.email}>{loading ? "Adding…" : "Add Contact"}</Btn>
            <Btn variant="ghost" onClick={() => setAdding(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {/* Table */}
      <Table headers={["Email", "Name", "Tags", "Engagement", "Status", "Added"]}>
        {filtered.length === 0 ? (
          <tr><td colSpan={6}><Empty message="No contacts found." /></td></tr>
        ) : (
          filtered.map(c => (
            <tr key={c.id}>
              <Td>{c.email}</Td>
              <Td dim>{c.name ?? "—"}</Td>
              <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                {(c.tags ?? []).map(t => (
                  <span key={t} style={{ background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid var(--accent-glow)", padding: "2px 7px", borderRadius: 4, fontSize: 10, marginRight: 4 }}>{t}</span>
                ))}
              </td>
              <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                <EngagementBar score={c.engagement_score ?? 0} />
              </td>
              <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}><Badge status={c.status} /></td>
              <Td dim>{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</Td>
            </tr>
          ))
        )}
      </Table>
    </div>
  );
}

const EngagementBar = ({ score }: { score: number }) => {
  const pct = Math.min(100, score);
  const color = pct > 60 ? "var(--green)" : pct > 30 ? "var(--amber)" : "var(--red)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.3s" }} />
      </div>
      <span style={{ fontSize: 10, color: "var(--text-muted)", width: 24, textAlign: "right" }}>{score}</span>
    </div>
  );
};
