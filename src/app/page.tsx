"use client";

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
    </div>
  );
}
