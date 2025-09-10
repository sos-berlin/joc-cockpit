# Settings - Kiosk

JOC Cockpit can be operated in [JS7 - Kiosk Mode](https://kb.sos-berlin.com/display/JS7/JS7+-+Kiosk+Mode) which includes

- unattended operation,
- display of a number of pages each for a predefined period,
- updating pages when new events arrive such as completion of jobs.

## Kiosk Settings

### Setting: *kiosk_role*, Default: *kiosk*

Specifies the name of the role that is assigned an account used for operation in kiosk mode:

- The role must be created by the user.
- The role should include read permissions only.
- The role is the only one assigned the account.

### Setting: *view_dashboard_duration*, Default: *20*

Specifies the duration in seconds for which the Dashboard will be displayed.

Users are free to modify the dashboard layout for the account used for kiosk mode.

- A value 0 specifies that the view will not be displayed.
- A value >10 specifies the desired duration.

### Setting: *view_monitor_order_notification_duration*, Default: *15*

Specifies the duration in seconds for which the [Monitor - Order Notifications](/monitor-order-notifications) view will be displayed.

- A value 0 specifies that the view will not be displayed.
- A value >10 specifies the desired duration.

### Setting: *view_monitor_system_notification_duration*, Default: *15*

Specifies the duration in seconds for which the [Monitor - System Notifications](/monitor-system-notifications) view will be displayed.

- A value 0 specifies that the view will not be displayed.
- A value >10 specifies the desired duration.

### Setting: *view_history_tasks_duration*, Default: *30*

Specifies the duration in seconds for which the [Task History](/history-tasks) view will be displayed.

- A value 0 specifies that the view will not be displayed.
- A value >10 specifies the desired duration.

### Setting: *view_history_orders_duration*, Default: *0*

Specifies the duration in seconds for which the [Order History](/history-orders) view will be displayed.

A value 0 specifies that the view will not be displayed.
A value >10 specifies the desired duration.

## References

- [Monitor - Order Notifications](/monitor-order-notifications)
- [Monitor - System Notifications](/monitor-system-notifications)
- [Order History](/history-orders)
- [Task History](/history-tasks)
- [Settings](/settings)
- [JS7 - Kiosk Mode](https://kb.sos-berlin.com/display/JS7/JS7+-+Kiosk+Mode)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
