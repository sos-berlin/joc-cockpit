# Log Benachrichtigungsdienst

[JS7 - Log Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Management) wird zusammen mit JOC Cockpit für die Überwachung der Protokollausgabe und den Versand von Benachrichtigungen angeboten, die von Controller-, Agent- und JOC Cockpit-Instanzen erstellt werden.

Die [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service) ist über die aktive JOC Cockpit-Instanz verfügbar:

## Dienst

Der Dienst dient zum Sammeln von Warnungen und Fehlern aus der Protokollausgabe von Controller &amp; Agent Instanzen und zum Erstellen von [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications).

- JOC Cockpit-Benachrichtigungen werden direkt und ohne Verwendung des Dienstes erstellt.
- Der Dienst ist konform mit RFC5424, auch bekannt als Syslog-Protokoll.
- Der Dienst bietet Neustart-Fähigkeiten: Im Falle eines Failover oder einer Umschaltung von JOC Cockpit wird der Log Notification Service von der aktiven JOC Cockpit-Instanz verfügbar gemacht.

## Clients

Die JS7 Controller &amp; Agent Instanzen fungieren als Clients für den Log Notification Service. Die Produkte können so konfiguriert werden, dass sie Warnungen und Fehler aus der Protokollausgabe an den Log Notification Service melden. Details finden Sie unter [JS7 - Log Configuration for use with System Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Configuration+for+use+with+System+Notifications).

Die Benutzer haben die Wahl, die Weiterleitung der Protokollausgabe pro Instanz von Controller &amp; Agent während der Installation oder später durch Anpassung der Log4j2-Konfiguration zu aktivieren.

## Benutzeroberfläche

Das JOC Cockpit bietet Systembenachrichtigungen in der Ansicht [Monitor - System Notifications](/monitor-notifications-system).

Das JOC Cockpit bietet [Notifications- Configuration ](/configuration-notification) für die Weiterleitung von Benachrichtigungen per E-Mail, von Kommandozeilen-Tools usw.

## Einstellungen des Log Benachrichtigungsdienstes

Für die Einstellungen des Log Notification Service siehe [Settings - Log Notification](/settings-log-notification).

## Referenzen

### Kontext-Hilfe

- [Monitor - System Notifications](/monitor-notifications-system)
- [Notification - Configuration ](/configuration-notification)
- [Settings - Log Notification](/settings-log-notification)

### Product Knowledge Base

- [JS7 - Log Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Management)
  - [JS7 - Log Configuration for use with System Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Configuration+for+use+with+System+Notifications)
  - [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)

