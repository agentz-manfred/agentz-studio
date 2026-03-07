# AgentZ Studio — TODO

Items werden von oben nach unten abgearbeitet. Erledigtes kommt ins CHANGELOG.md.
Neue Wünsche werden unten angehängt oder an der richtigen Prio-Stelle eingefügt.

## Features

- [ ] **🔴 PRIO 1 — Kanban DnD komplett ersetzen mit Dice UI Kanban:** Unsere jetzige DnD-Implementierung ist auf Mobile verbuggt. KOMPLETTER NEUAUFBAU — alte Kanban-Komponente LÖSCHEN und von Grund auf neu mit `@diceui/kanban` aufsetzen. KEINE Anpassung der bestehenden Version, sondern komplett ersetzen (https://www.diceui.com/docs/components/radix/kanban). Installation: `npx shadcn@latest add @diceui/kanban` ODER manuell `npm install @dnd-kit/core @dnd-kit/modifiers @dnd-kit/sortable @dnd-kit/utilities @radix-ui/react-slot`. Komponente nutzt MouseSensor + TouchSensor + KeyboardSensor, saubere Collision-Detection, `asHandle`-Pattern für Touch vs Scroll. Unsere Status-Pipeline (Idee→Skript→Freigabe→...→Veröffentlicht) als Columns mappen. Demo-Code: siehe https://www.diceui.com/docs/components/radix/kanban. Wichtig: `compose-refs.ts` Utility wird auch gebraucht (lib/compose-refs.ts). TESTEN AUF MOBILE nach Umbau!

- [ ] **Video Upload + Review (Frame.io Style):** Timestamp-Kommentare auf Timeline, Marker, abhaken, antworten, Share-Links
- [ ] **Video ↔ Idee Verknüpfung testen:** Beim Upload optional Idee auswählen. Bidirektionale Navigation prüfen.
- [ ] **Share-Links mit OG-Tags:** Für Videos, korrekte Thumbnail-Preview in WhatsApp etc.
- [ ] **Kalender-View verbessern:** Drehtermine + Veröffentlichungsdaten visuell anzeigen
- [ ] **Kunden-Dashboard verfeinern:** Super einfach für Nicht-Techniker, Tooltips, Hilfetexte, Onboarding


- [ ] **PWA Install prüfen:** Service Worker korrekt registriert? Install-Banner erscheint auf Android? Settings-Seite: "App installieren" Button funktioniert?
- [ ] **Logo-Entwicklung:** Eigenes AgentZ Studio Logo als SVG oder via Bildgenerierung (Nano Banana kann keine Transparenz, evtl. GPT-Modell nutzen). Favicon, App-Icon, Touch-Icon einheitlich gestalten.
- [ ] **Generelles Styling-Audit:** Konsistenz überall prüfen, einheitliches Design-System sicherstellen

## Wenn Liste leer ist
→ Projekt komplett analysieren:
1. Security Review (Auth, Input Validation, XSS, CSRF)
2. Funktionalität testen (Upload, Download, Löschen, Hinzufügen, Verschieben, jeder Workflow)
3. Visueller Review (Spacing, Responsive auf Desktop/Phone/Fold, Kontraste, Einheitlichkeit)
4. Design weiterentwickeln (Was kann schöner? Mehr Styling? Mehr Brand?)
5. Edge Cases finden und fixen
6. Performance prüfen
