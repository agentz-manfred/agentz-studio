# AgentZ Studio

Production Management Tool für die TikTok-Video-Pipeline von AgentZ Media.

## Tech-Stack

- **Frontend:** React + Vite + TypeScript
- **Backend:** Convex (Realtime DB + Auth)
- **UI:** shadcn/ui + Tailwind CSS v4
- **Drag & Drop:** dnd-kit
- **Icons:** Lucide React
- **Video CDN:** Bunny Stream
- **Deployment:** Vercel

## Features

- 📋 **Kanban Pipeline** — Drag & Drop Status-Board (Idee → Veröffentlicht)
- 👥 **Multi-Rolle Auth** — Admin & Kunden-Dashboards
- 🎬 **Video Management** — Upload, Review, Kommentare
- 📅 **Drehtermine** — Kalender-Übersicht
- 💬 **Kommentarsystem** — Timestamp-basiert für Video-Review
- ⚡ **Realtime** — Alle Änderungen sofort sichtbar (Convex)

## Status-Pipeline

```
Idee → Skript → Zur Freigabe → Korrektur → Freigegeben → Gedreht → Geschnitten → Review → Veröffentlicht
```

## Setup

```bash
# Dependencies installieren
npm install

# Convex verbinden (einmalig)
npx convex dev --once

# Dev-Server starten
npm run dev
```

## Environment Variables

Erstelle `.env.local`:

```
CONVEX_DEPLOYMENT=dev:your-deployment
VITE_CONVEX_URL=https://your-deployment.convex.cloud

BUNNY_LIBRARY_ID=...
BUNNY_API_KEY=...
VITE_BUNNY_CDN_HOSTNAME=...

SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

## Lizenz

Privat — AgentZ Media
