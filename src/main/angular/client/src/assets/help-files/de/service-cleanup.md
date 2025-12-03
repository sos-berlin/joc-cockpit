# Aufräumdienst

Der Bereinigungsdienst bereinigt die [JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database) von veralteten Datensätzen.

Dazu gehören Daten aus den folgenden Quellen:

- [Auftragshistorie](/history-orders)
- [Prozesshistorie](/history-tasks)
- [File Transfer History](/history-file-transfers)
- [Daily Plan](/daily-plan)
- [Audit Log](/audit-log)

Für jeden im Laufe des Tages ausgeführten Auftrag wird ein Eintrag in der *Aufgaben Historie* erstellt, ebenso für die *Auftrag Historie*. Je nach Anzahl der täglich ausgeführten Aufträge kann sich dies zu großen Zahlen summieren.

- Benutzer sollten die geltenden Richtlinien für die Aufbewahrung von Protokollen berücksichtigen, d.h. den Zeitraum, für den die Historie der Auftragsausführung und die Protokolle aufgrund gesetzlicher Bestimmungen und von Compliance-Anforderungen aufbewahrt werden müssen.
- Eine Datenbank kann nicht unbegrenzt wachsen. Mit einem leistungsfähigen DBMS können Sie vielleicht 100 Millionen Datensätze in einer Tabelle *Task Historie* haben. Dies ist jedoch eher nachteilig für die Leistung und möglicherweise nicht erforderlich. Das Bereinigen der Datenbank ist eine sinnvolle Maßnahme für einen reibungslosen Betrieb. Zusätzliche Maßnahmen zur Pflege der Datenbank, wie z.B. die Neuerstellung von Indizes, liegen in der Verantwortung des Benutzers.

Der Cleanup Service wird auf der Grundlage seiner Einstellungen gestartet und kann in der Dashboard-Ansicht aus dem Rechteck der aktiven JOC Cockpit-Instanzen mit der Operation *Run Service - Cleanup Service* gestartet werden.

<img src="dashboard-run-cleanup-service.png" alt="Run Cleanup Service" width="750" height="280" />

## Cleanup Service Einstellungen

Einzelheiten zur Konfiguration des Aufräumdienstes finden Sie unter [Settings - Cleanup](/settings-cleanup).

## Referenzen

### Kontext-Hilfe

- [Audit Log](/audit-log)
- [Daily Plan](/daily-plan)
- [File Transfer History](/history-file-transfers)
- [Auftragshistorie](/history-orders)
- [Prozesshistorie](/history-tasks)
- [Settings - Cleanup](/settings-cleanup)

### Product Knowledge Base

- [JS7 - Cleanup Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Cleanup+Service)
- [JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database)

