# AgentZ Studio — TODO

Items werden von oben nach unten abgearbeitet. Erledigtes kommt ins CHANGELOG.md.
Neue Wünsche werden unten angehängt oder an der richtigen Prio-Stelle eingefügt.

## Bugs (PRIO!)

- [ ] **Kanban Touch-DnD kaputt:** Long-Press aktiviert Drag-Modus (Karte geht schräg), ABER Item bewegt sich nicht mit dem Finger — Seite scrollt stattdessen. Fix: Nach Long-Press muss `touch-action: none` gesetzt und native Scroll geblockt werden. Ganze Karte als Drag-Handle (nicht nur Grip-Icon). Kurzer Tap = öffnen, Long-Press = Drag. dnd-kit TouchSensor mit delay:300/tolerance:5 und touchmove preventDefault. Ggf. andere DnD-Library evaluieren.

## Features

- [ ] **KI Ideen-Generierung:** Button "Ideen generieren" pro Kunde. Monat auswählen, Anzahl = Videos/Monat aus Kundenprofil. Kundenkontext + Plattformen werden mitgegeben. NUR Admin sichtbar!
- [ ] **KI Skript-Generierung erweitern:** Kundenkontext automatisch mitgeben bei Generierung
- [ ] **Filesystem/Video-Library:** Ordner erstellen, verschachtelte Ordner, Dateien verschieben (Drag & Drop), umbenennen, Previews. À la Google Drive + Frame.io
- [ ] **Video Upload + Review (Frame.io Style):** Timestamp-Kommentare auf Timeline, Marker, abhaken, antworten, Share-Links
- [ ] **Video ↔ Idee Verknüpfung testen:** Beim Upload optional Idee auswählen. Bidirektionale Navigation prüfen.
- [ ] **Share-Links mit OG-Tags:** Für Videos, korrekte Thumbnail-Preview in WhatsApp etc.
- [ ] **Kalender-View verbessern:** Drehtermine + Veröffentlichungsdaten visuell anzeigen
- [ ] **Kunden-Dashboard verfeinern:** Super einfach für Nicht-Techniker, Tooltips, Hilfetexte, Onboarding
- [ ] **Impressum + Datenschutz + Cookie-Banner:** Texte von agent-z.de übernehmen (Repo: agentzmedia). Impressum = Axel Roller, Ziegenmarkt 6, 19055 Schwerin. Cookie-Popup einbauen. Footer-Links.
- [ ] **Hover-States Desktop:** Alle klickbaren Elemente müssen klar erkennbar sein (cursor pointer, Farbwechsel, Elevation)
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
