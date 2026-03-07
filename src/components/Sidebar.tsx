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
      >\n        <div\n          style={{\n            width: 28,
            height: 28,
            background: "linear-gradient(135deg, var(--accent), #a855f7)",
            borderRadius: 7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            flexShrink: 0,
          }}\n        >\n           ✉\n        </div>\n        {!collapsed && (\n          <div>\n            <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-0.02em" }}>MailFlow</div>\n            <div\n              style={{\n                fontSize: 9,\n                color: "var(--accent)",\n                background: "var(--accent-soft)",\n                padding: "1px 6px",\n                borderRadius: 8,\n                display: "inline-block",\n                fontWeight: 700,\n                border: "1px solid var(--accent-glow)",\n              }}\n            >\n              BETA\n            </div>\n          </div>\n        )}\n      </div>\n\n      {/* Nav */}\n      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>\n        {tabs.map((tab) => {\n          const isActive = activeTab === tab.name;\n          const count = tab.countKey ? counts[tab.countKey] : undefined;\n          return (\n            <button\n              key={tab.name}\n              onClick={() => onTabChange(tab.name)}\n              title={collapsed ? tab.name : undefined}\n              style={{\n                display: "flex",\n                alignItems: "center",\n                gap: 10,\n                padding: collapsed ? "9px 0" : "9px 12px",\n                borderRadius: 8,\n                border: "none",\n                background: isActive ? "var(--accent-soft)" : "transparent",\n                color: isActive ? "var(--accent)" : "var(--text-muted)",\n                cursor: "pointer",\n                width: "100%",\n                textAlign: "left",\n                fontSize: 13,\n                fontWeight: isActive ? 700 : 400,\n                transition: "all 0.15s",\n                justifyContent: collapsed ? "center" : "flex-start",\n                borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",\n              }}\n            >\n              <span style={{ fontSize: 15, flexShrink: 0 }}>{tab.icon}</span>\n              {!collapsed && (\n                <>\n                  <span style={{ flex: 1 }}>{tab.name}</span>\n                  {count !== undefined && count > 0 && (\n                    <span\n                      style={{\n                        background: tab.name === "Queue" ? "var(--amber-soft)" : "var(--accent-soft)",\n                        color: tab.name === "Queue" ? "var(--amber)" : "var(--accent)",\n                        border: `1px solid ${tab.name === "Queue" ? "var(--amber)" : "var(--accent)"}44`,\n                        padding: "1px 7px",\n                        borderRadius: 10,\n                        fontSize: 10,\n                        fontWeight: 700,\n                      }}\n                    >\n                      {count}\n                    </span>\n                  )}\n                </>\n              )}\n            </button>\n          );\n        })}\n      </nav>\n\n      {/* Collapse toggle */}\n      <div style={{ padding: "12px 8px", borderTop: "1px solid var(--border)" }}>\n        <button\n          onClick={() => setCollapsed(!collapsed)}\n          style={{\n            display: "flex",\n            alignItems: "center",\n            justifyContent: collapsed ? "center" : "flex-start",\n            gap: 8,\n            width: "100%",\n            padding: "8px 12px",\n            background: "transparent",\n            border: "none",\n            borderRadius: 8,\n            color: "var(--text-dim)",\n            cursor: "pointer",\n            fontSize: 12,\n          }}\n        >\n          <span style={{ fontSize: 14 }}>{collapsed ? "→" : "←"}</span>\n          {!collapsed && "Collapse"}\n        </button>\n      </div>\n    </aside>\n  );\n}\n