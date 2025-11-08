# Monitor - Order Notifications

The view displays Notifications raised from Workflows.

Notifications are configured from the [Configuration - Notification](/configuration-notification) page and can be raised in case of success, warnings or errors of Order execution or Job execution.

- The *notify_on_failure_gui* fragment specifies if Notifications become visible in this view.
- In addition to displaying Notifications in this view, they can be forwarded by mail and from the command line, for example to 3rd-party System Monitor products. For details see [Configuration - Notification ](/configuration-notification).

Users should be aware that Notifications are subject to purge by the [Cleanup Service](/service-cleanup). By default, Notifications are purged if older than one day.

## Display of Notifications

Notifications are displayed from the following information items:

- **Workflow** specifies the name of a Workflow. 
  - Clicking the Workflow name navigates to the [Workflows](/workflows) view.
  - Clicking the pencil icon left to the Workflow name navigates to the [Configuration - Inventory - Workflows](/configuration-inventory-workflows) view.
- **Order ID** specifies the unique identifier of an Order.
- **Job** is indicated if the warning or error was caused by a Job.
- **Type** is one of
  - **SUCCESS** which indicates successful Order execution, provided that Notifications are configured to report this status.
  - **WARNING** which is raised from Shell Jobs for which specific return codes that are configured being *Warnings* that will not affect an Order's flow but will raise the related Notification.
  - **ERROR** which can be raised by Jobs or other Workflow Instructions. The Notification is triggered independently from the fact that a Workflow might apply error handling as from the *Try/Catch* or *Retry Instruction* that will allow an Order to proceed in the Workflow.
  - **RECOVERED** which indicates that a previously *failed* Order did recover and did successfully proceed in the Workflow.
- **Return Code** indicates the exit code of Shell Jobs or the return code of JVM Jobs that raised the Notification.
- **Message** holds the error message or warning.
- **Created** indicates the date the Notification was raised.

A warning or error can raise a number of Notifications depending on the related configuration, for example displaying the Notification with this view and forwarding the Notification by mail. 

For each channel configured for the Notification a separate entry is displayed. Entries for Notifications by mail or from the command line offer an *arrow down* icon that shows details about successful/unsuccessful use of the related channel.

## Operations on Notifications

For each warning and error Notification the 3-dots action menu is offered for the following operation:

- **Acknowledge** specifies that the user is aware of the Notification and is taking measures. The operation brings forward a pop-up window that allows specifying a comment about the handling of the Notification. <br/><br/>Acknowledged Notifications by default are excluded from display. They can be made visible by selecting the *Acknowledged* filter button.

## Filters

The top of the page offers a number of filter buttons that can be applied individually or in combination:

- **Successful** limits the display to Notifications about successful Order execution.
- **Failed** limits the display of Notifications to Orders that *failed*.
- **Warning** limits the display of Notifications to Orders that caused warnings.
- **Recovered** limits the display of Notifications to Orders that first failed and then recovered by successfully proceeding in the Workflow.
- **Acknowledged** limits the display to Notifications that previously have been acknowledged from the related operation.

## References

### Context Help

- [Cleanup Service](/service-cleanup)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Configuration - Notification](/configuration-notification)
- [Monitor - System Notifications](/monitor-notifications-system)
- [Workflows](/workflows)

### Product Knowledge Base

- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
