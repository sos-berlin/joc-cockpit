# Monitor - System Notifications

The view displays Notifications raised from JS7 products.

System Notifications require setting up the the *Log Notification Service* from the [Settings](/settings) page section [Settings - Log Notification](/settings-log-notification). If configured, the JOC Cockpit acts as a syslog service that receives warnings and errors from Controllers and Agents registered with JOC Cockpit.

Users should be aware that Notifications are subject to purge by the [Cleanup Service](/service-cleanup). By default, Notifications are visible for the current day.

## Display of Notifications

Notifications are displayed from the following information items:

- **JOC Cockpit ID** specifies the unique identifier of the JOC Cockpit instance. 
  - **Prefix** typicall is *joc* for a JOC Cockpit instance that offers GUI access.
  - **Serial No.** the number assigned the JOC Cockpit instance during installation.
- **Category** indicates the JS7 product that raised the Notification which is one of *JOC*, *CONTROLLER*, *AGENT*.
- **Source** specifies the 
  - **LogNotification** indicates that the message was received from the syslog interface.
  - **Deployment** indicates a deployment operation in the current JOC Cockpit instance.
- **Notifier** is one of
  - **<*Controller-ID*>** indicates the unique identifier of a Controller if the CONTROLLER *Category* is specified.
  - **<*Agent-Name*>(<*Director-Agent*>)** indicates the Agent name if the AGENT *Category* is specified.
  - **<*Java-class*>** indicates the name of the Java class that did raise the notification.
- **Type** is one of
  - **WARNING** which indicates a warning in the JS7 product's log.
  - **ERROR** which indicates an error in the JS7 product's log.
- **Message** holds the error message or warning.
- **Exception** indicates the exception that raised the Notification.
- **Created** indicates the date the Notification was raised.

A warning or error can raise a number of Notifications depending on the related configuration, for example displaying the Notification with this view and forwarding the Notification by mail. 

For each channel configured for the Notification a separate entry is displayed. Entries for Notifications by mail or from the command line offer an *arrow down* icon that shows details about successful/unsuccessful use of the related channel.

## Operations on Notifications

For each warning and error Notification the 3-dots action menu is offered with the following operation:

- **Acknowledge** specifies that the user is aware of the Notification and is taking measures. The operation brings forward a pop-up window that allows specifying a comment about the handling of the Notification. <br/><br/>Acknowledged Notifications by default are excluded from display. They can be made visible by selecting the *Acknowledged* filter button.

## Filters

The top of the page offers a number of filter buttons that can be applied individually or in combination.

The following buttons filter the source of Notifications:

- **All** displays Notifications from all JS7 products.
- **System**
- **JOC** limits display of Notifications to Orders that *failed*.
- **Controller** limits display of Notifications to Orders that caused warnings.
- **Agent** limits display of Notifications to Orders that first failed and then recovered by successfully proceeding in the Workflow.

The following buttons filter the type of Notifications:

- **Error** specifies that Notifications of *Type* ERROR should be displayed.
- **Warning** specifies that Notifications of *Type* WARNING should be displayed.
- **Acknowledged** limits display to Notifications that previously have been acknowledged from the related operation.

## References

### Context Help

- [Cleanup Service](/service-cleanup)
- [Settings](/settings)
- [Settings - Log Notification](/settings-log-notification)
- [Monitor - System Notifications - Agent](/monitor-notifications-system)
- [Workflows](/workflows)

### Product Knowledge Base

- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
