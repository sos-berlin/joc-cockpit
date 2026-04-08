# Settings - Log Notification Service

The [Log Notification Service](/service-log-notification) implements a syslog server that receives warnings and errors from JS7 products such as Controllers and Agents. The service can be configured to send notifications, for example, by e-mail.

Notifications are displayed from the [Monitor - System Notifications](/monitor-notifications-system) page.

The *Settings* page is accessible from the ![wheel icon](assets/images/wheel.png) icon in the menu bar.

The following settings are applied to the Log Notification Service. Changes become effective immediately.

## Log Notification Service Settings

### Setting: *log\_server\_active*, Default: *false*

Specifies that the Log Notification Service is started with JOC Cockpit.

### Setting: *log\_server\_port*, Default: *4245*

Specifies the UDP port on which the Log Notification Service will listen.

### Setting: *log\_server\_max\_messages\_per\_second*, Default: *1000*

Specifies the max. number of messages per second that the Log Notification Service will process.

## References

### Context Help

- [Log Notification Service](/service-log-notification)
- [Monitor - System Notifications](/monitor-notifications-system)
- [Settings](/settings)

### Product Knowledge Base

- [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
