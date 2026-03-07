# AgentZ Studio — TODO

Items werden von oben nach unten abgearbeitet. Erledigtes kommt ins CHANGELOG.md.
Neue Wünsche werden unten angehängt oder an der richtigen Prio-Stelle eingefügt.

## Bugs (PRIO!)

- [ ] **Kanban Drag & Drop kaputt:** Mobile: Items lassen sich nicht per Touch verschieben (kurz klicken und langes Drücken funktionieren beide nicht). Desktop: Gegrabte Items sind um hunderte Pixel nach rechts versetzt statt an der Mausposition. Webrecherche machen nach besserer Lösung — jemand hat mit chart.js/einer kostenlosen Library ein perfekt funktionierendes Kanban mit DnD gebaut. Aktuelle dnd-kit Implementation prüfen/ersetzen wenn nötig.

## Features

- [ ] **TipTap WYSIWYG-Editor:** Kundenkontext-Editor von Textarea auf TipTap/ProseMirror upgraden. Notion-Style. Markdown-Paste muss funktionieren (Copy-Paste aus .md → korrekt formatiert). Headings, Listen, Bold, Code. Package: @tiptap/react, @tiptap/starter-kit, @tiptap/extension-placeholder
- [ ] **WYSIWYG überall einsetzen:** Skript-Ausgabe, Ideen-Beschreibungen, Kommentare — überall wo Text angezeigt/editiert wird, den gleichen Editor nutzen. Einheitliches Text-System.
- [ ] **Kategorie-Zuweisung bei Ideen-Erstellung:** Beim Erstellen einer Idee Kategorie auswählen können
- [ ] **KI-Modell-Auswahl (Admin Settings):** OpenRouter API (/api/v1/models) abfragen, suchbares Dropdown mit Modellname + Preise pro Token. Seitenübergreifend speichern. Key: scripts/.openrouter_key
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
