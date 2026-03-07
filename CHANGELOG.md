# AgentZ Studio — CHANGELOG

## v2.3.0 (07.03.2026)
- **Kanban KOMPLETT NEU — Dice UI Primitives** — Fresh rebuild from scratch
  - Deleted old kanban + compose-refs, rebuilt 1:1 from Dice UI reference
  - `KanbanItem asHandle asChild` — whole card is drag handle (no more GripVertical icon)
  - Touch drag works natively (touch-none + select-none on handle)
  - New card design: accent bar top, shadow elevation on hover/active, cleaner layout
  - Grid layout with auto-cols-[260px] instead of fixed flex widths
  - Status-colored client avatars in cards
  - Drag overlay with subtle rotate[2deg] effect
  - radix-ui package added for Slot primitive

## v2.2.0 (07.03.2026)
- **Mediathek (Filesystem/Video-Library)** — Google Drive-Style Dateimanager
  - Ordner erstellen, verschachteln, umbenennen, löschen
  - Videos per Drag & Drop zwischen Ordnern verschieben
  - Breadcrumb-Navigation (Mediathek > Ordner > Unterordner)
  - Grid/List-View Toggle
  - Suche über Ordner und Videos
  - Video-Thumbnails mit Status-Badges
  - Kontextmenü (Umbenennen, Löschen) pro Ordner
  - Schema: `folders` Tabelle + `videos.folderId` + Indexes
  - Sidebar: Neuer "Mediathek" Nav-Eintrag mit FolderOpen Icon

## v2.1.0 (07.03.2026)
- **Kanban Touch-DnD Fix** — Ganze Karte als Drag-Handle, Scroll-Lock während Drag, Long-Press 300ms
- **KI Ideen-Generierung** — Monat auswählen, Anzahl = Videos/Monat aus Kundenprofil, Kundenkontext/Plattformen/Kategorien mitgegeben
- **KI Ideen pro Kunde** — "KI-Ideen" Button auf ClientDetail Seite
- **KI Skript-Generierung** — Kundenkontext, Plattformen und Hauptplattform automatisch mitgegeben
- **Impressum + Datenschutz** — Vollständige rechtliche Seiten (DSGVO-konform), öffentlich zugänglich
- **Cookie-Banner** — Minimaler Cookie-Hinweis, nur technisch notwendige Cookies
- **Footer-Links** — Impressum & Datenschutz Links auf Login-Seite
- **Hover-States** — Globaler cursor:pointer für alle interaktiven Elemente

## v2.0.0 (07.03.2026)
- **KI-Modell-Auswahl** — Suchbares Model-Picker in Einstellungen, OpenRouter API, Preise pro Token
- **Settings Store** — Key/Value Convex-Tabelle für globale Einstellungen
- **AI nutzt gespeichertes Modell** — Skript- und Ideen-Generierung lesen das gewählte Modell

## v1.9.1 (07.03.2026)
- **Kategorie-Zuweisung bei Ideen-Erstellung** — Pill-Buttons mit Kundenfarben, dynamisch nach Kundenwahl

## v1.9.0 (07.03.2026)
- **Fix: Kanban Drag & Drop** — TouchSensor für Mobile, MeasuringStrategy.Always für korrekte Desktop-Positionierung, KeyboardSensor für Accessibility
- **TipTap WYSIWYG-Editor** — Kundenkontext + Skript-Editor nutzen jetzt TipTap (Headings, Listen, Bold, Code, Zitate, Trennlinien)
- **WYSIWYG überall** — Skript-Anzeige + Ideen-Beschreibungen rendern jetzt Rich-HTML statt Raw-Text
- **Markdown-Paste** — TipTap erkennt eingefügten Markdown automatisch

## v1.8.0 (07.03.2026)
- Erweitertes Kundenprofil (Vertragslaufzeit, Plattformen, Videos/Monat)
- Kundenkontext-Editor (Textarea, wird bei KI-Generierung mitgegeben)
- Ideen-Kategorien (Notion-Style, eigene Farben, inline editierbar)
- KI nutzt Kundenkontext + Plattformen

## v1.7.0 (07.03.2026)
- Kanban-Karten mit farbigen Status-Akzentlinien
- Sidebar Active-Pill mit Gradient
- Login-Page Mesh-Gradient Background
- Dark-mode-safe CSS-Klassen

## v1.6.0 (07.03.2026)
- PWA Install Banner (Android + iOS Anleitung)
- Dot-Grid Hintergrund, Gradient-Kante Sidebar
- Glassmorphism CSS-Klassen

## v1.5.0 (07.03.2026)
- Stat-Cards redesigned (farbige Zahlen, Akzent-Linien)
- Quick-Action Buttons als Pills
- Kunden-Seite als Card-Grid mit Gradient-Avataren

## v1.4.0 (07.03.2026)
- PWA Icons als echte PNGs
- Dashboard Hero-Gradient
- Pipeline-Balken mit Status-Farben

## v1.3.0 (07.03.2026)
- Modal z-index Bug gefixt (Mobile)
- Sidebar-Höhe Bug gefixt (100dvh)
- AgentZ Logo eingebaut (Sidebar, Login, Mobile Header)
- Video ↔ Idee Verknüpfung (bidirektional)
- Demo-Daten geseedet

## v1.2.0 (07.03.2026)
- Convex Production Deployment (sleek-goat-172)
- Admin-Account auf Prod angelegt
- Login-Page redesigned (Split-Layout, Gradient)
- Kontrast-Fixes (Sidebar Active State)

## v1.1.0 (07.03.2026)
- Einladungslinks für Kunden
- Dark Mode (System/Hell/Dunkel)
- Command Palette (⌘K)
- Auto-Notifications
- Hash Routing
- Error Boundary

## v1.0.0 (06.03.2026)
- Initial Setup: React + Vite + TypeScript + Convex + shadcn/ui
- Auth (Email/Passwort), Admin + Client Rollen
- Dashboard, Kunden-Verwaltung, Ideen-Pipeline
- Kanban Board mit Drag & Drop
- Kalender (Monatsansicht)
- Video Upload via Bunny CDN
- Frame.io-Style Video Review
- Kommentar-System
- Mobile responsive
