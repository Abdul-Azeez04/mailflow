"use client";

import {
  LayoutDashboard,
  Mail,
  Users,
  GitBranch,
  PenLine,
  ListOrdered,
  Zap,
} from "lucide-react";

type Tab = "dashboard" | "campaigns" | "contacts" | "sequences" | "ai-writer" | "queue";

const navItems: { id: Tab; label: string; Icon: any }[] = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "campaigns", label: "Campaigns", Icon: Mail },
  { id: "contacts", label: "Contacts", Icon: Users },
  { id: "sequences", label: "Sequences", Icon: GitBranch },
  { id: "ai-writer", label: "AI Writer", Icon: PenLine },
  { id: "queue", label: "Queue", Icon: ListOrdered },
];

export default function Sidebar({
  activeTab,
  onTabChange,
}: { activeTab: Tab; onTabChange: (t: Tab) => void }) {
  return (
    <nav style={{
      width: "216px",
      minHeight: "100vh",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      padding: "24px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    }}>
      <div style={{ marginBottom: "24px", paddingLeft: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Zap size={20} color="var(--accent)" />
          <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)" }}>MailFlow</span>
        </div>
      </div>
      {navItems.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
              fontSize: "14px",
              fontWeight: isActive ? 600 : 400,
              background: isActive ? "var(--accent-soft)" : "transparent",
              color: isActive ? "var(--accent)" : "var(--text-muted)",
              transition: "all 0.15s",
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
