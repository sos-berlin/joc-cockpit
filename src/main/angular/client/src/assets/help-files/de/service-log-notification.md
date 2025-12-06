# Protokoll-Benachrichtigungsdienst

[JS7 - Log Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Management) wird zusammen mit JOC Cockpit für die Überwachung der Protokollausgaben und den Versand von Benachrichtigungen angeboten, die von Controller, Agenten und JOC Cockpit Instanzen erstellt werden.

Der [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service) ist über die aktive JOC Cockpit Instanz verfügbar:

## Benachrichtigungsdienst

Der Dienst dient zum Sammeln von Warnungen und Fehlern aus den Protokollausgaben von Controller und Agenten Instanzen und zum Erstellen von [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications).

- Lokale JOC Cockpit Benachrichtigungen werden direkt und ohne Verwendung des Dienstes erstellt.
- Der Dienst ist konform mit RFC5424, auch bekannt als Syslog-Protokoll.
- Der Dienst bietet Neustart-Fähigkeiten: Im Falle einer aktivierten Ausfallsicherung oder einer Umschaltung von JOC Cockpit wird der Protokoll-Benachrichtigungsdienst von der aktiven JOC Cockpit Instanz verfügbar gemacht.

## Clients

Die JS7 Controller und Agenten Instanzen fungieren als Clients für den Protokoll-Benachrichtigungsdienst. Die Produkte können so konfiguriert werden, dass sie Warnungen und Fehler aus den Protokollausgaben an den Protokoll-Benachrichtigungsdienst melden. Details finden Sie unter [JS7 - Log Configuration for use with System Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Configuration+for+use+with+System+Notifications).

Die Benutzer haben die Wahl, die Weiterleitung der Protokollausgaben pro Instanz von Controller und Agenten während der Installation oder später durch Anpassung der Log4j2-Konfiguration zu aktivieren.

## Benutzeroberfläche

Das JOC Cockpit bietet Systembenachrichtigungen in der Ansicht [Überwachung - Systembenachrichtigungen](/monitor-notifications-system).

Das JOC Cockpit bietet [Benachrichtigungskonfiguration](/configuration-notification) für die Weiterleitung von Benachrichtigungen per E-Mail, von Kommandozeilen-Tools usw.

## Einstellungen des Protokoll-Benachrichtigungsdienstes

Für die Einstellungen des Protkoll-Benachrichtigungsdienstes siehe [Einstellungen - Protkoll-Benachrichtigung](/settings-log-notification).

## Referenzen

### Kontext-Hilfe

- [Benachrichtigungskonfiguration](/configuration-notification)
- [Einstellungen - Protkoll-Benachrichtigung](/settings-log-notification)
- [Überwachung - Systembenachrichtigungen](/monitor-notifications-system)

### Product Knowledge Base

- [JS7 - Log Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Management)
  - [JS7 - Log Configuration for use with System Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Configuration+for+use+with+System+Notifications)
  - [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
