# AgentZ Studio — CHANGELOG

## v2.12.0 (08.03.2026) — Security Hardening: bcrypt + Crypto Tokens
- **SECURITY: bcrypt Password Hashing** — Alle Passwörter werden jetzt mit bcrypt (10 Rounds) gehasht statt der unsicheren simpleHash XOR-Funktion. Neue Convex Node Actions (`authActions.ts`) für Login, Register, ChangePassword, ResetPassword. Automatische Migration: bestehende simpleHash-Passwörter werden beim nächsten Login transparent zu bcrypt upgraded.
- **SECURITY: Kryptographisch sichere Session-Tokens** — `crypto.randomBytes()` statt `Math.random()`. 64-Byte Base64URL-Tokens sind nicht mehr vorhersagbar.
- **Invite-System:** `invitesActions.ts` + `invitesInternal.ts` — Invite-Redeem nutzt jetzt ebenfalls bcrypt + sichere Tokens.
- **Code-Architektur:** Saubere Trennung in Node Actions (mit `"use node"`) und Internal Mutations/Queries. Frontend: `useAction` statt `useMutation` für alle Auth-Operationen.
- **Visueller Audit:** Alle 11 Seiten auf Desktop (1280px) und Mobile (375px) geprüft — Design konsistent und professionell.

## v2.11.3 (08.03.2026) — Security & Code Quality
- **SECURITY: Rate Limiting auf Login** — Max 5 Fehlversuche pro Minute pro Email. Neue `loginAttempts` Tabelle, automatisches Cleanup in `cleanupSessions`.
- **CODE QUALITY: ~18x `as any` Casts entfernt** — `clientFilter` korrekt als `Id<"clients">` getypt, Client-Properties (`avatarColor`, `context`, `platforms`, `mainPlatform`, `videosPerMonth`) direkt ohne Cast angesprochen. Nur 2 harmlose `as any` verbleiben (navigator.standalone + KanbanBoard prop widening).

## v2.11.2 (08.03.2026) — Bug Fix Sprint
- **BUG FIX: AiSuggestModal token undefined** — `useAuth()` fehlte in der Komponente, Kategorien wurden nie geladen. Gefixt.
- **BUG FIX: ClientDetail englische Status-Keys** — Lokale STATUS_LABELS nutzten englische Keys (`idea`, `script`...) statt deutsche (`idee`, `skript`...). Jetzt wird `STATUS_LABELS` aus `utils.ts` importiert + STATUS_COLORS auf deutsche Keys umgestellt.
- **SECURITY FIX: ideas.list/clients.list Data Leak** — Alle Queries mit optionalem Token (`ideas.list`, `ideas.get`, `ideas.byStatus`, `ideas.search`, `ideas.listArchived`, `ideas.withPublishDates`, `clients.list`, `clients.get`) geben jetzt leere Ergebnisse bei fehlendem Token zurück. Alle Frontend-Aufrufe übergeben Token.
- **SECURITY FIX: folders.list/get kein Auth** — `folders.list` und `folders.get` erfordern jetzt Token. Ohne Token: leere Liste / null.

## v2.11.1 (08.03.2026) — TODO Cleanup Sprint
- **Kanban DnD Mobile Fix:** TouchSensor mit Activation Constraints (150ms delay, 8px tolerance), MouseSensor mit 3px distance, snap-x scrolling für mobile Columns, touch-action: pan-y auf Board-Container
- **Kunden-Avatar Fix:** Neues `avatarColor` Feld in Schema, automatische Farbzuweisung bei Erstellung, Color Picker im Kundenprofil (12 Presets + Custom), konsistente Darstellung überall (Kanban, Kunden-Liste, Kunden-Detail)
- **Team-Seite:** Rolle "Kunde" aus dem "Neuer Benutzer"-Dialog entfernt, Kunden aus Team-Liste gefiltert, Role-Stats von 4 auf 3 Spalten
- **Versionsnummer:** Dynamisch aus package.json via Vite define, aktualisiert auf v2.11.0
- **KI-Skript Output:** Verifiziert — HTML-Rendering + kein Preamble ✅
- **Termine:** Verifiziert — Edit-Modus im EventPopover funktioniert ✅
- **ClientAvatar-Komponente:** Wiederverwendbar, mit Image-Support vorbereitet
- **File Storage:** generateUploadUrl + getAvatarUrl für zukünftige Foto-Uploads

## v2.11.0 (08.03.2026) — Nacht-Sprint Run 9: Zero Open Queries
- **Security: Auth auf ALLE Queries** — videos.list, listByClient, listByFolder, comments.list, categories.listByClient, scripts.listByIdea, folders.getBreadcrumbs, folders.countItems — alle erfordern jetzt Auth-Token
- **Data Isolation** — Client-User sehen bei Videos nur clientVisible + eigene, bei Comments nur eigene Ideas/Videos
- **Frontend komplett angepasst** — Alle 8 betroffenen Pages (VideosPage, LibraryPage, IdeaDetail, ClientsPage, SettingsPage, PipelinePage, IdeasPage, ClientDetail, CommandPalette, ClientDashboard) übergeben Token

## v2.10.0 (08.03.2026) — Nacht-Sprint Run 8: Security Hardening + Resilience
- **Email SMTP via Resend** — sendStatusNotification nutzt Resend API (fetch-basiert), Graceful Fallback wenn kein API-Key
- **Comments Data Isolation** — Client-User sehen nur Kommentare zu eigenen Ideas/Videos
- **shootDates Auth** — Kein Daten-Leak mehr ohne Token, Backend gibt [] ohne Auth
- **invites.listByClient Auth** — Jetzt Admin-only mit Token-Validierung
- **Session Cleanup Cron** — Tägliches Aufräumen abgelaufener Sessions (3:00 UTC)
- **Lazy Load Retry** — Auto-Reload bei "Failed to fetch dynamically imported module" nach Deployments
- **Frontend Token Passing** — Alle shootDates-Queries nutzen "skip" statt leerer Strings

## v2.9.0 (08.03.2026) — Nacht-Sprint Run 7: Archive + DnD + Audit
- **Archiv-Funktion** — Ideas + Videos archivieren/wiederherstellen, Archiv-Tab, Bulk-Archivierung
- **Skeleton Loading** — Shimmer-Skeletons auf allen 7 Hauptseiten
- **Drag & Drop Ordner** — Ordner in Ordner verschachteln, Circular-Reference-Check
- **Suche verbessern** — Volltextsuche über Titel UND Beschreibungen
- **Audit Log** — Neues Schema + Page + Typ-Filter, Logging auf ideas, videos, clients, folders
- **Toast Notifications** — Lightweight success/error/info Toasts
- **Email + In-App Notifications** — Status-Change triggert Benachrichtigungen

## v2.8.0 (08.03.2026) — Nacht-Sprint Run 6: Accessibility + Bulk Ops
- **Keyboard Accessibility** — Focus-Trap (useFocusTrap) auf NewIdeaModal + AiSuggestModal, erweiterte Keyboard-Shortcuts (⌘K, ↑↓, Esc)
- **Optimistic Comments** — VideoReview zeigt Kommentare sofort an (pending state), kein Warten auf Server
- **Bulk Video Operations** — Multi-Select in Mediathek, "Alle auswählen", Bulk-Verschieben in Ordner
- **BulkMoveDialog** — Ordner-Picker für Bulk-Move mit folders.listAll Query
- **Focus-Ring** — Global :focus-visible war bereits implementiert (2px accent outline)

## v2.7.0 (08.03.2026) — Nacht-Sprint Run 4: Security Deep Dive + Performance
- **Security: Auth auf alle GET-Queries** — clients.get, folders.get, videos.get mit token-basierter Data Isolation
- **Security: shareLinks** — create/deactivate mit Auth, createdBy vom Server statt Client
- **Input Validation** — Trim + Empty-Checks auf create/rename (Clients, Folders, Videos, Ideas, Comments)
- **Status Validation** — ideas.updateStatus + videos.updateStatus lehnen ungültige Status-Strings ab
- **Invite Password** — Min 6 Zeichen Validierung bei redeem
- **Code Splitting** — Lazy-loaded Pages, Main Bundle 1035KB → 353KB (66% kleiner!)
- **UX: Not-Found States** — Ideas + Videos zeigen "Nicht gefunden" statt ewigem Laden bei ungültigen IDs

## v2.6.0 (08.03.2026) — Nacht-Sprint Run 2
- **Kalender-View** — Veröffentlichungsdaten (grün) neben Drehterminen (lila), Filter-Buttons, Legende
- **scheduledPublishDate** auf Ideas + Kalender + IdeaDetail Datepicker
- **Videos/Ordner Kundenzuordnung** — clientId + clientVisible, Ordner-Kontextmenü, ClientAssignDialog
- **Benutzerverwaltung (TeamPage)** — CRUD, Rollen Admin/Editor/Viewer/Client, Passwort-Reset, Suche
- **Multi-Upload Queue** — Mehrere Videos, max 3 parallel, Fortschritt, Cancel, beforeunload
- **Mediathek Status-Filter** — Dropdown für Video-Status
- **Security** — DOMPurify für RichTextDisplay, Input-Validation (Register)
- **Mobile Fix** — Library-Button Overflow auf 375px

## v2.5.0 (07.03.2026)
- **App-Icon neu** — Dark navy + white Z + blue play accent (8.5/10 premium rating)
  - All sizes: 512, 192, 180 (apple-touch), 32 (favicon), SVG + PNG
- **Mediathek Sortierung** — Sort dropdown (A→Z, Neueste, Status)

## v2.4.0 (07.03.2026)
- **Kundenfilter (Admin Sidebar)** — Global client filter
  - Dropdown in Sidebar (Admin only) to filter all views by client
  - React Context (ClientFilterProvider) for global state
  - Affects: Ideen, Pipeline/Kanban, Videos, Kalender
  - "Alle Kunden" to reset, accent highlight when active
  - Click-outside to dismiss

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
