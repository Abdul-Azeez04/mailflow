"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/supabase";
import { Badge, Btn, Card, Input, Table, Td, Empty, StatCard } from "@/components/ui";
import type { Contact } from "@/types";
interface Props {
  contacts: Contact[];
  onRefresh: () => void;
}