# Log Notification Service

[JS7 - Log Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Management) is offered with JOC Cockpit for monitoring of log output and dispatch of notifications created by Controller, Agent & JOC Cockpit instances.

The [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service) is available from the active JOC Cockpit instance:

## Service

The service is used to collect warnings and errors from log output of Controller & Agent instances and to create [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications).

- JOC Cockpit notifications are created directly and without use of the service.
- The service is compliant to RFC5424, aka syslog protocol.
- The service offers restart capabilities: in case of fail-over or switch-over of JOC Cockpit the Log Notification Service will become available from the active JOC Cockpit instance.

## Clients

The JS7 Controller & Agent instances act as clients to the Log Notification Service. The products can be configured to report warnings and errors from log output to the Log Notification Service, for details see [JS7 - Log Configuration for use with System Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Configuration+for+use+with+System+Notifications).

Users have a choice to enable forwarding of log output per instance of Controller & Agent during installation or later on by adjusting the Log4j2 configuration.

## User Interface

The JOC Cockpit offers System Notifications from the [Monitor - System Notifications](/monitor-notifications-system) view.

The JOC Cockpit offers [Notifications- Configuration ](/configuration-notification) for forwarding notifications by e-mail, from command line tools etc.

## Log Notification Service Settings

For settings of the Log Notification Service see [Settings - Log Notification](/settings-log-notification).

## References

### Context Help

- [Monitor - System Notifications](/monitor-notifications-system)
- [Notification - Configuration](/configuration-notification)
- [Settings - Log Notification](/settings-log-notification)

### Product Knowledge Base

- [JS7 - Log Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Management)
  - [JS7 - Log Configuration for use with System Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Configuration+for+use+with+System+Notifications)
  - [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
