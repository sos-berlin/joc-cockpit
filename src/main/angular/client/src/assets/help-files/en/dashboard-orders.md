# Dashboard - Orders

The *Orders* panel provides information about Orders from the following sources:

- Orders added by the [Daily Plan](/daily-plan)
- Orders added on demand by users from the [Workflows](/workflows) view
- Orders added from [File Order Sources](/configuration-inventory-file-order-sources) that watch directories for incoming files

<img src="dashboard-orders.png" alt="Orders" width="330" height="140" />

## Order States

The *Orders* panel provides information about the current state of Orders. The panel is updated when Orders' state changes.

- **Pending** Orders have been added to Workflows without specifying a start time, they can later on be assigned a start time.
- **Scheduled** Orders have been added to Workflows and are scheduled for execution at a later date and time.
- **In Progress** Orders are processed by Workflow Instructions but are not running a Job. 
- **Running** Orders are in execution of a Job. 
- **Suspended** Orders have been halted by user intervention and can be resumed.
- **Completed** Orders did finish a Workflow but have not been removed, for example if a File Order Source is used for file watching and the Workflow would not (re)move incoming files. In this situation the Order will remain in place as long as the file exists in the incoming directory.
- **Prompting** Orders are put on hold by the *Prompt Instruction* in a Workflow and require user confirmation to continue execution of the Workflow.
- **Waiting** Orders wait for a resource such as a *Resource Lock*, *Notice*, *Retry* or *Cycle* interval or for a process should the Agent in use specify a process limit that is exceeded.
- **Blocked** Orders cannot start, for example if the Agent is not reachable since the Order was added.
- **Failed** Orders indicate that a Job failed or that a *Fail Instruction* prevents the Order from proceeding. 

Clicking the indicated number of Orders navigates to the [Orders Overview](/orders-overview) that displays Orders in detail.

## Filters

The drop-down button in the upper-right corner of the panel offers selecting Orders from a date range:

- **All** displays all Orders available with the Controller and the Agents.
- **Today** Orders are related to the current day which is calculated from the time zone in the user's [Profile - Preferences](/profile-preferences).
  - **Pending** Orders without start time,
  - **Scheduled** Orders holding a start time for the current day,
  - **In Progress** Orders from any past date,
  - **Running** Orders from any past date,
  - **Suspended** Orders from any past date,
  - **Completed** Orders from any past date,
  - **Prompting** Orders from any past date,
  - **Waiting** Orders from any past date,
  - **Blocked** Orders from any past date,
  - **Failed** Orders from any past date.
- **Next Hour** includes Orders *Scheduled* for the next hour.
- **Next 12 Hours** includes Orders *Scheduled* for the next 12 hours.
- **Next 24 Hours** includes Orders *Scheduled* for the next 24 hours.
- **Next Day** includes Orders *Scheduled* until end of the next day.
- **Next 7 Days** includes Orders *Scheduled* until end of the next 7 days.

## References

### Context Help

- [Daily Plan](/daily-plan)
- [File Order Sources](/configuration-inventory-file-order-sources)
- [Orders Overview](/orders-overview)
- [Profile - Preferences](/profile-preferences)
- [Workflows](/workflows)

### Product Knowledge Base

- [JS7 - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Orders)
- [JS7 - Order State Transitions](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+State+Transitions)
