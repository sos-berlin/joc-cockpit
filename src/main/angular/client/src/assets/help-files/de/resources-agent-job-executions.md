# Agent Job Executions

Die Ansicht *Agent Job Executions* fasst die Auftragsausführungen für Agenten in einem bestimmten Zeitraum zusammen.

Agenten gibt es in den folgenden Varianten:

- **Standalone-Agenten** führen Aufträge auf entfernten Rechnern vor Ort und in Containern aus. Sie werden einzeln betrieben und vom Controller verwaltet.
- **Agenten-Cluster**
  - **Direktor-Agenten** orchestrieren *Subagenten* in einem Agenten-Cluster. Außerdem können sie zur Ausführung von Jobs verwendet werden.
  - **Unteragenten** führen Jobs auf entfernten Rechnern vor Ort und in Containern aus. Sie können als Arbeitsknoten in einem Agent Cluster betrachtet werden und werden von *Director Agents* verwaltet.

*Agent Job Executions Panel

Die folgenden Informationen werden angezeigt:

- **Agentenname** ist der eindeutige Name eines Agenten.
- **URL** ist die URL, über die der Agent vom Controller aus erreicht werden kann.
- **Anzahl der erfolgreich ausgeführten Aufgaben** ist das, was der Titel vermuten lässt.
- **Anzahl der ausgeführten Aufgaben** umfasst erfolgreiche und fehlgeschlagene Auftragsausführungen.

## Exportieren von Agent-Auftragsausführungen

Benutzer können die angezeigten Zusammenfassungsinformationen in eine Excel-Datei im .xlsx-Format exportieren. Die aktiven Filter und die Sortierreihenfolge werden beim Export angewendet.

## Filter

Benutzer können die oben im Fenster verfügbaren Filter anwenden, um die Zusammenfassung der Auftragsausführungen einzuschränken:

- die Filterschaltflächen **Datumsbereich** ermöglichen die Auswahl des Datumsbereichs für die Zusammenfassung der Auftragsausführungen.
- das Kontrollkästchen **Aktueller Controller** schränkt die Ausführung von Aufträgen auf Agenten ein, die bei dem aktuell ausgewählten Controller registriert sind.

## Erweiterter Filter

Der *Erweiterte Filter* bietet Filterkriterien für einen größeren Datumsbereich, für bestimmte Agent-Instanzen und Controller-Instanzen.

Der *Erweiterte Filter* ermöglicht den Export von Daten in Abhängigkeit von den angegebenen Kriterien.

## Referenzen

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)

