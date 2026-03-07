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

      {/* Stats */}
      <div style={{ display: "flex", gap: 16 }}>
        {STATUS_ORDER.map(s => (
          <StatCard key={s} label={s} value={counts[s] ?? 0} color={statColors[s]} />
        ))}
        <StatCard label="Total Jobs" value={jobs.length} color="var(--text-muted)" />
      </div>

      {/* Active / failed alert */}
      {counts.failed > 0 && (
        <div style={{ background: "var(--red-soft)", border: "1px solid var(--red)44", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--red)", fontWeight: 600 }}>⚠ {counts.failed} failed job{counts.failed > 1 ? "s" : ""} require attention</span>
          <Btn variant="danger" small onClick={onRefresh}>Review</Btn>
        </div>
      )}

      {/* Live jobs table */}
      <Table headers={["Job Type", "Status", "Attempts", "Payload Preview", "Scheduled", "Completed"]}>
        {jobs.length === 0 ? (
          <tr><td colSpan={6}><Empty message="Queue is empty — no jobs yet." /></td></tr>
        ) : (
          [...jobs]
            .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
            .map(j => (
              <tr key={j.id}>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                  <code style={{ background: "#0d0d14", padding: "2px 8px", borderRadius: 4, fontSize: 12, color: "var(--text)", border: "1px solid var(--border)" }}>
                    {j.job_type}
                  </code>
                </td>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                  <Badge status={j.status} />
                </td>
                <Td dim>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span>{j.attempts ?? 0}</span>
                    <span style={{ color: "var(--text-dim)" }}>/ {j.max_attempts ?? 3}</span>
                    <div style={{ flex: 1, height: 3, background: "var(--border)", borderRadius: 2, marginLeft: 6, overflow: "hidden", minWidth: 40 }}>
                      <div style={{ width: `${((j.attempts ?? 0) / (j.max_attempts ?? 3)) * 100}%`, height: "100%", background: j.status === "failed" ? "var(--red)" : "var(--accent)" }} />
                    </div>
                  </div>
                </Td>
                <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", maxWidth: 200 }}>
                  <code style={{ fontSize: 10, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                    {JSON.stringify(j.payload).slice(0, 80)}…
                  </code>
                  {j.error_message && (
                    <div style={{ fontSize: 10, color: "var(--red)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      ⚠ {j.error_message}
                    </div>
                  )}
                </td>
                <Td dim>{j.scheduled_for ? new Date(j.scheduled_for).toLocaleString() : "—"}</Td>
                <Td dim>{j.completed_at ? new Date(j.completed_at).toLocaleString() : "—"}</Td>
              </tr>
            ))
        )}
      </Table>

      {/* BullMQ integration hint */}
      <Card style={{ borderColor: "var(--accent-glow)" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>BullMQ Integration</div>
        <pre style={{ fontSize: 11, color: "var(--text-muted)", background: "#0d0d14", padding: 14, borderRadius: 8, overflow: "auto", margin: 0 }}>
{`// worker.ts – run alongside your Next.js app
import { Worker } from 'bullmq';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const worker = new Worker('email-sends', async (job) => {
  // Call the Supabase edge function
  await fetch(\`\${SUPABASE_URL}/functions/v1/email-automation/campaigns/send\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON_KEY },
    body: JSON.stringify(job.data),
  });
  // Log the job
  await supabase.from('queue_jobs').update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', job.data.queue_job_id);
}, { connection: redisOptions });`}
        </pre>
      </Card>
    </div>
  );
}
