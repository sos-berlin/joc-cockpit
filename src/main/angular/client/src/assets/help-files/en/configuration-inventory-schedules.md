# Configuration - Inventory - Schedules

The *Schedule Panel* offers specifying rules for creating Orders from the [Daily Plan](/daily-plan). For details see [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules).

- Schedules determine the point in time when Orders for Workflow execution will start. They are assigned one or more Workflows and optionally variables that are used by Jobs in the given Workflows.
  - **Start dates** are specified by [Configuration - Inventory - Calendars](/configuration-inventory-calendars) and limit the days for execution of Workflows.
  - **Start times** are specified by Schedules indicating one or more times during a day. They can further limit the days for Workflow execution.
- Schedules create Orders on a daily basis
  - for one-time execution of Workflows. This includes Workflows starting at a number of points in time per day.
  - for cyclic execution of Workflows. This specifies repeated execution of Workflows based on configurable intervals.
- Schedules are applied by the [Daily Plan](/daily-plan) to create Orders for the resulting dates and times.
  - Schedules can be manually applied from the Daily Plan view.
  - Schedules are automatically applied by the [Daily Plan Service](/service-daily-plan).

Schedules are managed from the following panels:

- The [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) on the left side of the window offers navigation by folders holding Schedules. In addition, the panel offers operations on Schedules.
- The *Schedule Panel* on the right side of the window holds details for Schedule configuration.

## Schedule Panel

For a Schedule the following inputs are available:

- **Name** is the unique identifier of a Schedule, see [Object Naming Rules](/object-naming-rules).
- **Title** holds an optional explanation of the Schedule's purpose.
- **Workflow Names** holds the list of Workflows that should be started.
- **Plan Order automatically** specifies that the Schedule will be considered by the [Daily Plan Service](/service-daily-plan).
- **Submit Order to Controller when planned** specifies that Orders will be submitted immediately to a Controller when being planned. Without this option, the Daily Plan Service will submit *planned* Orders based on [Settings - Daily Plan](/settings-daily-plan).

### Order Parameterization

- **Order Name**: An optional name that can be used to filter Orders in a number of views.
- **Tag Name**: Any number of Tags can be specified that will be added to the Order. Order Tags are displayed in a number of views if specified from the [Settings - JOC Cockpit](/settings-joc) page.
- **Ignore Instruction/Job Admission Times**: Jobs can be limited to run on certain days and/or in certain timeslots. This similarly applies to use of the *AdmissionTimes Instruction*. Orders arriving outside of a timeslot have to wait for the next available timeslot. The option forces Jobs and other instructions to start independently from such limitations.

### Order Position

If an Order should not start from the first node in the Workflow, then a position can be specified.

- **Block Position**: For Workflows holding block instructions such as Try/Catch, Lock, Fork/Join the related instruction can be selected.
- **Start Position**: If no *Start Position* is specified, then the Order will start from the first node.
  - If no *Block Position* is specified, then any top-level instruction in the Workflow can be selected from which the Order will start.
  - If a *Block Position* is specified, then the *Start Position* is a same-level node inside the block.
- **End Positions**:
  - If no *Block Position* is specified, then any top-level instruction in the Workflow can be selected before which the Order will terminate.
  - If a *Block Position* is specified, then any same-level node inside the block can be specified before which the Order will terminate.
  - More than one *End Position* can be specified.
- **Priority**:
  - If the Order will meet a Resource Lock instruction in the Workflow that limits parallelism, then its *Priority* determines the position in the queue of *waiting* Orders.
  - *Priorities* are specified from negative, zero and positive integers or from the shortcuts offered. A higher *Priority* has precedence. Shortcuts offer the following values:
    - **Low**: -20000
    - **Below Normal**: -10000
    - **Normal**: 0
    - **Above Normal**: 10000
    - **High**: 20000

### Order Variables

Order Variables are specified if a Workflow declares variables to parameterize execution of Jobs:

- Required variables are declared by a Workflow without default value. They are made available automatically to the Schedule and must be assigned related values.
- Optional variables are declared by a Workflow with a default value. They can be called up using the following links:
  - **Modify Variable** allows selecting specific variables from the list of Workflow Variables. The variables are populated from their default value.
  - **Modify Variables** adds inputs for all Workflow Variables. The variables are populated from their default value.

Assignment of values to variables includes specifying strings and numbers. An empty string can be assigned from two single quotes.

## Run-time

The *Run-time* button offers specifying start times for Orders from a pop-up window. For details see [Configuration - Inventory - Schedules - Run-time](/configuration-inventory-schedules-run-time).

## Operations on Schedules

For available operations see [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

## References

### Context Help

- [Configuration - Inventory - Calendars](/configuration-inventory-calendars)
- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Configuration - Inventory - Schedules - Run-time](/configuration-inventory-schedules-run-time)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Daily Plan Service](/service-daily-plan)
- [Object Naming Rules](/object-naming-rules)
- [Order History](/history-orders)
- [Profile - Preferences](/profile-preferences)
- [Settings - Daily Plan](/settings-daily-plan)
- [Task History](/history-tasks)

### Product Knowledge Base

- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
- [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
- [List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
