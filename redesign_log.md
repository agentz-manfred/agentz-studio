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
