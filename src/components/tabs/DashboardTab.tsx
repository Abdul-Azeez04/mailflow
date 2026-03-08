"use client";

import { StatCard, Card } from "@/components/ui";
import type { AppData } from "@/app/page";

interface Props {
  data: AppData;
}

export default function DashboardTab({ data }: Props) {
  const { campaigns, contacts, analytics } = data;

  const totalSent = analytics?.stats?.reduce((s, c) => s + (c.total_sent ?? 0), 0) ?? 0;
  const totalOpens = analytics?.stats?.reduce((s, c) => s + (c.unique_opens ?? 0), 0) ?? 0;
  const totalClicks = analytics?.stats?.reduce((s, c) => s + (c.unique_clicks ?? 0), 0) ?? 0;
  const avgOpenRate = totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0;
  const avgClickRate = totalSent > 0 ? Math.round((totalClicks / totalSent) * 100) : 0;
  const activeContacts = contacts.filter(c => c.status === "active").length;

  const recentEvents = analytics?.recentEvents?.slice(0, 8) ?? [];
  const topCampaigns = (analytics?.stats ?? [])
    .sort((a, b) => (b.unique_opens ?? 0) - (a.unique_opens ?? 0))
    .slice(0, 5);

  const eventIcon: Record<string, string> = {
    open: "👁", click: "🖱", bounce: "↩", unsubscribe: "🚫", sent: "📤", delivered: "✅",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="fade-in">

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
        <StatCard label="Total Sent" value={totalSent.toLocaleString()} color="var(--text)" />
        <StatCard label="Open Rate" value={`${avgOpenRate}%`} color="var(--blue)" sub="avg across campaigns" />
        <StatCard label="Click Rate" value={`${avgClickRate}%`} color="var(--green)" sub="unique clicks" />
        <StatCard label="Campaigns" value={campaigns.length} color="var(--accent)" />
        <StatCard label="Active Contacts" value={activeContacts.toLocaleString()} color="var(--amber)" />
        <StatCard label="Sequences" value={data.sequences.length} color="var(--accent-2)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent activity */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
            Recent Activity
          </div>
          {recentEvents.length === 0 ? (
            <EmptyState msg="No activity yet — send your first campaign!" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentEvents.map((ev, i) => (
                <div key={ev.id ?? i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "8px 10px", borderRadius: 8,
                  background: "var(--surface-hover)",
                }}>
                  <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>
                    {eventIcon[ev.event_type] ?? "•"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "var(--text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ev.contacts?.email ?? "Unknown"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{ev.event_type}</div>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-dim)", whiteSpace: "nowrap" }}>
                    {ev.occurred_at ? new Date(ev.occurred_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top campaigns */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
            Top Campaigns by Opens
          </div>
          {topCampaigns.length === 0 ? (
            <EmptyState msg="No campaign stats yet." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topCampaigns.map((stat, i) => {
                const openRate = stat.total_sent ? Math.round(((stat.unique_opens ?? 0) / stat.total_sent) * 100) : 0;
                const clickRate = stat.total_sent ? Math.round(((stat.unique_clicks ?? 0) / stat.total_sent) * 100) : 0;
                return (
                  <div key={stat.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        #{i + 1} {(stat as { campaigns?: { name?: string } }).campaigns?.name ?? "Campaign"}
                      </span>
                      <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: "var(--blue)", fontWeight: 700 }}>{openRate}% open</span>
                        <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 700 }}>{clickRate}% click</span>
                      </div>
                    </div>
                    <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${openRate}%`, height: "100%", background: "var(--blue)", borderRadius: 2, transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Contact breakdown */}
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
          Contact Health
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          {[
            { label: "Active", color: "var(--green)", count: contacts.filter(c => c.status === "active").length },
            { label: "Unsubscribed", color: "var(--amber)", count: contacts.filter(c => c.status === "unsubscribed").length },
            { label: "Bounced", color: "var(--red)", count: contacts.filter(c => c.status === "bounced").length },
          ].map(({ label, color, count }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color }}>{count}</span>
            </div>
          ))}
          <div style={{ flex: 1, height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden", minWidth: 200 }}>
            {contacts.length > 0 && (() => {
              const a = contacts.filter(c => c.status === "active").length;
              const u = contacts.filter(c => c.status === "unsubscribed").length;
              const b = contacts.filter(c => c.status === "bounced").length;
              const t = contacts.length;
              return (
                <div style={{ display: "flex", height: "100%" }}>
                  <div style={{ width: `${(a / t) * 100}%`, background: "var(--green)", transition: "width 0.5s" }} />
                  <div style={{ width: `${(u / t) * 100}%`, background: "var(--amber)", transition: "width 0.5s" }} />
                  <div style={{ width: `${(b / t) * 100}%`, background: "var(--red)", transition: "width 0.5s" }} />
                </div>
              );
            })()}
          </div>
        </div>
      </Card>
    </div>
  );
}

const EmptyState = ({ msg }: { msg: string }) => (
  <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
    {msg}
  </div>
);
