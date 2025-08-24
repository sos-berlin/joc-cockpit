# Adding Orders

Orders can be added on demand and will be executed independently from the Daily Plan.

### Order Attributes

- **Order Name**: An optional name that can be used to filter orders in a number of views.
- **Tag Name**: Any number of tags can be added that will be displayed and that can be searched for if specified from the Settings page.
- **Ignore Job Admission Times**: Jobs can be limited to run on certain days and/or in certain timeslots. Orders arriving have to wait for the next available timeslot. The option forces jobs to start independently from such limitations.

### Start Time

- **Now**: The order will start immediately.
- **Specific Date**: The order will start at the specified date and time.
- **Relative to Current Time**: The order will start with an offset of hours, minutes, seconds from the current time. Examples:
  - **30s**: 30 seconds later
  - **15m**: 15 minutes later
  - **1h**: 1 hour later
  - **1h 15m 30s** or **01:15:30**: 1 hour, 15 minutes and 30 seconds later
- **No Start Time**: The order will not start but will be available from the *pending* state and can be assigned a start time later on.

### Order Dependenceies

- **Notice Space Key**: If the Workflow holds dependencies based on Notices, then a daily plan date can be specified to which dependencies will be resolved. By default the current day is used.
  - It is possible to specify past dates for wich a plan is not yet closed.
  - It is possible to specify future dates.

### Order Position

A position can be specified if the order should not start from the first node in the Workflow.

- **Block Position**: For Workflows holding block instructions such as Try/Catch, ResourceLock, Fork/Join the related instruction can be selected.
- **Start Position**: If no Start Position is specified, then the order will start from the first node.
  - If no Block Position is specified, then any top-level instruction in the Workflow can be selected from which the order will start.
  - If a Block Position is specified, then the Start Position is a same-level node inside the block.
- **End Positions**
  - If no Block Position is specified, then any top-level instruction in the Workflow can be selected before which the order will terminate.
  - If a Block Position is specified, then any same-level node inside the block can be specified before which the order will terminate.
  - More than one End Position can be specified.
- **Priority**; 
  - If the order will meet a Resource Lock instruction in the wowrkflow that limits parallelism, then its prority determines the position in the queue of waiting orders.
  - Priorities are specified from negative and positive integers or from the shortcuts offered. A higher priority has precedence.

### Order Parameterization

- **Assign Parameterization from Schedule**: If the Workflow is assigned a Schedule, then this can be selected to copy its parameterization such as variables and tags to the current order.
- **Modify Variable**: 
  - If the Workflow specifies variables without default values, then the current order has to specify related values.
  - If the Workflow specifies variables with default values, then the link allows to select a variable for which a new value should be specified.
- **Modify Variables**: Behaves similarly to *Modify Variable* but displays all available variables.

### Additional Orders

- **Add Order**: If more than one order should be added to the same Workflow, then the link will add a set of order parameterizations for the additional order.
- **Add Orders from Schedules**: if the Workflow is assigned one or more Schedules, then for each Schedule a set of order parameterizations will be added.