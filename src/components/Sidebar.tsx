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