import { React } from "react";

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  style,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  style?: React.CSSProperties;
  [k: string]: any;
}) {
  const base: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "14px",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.15s",
    opacity: disabled ? 0.5 : 1,
  };
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: "var(--accent)", color: "#fff" },
    secondary: { background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" },
    ghost: { background: "transparent", color: "var(--text-muted)" },
    danger: { background: "var(--red-soft)", color: "var(--red)" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variantStyles[variant], ...style }} {...props}>
      {children}
    </button>
  );
}

export function Badge({
  children,
  color = "default",
}: {
  children: React.ReactNode;
  color?: "default" | "green" | "amber" | "red" | "blue" | "purple";
}) {
  const colorsMap: Record<string, React.CSSProperties> = {
    default: { background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" },
    green: { background: "var(--green-soft)", color: "var(--green)" },
    amber: { background: "var(--amber-soft)", color: "var(--amber)" },
    red: { background: "var(--red-soft)", color: "var(--red)" },
    blue: { background: "var(--blue-soft)", color: "var(--blue)" },
    purple: { background: "var(--accent-soft)", color: "var(--accent)" },
  };
  return (
    <span style={{
      padding: "3px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: 500,
      ...colorsMap[color],
    }}>
      {children}
    </span>
  );
}

export function Card({
  children,
  style,
}: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      padding: "24px",
      ...style,
    }}>
      {children}
    </div>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  style,
  ...props
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  style?: React.CSSProperties;
  [k: string]: any;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "14px",
        color: "var(--text)",
        width: "100%",
        ...style,
      }}
      {...props}
    />
  );
}

export function Select({
  value,
  onChange,
  children,
  style,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "14px",
        color: "var(--text)",
        width: "100%",
        ...style,
      }}
    >
      {children}
    </select>
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  style,
  ...props
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  style?: React.CSSProperties;
  [k: string]: any;
}) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "14px",
        color: "var(--text)",
        width: "100%",
        resize: "vertical",
        ...style,
      }}
      {...props}
    />
  );
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  width = 560,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}) {
  if (!isOpen) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border-bright)",
        borderRadius: "16px", padding: "28px", width: `${width}px`, maxWidth: "90vw",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text)" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "20px" }}>&#9730;</button>
        </div>
        {children}
      </div>
    </div>
  );
}
