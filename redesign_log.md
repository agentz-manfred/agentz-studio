# AgentZ Studio — Redesign Log

## Phase 1: Design System Tokens (09.03.2026, 21:00)

### Was wurde gemacht
- **index.css komplett neu geschrieben** — von Minimalist/Refined auf Brutalist/Raw umgestellt
- **Google Fonts eingebunden** in index.html: Space Grotesk (display) + Poppins (body)

### Design Tokens definiert

**Typography:**
- `--font-display`: Space Grotesk — NUR für H1, Hero, Login, Greeting
- `--font-body`: Poppins — alles andere (Nav, Buttons, Body, Inputs, Cards)
- `--font-mono`: JetBrains Mono — Code

**Brand Colors:**
- `--color-green`: #00DC82 (Primary)
- `--color-green-dark`: #00B86B
- `--color-green-light`: #4DFFAB
- `--color-green-muted`: rgba(0, 220, 130, 0.15)
- `--color-green-subtle`: rgba(0, 220, 130, 0.08)

**Surfaces:** 5 Stufen (#0A0A0A → #333333)
**Text:** 4 Stufen (#FAFAFA → #666666)
**Borders:** 4 Stufen inkl. green border

**Shadows (Brutalist):**
- `--shadow-brutal`: 4px 4px 0px #00DC82
- `--shadow-brutal-sm/lg/dark/inset` Varianten
- `--shadow-glow`: 0 0 40px rgba(0, 220, 130, 0.3) + sm/lg/intense
- Funktionale Shadows (xs/sm/md/lg)

**Spacing:** 8-stufige Scale (4px → 96px)
**Radii:** brutal (0px), sm (2px), md (4px), lg (8px), full
**Transitions:** brutal, out, in-out, snap easing + duration tokens

### Component Helpers
- `.btn-brutal` / `.btn-brutal-outline` — Brutale Buttons mit hover-translate
- `.input-brutal` — Dark input mit green focus shadow
- `.card-brutal` — Card mit brutal hover effect
- `.badge-green` — Green tag/badge
- `.scanlines` — Decorative scanline overlay

### Migrierte Patterns
- Brand Glow, Hero Gradient, Stat Card, Client Card — alle auf Green umgestellt
- Sidebar Texture, Glass Card, Dot Grid — Dark-first
- Nav Items, Kanban Header/Cards — Green accents
- TipTap Editor — Brand tokens
- Focus States → Green outline + glow
- Selection → Green tint
- Scrollbar → Dark, square (brutalist)

### Visueller Review
- ✅ Dev-Server gestartet (Port 5180)
- ✅ Token Preview injiziert und Screenshot gemacht
- ✅ Alle Tokens korrekt angewendet: Farben, Fonts, Shadows, Spacing
- ✅ Space Grotesk nur für Display, Poppins für alles andere
- ✅ Brutale Shadows + Green Glow sichtbar und on-brand

## Phase 2: Login Page + Favicon + Logo (09.03.2026, 22:00)

### Was wurde gemacht

**Login.tsx — Komplett-Redesign:**
- Linke Seite: Branding-Panel mit Grid-Pattern, Green Glow, Scanline-Overlay
- Grüne vertikale Trennlinie (3px) zwischen Branding und Login
- Logo-Mark: "A" in Box mit Green Border + Brutal Shadow
- "AGENTZ Studio" Typografie: Space Grotesk uppercase + Poppins "Studio"
- Hero-Text: "VIDEO PRODUCTION, VEREINFACHT." — Space Grotesk, Green Accent
- Feature-Tags: Brutalist-Style, Sharp Corners, Green-Highlight auf "Pipeline"
- Dekorativer Green Divider unten links
- Rechte Seite: Login-Form in brutaler Card (border, keine rounded corners)
- "WILLKOMMEN" als Space Grotesk H2 + Green Underscore
- Input-Felder: Dunkler Background, Green Left-Border bei Focus
- Labels: Uppercase, Tracked, Poppins
- ANMELDEN Button: Green, Brutal Shadow, Hover-Translate-Effekt
- Error-State: Red Left-Border Accent
- Footer: Uppercase, tracked, Copyright + Legal Links
- Mobile: Eigene Logo-Darstellung (zentriert), responsive Layout

**Favicon (favicon.svg) — Neu:**
- Komplett neu gestaltet, Brutalist-Stil
- Schwarzer Background (#0A0A0A) statt Blue-Gradient
- Green Border (2px #00DC82)
- Geometrisches "A" als AgentZ-Mark (weiß)
- Green Underscore-Accent unter dem A
- Kein rundlicher Border-Radius mehr

**Sidebar Logo/Branding — Neu:**
- Alten blauen Gradient entfernt
- Neue "A"-Box mit Green Border + Brutal Shadow (2px 2px)
- "AGENTZ" in Space Grotesk, uppercase, "Z" in Green
- "STUDIO" als Poppins, tracked, muted
- Clean, lesbar, professionell

**MobileHeader Logo — Neu:**
- Gleiche Designsprache wie Sidebar (kleinere Variante)
- "A"-Box mit Green Border + Mini Brutal Shadow
- Konsistentes Branding auf allen Viewports

### Visueller Review
- ✅ Dev-Server gestartet (Port 5180, .env.local mit Dummy-Convex-URL)
- ✅ Login-Seite Screenshot gemacht und analysiert
- ✅ Background-Farben korrekt (#0A0A0A / #111111)
- ✅ Text-Farben korrekt (#FAFAFA primary, #888 tertiary)
- ✅ AgentZ Green (#00DC82) durchgängig als Accent
- ✅ Space Grotesk NUR für Headlines (WILLKOMMEN, VIDEO PRODUCTION, AGENTZ)
- ✅ Poppins für Body, Labels, Buttons, Tags
- ✅ Brutal Shadows + Sharp Corners konsistent
- ✅ Green Focus-States auf Inputs
- ✅ Button Hover-Effekt (translate + shadow-change)
- ✅ Grid-Pattern, Glow-Effekte, Scanlines subtil im Hintergrund
- ✅ Favicon: Neues brutales "A"-Mark statt altem Blue-Z
- ✅ Keine alten blauen Styles mehr sichtbar
- ✅ .env.local nach Review gelöscht

## Phase 3: Sidebar + Navigation + MobileHeader (09.03.2026, 23:00)

### Was wurde gemacht

**Sidebar.tsx — Komplett-Redesign:**
- Background: `surface-0` (#0A0A0A) statt `surface-1` — dunklere, brutalere Base
- Border-right: 2px `border-strong` statt 1px `border-subtle` — härtere Kante
- Brand-Mark: Border auf 2px hochgezogen, Shadow 3px offset mit `green-dark`
- Search Bar: Brutale Border (1px solid), kein border-radius, font-mono kbd
- **Green Accent Dividers**: Neue Sektions-Trenner mit grünem Akzent-Block (links oben, rechts unten)
- **Active Nav State**: Green background + 3px brutal dark shadow offset — Item "springt" visuell nach vorne
- **Hover Nav State**: Green-subtle background + grüne 2px Left-Bar (animiert ein), Icon wird grün
- **Icon Stroke**: Active = 2.25 (dicker), Inactive = 1.75 (normal)
- Footer-Buttons: Uppercase, tracked (0.06em), 12px — einheitlich tool-like
- **User Card**: Eigener Container mit border + surface-1 background, separiert vom Rest
- **User Role**: Uppercase + 0.08em tracking, muted color
- **Logout Button**: Hover → Error-Red statt generic
- **Notification Badge**: Square (kein border-radius), brutal shadow 1px 1px
- **Notification Panel**: Redesigned — 2px green right-border, brutale header, mono timestamps, square unread-dots, hover → green-subtle + green title
- Theme Toggle: Uppercase label, tracked, icon goes green on hover
- Client Filter Dropdown: Brutale Border, shadow auf Dropdown, uppercase labels
- Alle rounded corners entfernt → sharp 0px überall

**MobileHeader.tsx — Redesign:**
- Background: `surface-0` (darkest)
- Border-bottom: 2px `border-strong`
- **Green Accent Lines**: Zwei 12px grüne Balken an den unteren Ecken (links + rechts)
- Hamburger + Search: Border on hover mit `border-green`, green-subtle background
- Icon strokeWidth: 2 (crisp)
- Brand-Mark: 2px border, 2px brutal shadow offset (green-dark)
- "STUDIO" Label: 0.2em tracking, 10px, muted

**CSS Updates (index.css):**
- `.nav-item-active` shadow aktualisiert: `3px 3px 0px #0A0A0A` (konsistent mit inline styles)

### Design-Entscheidungen
- **Surface-0 als Sidebar-Base**: Maximaler Kontrast zum Content-Bereich (surface-0 + dot-grid)
- **Brutale Dividers mit Green Accent**: Bricht die vertikale Monotonie, zeigt Brand-Farbe in kleinen Dosen
- **Active = Brutal Shadow + Full Green**: Sofort sichtbar, welche Seite aktiv ist — kein subtiles Highlight, sondern klares Statement
- **Hover = Subtle + Indicator Bar**: Feedback ohne zu schreien — grüne Left-Bar zeigt "hier kannst du klicken"
- **Square Everything**: Konsequent brutalist — keine rounded corners, auch nicht bei Badges oder Dropdowns
- **Uppercase Footer**: Tool-Interface-Vibe, nicht App-Vibe — passt zum Brutalist-Ansatz

### Visueller Review
- ✅ Dev-Server gestartet (Port 5180)
- ✅ Static HTML Preview erstellt (Sidebar + MobileHeader isoliert)
- ✅ Desktop Screenshot: Sidebar mit allen Nav-Items, Active State (Dashboard), Dividers, Footer
- ✅ Hover States getestet: Green-subtle background + left-bar indicator funktioniert
- ✅ Mobile Screenshot (375px): MobileHeader mit Brand, Hamburger, Search, Green Accent Lines
- ✅ Sidebar hidden on mobile ✅
- ✅ TypeScript Build: Zero errors (`npx tsc --noEmit` clean)
- ✅ Background-Farben korrekt (surface-0 Sidebar, surface-0 MobileHeader)
- ✅ Text-Farben korrekt (primary, secondary, tertiary, muted — richtige Hierarchie)
- ✅ Green (#00DC82) durchgängig als Accent
- ✅ Space Grotesk NUR für Brand-Mark und Logo-Text
- ✅ Poppins für ALLE Nav-Items, Labels, Buttons, Footer
- ✅ Brutal Shadows + Sharp Corners konsistent
- ✅ Keine alten rounded-corner Styles mehr
- ✅ Cleanup: Preview-HTML und .env.local gelöscht
- ✅ Dev-Server gestoppt

## Phase 4: Admin Dashboard (10.03.2026, 00:00)

### Was wurde gemacht

**AdminDashboard.tsx — Komplett-Redesign:**

**StatCard — Brutal:**
- 2px solid border (border-strong), 0px radius — komplett square
- Left accent bar (3px): default surface-4, hover → green, "isGreen"-Variante permanent green
- Hover: translate(-2px, -2px) + brutal-dark shadow (normal cards) / brutal green shadow (green card)
- Hover: border-color → border-green / green
- Value: Space Grotesk, 36px, bold, tabular-nums
- Icon-Box: 32x32, square, eigene border+background, green-Variante mit green-subtle bg
- Label: 12px uppercase, 0.08em tracking, font-semibold, text-tertiary
- ArrowUpRight: opacity-0 → 1 on hover
- "Veröffentlicht" Card: Green-Value, green accent-bar, green icon-box, green brutal shadow on hover

**QuickAction — Brutal:**
- 2px border, square (no radius), uppercase, 0.06em tracking
- Hover: green border, green text, green-subtle background
- Hover: translate(-1px, -1px) + brutal-sm shadow
- StrokeWidth 2 auf Icons (crisp)

**SectionHeader — Neu:**
- Green accent bar (3px × 20px) links vom Titel
- 13px uppercase, 0.08em tracking, font-bold
- Optional "Alle →" Action-Link (11px, uppercase, muted → green on hover)

**PipelineProgress — Brutal:**
- Card: 2px border-strong, 0px radius
- Bar: 12px height (statt 8px), square, mit 1px border
- Legend: Square dots (10px × 10px), separate count in bold
- Uppercase labels mit tracking

**UpcomingShoots — Brutal:**
- Stacked items (negative margin -2px für zusammenhängende Borders)
- 2px border, square
- Date-Box: 48×48, square, eigene border
- "Heute": Green background auf Date-Box mit dark text, green border auf gesamtes Item
- "Heute"-Badge: Inline, green-subtle bg, green border, uppercase tracking
- Time in mono-font
- Hover: translate + brutal-sm shadow

**RecentActivity — Brutal:**
- Stacked items (negative margin -2px)
- 2px border, square, text-left
- Title: 13px semibold, goes green on hover
- Client: 11px uppercase tracking, text-muted
- Status-Badges: Square, 1px border, colored (consistent mit STATUS_COLORS)
- Date: mono font, tabular-nums
- Hover: border-green + translate + shadow

**Header — Brutal:**
- Greeting: 11px uppercase, 0.12em tracking, text-muted
- Name: Space Grotesk, 32px, uppercase, bold
- Green accent bar (48px × 3px) unter dem Namen
- Subtle green glow top-left (decorative, 6% opacity)

**PWAInstallBanner — Brutal:**
- 2px green border, square
- Icon-Box: green-subtle bg, 2px green border
- Labels: uppercase, bold
- Install-Button: btn-brutal helper class
- Close: border + hover → error-red
- Green glow Deko top-right

**WidgetConfigurator — Brutal:**
- 2px green border + brutal green shadow
- Green accent bar im Header
- Uppercase labels, 0.04em tracking
- Items: border on hover, hover → surface-2
- Close: border, hover → error-red
- Arrows: hover → green

**Empty State — Brutal:**
- 2px dashed border-strong
- Decorative corner marks (4 Ecken, green L-shapes)
- Icon-Box: square, 2px border
- Title: Space Grotesk, uppercase
- Buttons: btn-brutal + btn-brutal-outline helper classes

**Entfernte Patterns (altes Design):**
- Keine rounded corners mehr (rounded-full, radius-lg, radius-md)
- Keine hero-gradient class mehr
- Keine farbigen accentColor props (stattdessen: uniform oder isGreen boolean)
- Keine rounded status-badges (jetzt square mit border)
- Keine weichen box-shadows (jetzt brutal offsets)

### Design-Entscheidungen
- **isGreen statt accentColor**: Statt 4 verschiedene bunte Akzentfarben ein binäres System — normal oder green-highlighted. Weniger Chaos, mehr Brand-Kohärenz.
- **Stacked Items (negative margin)**: Shoot-Items und Activity-Items stehen direkt zusammen — spart vertikalen Raum und wirkt wie ein Daten-Terminal.
- **Square everything**: Konsequent 0px radius. Keine Ausnahmen. Auch Date-Boxes, Icon-Boxes, Badges — alles kantiger Brutalismus.
- **Mono für Timestamps**: JetBrains Mono für Uhrzeiten und Datumsangaben — Tool-Interface-Vibe.
- **Uppercase + Tracking**: Alle Labels, Section-Headers, Badges — durchgehend uppercase mit letter-spacing. Militant einheitlich.

### Visueller Review
- ✅ Dev-Server gestartet (Port 5180, .env.local mit Dummy-Convex-URL)
- ✅ Static HTML Preview erstellt (Dashboard mit Sidebar, Stats, Pipeline, Shoots, Activity)
- ✅ Full-Page Screenshot gemacht und analysiert
- ✅ Background-Farben korrekt (surface-0 main, surface-1 cards)
- ✅ Text-Farben korrekt (primary, secondary, tertiary, muted — richtige Hierarchie)
- ✅ Green #00DC82 durchgängig als Accent
- ✅ Space Grotesk NUR für Name, Stat-Values, Shoot-Day-Numbers
- ✅ Poppins für ALLE Labels, Buttons, Body-Text
- ✅ JetBrains Mono für Timestamps
- ✅ 0px border-radius überall — keine rounded corners
- ✅ 2px Borders durchgängig (border-strong)
- ✅ Brutal shadows korrekt (translate + offset)
- ✅ Green accent bars bei Section Headers
- ✅ "Veröffentlicht" Card grün hervorgehoben
- ✅ Pipeline-Bar square, Legend square dots
- ✅ Status-Badges square mit farbiger Border
- ✅ "Heute" Drehtermin mit grünem Date-Block
- ✅ Stacked Items (Shoots + Activity) korrekt zusammenhängend
- ✅ TypeScript Build: Zero errors (npx tsc --noEmit clean)
- ✅ Preview-HTML und .env.local gelöscht
- ✅ Dev-Server gestoppt
