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
