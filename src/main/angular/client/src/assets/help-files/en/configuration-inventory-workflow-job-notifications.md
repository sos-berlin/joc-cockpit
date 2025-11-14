# Configuration - Inventory - Workflow - Job Notifications

The *Workflow* panel offers designing Workflows from a sequence of instructions. Users can drag & drop the *Job Instruction* from the *Toolbar* to a position in the Workflow.

The GUI offers a number of tabs for specifying Job details. The fifth tab is offered for *Notifications*.

## Notifications

### Global Notifications

Global Notifications are configured from [Notifications](/notifications) and are applied to all Workflows and Jobs specified with its configuration.

Notifications allow use of different channels:

- Making the Notification available in the [Monitor - Order Notifications](/monitor-notifications-order) view and [Monitor - System Notifications](/monitor-notifications-system) view
- Sending Notifications by e-mail.
- Executing a Shell command. For example, 3rd-party System Monitor tools frequently offer a Command Line Interface that can be parameterized to feed the System Monitor from events about successful or failed Job execution.

### Job related Notifications

Specific Notifications per Job override Global Notifications from the following settings:

- **Mail on** specifies one or more events in which e-mail should be sent
  - *ERROR* triggers the Notification in case of Job failure.
  - *WARNING* triggers the Notification in case of successful Jobs that indicate a warning return code.
  - *SUCCESS* triggers the Notification in case of successful Jobs with or without warnings.
- **Mail To** specifies the list of e-mail recipieints. More than one recipient can be specified by using a comma or semicolon. If no recipient is specified, then no Notification will be sent by e-mail overriding the Global Notification setting.
- **Mail Cc** specifies the list of e-mail recipients that will receive carbon copies. More than one recipient can be specified by using a comma or semicolon.
- **Mail Bcc** specifies the list of e-mail recipients that will receive blind copies. More than one recipient can be specified by using a comma or semicolon.

## References

### Context Help

- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  - [Configuration - Inventory - Workflows - Job Options](/configuration-inventory-workflows-job-options)
  - [Configuration - Inventory - Workflows - Job Properties](/configuration-inventory-workflows-job-properties)
  - [Configuration - Inventory - Workflows - Job Node Properties](/configuration-inventory-workflows-job-node-properties)
  - [Configuration - Inventory - Workflows - Job Tags](/configuration-inventory-workflows-job-tags)
- [Monitor - Order Notifications](/monitor-notifications-order)
- [Monitor - System Notifications](/monitor-notifications-system)
- [Notifications](/notifications)

### Product Knowledge Base

- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
