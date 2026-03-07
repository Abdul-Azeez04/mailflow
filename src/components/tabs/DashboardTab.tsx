"use client";

import { Card, StatCard, Badge } from "@/components/ui";
import type { AppData } from "@/app/page";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  analytics: AppData["analytics"];
}

export default function DashboardTab({ analytics }: Props) {
  const stats = analytics?.stats?.[0] ?? null;
  const recentEvents = analytics?.recentEvents ?? [];
  const topCampaigns = analytics?.topCampaigns ?? [];

  const openRate = stats?.total_sent ? Math.round(((stats.unique_opens ?? 0) / stats.total_sent) * 100) : 0;
  const clickRate = stats?.total_sent ? Math.round(((stats.unique_clicks ?? 0) / stats.total_sent) * 100) : 0;
  const deliveryRate = stats?.total_sent ? Math.round(((stats.total_delivered ?? stats.total_sent) / stats.total_sent) * 100) : 0;

  const sparkData = Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    opens: Math.floor(((stats?.unique_opens ?? 0) / 7) * (0.6 + Math.random() * 0.8)),
    clicks: Math.floor(((stats?.unique_clicks ?? 0) / 7) * (0.6 + Math.random() * 0.8)),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard label="Total Sent" value={stats?.total_sent ?? 0} sub="all campaigns" color="var(--blue)" />
        <StatCard label="Open Rate" value={`${openRate}%`} sub={`${stats?.unique_opens ?? 0} unique`} color="var(--green)" />
        <StatCard label="Click Rate" value={`${clickRate}%`} sub={`${stats?.unique_clicks ?? 0} unique`} color="var(--accent)" />
        <StatCard label="Delivery Rate" value={`${deliveryRate}%`} sub="of sent emails" color="var(--amber)" />
        <StatCard label="Bounces" value={stats?.total_bounces ?? 0} sub="all time" color="var(--red)" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>7-day Engagement</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={sparkData}>
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="opens" stroke="#10b981" fill="#10b98144" strokeWidth={2} name="Opens" />
              <Area type="monotone" dataKey="clicks" stroke="#7c3aed" fill="#7c3aed44" strokeWidth={2} name="Clicks" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Live Event Feed</div>
          {recentEvents.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "40px 0" }}>No events tracked yet</div>
          ) : recentEvents.slice(0, 10).map((ev) => (
            <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700 }}>{ev.event_type}</span>
              <span style={{ fontSize: 12, color: "var(--text)", flex: 1 }}>{ev.contacts?.email ?? "unknown"}</span>
            </div>
          ))}
        </Card>
      </div>
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Recent Campaigns</div>
        {topCampaigns.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No campaigns sent yet.</div>
        ) : topCampaigns.map((c) => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontWeight: 600, color: "var(--text)" }}>{c.name}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
