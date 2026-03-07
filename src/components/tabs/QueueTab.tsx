"use client";

import { Badge, Btn, Card, StatCard, Table, Td, Empty } from "@/components/ui";
import type { QueueJob } from "@/types";

export default function QueueTab({ jobs, onRefresh }: { jobs: QueueJob[], onRefresh: () => void }) {
  return <div>Queue</div>;
}
