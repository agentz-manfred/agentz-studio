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

## Phase 5: Client Pages (10.03.2026, 01:00)

### Was wurde gemacht

**ClientAvatar.tsx — Brutalist Redesign:**
- Rounded-full entfernt → Square Avatare (0px border-radius)
- Default-Farbe von #4F46E5 auf #00DC82 (Brand Green)
- Border: 2px solid in Avatar-Farbe
- Brutal Shadow auf lg (3px) und md (2px) Varianten
- Letter-spacing 0.05em auf Initialen
- Image-Variante: border-strong statt rounded

**ClientsPage.tsx — Komplett-Redesign:**
- **Page Header**: Green accent bar (12×20px) + "KUNDENVERWALTUNG" meta-label (uppercase, 0.12em tracking)
- **H1**: Space Grotesk, 24px, uppercase — NUR hier Display-Font
- **Count**: Font-mono, tabular-nums
- **Search**: 2px border-strong, font-mono placeholder, green focus mit brutal-sm shadow
- **"Neuer Kunde" Button**: btn-brutal Helper-Class (green, uppercase, shadow on hover)
- **Client Grid**: Stacked cards mit -2px margins (vertikal + horizontal), keine gaps
- **Client Cards**: 2px border-strong, 0px radius, hover → translate(-2px, -2px) + brutal green shadow + border-green
- **Avatar**: Square, 2px border in Avatar-Farbe, 2px brutal shadow offset
- **Name**: 14px bold uppercase, 0.02em tracking, goes green on hover
- **Stats**: Font-mono für Zahlen, uppercase labels
- **Contact Row**: 2px border-top, font-mono für Email/Telefon
- **Aktiv Badge**: Square, green-subtle bg, green border, uppercase tracking
- **Action Buttons**: Square w-7 h-7 mit border, hover → green border + green icon + green-subtle bg
- **Empty State**: Dashed border + 4 green corner marks + square icon-box

**Modals (Create Client, Create Login, Invite Link):**
- 2px border-strong, brutal shadow (4px 4px green)
- Header: 2px green accent bar + uppercase tracking title + close button mit error-hover
- Labels: 11px uppercase, 0.08em tracking, font-bold, text-muted
- Inputs: 2px border-strong, bg surface-0, green focus border + brutal-sm shadow
- Buttons: btn-brutal / btn-brutal-outline helper classes
- Invite-Link: Font-mono für URL, "COPY" uppercase
- Success-State: Square green check-icon, green border
- Error-State: Left-border red accent

**ClientDetail.tsx — Komplett-Redesign:**
- **SectionHeader**: Wiederverwendbare Komponente mit 3×20px green accent bar + Icon + uppercase title + optionaler "Action →" link
- **Back-Link**: 11px uppercase, 0.08em tracking, hover → green
- **Avatar**: Square 14×14, 2px border, 3px brutal shadow
- **Name**: Space Grotesk, 24px, uppercase
- **Meta**: Font-mono für Email/Telefon
- **Green Accent Bar**: 48×3px unter dem Namen
- **Action Buttons**: 2px border-strong, 11px uppercase, hover → green border + green text
- **KI-Ideen Button**: Green border + green-subtle bg + green text
- **Login/No-Login Badge**: Square, green/gray Variante

**Stat Cards (3er Grid):**
- Stacked mit -2px margin-left
- 2px border-strong, square
- Left accent bar (3px): default surface-4, "Veröffentlicht" → green
- Icon-Box: Square, border, green-Variante für highlighted card
- Value: Space Grotesk, 32px, bold, tabular-nums
- Hover: translate(-2px, -2px) + brutal-dark/brutal shadow

**ProfileInfo Section:**
- 2px border-strong, square
- Labels: 10px uppercase, 0.08em tracking, font-bold
- Vertrag: Font-mono tabular-nums
- Plattformen: Square badges mit border
- Videos/Woche: Space Grotesk display value + mono "≈ X/mo"
- Kontext: 2px border-top separator

**ProfileEditor:**
- 2px border-strong, square container
- Header: Green accent bar + Pencil icon
- Inputs: 2px border-strong, green focus
- Avatar-Farbe: Square color swatches mit brutal shadow on selected
- Plattform-Buttons: Square, 2px border, uppercase, green active state mit translate + shadow
- Save/Cancel: btn-brutal / btn-brutal-outline

**CategoryManager:**
- Square category badges (2px border, color-tinted)
- Square color dots statt rounded
- Square edit/add inline containers
- Delete → error hover

**Ideas List:**
- Stacked items (-2px margin-top)
- 2px border-strong, hover → border-green + translate + shadow
- Status badges: Square mit farbiger border
- Category badges: Square mit color dot (square)
- Title: Goes green on hover

**Shoots:**
- Stacked items (-2px margin-top)
- Date-Box: Square 48×48, 2px border, Space Grotesk day number
- "Heute": Green background date-box + green border on item + square "Heute" badge
- Time: Font-mono tabular-nums

**Activity Timeline:**
- Filter buttons: Square, border, uppercase, active → green
- Timeline line: 2px width
- Square icon-dots statt rounded (border + tinted bg)
- Title: Goes green on hover
- Time: Font-mono
- User: 10px uppercase, 0.06em tracking

**ClientDashboard.tsx — Komplett-Redesign:**
- Header: Green accent bar + "DASHBOARD" meta + Space Grotesk greeting + accent underline
- Stat cards: Stacked 3er-grid, -2px margins, left accent bars, square icon-boxes
- "Veröffentlicht" card: Green value + green accent + green shadow on hover
- Projects list: Stacked items, 2px borders, hover → translate + shadow
- "Aktion nötig" badge: Square, warning-yellow bg, dark text, uppercase
- Progress tracker: Square bars (h-2 statt h-1), step icons below
- Video grid: Stacked 2×2, square cards, hover → brutal dark shadow
- Play button: Square green box statt rounded white circle
- Feedback badge: Square, warning bg, uppercase
- Empty state: Dashed border + 4 green corner marks + square icon box
- Help hint: Square card, square icon box

### Design-Entscheidungen
- **Square Avatare**: Konsequent brutalist — keine Ausnahme für Profilbilder. Alle Elemente sind kantiger Brutalismus.
- **Stacked Grid**: Client-Cards hängen direkt zusammen (-2px margin), spart Platz und wirkt wie ein Daten-Terminal.
- **SectionHeader-Komponente**: Wiederverwendbar für alle Sektionen — green accent bar links ist das visuelle Leitmotiv.
- **Square Timeline-Icons**: Statt runder Dots → quadratische Boxen. Konsequenter Brutalist-Approach.
- **Play-Button Square Green**: Im Video-Grid wird der Play-Button von einem weißen Kreis zu einem grünen Quadrat — passt zum Brand.
- **Mono für Daten**: Konsequent JetBrains Mono für Emails, Telefon, URLs, Timestamps — technischer Tool-Vibe.

### Visueller Review
- ✅ Dev-Server gestartet (Port 5180, .env.local mit Dummy-Convex-URL)
- ✅ Static HTML Preview erstellt (komplette Client Pages: Grid, Detail, Stats, Ideas, Shoots, Activity, Modal)
- ✅ Full-Page Screenshot gemacht und analysiert
- ✅ Background-Farben korrekt (surface-0 main, surface-1 cards)
- ✅ Text-Farben korrekt (primary, secondary, tertiary, muted — richtige Hierarchie)
- ✅ Green #00DC82 durchgängig als Accent
- ✅ Space Grotesk NUR für Page-Titles und Stat-Values
- ✅ Poppins für ALLE Labels, Buttons, Body-Text
- ✅ JetBrains Mono für Emails, Telefon, Timestamps, URLs
- ✅ 0px border-radius überall — keine rounded corners
- ✅ 2px Borders durchgängig (border-strong)
- ✅ Brutal shadows korrekt (translate + offset)
- ✅ Green accent bars bei Section Headers
- ✅ Square Badges, Avatare, Icon-Boxes, Color-Dots
- ✅ Stacked Items (Cards, Ideas, Shoots) korrekt zusammenhängend
- ✅ Filter-Buttons square mit active state
- ✅ Modal mit brutal shadow + green accent bar
- ✅ Uppercase + Tracking militant einheitlich
- ✅ TypeScript Build: Zero errors (npx tsc --noEmit clean)
- ✅ Preview-HTML und .env.local gelöscht
- ✅ Dev-Server gestoppt

## Phase 6: Video/Pipeline Pages (10.03.2026, 02:00)

### Was wurde gemacht

**VideosPage.tsx — Komplett-Redesign:**
- Page Header: Green accent bar (3×20px) + "VIDEOVERWALTUNG" meta-label (uppercase, 0.12em tracking)
- H1: Space Grotesk, 24px, uppercase — NUR hier Display-Font
- Count: Font-mono, tabular-nums, bold
- Search: 2px border-strong, font-mono placeholder, green focus mit brutal-sm shadow, square (0px radius)
- "Video hochladen" Button: btn-brutal Helper-Class (green, uppercase, shadow on hover)
- Filter Buttons: Stacked (connected mit -2px margin-right), 2px border, square, active → green bg + green border
- Video Grid: Stacked cards mit -2px margins (vertikal + horizontal), keine gaps
- Video Cards: 2px border-strong, 0px radius, hover → translate(-2px, -2px) + brutal green shadow + border-green
- Thumbnails: Square green play-overlay (statt rounded-full white)
- Video Title: 13px bold uppercase, goes green on hover
- Status Badges: Square, 10px, border in status-color, uppercase tracking
- Meta Row: 11px uppercase tracking
- Date: Border-top separator, font-mono tabular-nums, clock icon
- Empty State: Dashed border + 4 green corner marks + square icon-box + Space Grotesk title
- No-Results: Uppercase bold + Search icon

**VideoPlayer.tsx — Brutalist Redesign:**
- Container: 2px border-strong, 0px radius (kein rounded-lg)
- Play Overlay: Square green button (64×64) mit border + box-shadow, statt rounded-full white
- Progress Bar: 6px height (statt 1px), square (kein border-radius)
- Progress Fill: Green, square
- Playhead: Square 14×14, green, 2px border green-dark, shadow 1px offset
- Timeline Markers: Square 10×10 (statt rounded-full 2.5), border 1px #0A0A0A
- Hover Tooltip: Square, green text on black bg, green border, mono font
- Control Buttons: Hover → green (statt generic white)
- Time Display: Font-mono, tabular-nums
- Embed Variant: Square border (kein rounded)

**VideoReview.tsx — Komplett-Redesign:**
- Header: 2px border-bottom, surface-0 background
- Back Button: Square, border on hover → green + green-subtle bg
- Title: 14px bold uppercase, font-body
- Linked Idea Badge: Square, green border + green-subtle bg, 10px uppercase
- Status Badge: Square, border in status-color, uppercase tracking, ChevronDown for admin
- Status Dropdown: 2px border-strong, brutal shadow, square, items hover → green-subtle + green text, square status dots
- Share Button: Square, hover → green border
- Share Panel: 2px border-strong, brutal shadow, green accent bar header, stacked link items (-2px margin), mono font for URLs, btn-brutal for new link
- Player Area: surface-0 background
- Processing State: Square icon box, uppercase labels

**Comment Panel:**
- 2px border-left, surface-1 background
- Header: 2px border-bottom, green accent bar + MessageSquare icon + uppercase "KOMMENTARE" + mono count
- Stacked Comment Cards: 2px border-strong, -2px margin-top, hover → border-green
- Author: 11px bold uppercase tracking
- Timestamp Badge: Square green bg, #0A0A0A text, mono font, green-dark border
- Reply Thread: border-left-2 green (statt generic border)
- Reply Input: Connected (gap-0, -2px margin), square
- Send Button: Square green, border green-dark
- Resolved Toggle: Uppercase bold tracking, hover → green
- Comment Dates: Font-mono tabular-nums
- Pending Comments: Green border + green-subtle bg
- Timestamp Toggle: 10px uppercase bold

**VideoUpload.tsx — Brutalist Redesign:**
- Drop Zone: 2px dashed border-strong, square, 4 green corner marks
- Icon Box: 40×40, square, 2px border
- Labels: 13px bold uppercase tracking
- Hint: 11px uppercase tracking
- Drag-Over State: Green border + green-subtle bg + brutal shadow
- Summary Bar: 2px border-strong, square, uppercase, mono counts
- Upload Items: Stacked (-2px margin-top), 2px border-strong, square
- File Name: 12px bold uppercase
- File Size: 10px mono tabular-nums
- Progress %: 10px mono bold green
- Progress Bar: 6px height, square, border, green fill
- Status Icons: strokeWidth 2 (crisp)
- Cancel/Remove: Square hover → error border

**PipelinePage.tsx — Komplett-Redesign:**
- Header: 2px border-bottom, green accent bar + "CONTENT PIPELINE" meta
- H1: Space Grotesk, 24px, uppercase
- Subtitle: 12px uppercase tracking bold
- "Neue Idee" Button: btn-brutal
- New Idea Modal: 2px border-strong + brutal shadow, square
- Modal Header: Green accent bar + uppercase title + close → error hover
- Labels: 11px uppercase 0.08em tracking bold, text-muted
- Inputs: 2px border-strong, surface-0 bg, green focus + brutal-sm shadow
- Selects: Same brutal input style
- Category Buttons: Stacked (connected -2px margin), square, 2px border, colored
- Buttons: btn-brutal / btn-brutal-outline, connected (gap-0, -2px margin)

**KanbanBoard.tsx — Komplett-Redesign:**
- Board Grid: gap-0, columns connected (-2px margin-left)
- Column Headers: 2px border-strong, square, status dot (10×10 square mit border)
- Column Name: 11px bold uppercase 0.08em tracking
- Count Badge: Square, border in status-color, mono font, tabular-nums
- Cards: 2px border-strong, -2px margin-top (stacked), square
- Card Accent Bar: 3px height, status-colored, full-width (kein border-radius)
- Card Title: 12px bold uppercase, hover → green
- Card Description: 11px, text-tertiary
- Client Section: 2px border-top separator
- Client Avatar: Square 20×20, border #0A0A0A, colored bg (statt rounded-full)
- Client Name: 10px uppercase tracking bold
- Hover: translate(-2px, -2px) + 3px green-dark shadow + green border
- Active/Drag: 4px green shadow, slight scale
- Empty Column: Square dashed border, 10px uppercase tracking
- Drag Overlay: Square, 2px green border, 4px green shadow, rotate(2deg)

### Design-Entscheidungen
- **Square Play Buttons**: Green-filled squares statt weiße Kreise — konsequenter Brutalist-Approach + Brand-Color prominent
- **Connected Elements**: Filter-Buttons, Upload-Items, Comment-Cards, Kanban-Columns — alles -2px margin für zusammenhängendes Terminal-Feeling
- **Square Progress Bars**: 6px statt 1px, kein border-radius — massiver, sichtbarer, brutaler
- **Square Timeline Markers**: 10×10 Quadrate mit Border — passen zum Square-Everything-Prinzip
- **Comment Stacking**: Cards liegen direkt übereinander — Data-Terminal-Vibe, spart Platz
- **Kanban Connected Columns**: Columns ohne Gap — visuell ein zusammenhängender Block statt separate Spalten
- **Mono für alles Technische**: Timestamps, File-Sizes, Counts, URLs — konsequent JetBrains Mono

### Visueller Review
- ✅ Dev-Server gestartet (Port 5181, .env.local mit Dummy-Convex-URL)
- ✅ Static HTML Preview erstellt (alle 6 Komponenten: Videos Grid, Video Review, Video Player, Video Upload, Pipeline Header, Kanban Board + Modal)
- ✅ Full-Page Screenshot gemacht und analysiert
- ✅ Background-Farben korrekt (surface-0 main, surface-1 cards/panels)
- ✅ Text-Farben korrekt (primary, secondary, tertiary, muted — richtige Hierarchie)
- ✅ Green #00DC82 durchgängig als Accent
- ✅ Space Grotesk NUR für Page-Titles (Videos, Pipeline)
- ✅ Poppins für ALLE Labels, Buttons, Body-Text, Card-Titles
- ✅ JetBrains Mono für Timestamps, File-Sizes, Counts, Progress, URLs
- ✅ 0px border-radius überall — keine rounded corners
- ✅ 2px Borders durchgängig (border-strong)
- ✅ Brutal shadows korrekt (translate + offset)
- ✅ Green accent bars bei Section Headers
- ✅ Square Badges, Play-Buttons, Markers, Progress-Bars, Avatars
- ✅ Stacked Items (Cards, Comments, Upload-Queue, Kanban-Cards) korrekt zusammenhängend
- ✅ Filter-Buttons connected mit active state
- ✅ Modal mit brutal shadow + green accent bar
- ✅ Uppercase + Tracking militant einheitlich
- ✅ TypeScript Build: Zero errors (npx tsc --noEmit clean)
- ✅ Preview-HTML und .env.local gelöscht
- ✅ Dev-Server gestoppt

## Phase 7: Remaining Pages (10.03.2026, 03:00)

### Was wurde gemacht
Alle verbleibenden Seiten wurden auf den einheitlichen AgentZ Brutalist-Stil migriert:

**10 Dateien redesigned:**
1. **CalendarPage.tsx** — Kalender-Grid mit 2px Borders, square cells, brutale Event-Chips, green accent bars, stacked upcoming-Termine mit hover-translate+shadow, square popovers/modals
2. **IdeasPage.tsx** — Square StatusDots, connected filter buttons, stacked idea items mit hover-brutal, square checkboxen, brutalist bulk-bar, AI-modal mit green accent header
3. **IdeaDetail.tsx** — Square StatusBadge mit Borders, brutalist breadcrumb, ScriptEditor mit green accent bar, square AI-Buttons, stacked comments
4. **LibraryPage.tsx** — Square folder/video cards mit brutal hover shadows, square toolbar, connected view-toggles, brutalist dialogs (Rename/NewFolder/Move)
5. **TeamPage.tsx** — Square user avatars (nicht rounded-full!), stacked user items, connected role stats, square role badges mit borders, brutalist modals
6. **SettingsPage.tsx** — Alle section cards: 2px border-strong + square icon containers + uppercase section headers. Theme-Buttons connected, brutalist PWA install section, square AI model dropdown
7. **AuditLogPage.tsx** — Stacked log entries mit 2px border + hover-translate, connected filter selects, square icon dots, green corner marks empty state
8. **InvitePage.tsx** — Square brand mark mit brutal shadow, brutalist form card, 2px border inputs, btn-brutal submit, square success/error states
9. **SharePage.tsx** — Square brand mark mit green border, brutalist player container, square status badges, uppercase header/footer
10. **LegalPages.tsx** — Square back button, green accent bar H1, Section headers mit green accent, square InfoBox, uppercase tracked footer links

### Design-Prinzipien konsistent angewendet
- `border-radius: 0` überall (keine Ausnahme)
- `border: 2px solid var(--color-border-strong)` für alle Karten/Inputs
- `shadow: var(--shadow-brutal)` / `var(--shadow-brutal-sm)` für Modals/Hover
- Green accent bars (3px × 20px) bei Section Headers
- Space Grotesk nur für H1/Hero Headlines
- Uppercase + letter-spacing für Labels/Badges
- Connected elements mit -2px margin
- Hover: border-green + translate(-1px,-1px) + brutal-shadow
- Empty states: dashed border + 4 grüne Corner-Marks
- Font-mono für Timestamps/technische Daten

### Keine Funktionalität geändert
Rein visuelle Änderungen — alle Hooks, State, Mutations, Queries und Logik unverändert.

### TypeScript
✅ `npx tsc --noEmit` — kompiliert fehlerfrei

## Phase 8: Popups, Modals, Overlays (10.03.2026, 04:00)

### Was wurde gemacht

**6 Overlay-Komponenten auf einheitlichen Brutalist-Stil migriert:**

**CommandPalette.tsx — Komplett-Redesign:**
- Panel: 2px border-strong, 0px radius, brutal green shadow (statt rounded-lg + shadow-lg)
- Green accent bar (3px) oben — visuelles Leitmotiv aller Overlays
- Backdrop: rgba(10,10,10,0.8) + blur(8px) saturate(120%) — konsistent mit modal-backdrop CSS
- Search Input: Uppercase placeholder, font-body, 0.04em tracking, green Search-icon
- ESC kbd: Mono-font, 1px border-strong, square — kein rounded
- Category Labels: Green accent bar (3px × 12px) links + 10px uppercase 0.1em tracking
- Selected Item: Full green background + 3px green-dark left-border + bold uppercase + ArrowRight icon
- Normal Items: Uppercase, 3px transparent left-border, hover → green bg
- Sublabels: Font-mono für Personennamen/Status
- Footer: Surface-0 background, 2px border-top, uppercase labels, square KBDs mit mono-font
- Animation: cmdSlideDown (translateY statt scale) mit ease-brutal

**CommandPaletteTrigger — Redesign:**
- Uppercase "SUCHEN" label, 0.04em tracking
- Square (kein border-radius), border on hover → green
- KBD: Square, border-strong, mono-font

**IdeaDrawer.tsx — Komplett-Redesign:**
- Panel: 2px border-left strong, **-6px green shadow links** als visueller Marker (statt shadow-2xl)
- Backdrop: Konsistent rgba(10,10,10,0.8) + blur
- Header: Surface-1 background, 2px border-bottom, green accent bar (3px × 20px) links
- Close Button: Square 32×32, 2px border-strong, hover → error-red border + bg
- Client Name: 11px uppercase, 0.06em tracking, font-bold, muted
- Title: Space Grotesk, 20px, uppercase (Display-Font für Drawer-Headline)
- Description Box: 2px border-strong, square (statt rounded-md)
- Shoot Dates: Stacked (-2px margin-top), square icon-box 32×32 mit green clock
- Time: Font-mono, green color
- Location: Uppercase, 0.04em tracking, muted
- Date Input: 2px border-strong, font-mono, green focus
- Archive Button: Uppercase "ARCHIV"/"RESTORE", hover → green border + green text
- Created Date: Font-mono, tabular-nums

**Toast.tsx — Komplett-Redesign:**
- Entfernt: Tailwind emerald-500/red-500 Farben → Brand-Token-System
- Border: 2px solid in Status-Farbe (green/error/info)
- Shadow: 3px 3px 0px in Status-Farbe — brutal offset statt backdrop-blur
- Icon Box: Square 28×28, 1px border in Status-Farbe, tinted background
- Message: 12px uppercase, 0.03em tracking, font-bold
- Dismiss Button: Square 24×24, 1px border-strong, hover → error-red
- Animation: toastSlideIn von rechts (translateX statt translateY)
- Exit: translateX(12px) statt translateY(2px) — nach rechts raussliden
- Kein backdrop-blur mehr — clean, brutal, schnell

**CookieBanner.tsx — Komplett-Redesign:**
- Container: 2px border-strong, brutal green shadow (statt rounded-lg)
- Icon Box: Square 32×32, 2px green border, green-subtle bg (statt nackte Icon)
- Text: 12px, font-weight-500
- "MEHR →" Link: 10px uppercase, 0.06em tracking, green, hover underline
- Accept Button: btn-brutal helper class, 11px, 32px height
- Max-width 480px (statt max-w-lg)

**KeyboardShortcutsDialog.tsx — Komplett-Redesign:**
- Panel: 2px border-strong, brutal green shadow (statt rounded-lg + shadow-lg)
- Green accent bar (3px) oben — wie CommandPalette
- Header: 2px border-bottom, square icon-box (28×28, 2px green border, green-subtle bg)
- Title: 13px uppercase, 0.06em tracking, font-bold
- Close: Square 28×28, 2px border-strong, hover → error-red
- Section Headers: Green accent bar (3px × 12px) + 10px uppercase 0.1em tracking
- Items: Separator mit border-subtle (statt space-y)
- KBDs: Square, 2px border-strong, mono-font, **green text** — Key-Shortcut-Tasten leuchten grün
- Description Text: 12px, font-weight-500, secondary

**RichTextEditor.tsx — Brutalist Redesign:**
- Container: 2px border-strong, square (statt rounded-md)
- Toolbar: Surface-0 background (dunkler als Editor), 2px border-bottom
- Toolbar Buttons: Square mit transparent border, active → green bg + green-dark border
- Hover: Green text + border-strong + green-subtle bg (statt generic surface-2)
- Dividers: 2px × 16px border-strong (statt 1px)
- Icon strokeWidth: 2 (crisp)
- Non-editable: Keine border/bg (transparent)

**index.css — TipTap Styles aktualisiert:**
- Editor focus: Background → surface-0 (dunklere Fokus-Ebene)
- Placeholder: Uppercase, 0.04em tracking, 12px, muted (statt tertiary)
- H2/H3: font-weight 700 (statt 600), uppercase, 0.02em tracking
- List bullets: `square` statt `disc` — Brutalist konsequent
- Inline code: 0px border-radius, 1px border-strong, green color
- Pre blocks: 2px border-strong + 3px green left-border
- Blockquote: Green-subtle background (statt transparent)
- HR: border-strong (statt border)
- Display-Variante: Gleiche Brutalist-Updates

### Design-Entscheidungen
- **Green Shadow Links (Drawer)**: Statt shadow-2xl ein 6px grüner Balken links — markiert den Drawer als Panel-Overlay, sofort erkennbar
- **Consistent Backdrop**: Alle Overlays nutzen jetzt rgba(10,10,10,0.8) + blur(8px) saturate(120%) — identisch mit `.modal-backdrop` CSS-Klasse
- **Toast Richtung**: Toasts sliden von rechts rein/raus statt von unten — natürlicher für bottom-right Position
- **Green KBDs**: Keyboard-Shortcut-Tasten in grün — Brand-Color zeigt "das sind interaktive Keys"
- **Uppercase durchgehend**: Alle Labels, Badges, Category-Headers, Buttons — militant einheitlich in allen Overlays
- **Square Icons in allen Overlays**: Konsistent mit den Page-Redesigns — keine rounded icon-containers

### Keine Funktionalität geändert
Rein visuelle Änderungen — alle Hooks, State, Mutations, Queries, Keyboard-Shortcuts und Logik unverändert.

### Visueller Review
- ✅ Dev-Server gestartet (Port 5182)
- ✅ Static HTML Preview erstellt (Command Palette, Toasts ×3, Cookie Banner, Keyboard Shortcuts, Idea Drawer, Rich Text Editor)
- ✅ Full-Page Screenshot gemacht und analysiert
- ✅ Background-Farben korrekt (surface-0/surface-1 richtig verteilt)
- ✅ Text-Farben korrekt (primary, secondary, tertiary, muted — richtige Hierarchie)
- ✅ Green #00DC82 durchgängig als Accent in allen Overlays
- ✅ Space Grotesk NUR für Drawer-Title (Display)
- ✅ Poppins für alle Labels, Buttons, Messages
- ✅ JetBrains Mono für KBDs, Sublabels, Timestamps
- ✅ 0px border-radius überall — keine rounded corners in Overlays
- ✅ 2px Borders durchgängig (border-strong)
- ✅ Brutal shadows korrekt (offset-Stil für Toasts + Panels)
- ✅ Green accent bars bei Command Palette + Keyboard Shortcuts + Drawer Header
- ✅ Square Icon-Boxes, KBDs, Close-Buttons, Dismiss-Buttons
- ✅ Uppercase + Tracking militant einheitlich
- ✅ Toast-Farben: Green/Red/Blue — korrekte Status-Trennung
- ✅ RichTextEditor Toolbar: Green active state, brutal dividers
- ✅ TypeScript Build: Zero errors (npx tsc --noEmit clean)
- ✅ Preview-HTML und .env.local gelöscht
- ✅ Dev-Server gestoppt

## Phase 9: Polish + Micro-Interactions (10.03.2026, 05:00)

### Was wurde gemacht

**Skeleton.tsx — Komplett-Redesign auf Brutalist-Stil:**
- Entfernt: Alle `rounded-*` (md, lg, full, [10px]) → 0px radius überall
- Entfernt: `border-subtle` → 2px `border-strong` durchgehend
- Entfernt: `animate-pulse` → Custom `skeleton-shimmer` Animation (directional sweep, nicht opacity-pulse)
- Alle Skeleton-Varianten auf Brand-Stil migriert:
  - **StatSkeleton**: Left accent bar (3px), square icon-box
  - **ListItemSkeleton**: Square dots statt rounded-full, stacked (-2px margin-top)
  - **DashboardSkeleton**: Green accent bar placeholder, stacked stat-grid, connected widget-panels
  - **PipelineSkeleton**: Connected Kanban-Columns (-2px margin), column headers mit border-bottom
  - **CalendarSkeleton**: Grid mit 2px borders, connected nav-buttons
  - **LibrarySkeleton**: Green accent bars bei Section-Labels, stacked folder/video cards
  - **ClientsSkeleton**: Stacked grid, border-top separator in cards
  - **TeamSkeleton**: Stacked items, square avatare, square role badges
  - **IdeasListSkeleton**: Connected filter-bar, stacked items

**PageTransition.tsx — Verfeinert:**
- Von simplem opacity-fade auf 2-Phasen-System (exit → enter → idle)
- Exit: translateX(-6px) + opacity 0, 100ms, ease-brutal
- Enter: translateX(0) + opacity 1, 200ms, ease-out
- Keine CSS-Klassen mehr, direkte style-Objekte für saubere Phasen-Kontrolle
- Kein `transition-all` mehr (war zu breit), nur opacity + transform

**ErrorBoundary.tsx — Brutalist-Redesign:**
- Icon-Container: Square (0px radius), 2px border-error, error-tinted bg
- Title: Uppercase, 0.04em tracking, font-bold
- Error-Message: font-mono (technischer Fehlertext)
- Button: `btn-brutal` helper class statt eigenem rounded-md + accent-bg
- Entfernt: `rounded-full`, `rounded-[var(--radius-md)]`

**index.css — Neue Sektionen hinzugefügt:**

**1. Skeleton Loading Animation:**
- `@keyframes skeletonShimmer`: Horizontaler Sweep (400px range)
- `.skeleton-shimmer`: Gradient-basiert (surface-2 → surface-3 → surface-2), 1.6s, ease-in-out
- Kein `animate-pulse` mehr — shimmer ist visuell interessanter + brand-consistent

**2. Unified Hover States:**
- `.hover-brutal`: translate(-2px, -2px) + brutal shadow + green border — für Cards/Items
- `.hover-brutal-sm`: translate(-1px, -1px) + brutal-sm shadow — für kleinere Elemente
- `.hover-green`: Color → green Transition — für Links/Labels
- Alle mit `var(--duration-fast)` + `var(--ease-brutal)` Timing

**3. Unified Focus States (Accessibility WCAG 2.1 AA):**
- Base `:focus-visible`: 2px green outline + 4px green ring (0.15 opacity) + glow
- Inputs: `outline: none`, green border + brutal-sm shadow (kein doppelter Outline)
- Buttons/Links: Green outline + ring (kein transform, das ist für hover)
- `:focus:not(:focus-visible)`: Keine outline bei Mouse-Klicks (nur Keyboard-Focus sichtbar)
- Alte duplicate `:focus-visible` Regel entfernt (war bei Zeile 160)

**4. Responsive Polish:**
- Mobile (≤640px): Reduzierte brutal shadows (3px statt 4px) — weniger visuelles Gewicht auf kleinen Screens
- Tablet (641–1024px): Moderate shadow-lg Anpassung
- `prefers-reduced-motion`: Alle Animationen auf 0.01ms, skeleton-shimmer deaktiviert
- Touch-Devices (`hover: none` + `pointer: coarse`): Min-Height/Width 44px auf Buttons (Touch-Target-Size), keine hover-transforms (kleben auf Touch)

**5. Weitere Fixes:**
- **SharePage.tsx**: `rounded-[10px]` → square, `rounded-full` dots → square, `rounded` timestamp badge → square mit border
- **kanban.tsx** (Base-Komponente): `rounded-lg bg-zinc-100 dark:bg-zinc-900` → 2px border-strong + surface-1 (Brand-consistent)
- **Shimmer @keyframes**: Fehlende `}` bei `@keyframes shimmer` gefixt

### Design-Entscheidungen
- **Shimmer statt Pulse**: animate-pulse ist generisch. Ein horizontaler Gradient-Sweep passt zum technischen Brutalist-Vibe.
- **2-Phasen PageTransition**: Exit geht nach links (translateX), Enter kommt von neutral. Horizontale Bewegung passt zum App-Navigations-Gefühl.
- **Focus vs Hover Trennung**: Focus-visible = grüner Ring (Accessibility). Hover = translate + shadow (Mouse). Kein Mischen.
- **Touch-Target 44px**: WCAG 2.5.5 Target Size — alle interaktiven Elemente mindestens 44×44px auf Touch-Devices.

### Keine Funktionalität geändert
Rein visuelle Änderungen — alle Hooks, State, Mutations, Queries und Logik unverändert.

### Visueller Review
- ✅ Dev-Server gestartet (Port 5180, .env.local mit Dummy-Convex-URL)
- ✅ Desktop Screenshot: Login-Seite korrekt
- ✅ Hover State: ANMELDEN Button — translate + lighter green ✅
- ✅ Focus State: E-Mail Input — grüne Border + glow ✅
- ✅ Tab-Navigation: Passwort → ANMELDEN — grüner Focus-Ring ✅
- ✅ Cookie Banner OK Hover: translate + brutal shadow ✅
- ✅ Mobile Viewport (375×812): Login responsive, zentriert ✅
- ✅ Tablet Viewport (768×1024): Login responsive ✅
- ✅ Background-Farben korrekt (#0A0A0A)
- ✅ Green #00DC82 durchgängig als Accent
- ✅ 0px border-radius überall
- ✅ TypeScript Build: Zero errors (npx tsc --noEmit clean)
- ✅ .env.local gelöscht
- ✅ Dev-Server gestoppt

## Phase 10: Final Review + CSS Cleanup (10.03.2026, 06:00)

### Was wurde gemacht

**Visueller Komplett-Check:**
- ✅ Login-Seite (Desktop 1280×900 + Mobile 375×812)
- ✅ Impressum-Seite (Volltext, alle Sektionen)
- ✅ Datenschutz-Seite (Volltext, alle Sektionen)
- ✅ Invite-Seite (Loading State)
- ✅ Cookie Banner (korrekt auf allen Seiten)
- ✅ Alle öffentlichen Routen visuell einwandfrei

**Code-Audit aller TSX-Dateien:**
- ✅ `rounded-*` Tailwind-Klassen: Nur 2 Vorkommen in Login.tsx für dekorative Gradient-Kreise (korrekt, brauchen rounded-full)
- ✅ `border-radius` Inline-Styles: Nur Kommentare + Print-Export (nicht user-facing)
- ✅ Keine generischen Tailwind-Shadows (shadow-lg, shadow-xl, etc.) mehr in TSX
- ✅ Status-Farben (emerald, violet, blue) werden korrekt für semantische Differenzierung genutzt — Brand-Accent bleibt #00DC82

**index.css Cleanup — 276 Zeilen entfernt (945 → 669):**
22 ungenutzte CSS-Klassen entfernt, die in Phase 1 als Utility-Klassen definiert, aber in den nachfolgenden Phasen durch Inline-Styles in den Komponenten ersetzt wurden:
- `brand-glow`, `hero-gradient`, `stat-card`, `accent-left`, `quick-action`
- `client-card`, `glass-card`, `install-banner`, `kanban-header`, `title-accent`
- `kanban-card-accent`, `login-mesh`, `nav-item-active`, `nav-active-indicator`
- `modal-backdrop`, `tooltip-animate`
- `input-brutal`, `card-brutal`, `badge-green`
- `hover-brutal`, `hover-brutal-sm`, `hover-green`

**TipTap Pre-Block Fix:**
- Doppelte `border-left` Deklaration in `.tiptap-editor .tiptap pre` bereinigt

**Build-Verifizierung:**
- ✅ TypeScript: `npx tsc --noEmit` — Zero errors
- ✅ Vite Build: `npx vite build` — Erfolgreich, alle Assets generiert
- ✅ Dev-Server: Kein CSS-Fehler nach Cleanup + Reload
- ✅ Keine visuellen Regressionen nach CSS-Cleanup

### Keine Funktionalität geändert
Rein Cleanup und Verifizierung — keine Logik, Hooks, State oder Queries verändert.

---

## Redesign-Zusammenfassung (09./10. März 2026)

### Überblick
Komplettes visuelles Redesign des AgentZ Studio von einem generischen Dark-Theme auf einen einheitlichen **Brutalist / Raw** Stil mit AgentZ Brand Colors.

**Aesthetic Direction:** Brutalist / Raw
**Differentiator:** Brutal offset shadows + green glow + sharp geometry

### Designsprache
| Element | Vorher | Nachher |
|---|---|---|
| Corners | rounded-md/lg/full | 0px überall |
| Shadows | Tailwind shadow-lg | Brutal offset (4px 4px 0px #00DC82) |
| Primary Color | Blau/Indigo-Gradient | #00DC82 (AgentZ Green) |
| Typography | System/Inter | Space Grotesk (Display) + Poppins (Body) |
| Borders | 1px subtle | 2px solid #3A3A3A |
| Labels | Mixed case | UPPERCASE + letter-spacing |
| Timestamps | Normal font | JetBrains Mono, tabular-nums |
| Avatare | Rounded-full | Square |
| Badges | Rounded-full/pill | Square mit Border |
| Cards | Gap/separated | Stacked (-2px margin) |

### Geänderte Dateien (28 Dateien)

**Core:**
- `src/index.css` — Design System Tokens + Component Helpers (669 Zeilen)
- `index.html` — Google Fonts (Space Grotesk, Poppins)
- `public/favicon.svg` — Neues Brutalist "A"-Mark

**Layout:**
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/MobileHeader.tsx`
- `src/components/layout/CommandPalette.tsx`
- `src/components/layout/KeyboardShortcuts.tsx` (Dialog)
- `src/components/layout/PageTransition.tsx`

**Shared Components:**
- `src/components/ui/ClientAvatar.tsx`
- `src/components/ui/RichTextEditor.tsx`
- `src/components/ui/Skeleton.tsx`
- `src/components/ui/Toast.tsx`
- `src/components/ui/kanban.tsx`
- `src/components/CookieBanner.tsx`
- `src/components/ErrorBoundary.tsx`
- `src/components/ideas/IdeaDrawer.tsx`
- `src/components/kanban/KanbanBoard.tsx`
- `src/components/video/VideoPlayer.tsx`
- `src/components/video/VideoUpload.tsx`

**Pages (18):**
- `src/pages/Login.tsx`
- `src/pages/AdminDashboard.tsx`
- `src/pages/ClientsPage.tsx`
- `src/pages/ClientDetail.tsx`
- `src/pages/ClientDashboard.tsx`
- `src/pages/VideosPage.tsx`
- `src/pages/VideoReview.tsx`
- `src/pages/PipelinePage.tsx`
- `src/pages/CalendarPage.tsx`
- `src/pages/IdeasPage.tsx`
- `src/pages/IdeaDetail.tsx`
- `src/pages/LibraryPage.tsx`
- `src/pages/TeamPage.tsx`
- `src/pages/SettingsPage.tsx`
- `src/pages/AuditLogPage.tsx`
- `src/pages/InvitePage.tsx`
- `src/pages/SharePage.tsx`
- `src/pages/LegalPages.tsx`

### Design-Entscheidungen (Zusammenfassung)
1. **Square Everything**: Konsequent 0px border-radius. Keine Ausnahmen (außer dekorative Gradient-Kreise).
2. **Stacked Elements**: Cards, Items, Columns — alle mit -2px margin für zusammenhängendes Terminal-Feeling.
3. **Green Accent Bars**: 3px × 20px grüne Balken bei Section Headers als visuelles Leitmotiv.
4. **Mono für Daten**: JetBrains Mono konsequent für Timestamps, Emails, URLs, Counts, File-Sizes.
5. **Uppercase + Tracking**: Alle Labels, Badges, Buttons — militant einheitlich uppercase mit letter-spacing.
6. **isGreen statt bunte Accents**: Binäres System (normal oder green-highlighted) statt 4+ verschiedene Akzentfarben.
7. **Status-Farben bleiben funktional**: Emerald, Violet, Blue für semantische Status-Differenzierung — Brand-Accent bleibt Green.
8. **Hover = Translate + Shadow**: Konsistent translate(-2px, -2px) + brutal shadow offset für Cards/Items.
9. **Focus = Green Ring**: WCAG 2.1 AA konforme Focus-States mit grünem Outline + Ring.
10. **Touch-Targets 44px**: Alle interaktiven Elemente mindestens 44×44px auf Touch-Devices.

### Offene Punkte
- **Kein Live-Backend-Test möglich**: Interne Seiten (Dashboard, Clients, Videos, etc.) konnten nur per Code-Review und Static-Preview geprüft werden, da kein Convex-Backend verfügbar. Empfehlung: Nach Deploy mit echten Daten nochmal visuell durchgehen.
- **Status-Farben**: AuditLogPage und IdeasPage nutzen direkte Tailwind-Farben (text-emerald-600, bg-blue-500, etc.) statt CSS Custom Properties. Funktional korrekt, aber bei Bedarf auf Token-System migrierbar.
- **export.ts**: Print-Export-Button hat border-radius:8px — nicht user-facing, daher belassen.

### Git-History
```
f7b820d (pre-redesign baseline)
a86179b redesign phase 1: design system tokens
7789cc0 redesign phase 2: login + favicon + logo
0b8fa19 redesign phase 3: sidebar + navigation
6316a84 redesign phase 4: admin dashboard
31dc965 redesign phase 5: client pages
7fc640d redesign phase 6: video + pipeline pages
e82ad73 redesign phase 7: remaining pages
84a0b62 redesign phase 8: modals + overlays
489aba4 redesign phase 9: polish + micro-interactions
[next]  redesign phase 10: final review + cleanup
```
