# AgentZ Studio — TODO

Items werden von oben nach unten abgearbeitet. Erledigtes kommt ins CHANGELOG.md.

## Features

- [ ] **🔴🔴🔴 ABSOLUT PRIO 1 — Kanban DnD auf Mobile TESTEN!** Der Nacht-Sprint behauptet Kanban sei neu gebaut (Run 1, Dice UI Primitives, `asHandle asChild`). Timo hat gestern getestet und es ging NICHT. Muss auf Mobile verifiziert werden — wenn es immer noch nicht geht: KOMPLETTER Fresh Start nach `DICE-UI-KANBAN-REFERENCE.md`. Alte Dateien löschen, Code 1:1 aus der Referenz kopieren. Das Ergebnis MUSS visuell anders aussehen!
- [ ] **Kunden-Avatar Fix:** Aktuell ändert sich die Avatar-Farbe je nach Status — das ist falsch. Stattdessen: 1) Bei Kundenerstellung + Bearbeitung: Farbwähler (Hex-Code + visueller Color Picker) für die Avatar-Farbe, 2) Optional: Foto hochladen für den Kunden (auf 200x200px komprimieren, JPEG 70% Qualität, in Convex File Storage speichern), 3) Wenn Foto vorhanden → Foto als Avatar anzeigen, sonst → Initialen mit gewählter Farbe, 4) Diese Farbe/Foto überall konsistent verwenden (Kanban-Karten, Ideen-Liste, Dashboard, etc.) — NICHT vom Status abhängig!
- [ ] **Team-Seite: Rolle "Kunde" entfernen!** Kunden sind NICHT Teil des Teams. In der Team-Verwaltung dürfen nur interne Rollen erstellt werden (Admin, Editor, Betrachter). Kunden werden ausschließlich über die Kunden-Seite angelegt (Einladungslink / manuelle Registrierung). "Kunde" als Rollen-Option aus dem "Neuer Benutzer"-Dialog auf der Team-Seite entfernen. Kunden auch nicht in der Team-Liste anzeigen.
- [ ] **Versionsnummer aktualisieren:** In `src/pages/SettingsPage.tsx` steht hardcoded `"2.0.0"`. Muss dynamisch aus `package.json` kommen (import oder Vite define). Aktuell sind wir bei v2.11. Auch `package.json` version-Feld updaten.
- [ ] **KI-Skript Output prüfen:** Nacht-Sprint sagt "already implemented" (HTML output, preamble stripping). VERIFIZIEREN: Skript generieren und schauen ob Gelaber weg ist + HTML korrekt gerendert wird.
- [ ] **Termine bearbeitbar machen:** Überall anklickbar + editierbar (auch Dashboard). Detail-Modal: Titel, Datum/Uhrzeit, Notizen, Ort ändern. Optional: Ideen/Skripte verknüpfen. Löschen.
- [ ] **Generelles Styling-Audit:** Konsistenz überall prüfen. Sieht es wie ein eigenes Produkt aus oder wie ein shadcn-Template?

## Vom Nacht-Sprint als erledigt markiert (VERIFIZIEREN!):
- [x] Email SMTP ✅ (Sub-Agent hat auf nodemailer umgebaut + getestet)
- [x] Kundenfilter (Sidebar-Dropdown) — behauptet implementiert (Run 1)
- [x] KI-Prompts konfigurierbar — behauptet implementiert (Run 1)
- [x] App-Icon neu — behauptet erstellt (Run 1)
- [x] Videos/Ordner Kundenzuordnung — behauptet implementiert (Run 2)
- [x] Benutzerverwaltung — behauptet implementiert (Run 2)
- [x] Multi-Upload + Queue — behauptet implementiert (Run 2)
- [x] Mediathek Sortierung/Filter — behauptet implementiert (Run 1+2)
- [x] Kalender-View — behauptet verbessert (Run 2)
- [x] PWA Install — behauptet geprüft (Run 2)
- [x] Security Audit — Auth auf alle Queries (Run 3-9)

## Wenn Liste leer ist
→ Projekt komplett analysieren + visuell testen
