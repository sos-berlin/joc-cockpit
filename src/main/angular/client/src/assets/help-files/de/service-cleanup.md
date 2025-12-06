# Bereinigungsdienst

Der Bereinigungsdienst bereinigt die [JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database) von veralteten Datensätzen.

Dazu gehören Daten aus den folgenden Quellen:

- [Auftragshistorie](/history-orders)
- [Prozesshistorie](/history-tasks)
- [Dateiübertragungshistorie](/history-file-transfers)
- [Tagesplan](/daily-plan)
- [Prüfprotokoll](/audit-log)

Für jeden im Laufe des Tages ausgeführten Auftrag wird ein Eintrag in der *Prozesshistorie* erstellt, ebenso für die *Auftragshistorie*. Je nach Anzahl der täglich ausgeführten Aufträge kann sich dies zu großen Zahlen summieren.

- Benutzer sollten die geltenden Richtlinien für die Aufbewahrung von Protokollen berücksichtigen, d.h. den Zeitraum, für den die Historie der Auftragsausführung und die Protokolle aufgrund gesetzlicher Bestimmungen und von Compliance-Anforderungen aufbewahrt werden müssen.
- Eine Datenbank kann nicht unbegrenzt wachsen. Mit einem leistungsfähigen DBMS können Sie vielleicht 100 Millionen Datensätze in einer Tabelle *Task Historie* vorhalten. Dies ist jedoch eher nachteilig für die Leistung und möglicherweise nicht erforderlich. Das Bereinigen der Datenbank ist eine sinnvolle Maßnahme für einen reibungslosen Betrieb. Zusätzliche Maßnahmen zur Pflege der Datenbank, wie z.B. die Neuerstellung von Indizes, liegen in der Verantwortung des Benutzers.

Der Bereinigungsdienst wird mit seinen Einstellungen gestartet und kann in der Ansicht *Übersicht* aus dem Rechteck der aktiven JOC Cockpit Instanz mit der Operation *Dienst starten - Bereinigungsdienst* manuell gestartet werden.

<img src="dashboard-run-cleanup-service.png" alt="Run Cleanup Service" width="750" height="280" />

## Einstellungen: Bereinigungsdienst

Einzelheiten zur Konfiguration des Bereinigungsdienstes finden Sie unter [Einstellungen - Bereinigungsdienst](/settings-cleanup).

## Referenzen

### Kontext-Hilfe

- [Auftragshistorie](/history-orders)
- [Dateiübertragungshistorie](/history-file-transfers)
- [Einstellungen - Bereinigungsdienst](/settings-cleanup)
- [Prozesshistorie](/history-tasks)
- [Prüfprotokoll](/audit-log)
- [Tagesplan](/daily-plan)

### Product Knowledge Base

- [JS7 - Cleanup Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Cleanup+Service)
- [JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database)
