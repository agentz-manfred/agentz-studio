# AgentZ Studio — TODO

Items werden von oben nach unten abgearbeitet. Erledigtes kommt ins CHANGELOG.md.

## Features

- [ ] **Generelles Styling-Audit:** Konsistenz überall prüfen. Sieht es wie ein eigenes Produkt aus oder wie ein shadcn-Template?

## Vom Nacht-Sprint als erledigt markiert (VERIFIZIERT ✅):
- [x] Email SMTP ✅
- [x] Kundenfilter (Sidebar-Dropdown) ✅
- [x] KI-Prompts konfigurierbar ✅
- [x] App-Icon neu ✅
- [x] Videos/Ordner Kundenzuordnung ✅
- [x] Benutzerverwaltung ✅
- [x] Multi-Upload + Queue ✅
- [x] Mediathek Sortierung/Filter ✅
- [x] Kalender-View ✅
- [x] PWA Install ✅
- [x] Security Audit ✅
- [x] Kanban DnD Mobile (TouchSensor Constraints) ✅
- [x] Kunden-Avatar Fix (avatarColor + Color Picker) ✅
- [x] Team-Seite Rolle "Kunde" entfernt ✅
- [x] Versionsnummer dynamisch (2.11.0) ✅
- [x] KI-Skript Output (HTML + kein Gelaber) ✅
- [x] Termine bearbeitbar (Kalender EventPopover) ✅

## Wenn Liste leer ist
→ Projekt komplett analysieren + visuell testen

---

## Bugs & Issues (Deep Review)

*Deep Review durchgeführt am 08.03.2026 von Manfred Bellmann (QA)*

### 🐛 Bugs (Funktional)



### ⚠️ Sicherheit

- [ ] **SECURITY: `simpleHash` statt bcrypt** (`convex/auth.ts:6`): Passwörter werden mit einer simplen XOR-Hash-Funktion gehasht. Kein Salt, trivial umkehrbar. Bei Datenleak sind alle Passwörter sofort kompromittiert. **Fix:** Bcrypt via Convex Action verwenden.

- [ ] **SECURITY: `Math.random()` für Session-Tokens** (`convex/auth.ts:18`): Nicht kryptographisch sicher. Tokens sind vorhersagbar. **Fix:** `crypto.getRandomValues()` verwenden (in Convex Actions möglich).

- [x] **SECURITY: Rate Limiting auf Login**: ✅ Max 5 Fehlversuche pro Minute pro Email. `loginAttempts` Tabelle, Cleanup in `cleanupSessions`.

### 🔧 Code-Qualität

- [x] **`as any` Casts bereinigt**: ✅ `clientFilter` korrekt als `Id<"clients">` getypt, ~18 `as any` Casts entfernt. Nur 2 verbleibend (navigator.standalone + KanbanBoard Prop-Widening).

- [ ] **Inkonsistente Text-Editoren**: Tiptap/RichTextEditor nur in IdeaDetail (Skript + Client-Kontext). Überall sonst plain `<textarea>` (Kalender-Notes, KI-Prompts in Settings, Neue-Idee-Beschreibung, Pipeline Quick-Add). Nicht zwingend Bug, aber inkonsistent.

- [ ] **54x `.collect()` ohne Pagination**: Backend-Queries laden ALLE Dokumente in den Speicher. Bei wachsender Datenmenge wird das zum Performance-Problem. Besonders kritisch: `ideas.list` (alle Ideen aller Kunden), `auth.listUsers`, `auth.cleanupSessions`.



### 🎨 UI/UX

- [ ] **Dashboard: "Widgets anpassen" Button** funktioniert (checked), aber wirkt etwas versteckt (nur ein kleines Icon oben rechts).

- [ ] **Keine Loading-States bei Buttons**: Bei KI-Generierung und anderen async Actions fehlen teilweise disabled-States auf den Auslöse-Buttons (Doppelklick möglich).

### ✅ Was gut läuft

- Saubere Projektstruktur, gutes Component-Decomposition
- Design-System konsistent (CSS Variables, einheitliche Radien/Schatten/Farben)
- Auth-Pattern im Backend konsistent (lib.ts `authenticate`/`requireAdmin`/`requireEditor`)
- Alle Fehlermeldungen auf Deutsch
- Keine stray `console.log` Statements
- Audit-Logging für wichtige Aktionen implementiert
- Responsive Sidebar mit korrektem Mobile-Verhalten
- Dashboard sieht professionell aus, gute Informationsdichte
- Dark/Light Mode korrekt implementiert
