# AgentZ Studio — TODO

Items werden von oben nach unten abgearbeitet. Erledigtes kommt ins CHANGELOG.md.
Neue Wünsche werden unten angehängt oder an der richtigen Prio-Stelle eingefügt.

## Security: Backend Data Isolation (KRITISCH)
- Alle Convex Queries/Mutations brauchen `token`-Parameter + Auth-Check
- Client-User dürfen NUR eigene Daten sehen (ideas, videos, shootDates, comments für eigene Ideen)
- Admin/Editor sehen alles, Viewer nur lesen, Client nur eigene
- Betrifft: ideas.ts, videos.ts, clients.ts, folders.ts, shootDates.ts, comments.ts, scripts.ts, categories.ts, notifications.ts
- Approach: `authenticate(ctx, token)` in jeder Query, dann Role-based filtering

## Security: Notifications Create absichern
- `notifications.create` ist offen — sollte nur intern (von anderen Mutations) aufrufbar sein
- → `internalMutation` statt `mutation` verwenden

## Wenn Liste leer ist
→ Projekt komplett analysieren:
1. Security Review (Auth, Input Validation, XSS, CSRF)
2. Funktionalität testen (Upload, Download, Löschen, Hinzufügen, Verschieben, jeder Workflow)
3. Visueller Review (Spacing, Responsive auf Desktop/Phone/Fold, Kontraste, Einheitlichkeit)
4. Design weiterentwickeln (Was kann schöner? Mehr Styling? Mehr Brand?)
5. Edge Cases finden und fixen
6. Performance prüfen
