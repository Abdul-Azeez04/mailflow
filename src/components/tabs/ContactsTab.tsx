"use client";

import { useState, useRef } from "react";
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
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ added: number; errors: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);
  const PER_PAGE = 20;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const add = async () => {
    if (!form.email) return;
    setLoading(true);
    try {
      const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      await apiFetch("/contacts", { method: "POST", body: JSON.stringify({ ...form, tags }) });
      setAdding(false);
      setForm({ email: "", name: "", tags: "" });
      onRefresh();
      showToast("✓ Contact added");
    } catch (e) {
      showToast(`✗ ${e}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const text = await file.text();
    const lines = text.trim().split("\n");
    const headers = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/"/g, ""));
    const emailIdx = headers.findIndex(h => h.includes("email"));
    const nameIdx = headers.findIndex(h => h.includes("name"));
    if (emailIdx === -1) { showToast("✗ CSV must have an email column"); setImporting(false); return; }

    let added = 0, errors = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim().replace(/"/g, ""));
      const email = cols[emailIdx];
      if (!email || !email.includes("@")) { errors++; continue; }
      try {
        await apiFetch("/contacts", { method: "POST", body: JSON.stringify({ email, name: nameIdx >= 0 ? cols[nameIdx] : undefined }) });
        added++;
      } catch { errors++; }
    }
    setImportResult({ added, errors });
    setImporting(false);
    onRefresh();
    showToast(`✓ Imported ${added} contacts${errors ? `, ${errors} failed` : ""}`);
    if (fileRef.current) fileRef.current.value = "";
  };

  const filtered = contacts.filter(c => {
    const matchSearch = !search || c.email.toLowerCase().includes(search.toLowerCase()) || (c.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const active = contacts.filter(c => c.status === "active").length;
  const unsub = contacts.filter(c => c.status === "unsubscribed").length;
  const bounced = contacts.filter(c => c.status === "bounced").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="fade-in">
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Total" value={contacts.length} color="var(--text)" />
        <StatCard label="Active" value={active} color="var(--green)" />
        <StatCard label="Unsubscribed" value={unsub} color="var(--amber)" />
        <StatCard label="Bounced" value={bounced} color="var(--red)" />
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input
          placeholder="Search by email or name…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, minWidth: 200, background: "var(--surface-hover)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "var(--text)", fontSize: 13 }}
        />
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          style={{ background: "var(--surface-hover)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "var(--text)", fontSize: 13 }}>
          {["all", "active", "unsubscribed", "bounced", "complained"].map(s => (
            <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>
          ))}
        </select>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} style={{ display: "none" }} />
        <Btn variant="ghost" onClick={() => fileRef.current?.click()} disabled={importing}>
          {importing ? "⏳ Importing…" : "⬆ Import CSV"}
        </Btn>
        <Btn onClick={() => setAdding(!adding)}>+ Add Contact</Btn>
      </div>

      {importResult && (
        <div style={{ background: "var(--green-soft)", border: "1px solid var(--green)", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "var(--green)" }}>
          ✓ Import complete — {importResult.added} added{importResult.errors > 0 ? `, ${importResult.errors} skipped` : ""}
          <button onClick={() => setImportResult(null)} style={{ marginLeft: 12, background: "none", border: "none", color: "var(--green)", cursor: "pointer", fontSize: 13 }}>✕</button>
        </div>
      )}

      {adding && (
        <Card style={{ borderColor: "var(--accent-glow)" }} className="fade-in">
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>Add Contact</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
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

      <Table headers={["Email", "Name", "Tags", "Engagement", "Status", "Added"]}>
        {paginated.length === 0 ? (
          <tr><td colSpan={6}><Empty message="No contacts found." /></td></tr>
        ) : (
          paginated.map(c => (
            <tr key={c.id} style={{ transition: "background 0.1s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <Td><span style={{ fontWeight: 600, color: "var(--text)" }}>{c.email}</span></Td>
              <Td dim>{c.name ?? "—"}</Td>
              <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                {(c.tags ?? []).map(t => (
                  <span key={t} style={{ background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid var(--accent-glow)", padding: "2px 7px", borderRadius: 4, fontSize: 10, marginRight: 4, fontWeight: 600 }}>{t}</span>
                ))}
              </td>
              <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", width: 140 }}>
                <EngagementBar score={c.engagement_score ?? 0} />
              </td>
              <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}><Badge status={c.status} /></td>
              <Td dim>{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</Td>
            </tr>
          ))
        )}
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
          <Btn variant="ghost" small disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</Btn>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Page {page} of {totalPages} · {filtered.length} contacts</span>
          <Btn variant="ghost" small disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next ›</Btn>
        </div>
      )}
    </div>
  );
}

const EngagementBar = ({ score }: { score: number }) => {
  const pct = Math.min(100, score);
  const color = pct > 60 ? "var(--green)" : pct > 30 ? "var(--amber)" : "var(--text-dim)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 10, color: "var(--text-muted)", width: 22, textAlign: "right" }}>{score}</span>
    </div>
  );
};
