"use client";

import { Badge, Btn, Card, StatCard, Table, Td, Empty } from "@/components/ui";
import type { QueueJob } from "@/types";

interface Props {
  jobs: QueueJob[];
  onRefresh: () => void;
}

const STATUS_ORDER = ["processing", "pending", "failed", "completed"];

export default function QueueTab({ jobs, onRefresh }: Props) {
  const counts = STATUS_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = jobs.filter(j => j.status === s).length;
    return acc;
  }, {});

  const statColors: Record<string, string> = {
    processing: "var(--blue)",
    pending: "var(--amber)",
    failed: "var(--red)",
    completed: "var(--green)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Queue Monitor</div>
        <Btn variant="ghost" small onClick={onRefresh}>↻ Refresh</Btn>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        {STATUS_ORDER.map(s => (
          <StatCard key={s} label={s} value={counts[s] ?? 0} color={statColors[s]} />
        ))}
        <StatCard label="Total Jobs" value={jobs.length} color="var(--text-muted)" />
      </div>
      <Table headers={["Job Type", "Status", "Attempts", "Scheduled", "Completed"]}>
        {jobs.length === 0 ? (
          <tr><td colSpan={5}><Empty message="Queue is empty" /></td></tr>
        ) : [...jobs].sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()).map(j => (
          <tr key={j.id}>
            <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}><code>{j.job_type}</code></td>
            <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}><Badge status={j.status} /></td>
            <Td dim>{j.attempts ?? 0} / {j.max_attempts ?? 3}</Td>
            <Td dim>{j.scheduled_for ? new Date(j.scheduled_for).toLocaleString() : "—"}</Td>
            <Td dim>{j.completed_at ? new Date(j.completed_at).toLocaleString() : "—"}</Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
