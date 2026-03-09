# AgentZ Studio - Redesign Brief (Nacht 09./10.03.2026)

## Ziel
Komplettes visuelles Redesign. KEINE Funktionalitaets-Aenderungen. Nur Design, Farben, Schriften, Abstände, Layout, Consistency.

## Brand-Referenz: AgentZ Media Website (agentzmedia)
Die Farben und Designsprache orientieren sich an der AgentZ-Website:

### Brand Colors
- **Primary Green:** `#00DC82` (agentz-green)
- **Green Dark:** `#00B86B`
- **Green Light:** `#4DFFAB`
- **Black:** `#0A0A0A`
- **Dark:** `#111111`
- **Gray:** `#1A1A1A`
- **Gray Light:** `#2A2A2A`
- **White:** `#FAFAFA`
- **Muted:** `#888888`

### Typography
- **Display Font:** Space Grotesk — NUR fuer grosse Hero-Elemente (H1, Login-Headline, "Hallo Timo"-Begruessung, Logo). EXTREMST SPARSAM einsetzen!
- **System Font:** Poppins — fuer ALLES andere: Navigation, Buttons, Labels, Body Text, Inputs, Tabellen, Cards, Sidebar, Menus. Das ist ein TOOL, kein Marketing-Auftritt. Clean und lesbar.

### Design-Stil
- Neo-Brutalist x High-Contrast
- `--shadow-brutal: 4px 4px 0px #00DC82`
- `--radius-brutal: 0px` (sharp corners)
- `--radius-soft: 4px`
- `--shadow-glow: 0 0 40px rgba(0, 220, 130, 0.3)`

## Stack
- React + TypeScript + Vite
- Tailwind CSS 4 (@tailwindcss/vite)
- Convex (Backend)
- Radix UI, Lucide Icons, TipTap Editor
- Hauptdatei Styles: `src/index.css`

## Was redesigned werden muss (Reihenfolge)

### Phase 1: Design System (21:00)
- Design Tokens in index.css definieren (Brand Colors, Fonts, Shadows, Spacing)
- CSS Custom Properties analog zur AgentZ-Website
- Tailwind Theme erweitern mit Brand-Tokens

### Phase 2: Login Page + Grundstruktur (22:00)
- Login-Seite komplett neu gestalten
- Favicon neu (NICHT das haessliche Z)
- Logo/Branding im Header neu (nicht unlesbares kleines Quadrat)
- App-Shell / Layout-Grundstruktur

### Phase 3: Sidebar + Navigation (23:00)
- Sidebar redesign im AgentZ-Stil
- Navigation, Icons, Active States
- Mobile Header

### Phase 4: Admin Dashboard (00:00)
- AdminDashboard.tsx komplett redesignen
- Cards, Stats, Widgets im Brand-Stil
- Einheitliche Spacing + Shadows

### Phase 5: Client Pages (01:00)
- ClientsPage, ClientDetail, ClientDashboard
- ClientAvatar-Komponente
- Alle Tabellen, Listen, Cards einheitlich

### Phase 6: Video/Pipeline Pages (02:00)
- VideosPage, VideoReview, VideoPlayer, VideoUpload
- PipelinePage + KanbanBoard
- Drag & Drop visuell aufwerten

### Phase 7: Weitere Pages (03:00)
- CalendarPage, IdeasPage, IdeaDetail
- LibraryPage, TeamPage, SettingsPage
- AuditLogPage

### Phase 8: Popups, Dropdowns, Modals (04:00)
- CommandPalette
- IdeaDrawer
- Toast Notifications
- Alle Dialoge/Overlays einheitlich
- CookieBanner
- RichTextEditor Styling

### Phase 9: Polish + Micro-Interactions (05:00)
- Hover States, Transitions, Animations
- Focus States, Loading States
- Responsive Feinschliff
- Skeleton Loading States

### Phase 10: Final Review + Git Push (06:00)
- Gesamtcheck: Alles einheitlich?
- Letzte Fixes
- Git commit + push
- Zusammenfassung in redesign_log.md schreiben

## Regeln
1. KEINE Funktionalitaet aendern! Nur visuelles Redesign
2. Jeder Cronjob MUSS seinen Fortschritt in `agentz-studio/redesign_log.md` dokumentieren
3. Jeder Cronjob MUSS am Ende git commit + push
4. Frontend-Design-Skill lesen und befolgen!
5. Aesthetic Direction: **Brutalist / Raw** mit AgentZ Brand Colors
6. Differentiator: Brutal shadows + green glow + sharp geometry
7. GH_TOKEN: (see env / cron config)

## Dateistruktur
```
src/
├── App.tsx (Router, Layout)
├── index.css (HAUPT-STYLES - hier Design Tokens!)
├── main.tsx
├── components/
│   ├── CookieBanner.tsx
│   ├── ErrorBoundary.tsx
│   ├── ideas/IdeaDrawer.tsx
│   ├── kanban/KanbanBoard.tsx
│   ├── layout/CommandPalette.tsx, KeyboardShortcuts.tsx, MobileHeader.tsx, PageTransition.tsx, Sidebar.tsx
│   ├── ui/ClientAvatar.tsx, RichTextEditor.tsx, Skeleton.tsx, Toast.tsx, kanban.tsx
│   └── video/VideoPlayer.tsx, VideoUpload.tsx
├── hooks/useFocusTrap.ts, usePWAInstall.ts, useTheme.ts
├── lib/auth.tsx, clientFilter.tsx, compose-refs.ts, export.ts, utils.ts
└── pages/
    ├── AdminDashboard.tsx, AuditLogPage.tsx, CalendarPage.tsx
    ├── ClientDashboard.tsx, ClientDetail.tsx, ClientsPage.tsx
    ├── IdeaDetail.tsx, IdeasPage.tsx, InvitePage.tsx
    ├── LegalPages.tsx, LibraryPage.tsx, Login.tsx
    ├── PipelinePage.tsx, SettingsPage.tsx, SharePage.tsx
    ├── TeamPage.tsx, VideoReview.tsx, VideosPage.tsx
    └── ...
```
