# Order Sources

Orders can be added from the following sources:

- Orders added by the [Daily Plan](/daily-plan)
- Orders added on demand by users from the [Workflows](/workflows) view
- Orders added from File Order Sources that watch directories for incoming files

States of current Orders are displayed with the *Dashboard* view:

<img src="dashboard-orders.png" alt="Orders" width="330" height="140" />

## Order States

The following *Order States* are available:

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

## References

- [Daily Plan](/daily-plan)
- [Orders Overview](/orders-overview)
- [Workflows](/workflows)
- [JS7 - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Orders)
- [JS7 - Order State Transitions](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+State+Transitions)
