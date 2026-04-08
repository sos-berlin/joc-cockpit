# Workflows

The *Workflows* view offers monitoring and control of Workflows.

- Users can identify Orders being processed for specific Workflows.
- Users can add Orders to Workflows on demand. Such Orders are not added to the [Daily Plan](/daily-plan), but are added ad hoc.

## Navigation Panel

The left panel is organized in tabs that allow navigation from folders and filtering by Tags for Workflows and Orders.

- **Folder** navigation offers the chevron-down icon when hovering over a folder name. This will display Workflows from the current folder and from any sub-folders. Use of the chevron-up icon resets the selection to the current folder.
- Tag filtering is offered from the following tabs:
  - **Workflow Tags** are assigned from the [Configuration - Inventory - Workflows](/configuration-inventory-workflows) view.
  - **Order Tags** are assigned from the [Configuration - Inventory - Schedules](/configuration-inventory-schedules) view.

Tags are selected from + and - icons and can be looked up using the Quick Search icon. Display of Tags must be activated from the [Settings - JOC Cockpit](/settings-joc) page.

## Workflow Panel

### Order Summary

The top of the window holds the Order summary similar to [Dashboard - Orders](/dashboard-orders). Users can click the indicated number of Orders for a given state to bring up a pop-up window that will display the list of Orders.

The Order summary is indicated for Orders related to the Workflows displayed for selected folders or Tags.

### Display of Workflows

- **Workflow Name** is the unique name assigned a Workflow.
  - Clicking the *Workflow Name* will bring up the *History* panel in the lower part of the window that displays the recent execution history of the Workflow.
  - Clicking the large arrow-down icon will display all Jobs and Workflow Instructions.
  - Clicking the small arrow-down icon will display top-level Jobs and Workflow Instructions.
  - Clicking the pencil icon navigates to the [Configuration - Inventory - Workflows](/configuration-inventory-workflows) view.
  - Clicking the + icon brings up a pop-up window to [Add Orders](/workflows-orders-add).
- **Tabular View**, **Graphical View** icons are available to display Workflows
  - in tabular format that is focused on concise structure and saves space on the window.
  - in graphical format that is more speaking to a number of users.
- **Deployment Date** indicates the date the Workflow was deployed.
- **Deployment Status** indicates if the Workflow is deployed to the Controller and Agents.
  - **Synchronized** Workflows are deployed and are available with the Controller and Agents.
  - **Not Synchronized** Workflows are not deployed to Controller and Agents but are available from the inventory only.
  - **Suspended** Workflows are frozen, they accept Orders but will not allow Orders starting until Workflows will be resumed.
  - **Outstanding** Workflows wait for confirmation by one or more Agents that the Workflow is suspended or resumed.
- **No. of Orders** indicates the number of Orders assigned the Workflow. 
  - Up to three Orders are displayed directly with the Workflow. They offer an action menu for Order operations.
    - Users can click the indicated Order ID to display the Order's log output from the [Order Log View](/order-log). The log includes output created by any Jobs executed with the Workflow.
  - Clicking the *No. of Orders* brings up a pop-up window that displays all related Orders and that offers operations on individual Orders and bulk operations on selected Orders.

### Display of Jobs and Workflow Instructions

When a Workflow is expanded using the arrow-down icon available for a Workflow, then its Jobs and Workflow Instructions will be displayed.

## History Panel

The panel is displayed at the lower part of the window when users click the name of the Workflow or add an Order.

### Order History

- **Order ID** is the unique identifier assigned an Order. Clicking the arrow-down icon will display the Order variables and the Jobs passed by the Order. 
- **Label** indicates the latest position of an Order in the Workflow. Users can assign *Labels* to Workflow Instructions that will be displayed and otherwise the technical position will be indicated.
- **History Status** indicates the latest outcome in the Order's life.
  - If Orders are completed, then the *History Status* will be *successful* or *failed*.
  - If Orders are not completed, the *History Status* will be *in progress*.
- **Order State** indicates the Order's latest state, see [Order States](/order-states).
  - If Orders are completed, then the *Order State* will be *successful* or *failed*.
  - If Orders are not completed, the *Order State* will be *processing*.

For access to log output the following options are available:

- **Order ID**: clicking the *Order ID* will display the Order's log output from the [Order Log View](/order-log). The log includes output created by all Jobs executed with the Workflow.
- **Download Icon**: clicking the icon will download the Order's log to a file.

By default display of Order logs is limited to 10 MB log size and otherwise logs are downloaded to files. Users can adjust the limit from the [Settings - JOC Cockpit](/settings-joc) page.

### Task History

- **Job** indicates the name of the Job.
- **Label** indicates the position of the Job in the Workflow.
- **Status** is the outcome of Job execution indicated by *in progress*, *successful* or *failed*.
- **Start Time**, **End Time** indicate the beginning and end of Job execution.
- **Criticality** is specified with [Configuration - Inventory - Workflows - Job Options](/configuration-inventory-workflow-job-options) and indicates the relevance of a Job:
  - *Minor*
  - *Normal*
  - *Major*
  - *Critical*
- **Return Code** is the exit code of a Shell Job or the return code of a JVM Job. The [Configuration - Inventory - Workflows - Job Properties](/configuration-inventory-workflow-job-properties) panel offers configuring return codes for successful and failed execution of Jobs.

For access to log output the following action is available:

- **Job**: clicking the *Job Name* will display the Job's log output from the [Task Log View](/task-log). 

By default display of Task logs is limited to 10 MB log size and otherwise logs are downloaded to files. Users can adjust the limit from the [Settings - JOC Cockpit](/settings-joc) page.

### Audit Log

The panel displays the same information as the [Audit Log](/audit-log) focused on the current Workflow.

The number of Audit Log entries displayed can be modified from the *Max. number of Audit Log entries per object* setting in the user's [Profile - Preferences](/profile-preferences).

## Operations

### Operations on Workflows

At the top of the window the following buttons are offered for Workflow operations:

- **Suspend All** acts as an *Emergency Stop* and will suspend all Workflows regardless of the currently displayed selection of Workflows. Suspended Workflows are frozen, they accept Orders but will not start Orders unless the Workflow is resumed. Running Orders continue the current Job or other instruction before being suspended.
- **Resume All** resumes all suspended Workflows regardless of the currently displayed selection of Workflows.

### Operations on Jobs and Workflow Instructions

The following operations are available for Jobs from their related action menu:

- **Skip Job** prevents an Order from executing the related Job and makes it proceed with the next Workflow Instruction.
- **Unskip Job** reverts a previously skipped Job.
- **Stop Job** will suspend Orders arriving at the Job. Orders can be continued from a *Resume* operation that allows to continue processing from a different Workflow node or to force processing of the stopped Job.
- **Unstop Job** reverts a previously stopped Job.

### Operations on Orders

Users find an action menu per Order that offers the following operations:

- **Cancel** will terminate the Order. *Running* Orders will complete the current Job or Workflow Instruction and will leave the Workflow with a *failed* *History Status*.
- **Cancel/terminate task** will forcibly terminate Orders running a Job. Orders will leave the Workflow with a *failed* *History Status*.
- **Suspend** will suspend the Order. Running Orders will be suspended after they completed the current Job or Workflow Instruction.
- **Suspend/terminate task** will forcibly terminate *running* Orders and will suspend the Orders.
- **Suspend/reset** will immediately reset the current Workflow Instruction and will put the Order to the *suspended* state. The option can be combined with forcibly terminating tasks for *running* Orders.
- **Resume** will continue a *suspended* or *failed* resumable Order.

Additional operations can be available that are specific for the Order state.

## Filters

Users can apply filters to limit display of Workflows. Filter buttons are available at the top of the window:

- **Agents** offers filtering Workflows holding Jobs that are assigned one or more selected Agents.
- **Synchronized** Workflows are deployed and are available with the Controller and Agents.
- **Not Synchronized** Workflows are not deployed to Controller and Agents but are available from the inventory only.
- **Suspended** Workflows are frozen, they accept Orders but will not allow Orders starting until Workflows will be resumed.
- **Outstanding** Workflows wait for confirmation by one or more Agents that the Workflow is suspended.
- **Order Filter** offers specifying the date range for which *scheduled* Orders will be displayed for selected Workflows.

The *Advanced Filter* offers more detailed criteria for filtering of Workflows.

## Search

The [Workflows - Search](/workflows-search) offers criteria for looking up Workflows from dependencies, for example searching for Workflows including a specific Job name, or using specific Notice Boards.

## References

### Context Help

- [Configuration - Inventory - Schedules](/configuration-inventory-schedules)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  - [Configuration - Inventory - Workflows - Job Properties](/configuration-inventory-workflow-job-properties)
  - [Configuration - Inventory - Workflows - Job Options](/configuration-inventory-workflow-job-options)
- [Daily Plan](/daily-plan)
- [Order Log View](/order-log)
- [Order States](/order-states)
- [Profile - Preferences](/profile-preferences)
- [Settings - JOC Cockpit](/settings-joc)
- [Workflows - Add Orders](/workflows-orders-add)
- [Workflows - Search](/workflows-search)

### Product Knowledge Base

- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
- [JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows)
