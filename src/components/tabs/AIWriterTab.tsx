"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/supabase";
import { Btn, Card, Input, Textarea } from "@/components/ui";
import type { AIGeneratedEmail } from "@/types";
const TONE_OPTIONS = ["professional", "friendly", "urgent", "playful", "formal", "conversational", "empathetic", "bold"];