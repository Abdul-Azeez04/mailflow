"use client";

import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

// ─── Badge ─────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  active:      { bg: "var(--green-soft)",  color: "var(--green)",  border: "var(--green)33" },
  sent:        { bg: "var(--blue-soft)",   color: "var(--blue)",   border: "var(--blue)33" },
  sending:     { bg: "var(--amber-soft)",  color: "var(--amber)",  border: "var(--amber)33" },
  draft:       { bg: "#1e1e2e",            color: "var(--text-muted)", border: "var(--border)" },
  paused:      { bg: "var(--amber-soft)",  color: "var(--amber)",  border: "var(--amber)33" },
  queued:      { bg: "var(--amber-soft)",  color: "var(--amber)",  border: "var(--amber)33" },
  failed:      { bg: "var(--red-soft)",    color: "var(--red)",    border: "var(--red)33" },
  completed:   { bg: "var(--green-soft)",  color: "var(--green)",  border: "var(--green)33" },
  processing:  { bg: "var(--blue-soft)",   color: "var(--blue)",   border: "var(--blue)33" },
  unsubscribed:{ bg: "var(--red-soft)",    color: "var(--red)",    border: "var(--red)33" },
  bounced:     { bg: "var(--red-soft)",    color: "var(--red)",    border: "var(--red)33" },
  manual:      { bg: "#1e1e2e",            color: "var(--text-muted)", border: "var(--border)" },
  signup:      { bg: "var(--green-soft)",  color: "var(--green)",  border: "var(--green)33" },
  behavior:    { bg: "var(--blue-soft)",   color: "var(--blue)",   border: "var(--blue)33" },
  archived:    { bg: "#1e1e2e",            color: "var(--text-dim)", border: "var(--border)" },
};

export const Badge = ({ status }: { status: string }) => {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
};

// ─── Card ──────────────────────────────────────────────────────────────────
export const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, ...style }}>
    {children}
  </div>
);

// ─── Button ────────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "ghost" | "danger" | "success";
const BTN_STYLES: Record<BtnVariant, { bg: string; bgHov: string; color: string; border: string }> = {
  primary: { bg: "var(--accent)",      bgHov: "var(--accent-hover)", color: "#fff",           border: "none" },
  ghost:   { bg: "transparent",        bgHov: "var(--surface-hover)",color: "var(--text)",    border: "1px solid var(--border)" },
  danger:  { bg: "var(--red-soft)",    bgHov: "#dc2626",             color: "var(--red)",     border: "1px solid var(--red)44" },
  success: { bg: "var(--green-soft)",  bgHov: "#059669",             color: "var(--green)",   border: "1px solid var(--green)44" },
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  small?: boolean;
}

export const Btn = ({ children, variant = "primary", small, style, disabled, ...rest }: BtnProps) => {
  const [hov, setHov] = useState(false);
  const s = BTN_STYLES[variant];
  return (
    <button
      {...rest}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov && !disabled ? s.bgHov : s.bg,
        color: s.color,
        border: s.border,
        padding: small ? "5px 12px" : "8px 18px",
        borderRadius: 8,
        fontSize: small ? 12 : 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </button>
  );
};

// ─── Input ─────────────────────────────────────────────────────────────────
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  onChange?: (val: string) => void;
}

export const Input = ({ label, onChange, style, ...rest }: InputProps) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style as React.CSSProperties }}>
    {label && <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>}
    <input
      {...rest}
      onChange={e => onChange?.(e.target.value)}
      style={{ background: "#0d0d14", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", fontSize: 13 }}
    />
  </div>
);

// ─── Textarea ──────────────────────────────────────────────────────────────
interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  label?: string;
  onChange?: (val: string) => void;
}

export const Textarea = ({ label, onChange, ...rest }: TextareaProps) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>}
    <textarea
      {...rest}
      onChange={e => onChange?.(e.target.value)}
      style={{ background: "#0d0d14", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
    />
  </div>
);

// ─── Select ────────────────────────────────────────────────────────────────
interface SelectProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}

export const Select = ({ label, value, onChange, options }: SelectProps) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>}
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ background: "#0d0d14", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", fontSize: 13 }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ─── StatCard ──────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, sub, color = "var(--accent)" }: { label: string; value: string | number | null | undefined; sub?: string; color?: string }) => (
  <Card style={{ flex: 1, minWidth: 130 }}>
    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{value ?? "—"}</div>
    {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>{sub}</div>}
  </Card>
);

// ─── Table ─────────────────────────────────────────────────────────────────
export const Table = ({ headers, children }: { headers: string[]; children: React.ReactNode }) => (
  <Card style={{ padding: 0, overflow: "hidden" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: "1px solid var(--border)" }}>
          {headers.map(h => (
            <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </Card>
);

export const Td = ({ children, dim }: { children: React.ReactNode; dim?: boolean }) => (
  <td style={{ padding: "12px 16px", fontSize: 13, color: dim ? "var(--text-muted)" : "var(--text)", borderBottom: "1px solid var(--border)" }}>{children}</td>
);

// ─── Empty state ───────────────────────────────────────────────────────────
export const Empty = ({ message }: { message: string }) => (
  <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)", fontSize: 13 }}>{message}</div>
);
