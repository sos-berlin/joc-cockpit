# Tagesplandienst

 [JS7 - Daily Plan Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan+Service) wird verwendet, um Aufträge für den [Tagesplan](/daily-plan) zu erstellen und an die Controller zu übermitteln. Der Dienst wird im Hintergrund betrieben und arbeitet täglich, um Aufträge für einige Tage im Voraus zu planen und zu übermitteln.

Der Tagesplandienst führt bestehende [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules) aus und erzeugt Aufträge für die angegebenen Startzeiten. Dies gilt sowohl für Zeitpläne, die eine einzige Startzeit für einen Auftrag vorgeben, als auch für Zeitpläne, die zyklische Startzeiten vorgeben. Für jede Startzeit in einem Zyklus wird ein einzelner Auftrag erstellt. In einem weiteren Schritt werden diese Aufträge an die entsprechenden Controller weitergeleitet.

Eine ähnliche Funktionalität steht in der Ansicht *Tagesplan* für die manuelle Verwendung durch Benutzer zur Verfügung. Der Tagesplandienst führt diese Aufgabe jedoch automatisch aus.

Der Tagesplandienst wird auf der Grundlage seiner Einstellungen gestartet und kann in der Übersichtsansicht aus dem Rechteck der aktiven JOC Cockpit Instanzen mit der Operation *Dienst starten - Tagesplandienst* gestartet werden. Es hat keinen negativen Einfluss, den Tagesplandienst mehrmals am Tag zu starten.

<img src="dashboard-run-daily-plan-service.png" alt="Run Daily Plan Service" width="750" height="280" />

## Einstellungen für den Tagesplan Service

Für die Einstellungen des Tagesplandienstes siehe [Einstellungen - Tagesplan](/settings-daily-plan).

## Referenzen

### Kontext-Hilfe

- [Einstellungen - Tagesplan](/settings-daily-plan)
- [Tagesplan](/daily-plan)

### Product Knowledge Base

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - Daily Plan Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan+Service)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
