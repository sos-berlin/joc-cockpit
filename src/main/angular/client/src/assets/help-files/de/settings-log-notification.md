# Einstellungen - Protokoll-Benachrichtigungsdienst

Als [Protokoll-Benachrichtigungsdienst](/service-log-notification) ist ein Syslog-Server implementiert, der Warnungen und Fehler von JS7 Produkten wie Controller und Agenten empfängt. Der Dienst kann so konfiguriert werden, dass er Benachrichtigungen z.B. per E-Mail versendet.

Die Benachrichtigungen werden auf der Seite [Überwachung - Systembenachrichtigungen](/monitor-notifications-system) angezeigt.

Die Seite *Einstellungen* ist über das Symbol ![wheel icon](assets/images/wheel.png) in der Menüleiste zugänglich.

Die folgenden Einstellungen werden für den Protokoll-Benachrichtigungsdienst angewendet. Änderungen werden sofort wirksam.

## Einstellungen des Protokoll-Benachrichtigungsdienstes

### Einstellung: *log\_server\_active*, Standard: *false*

Gibt an, dass der Protokoll-Benachrichtigungsdienst mit JOC Cockpit gestartet wird.

### Einstellung: *log\_server\_port*, Standard: *4245*

Legt den UDP-Port fest, an dem der Protokoll-Benachrichtigungsdienst lauscht.

### Einstellung: *log\_server\_max\_messages\_per\_second*, Standard: *1000*

Gibt die maximale Anzahl von Nachrichten pro Sekunde an, die der Protokoll-Benachrichtigungsdienst verarbeitet.

## Referenzen

### Kontext-Hilfe

- [Einstellungen](/settings)
- [Protokoll-Benachrichtigungsdienst](/service-log-notification)
- [Überwachung - Systembenachrichtigungen](/monitor-notifications-system)

### Product Knowledge Base

- [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
