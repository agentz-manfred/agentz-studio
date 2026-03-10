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
