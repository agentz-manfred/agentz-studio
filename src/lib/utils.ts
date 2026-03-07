import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STATUS_LABELS: Record<string, string> = {
  idee: "Idee",
  skript: "Skript",
  freigabe: "Zur Freigabe",
  korrektur: "Korrektur",
  freigegeben: "Freigegeben",
  gedreht: "Gedreht",
  geschnitten: "Geschnitten",
  review: "Review",
  "veröffentlicht": "Veröffentlicht",
};

export const STATUS_ORDER = [
  "idee",
  "skript",
  "freigabe",
  "korrektur",
  "freigegeben",
  "gedreht",
  "geschnitten",
  "review",
  "veröffentlicht",
];

/** Subtle dot color per pipeline stage */
export const STATUS_COLORS: Record<string, string> = {
  idee: "#a3a3a3",
  skript: "#8b5cf6",
  freigabe: "#f59e0b",
  korrektur: "#ef4444",
  freigegeben: "#3b82f6",
  gedreht: "#06b6d4",
  geschnitten: "#8b5cf6",
  review: "#f97316",
  "veröffentlicht": "#16a34a",
};

/** Dark-mode-safe status badge styles using inline styles */
export const STATUS_BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  idee: { bg: "rgba(163,163,163,0.12)", color: "#737373" },
  skript: { bg: "rgba(139,92,246,0.12)", color: "#8b5cf6" },
  freigabe: { bg: "rgba(245,158,11,0.12)", color: "#d97706" },
  korrektur: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
  freigegeben: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6" },
  gedreht: { bg: "rgba(6,182,212,0.12)", color: "#06b6d4" },
  geschnitten: { bg: "rgba(139,92,246,0.12)", color: "#8b5cf6" },
  review: { bg: "rgba(249,115,22,0.12)", color: "#f97316" },
  "veröffentlicht": { bg: "rgba(22,163,74,0.12)", color: "#16a34a" },
  // Video-specific statuses
  hochgeladen: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6" },
  final: { bg: "rgba(22,163,74,0.12)", color: "#16a34a" },
};

export const VIDEO_STATUS_LABELS: Record<string, string> = {
  hochgeladen: "Hochgeladen",
  review: "Review",
  korrektur: "Korrektur",
  freigegeben: "Freigegeben",
  final: "Final",
};
