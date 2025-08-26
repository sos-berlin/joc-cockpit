# Adding Orders

Orders can be added on demand and will be executed independently from the Daily Plan.

### Order Attributes

- **Order Name**: An optional name that can be used to filter Orders in a number of views.
- **Tag Name**: Any number of tags can be added that will be displayed and that can be searched for if specified from the Settings page.
- **Ignore Job Admission Times**: Jobs can be limited to run on certain days and/or in certain timeslots. Orders arriving have to wait for the next available timeslot. The option forces Jobs to start independently from such limitations.

### Start Time

- **Now**: The Order will start immediately.
- **Specific Date**: The Order will start at the specified date and time.
- **Relative to Current Time**: The Order will start with an offset of hours, minutes, seconds from the current time. Examples:
  - **30s**: 30 seconds later
  - **15m**: 15 minutes later
  - **1h**: 1 hour later
  - **1h 15m 30s** or **01:15:30**: 1 hour, 15 minutes and 30 seconds later
- **No Start Time**: The Order will not start but will be available from the *pending* state and can be assigned a start time later on.

### Order Dependenceies

- **Notice Space Key**: If the Workflow holds dependencies based on Notices, then a daily plan date can be specified to which dependencies will be resolved. By default the current day is used.
  - It is possible to specify past dates for wich a plan is not yet closed.
  - It is possible to specify future dates.

### Order Position

A position can be specified if the Order should not start from the first node in the Workflow.

- **Block Position**: For Workflows holding block instructions such as Try/Catch, ResourceLock, Fork/Join the related instruction can be selected.
- **Start Position**: If no Start Position is specified, then the Order will start from the first node.
  - If no Block Position is specified, then any top-level instruction in the Workflow can be selected from which the Order will start.
  - If a Block Position is specified, then the Start Position is a same-level node inside the block.
- **End Positions**
  - If no Block Position is specified, then any top-level instruction in the Workflow can be selected before which the Order will terminate.
  - If a Block Position is specified, then any same-level node inside the block can be specified before which the Order will terminate.
  - More than one End Position can be specified.
- **Priority**; 
  - If the Order will meet a Resource Lock instruction in the wowrkflow that limits parallelism, then its prority determines the position in the queue of waiting Orders.
  - Priorities are specified from negative, zero and positive integers or from the shortcuts offered. A higher priority has precedence. Shortcuts offer the following priority values:
    - **Low**: -20000
    - **Below Normal**: -10000
    - **Normal**: 0
    - **Above Normal**: 10000
    - **High**: 20000

### Order Parameterization

- **Assign Parameterization from Schedule**: If the Workflow is assigned a Schedule, then this can be selected to copy its parameterization such as variables and tags to the current Order.
- **Modify Variable**: 
  - If the Workflow specifies variables without default values, then the current Order has to specify related values.
  - If the Workflow specifies variables with default values, then the link allows to select a variable for which a new value should be specified.
- **Modify Variables**: Behaves similarly to *Modify Variable* but displays all available variables.

### Additional Orders

- **Add Order**: If more than one Order should be added to the same Workflow, then the link will add a set of Order parameterizations for the additional Order.
- **Add Orders from Schedules**: if the Workflow is assigned one or more Schedules, then for each Schedule an Order parameterized from a Schedule will be added.