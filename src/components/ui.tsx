"use client";

import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  active: { bg: "var(--green-soft)", color: "var(--green)", border: "var(--green)33" },
};
