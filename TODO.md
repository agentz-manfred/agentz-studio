# AgentZ Studio — TODO

Items werden von oben nach unten abgearbeitet. Erledigtes kommt ins CHANGELOG.md.
Neue Wünsche werden unten angehängt oder an der richtigen Prio-Stelle eingefügt.

## Features


- [ ] **Kalender-View verbessern:** Drehtermine + Veröffentlichungsdaten visuell anzeigen
- [ ] **Kunden-Dashboard verfeinern:** Super einfach für Nicht-Techniker, Tooltips, Hilfetexte, Onboarding




- [ ] **KI-Prompts konfigurierbar (Admin):** Globale System-Prompts über Einstellungen editierbar: Ideengenerierung, Skriptgenerierung, Skript kürzen, Skript verbessern. Pro Kunde optional überschreibbar: Eigenes Prompt-Feld pro KI-Funktion beim Kunden. Modus-Auswahl: "Überschreibt global" oder "Ergänzt global" (append). In DB: `settings`-Tabelle für globale Prompts + Felder im Client-Schema für kundenspezifische Overrides. UI: Settings-Seite "KI-Prompts" Tab + Kunden-Detail erweitern.

- [ ] **PWA Install prüfen:** Service Worker korrekt registriert? Install-Banner erscheint auf Android? Settings-Seite: "App installieren" Button funktioniert?
- [ ] **🔴 PRIO 2 — App-Icon neu:** Das jetzige Icon sieht billig aus. Prozess: 1) Erst selbst als SVG designen, 2) Screenshot machen + visuell analysieren, 3) iterieren bis es gut aussieht, 4) wenn SVG nicht reicht → mit Nano Banana Pro (google/gemini-3.0-pro-image-generation via OpenRouter, `scripts/generate_image.py`) generieren, 5) Ergebnis wieder visuell prüfen + iterieren. Muss als PWA Touch-Icon (192x192 + 512x512), Favicon und App-Icon funktionieren. Ziel: Premium-Look, kein billiges Standardding.
- [ ] **Videos/Ordner Kundenzuordnung:** Jedes Video + jeder Ordner bekommt ein optionales `clientId`-Feld (Kundenzuordnung). Pro Kunde automatisch ein Root-Ordner in der Mediathek. Checkbox "Für Kunde sichtbar" (default: aus) — Admin entscheidet was der Kunde in seinem Login sehen darf. Greift ineinander mit Kundenfilter (Sidebar-Dropdown filtert auch Mediathek) und Benutzerverwaltung (Kunde sieht nur seine freigegebenen Ordner/Videos).
- [ ] **Benutzerverwaltung (Admin):** Admins können neue Benutzer anlegen + verwalten. Features: 1) User-Liste mit Rollen (Admin/Editor/Viewer), 2) Neuen User erstellen (Name, Email, Passwort, Rolle), 3) Rollen-System: Admin (alles), Editor (Inhalte bearbeiten, keine User-Verwaltung), Viewer (nur lesen), 4) Kundenzuordnung: User kann auf bestimmte Kunden beschränkt werden (z.B. Axel sieht nur Kolbe), 5) User deaktivieren/löschen, 6) Passwort zurücksetzen. Eigene Settings-Unterseite "Team" o.ä.
- [ ] **Multi-Upload + Upload-Queue:** Mehrere Videos gleichzeitig hochladen (auch ganzen Ordner reinziehen). Max 5 parallele Uploads, Rest in Warteschlange. Fortschrittsanzeige pro Video. Seite nicht verlassen während Upload läuft (beforeunload-Warning). Während Upload weiter Videos reinziehen können. Abbrechen einzelner Uploads möglich.
- [ ] **Mediathek Sortierung + Filter:** Sortieren nach: Name, Upload-Datum, Größe, Länge. Filtern nach: Kunde, Status, Dateityp. Toggle Grid/List-View (haben wir evtl. schon).
- [ ] **Generelles Styling-Audit:** Konsistenz überall prüfen, einheitliches Design-System sicherstellen

## Wenn Liste leer ist
→ Projekt komplett analysieren:
1. Security Review (Auth, Input Validation, XSS, CSRF)
2. Funktionalität testen (Upload, Download, Löschen, Hinzufügen, Verschieben, jeder Workflow)
3. Visueller Review (Spacing, Responsive auf Desktop/Phone/Fold, Kontraste, Einheitlichkeit)
4. Design weiterentwickeln (Was kann schöner? Mehr Styling? Mehr Brand?)
5. Edge Cases finden und fixen
6. Performance prüfen
