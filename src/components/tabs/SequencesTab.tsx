"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/supabase";
import { Badge, Btn, Card, Input, Select, Textarea } from "@/components/ui";
import type { Sequence, SequenceStep } from "@/types";

interface Props {
  sequences: Sequence[];
  onRefresh: () => void;
}

interface StepForm {
  subject: string;
  delay_hours: number;
  ai_prompt: string;
}

interface SeqForm {
  name: string;
  description: string;
  trigger_type: string;
  steps: StepForm[];
}

const EMPTY_STEP: StepForm = { subject: "", delay_hours: 24, ai_prompt: "" };
const EMPTY: SeqForm = { name: "", description: "", trigger_type: "signup", steps: [{ ...EMPTY_STEP, delay_hours: 0 }] };

const TRIGGER_OPTIONS = [
  { value: "manual", label: "Manual" },
  { value: "signup", label: "On Signup" },
  { value: "tag_added", label: "Tag Added" },
  { value: "behavior", label: "Behavioral" },
  { value: "schedule", label: "Scheduled" },
];

export default function SequencesTab({ sequences, onRefresh }: Props) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<SeqForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const setSeq = (k: keyof SeqForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const updateStep = (i: number, k: keyof StepForm) => (v: string) =>
    setForm(f => ({ ...f, steps: f.steps.map((s, idx) => idx === i ? { ...s, [k]: k === "delay_hours" ? parseInt(v) || 0 : v } : s) }));

  const addStep = () => setForm(f => ({ ...f, steps: [...f.steps, { ...EMPTY_STEP }] }));
  const removeStep = (i: number) => setForm(f => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));

  const create = async () => {
    if (!form.name) return;
    setLoading(true);
    try {
      await apiFetch("/sequences", { method: "POST", body: JSON.stringify(form) });
      setCreating(false);
      setForm(EMPTY);
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Automation Sequences ({sequences.length})</div>
        <Btn onClick={() => setCreating(!creating)}>+ New Sequence</Btn>
      </div>

      {creating && (
        <Card style={{ borderColor: "var(--accent-glow)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Create Sequence</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            <Input label="Name *" value={form.name} onChange={setSeq("name")} placeholder="Welcome Series" />
            <Input label="Description" value={form.description} onChange={setSeq("description")} placeholder="Onboard new users" />
            <Select label="Trigger" value={form.trigger_type} onChange={setSeq("trigger_type")} options={TRIGGER_OPTIONS} />
          </div>

          <div style={{ marginBottom: 12, fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Email Steps
          </div>

          {form.steps.map((step, i) => (
            <div key={i} style={{ background: "#0d0d14", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>Step {i + 1}{i === 0 ? " (immediate)" : ""}</span>
                {i > 0 && (
                  <button onClick={() => removeStep(i)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 12 }}>× Remove</button>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 10 }}>
                <Input label="Subject" value={step.subject} onChange={updateStep(i, "subject")} placeholder={`Email ${i + 1}: Subject line`} />
                <Input label={i === 0 ? "Delay (hours)" : "Delay after prev (hours)"} value={String(step.delay_hours)} onChange={updateStep(i, "delay_hours")} type="number" />
              </div>
              <Textarea label="AI Prompt (optional – Claude will generate copy)" value={step.ai_prompt} onChange={updateStep(i, "ai_prompt")} rows={2} placeholder="Write a warm welcome email for a new subscriber…" />
            </div>
          ))}

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <Btn variant="ghost" small onClick={addStep}>+ Add Step</Btn>
            <Btn onClick={create} disabled={loading || !form.name}>{loading ? "Creating…" : "Create Sequence"}</Btn>
            <Btn variant="ghost" onClick={() => setCreating(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {sequences.length === 0 ? (
        <Card><div style={{ color: "var(--text-muted)", textAlign: "center", padding: 48 }}>No sequences yet.</div></Card>
      ) : (
        sequences.map(s => (
          <Card key={s.id} style={{ borderColor: expanded === s.id ? "var(--accent-glow)" : "var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>{s.name}</span>
                  <Badge status={s.status} />
                  <Badge status={s.trigger_type} />
                </div>
                {s.description && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.description}</div>}
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                  {s.sequence_steps?.length ?? 0} step{(s.sequence_steps?.length ?? 0) !== 1 ? "s" : ""}
                  {s.created_at && ` · Created ${new Date(s.created_at).toLocaleDateString()}`}
                </div>
              </div>
              <Btn variant="ghost" small onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                {expanded === s.id ? "▲ Hide" : "▼ Steps"}
              </Btn>
            </div>

            {expanded === s.id && (s.sequence_steps ?? []).length > 0 && (
              <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <SequenceFlow steps={s.sequence_steps ?? []} />
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}

const SequenceFlow = ({ steps }: { steps: SequenceStep[] }) => (
  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
    {[...steps].sort((a, b) => a.step_order - b.step_order).map((step, i) => (
      <div key={step.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-glow)", borderRadius: 8, padding: "8px 14px" }}>
          <div style={{ fontSize: 10, color: "var(--accent)", fontWeight: 700, marginBottom: 2 }}>Step {i + 1}</div>
          <div style={{ fontSize: 12, color: "var(--text)", fontWeight: 600 }}>{step.subject}</div>
          {step.delay_hours > 0 && (
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>+{step.delay_hours}h delay</div>
          )}
        </div>
        {i < steps.length - 1 && <span style={{ color: "var(--text-dim)", fontSize: 18 }}>→</span>}
      </div>
    ))}
  </div>
);
