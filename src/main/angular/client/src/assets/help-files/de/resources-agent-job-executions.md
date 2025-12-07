# Agent Job-Ausführungen

Die Ansicht *Agent Job-Ausführungen* fasst die Job-Ausführungen von Agenten in einem bestimmten Zeitraum zusammen.

Agenten gibt es in den folgenden Varianten:

- **Standalone Agents** führen Aufträge auf entfernten Rechnern vor Ort und in Containern aus. Sie werden einzeln betrieben und vom Controller verwaltet.
- **Agent Cluster**
  - **Director Agents** orchestrieren *Subagenten* in einem Agent Cluster. Außerdem können sie zur Ausführung von Jobs verwendet werden.
  - **Subagents** führen Jobs auf entfernten Rechnern und in Containern aus. Sie können als Arbeitsknoten in einem Agent Cluster betrachtet werden und werden von *Director Agents* verwaltet.

## Bereich: Agent Job-Ausführungen

Die folgenden Informationen werden angezeigt:

- **Agentenname** ist der eindeutige Name eines Agenten.
- **URL** ist die URL, über die der Agent vom Controller aus erreicht werden kann.
- **Anzahl der erfolgreich ausgeführten Jobs** ist das, was der Titel vermuten lässt.
- **Anzahl der ausgeführten Jobs** umfasst erfolgreiche und fehlgeschlagene Auftragsausführungen.

## Exportieren von Agent Job-Aausführungen

Benutzer können die angezeigten Informationen in eine Excel-Datei im .xlsx-Format exportieren. Die aktiven Filter und die Sortierreihenfolge werden beim Export angewendet.

## Filter

Benutzer können die oben im Fenster verfügbaren Filter anwenden, um die Zusammenfassung der Job-Ausführungen einzuschränken:

- die Filterschaltflächen **Datumsbereich** ermöglichen die Auswahl des Datumsbereichs für die Zusammenfassung der Job-Ausführungen.
- das Kontrollkästchen **Aktueller Controller** schränkt die Ausführung von Jobs auf Agenten ein, die bei dem aktuell ausgewählten Controller registriert sind.

## Erweiterter Filter

Der *Erweiterte Filter* bietet Filterkriterien für einen größeren Datumsbereich, für bestimmte Agenten und Controller Instanzen.

Der *Erweiterte Filter* ermöglicht den Export von Daten in Abhängigkeit von den angegebenen Kriterien.

## Referenzen

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)

