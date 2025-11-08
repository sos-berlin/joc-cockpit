# Settings - Kiosk

JOC Cockpit can be operated in [JS7 - Kiosk Mode](https://kb.sos-berlin.com/display/JS7/JS7+-+Kiosk+Mode) which includes

- unattended operation,
- display of a number of pages each for a predefined period,
- updating pages when new events arrive such as completion of jobs.

The *Settings* page is accessible from the ![wheel icon](assets/images/wheel.png) icon in the menu bar.

## Kiosk Settings

### Setting: *kiosk\_role*, Default: *kiosk*

Specifies the name of the role that is assigned an account used for operation in kiosk mode:

- The role must be created by the user.
- The role should include read-only permissions.
- The role is the only one assigned the account.

### Setting: *view\_dashboard\_duration*, Default: *20*

Specifies the duration in seconds for which the Dashboard will be displayed.

Users can modify the dashboard layout for the account used for kiosk mode.

- A value 0 specifies that the view will not be displayed.
- A value >10 specifies the desired duration.

### Setting: *view\_monitor\_order\_notification\_duration*, Default: *15*

Specifies the duration in seconds for which the [Monitor - Order Notifications](/monitor-notifications-order) view will be displayed.

- A value 0 specifies that the view will not be displayed.
- A value >10 specifies the desired duration.

### Setting: *view\_monitor\_system\_notification\_duration*, Default: *15*

Specifies the duration in seconds for which the [Monitor - System Notifications](/monitor-notifications-system) view will be displayed.

- A value 0 specifies that the view will not be displayed.
- A value >10 specifies the desired duration.

### Setting: *view\_history\_tasks\_duration*, Default: *30*

Specifies the duration in seconds for which the [Task History](/history-tasks) view will be displayed.

- A value 0 specifies that the view will not be displayed.
- A value >10 specifies the desired duration.

### Setting: *view\_history\_orders\_duration*, Default: *0*

Specifies the duration in seconds for which the [Order History](/history-orders) view will be displayed.

A value 0 specifies that the view will not be displayed.
A value >10 specifies the desired duration.

## References

### Context Help

- [Monitor - Order Notifications](/monitor-notifications-order)
- [Monitor - System Notifications](/monitor-notifications-system)
- [Order History](/history-orders)
- [Task History](/history-tasks)
- [Settings](/settings)

### Product Knowledge Base

- [JS7 - Kiosk Mode](https://kb.sos-berlin.com/display/JS7/JS7+-+Kiosk+Mode)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
