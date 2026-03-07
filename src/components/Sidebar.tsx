"use client";

import type { TabName } from "@/app/page";

const NAV = [
  { name: "Dashboard" as TabName,  icon: "⬡", desc: "Overview & analytics" },
  { name: "Campaigns" as TabName,  icon: "◈", desc: "Email campaigns" },
  { name: "Contacts" as TabName,   icon: "◎", desc: "Subscriber list" },
  { name: "Sequences" as TabName,  icon: "⟳", desc: "Automation flows" },
  { name: "AI Writer" as TabName,  icon: "✦", desc: "AI email generator" },
  { name: "Queue" as TabName,      icon: "⊞", desc: "Send queue" },
] as const;

interface Props {
  activeTab: TabName;
  onTabChange: (t: TabName) => void;
  counts: { campaigns: number; contacts: number; sequences: number; jobs: number };
}

const COUNTS: Partial<Record<TabName, keyof Props["counts"]>> = {
  Campaigns: "campaigns",
  Contacts: "contacts",
  Sequences: "sequences",
  Queue: "jobs",
};

export default function Sidebar({ activeTab, onTabChange, counts }: Props) {
  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900, color: "#fff",
            boxShadow: "0 4px 12px var(--accent-glow)",
          }}>M</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>MailFlow</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>Email Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(({ name, icon, desc }) => {
          const active = activeTab === name;
          const countKey = COUNTS[name];
          const count = countKey ? counts[countKey] : null;
          return (
            <button
              key={name}
              onClick={() => onTabChange(name)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                border: "none",
                background: active ? "var(--accent-soft)" : "transparent",
                color: active ? "var(--accent)" : "var(--text-muted)",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                transition: "all 0.15s",
                outline: active ? "1px solid var(--accent-glow)" : "none",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-hover)"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: "center", flexShrink: 0 }}>{icon}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: active ? 700 : 500 }}>{name}</span>
              {count != null && count > 0 && (
                <span style={{
                  background: active ? "var(--accent)" : "var(--border-bright)",
                  color: active ? "#fff" : "var(--text-muted)",
                  fontSize: 10, fontWeight: 700,
                  padding: "1px 6px", borderRadius: 10, minWidth: 18, textAlign: "center",
                }}>{count}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "var(--green)",
            boxShadow: "0 0 8px var(--green)",
            animation: "pulse-dot 2s ease infinite",
          }} />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Supabase connected</span>
        </div>
      </div>
    </aside>
  );
}
