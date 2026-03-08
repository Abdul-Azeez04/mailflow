"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/supabase";
import { Badge, Btn, Card, StatCard, Table, Td, Empty } from "@/components/ui";
import type { QueueJob } from "@/types";

interface Props {
  jobs: QueueJob[];
  onRefresh: () => void;
}

export default function QueueTab({ jobs, onRefresh }: Props) {
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState<string | null>(null);
  const [autoRefresh] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const processQueue = async () => {
    setProcessing(true);
    try {
      await apiFetch("/queue/process", { method: "POST", body: JSON.stringify({}) });
      onRefresh();
      showToast("✓ Queue processed successfully");
    } catch (e) {
      showToast(`✗ ${e}`);
    } finally {
      setProcessing(false);
    }
  };

  const pending = jobs.filter(j => j.status === "pending").length;
  const running = jobs.filter(j => j.status === "processing").length;
  const done = jobs.filter(j => j.status === "completed").length;
  const failed = jobs.filter(j => j.status === "failed").length;

  const filtered = filter === "all" ? jobs : jobs.filter(j => j.status === filter);

  const statusColor: Record<string, string> = {
    pending: "var(--amber)", processing: "var(--blue)", completed: "var(--green)", failed: "var(--red)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="fade-in">
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 1000,
          background: toast.startsWith("✓") ? "var(--green-soft)" : "var(--red-soft)",
          border: `1px solid ${toast.startsWith("✓") ? "var(--green)" : "var(--red)"}`,
          color: toast.startsWith("✓") ? "var(--green)" : "var(--red)",
          padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "var(--shadow)",
        }}>{toast}</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Pending" value={pending} color="var(--amber)" sub="waiting to send" />
        <StatCard label="Processing" value={running} color="var(--blue)" sub="in progress" />
        <StatCard label="Completed" value={done} color="var(--green)" sub="sent successfully" />
        <StatCard label="Failed" value={failed} color="var(--red)" sub="need attention" />
      </div>

      {/* Active jobs indicator */}
      {(pending > 0 || running > 0) && (
        <Card style={{ borderColor: "var(--amber-soft)", background: "var(--amber-soft)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--amber)", animation: "pulse-dot 1.5s ease infinite" }} />
              <span style={{ color: "var(--amber)", fontSize: 13, fontWeight: 700 }}>
                {running > 0 ? `${running} job${running > 1 ? "s" : ""} processing` : `${pending} job${pending > 1 ? "s" : ""} pending`}
              </span>
            </div>
            <Btn onClick={processQueue} disabled={processing} small>
              {processing ? "⏳ Processing…" : "▶ Process Queue"}
            </Btn>
          </div>
        </Card>
      )}

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {["all", "pending", "processing", "completed", "failed"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
              border: "1px solid var(--border)", cursor: "pointer",
              background: filter === f ? "var(--accent-soft)" : "transparent",
              color: filter === f ? "var(--accent)" : "var(--text-muted)",
              outline: filter === f ? "1px solid var(--accent-glow)" : "none",
            }}>{f}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" small onClick={onRefresh}>↻ Refresh</Btn>
          {pending === 0 && running === 0 && (
            <Btn onClick={processQueue} disabled={processing} small>
              {processing ? "⏳ Processing…" : "▶ Process Queue"}
            </Btn>
          )}
        </div>
      </div>

      <Table headers={["Type", "Status", "Payload", "Attempts", "Scheduled", "Created"]}>
        {filtered.length === 0 ? (
          <tr><td colSpan={6}><Empty message="No jobs in queue." /></td></tr>
        ) : (
          filtered.map(j => (
            <tr key={j.id}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", background: "var(--surface-hover)", padding: "3px 8px", borderRadius: 6 }}>
                  {j.job_type}
                </span>
              </td>
              <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor[j.status] ?? "var(--border)" }} />
                  <Badge status={j.status} />
                </div>
              </td>
              <Td>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", display: "block", maxWidth: 220 }}>
                  {JSON.stringify(j.payload).slice(0, 60)}{JSON.stringify(j.payload).length > 60 ? "…" : ""}
                </span>
              </Td>
              <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: j.attempts === j.max_attempts ? "var(--red)" : "var(--text-muted)" }}>
                  {j.attempts ?? 0}/{j.max_attempts ?? 3}
                </span>
                {j.error_message && (
                  <div style={{ fontSize: 10, color: "var(--red)", marginTop: 2, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {j.error_message}
                  </div>
                )}
              </td>
              <Td dim>{j.scheduled_for ? new Date(j.scheduled_for).toLocaleString() : "—"}</Td>
              <Td dim>{j.created_at ? new Date(j.created_at).toLocaleString() : "—"}</Td>
            </tr>
          ))
        )}
      </Table>
    </div>
  );
}
