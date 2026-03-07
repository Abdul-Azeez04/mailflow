"use client";

import { useState } from "react";
import type { TabName } from "@/app/page";

const tabs: { name: TabName; icon: string; countKey?: string }[] = [
  { name: "Dashboard", icon: "◈" },
  { name: "Campaigns", icon: "✉", countKey: "campaigns" },
  { name: "Contacts", icon: "👥", countKey: "contacts" },
  { name: "Sequences", icon: "⚡", countKey: "sequences" },
  { name: "AI Writer", icon: "✨" },
  { name: "Queue", icon: "⏳", countKey: "jobs" },
];

interface Props {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
  counts: Record<string, number>;
}

export default function Sidebar({ activeTab, onTabChange, counts }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? 60 : 220,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s ease",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden",
      }}
    >\n      {/* Logo */}
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          padding: collapsed ? "0 16px" : "0 16px",
          borderBottom: "1px solid var(--border)",
          gap: 10,
          overflow: "hidden",
        }}
      >\n        <div
          style={{
            width: 28,
            height: 28,
            background: "linear-gradient(135deg, var(--accent), #a855f7)",
            borderRadius: 7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          ✉
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-0.02em" }}>MailFlow</div>
            <div
              style={{
                fontSize: 9,
                color: "var(--accent)",
                background: "var(--accent-soft)",
                padding: "1px 6px",
                borderRadius: 8,
                display: "inline-block",
                fontWeight: 700,
                border: "1px solid var(--accent-glow)",
              }}
            >
              BETA
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          const count = tab.countKey ? counts[tab.countKey] : undefined;
          return (
            <button
              key={tab.name}
              onClick={() => onTabChange(tab.name)}
              title={collapsed ? tab.name : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: collapsed ? "9px 0" : "9px 12px",
                borderRadius: 8,
                border: "none",
                background: isActive ? "var(--accent-soft)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-muted)",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                fontSize: 13,
                fontWeight: isActive ? 700 : 400,
                transition: "all 0.15s",
                justifyContent: collapsed ? "center" : "flex-start",
                borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
              }}
            >
              <span style={{ fontSize: 15, flexShrink: 0 }}>{tab.icon}</span>
              {!collapsed && (
                <>
                  <span style={{ flex: 1 }}>{tab.name}</span>
                  {count !== undefined && count > 0 && (
                    <span
                      style={{
                        background: tab.name === "Queue" ? "var(--amber-soft)" : "var(--accent-soft)",
                        color: tab.name === "Queue" ? "var(--amber)" : "var(--accent)",
                        padding: "1px 7px",
                        borderRadius: 10,
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {count}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid var(--border)" }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 8,
            width: "100%",
            padding: "8px 12px",
            background: "transparent",
            border: "none",
            borderRadius: 8,
            color: "var(--text-dim)",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          <span style={{ fontSize: 14 }}>{collapsed ? "→" : "←"}</span>
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}
