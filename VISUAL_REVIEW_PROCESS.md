# Visueller Review-Prozess (PFLICHT nach jeder Phase!)

## Ablauf
Nach JEDER Design-Aenderung musst du visuell pruefen:

1. **Dev-Server starten** (falls nicht laeuft):
   ```
   cd /Users/manfredbellmann/.openclaw/workspace/agentz-studio
   npx vite --port 5180 &
   sleep 5
   ```

2. **Screenshots machen** mit dem Browser-Tool:
   - Oeffne http://localhost:5180 im Browser (profile=openclaw)
   - Mache Screenshots von allen geaenderten Seiten/Komponenten
   - Bei Modals/Popups: Klicke auf die Trigger und mache Screenshots im geoeffneten Zustand

3. **Screenshots analysieren**:
   - Vergleiche mit dem Ziel aus REDESIGN_BRIEF.md
   - Pruefe: Sind ALLE Elemente einheitlich?
   - Pruefe: Stimmen Farben, Shadows, Spacing, Typography?
   - Pruefe: Gibt es noch Reste vom alten Design?
   - Pruefe: Kommen Styles eventuell aus anderen Dateien die du nicht geaendert hast?

4. **Iterieren**: Wenn etwas nicht stimmt:
   - Fix den Fehler
   - Mache erneut einen Screenshot
   - Vergleiche wieder
   - Repeat bis es passt

5. **Dev-Server stoppen**: `kill %1` oder `pkill -f "vite.*5180"`

## Checkliste pro Seite
- [ ] Background-Farbe korrekt (#0A0A0A / #111111)?
- [ ] Text-Farbe korrekt (#FAFAFA)?
- [ ] Buttons im Brand-Stil (Green #00DC82)?
- [ ] Shadows einheitlich (brutal shadow)?
- [ ] Abstände/Spacing konsistent?
- [ ] Font korrekt (Space Grotesk Headlines, Poppins Body)?
- [ ] Hover/Focus States vorhanden und einheitlich?
- [ ] Keine alten Styles die durchscheinen?
- [ ] Mobile-Ansicht OK?

## Wichtig
- Nicht nur die Hauptseite pruefen, auch Sub-Elemente (Dropdowns, Tooltips, etc.)
- Modals MUESSEN geoeffnet und geprüeft werden
- Wenn ein Element aus einer Shared-Komponente kommt, die Komponente fixen (nicht nur inline-Styles)
