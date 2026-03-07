# AgentZ Studio — TODO

Items werden von oben nach unten abgearbeitet. Erledigtes kommt ins CHANGELOG.md.
Neue Wünsche werden unten angehängt oder an der richtigen Prio-Stelle eingefügt.

## Features

- [ ] **Kalender-View verbessern:** Drehtermine + Veröffentlichungsdaten visuell anzeigen
- [ ] **PWA Install prüfen:** Service Worker korrekt registriert? Install-Banner erscheint auf Android? Settings-Seite: "App installieren" Button funktioniert?
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
