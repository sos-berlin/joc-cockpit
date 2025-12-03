# Einstellungen - Protokoll-Benachrichtigungsdienst

Auf [Log Notification Service](/service-log-notification) ist ein Syslog-Server implementiert, der Warnungen und Fehler von JS7-Produkten wie Controllern und Agenten empfängt. Der Dienst kann so konfiguriert werden, dass er Benachrichtigungen z.B. per E-Mail versendet.

Die Benachrichtigungen werden auf der Seite [Monitor - System Notifications](/monitor-notifications-system) angezeigt.

Die Seite *Einstellungen* ist über das Symbol ![wheel icon](assets/images/wheel.png) in der Menüleiste zugänglich.

Die folgenden Einstellungen werden auf den Log-Benachrichtigungsdienst angewendet. Änderungen werden sofort wirksam.

## Einstellungen des Protokoll-Benachrichtigungsdienstes

### Einstellung: *log\_server\_active*, Standard: *false*

Gibt an, dass der Log Notification Service mit JOC Cockpit gestartet wird.

### Einstellung: *log\_server\_port*, Standard: *4245*

Legt den UDP-Port fest, an dem der Log Notification Service lauscht.

### Einstellung: *log\_server\_max\_messages\_per\_second*, Standard: *1000*

Gibt die maximale Anzahl von Nachrichten pro Sekunde an, die der Log Notification Service verarbeitet.

## Referenzen

### Kontext-Hilfe

- [Log Notification Service](/service-log-notification)
- [Monitor - System Notifications](/monitor-notifications-system)
- [Settings](/settings)

### Product Knowledge Base

- [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)

