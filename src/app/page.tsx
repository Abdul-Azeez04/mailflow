"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardTab from "@/components/tabs/DashboardTab";
import CampaignsTab from "@/components/tabs/CampaignsTab";
import ContactsTab from "@/components/tabs/ContactsTab";
import SequencesTab from "@/components/tabs/SequencesTab";
import AIWriterTab from "@/components/tabs/AIWriterTab";
import QueueTab from "@/components/tabs/QueueTab";

type Tab = "dashboard" | "campaigns" | "contacts" | "sequences" | "ai-writer" | "queue";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main style={{
        flex: 1,
        overflowY: "auto",
        padding: "32px",
        background: "var(--bg)",
      }}>
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "campaigns" && <CampaignsTab />}
        {activeTab === "contacts" && <ContactsTab />}
        {activeTab === "sequences" && <SequencesTab />}
        {activeTab === "ai-writer" && <AIWriterTab />}
        {activeTab === "queue" && <QueueTab />}
      </main>
    </div>
  );
}
