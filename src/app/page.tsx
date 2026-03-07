"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/supabase";
import type { Campaign, Contact, Sequence, QueueJob, TrackingEvent, CampaignStats } from "@/types";
import Sidebar from "@/components/Sidebar";
import DashboardTab from "@/components/tabs/DashboardTab";
import CampaignsTab from "@/components/tabs/CampaignsTab";
import ContactsTab from "@/components/tabs/ContactsTab";
import SequencesTab from "@/components/tabs/SequencesTab";
import AIWriterTab from "@/components/tabs/AIWriterTab";
import QueueTab from "@/components/tabs/QueueTab";

export type TabName = "Dashboard" | "Campaigns" | "Contacts" | "Sequences" | "AI Writer" | "Queue";

export interface AppData {
  campaigns: Campaign[];
  contacts: Contact[];
  sequences: Sequence[];
  jobs: QueueJob[];
  analytics: {
    stats: (CampaignStats & { campaigns: Campaign })[] | null;
    recentEvents: TrackingEvent[] | null;
    topCampaigns: Campaign[] | null;
  } | null;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabName>("Dashboard");
  const [data, setData] = useState<AppData>({
    campaigns: [],
    contacts: [],
    sequences: [],
    jobs: [],
    analytics: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [campaigns, contacts, sequences, jobs, analytics] = await Promise.allSettled([
        apiFetch("/campaigns"),
        apiFetch("/contacts"),
        apiFetch("/sequences"),
        apiFetch("/queue/jobs"),
        apiFetch("/analytics"),
      ]);

      setData({
        campaigns: campaigns.status === "fulfilled" ? campaigns.value?.campaigns ?? [] : [],
        contacts: contacts.status === "fulfilled" ? contacts.value?.contacts ?? [] : [],
        sequences: sequences.status === "fulfilled" ? sequences.value?.sequences ?? [] : [],
        jobs: jobs.status === "fulfilled" ? jobs.value?.jobs ?? [] : [],
        analytics: analytics.status === "fulfilled" ? analytics.value : null,
      });
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const tabContent: Record<TabName, React.ReactNode> = {
    Dashboard: <DashboardTab analytics={data.analytics} />,
    Campaigns: <CampaignsTab campaigns={data.campaigns} onRefresh={fetchAll} />,
    Contacts: <ContactsTab contacts={data.contacts} onRefresh={fetchAll} />,
    Sequences: <SequencesTab sequences={data.sequences} onRefresh={fetchAll} />,
    "AI Writer": <AIWriterTab />,
    Queue: <QueueTab jobs={data.jobs} onRefresh={fetchAll} />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} counts={{ campaigns: data.campaigns.length, contacts: data.contacts.length, sequences: data.sequences.length, jobs: data.jobs.filter((j) => j.status === "pending" || j.status === "processing").length }} />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header
          style={{
            height: 56,
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{activeTab}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={fetchAll}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "5px 12px",
                color: "var(--text-muted)",
                fontSize: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span style={{ fontSize: 14 }}>↻</span> Refresh
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--green)",
                  boxShadow: "0 0 6px var(--green)",
                }}
              />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Connected · Supabase</span>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, padding: "28px", overflow: "auto" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 300,
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  border: "3px solid var(--border)",
                  borderTopColor: "var(--accent)",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading data…</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : error ? (
            <div
              style={{
                background: "var(--red-soft)",
                border: "1px solid var(--red)",
                borderRadius: 12,
                padding: 20,
                color: "var(--red)",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          ) : (
            tabContent[activeTab]
          )}
        </div>
      </main>
    </div>
  );
}
