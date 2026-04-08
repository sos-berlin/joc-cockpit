# Order History

The *Order History* view summarizes the execution history of Orders. This includes the execution history of Jobs used in Workflows triggered by related Orders.

The *Order History* is subject to purge of the database performed by the [Cleanup Service](/service-cleanup).

For the history of tasks see [Task History](/history-tasks).

## Navigation Panel

The left panel allows filtering by Tags from Workflows and Orders.

- **Workflow Tags** are assigned from the [Configuration - Inventory - Workflows](/configuration-inventory-workflows) view.
- **Order Tags** are assigned from the [Configuration - Inventory - Schedules](/configuration-inventory-schedules) view.

Tags are selected from + and - icons and can be looked up using the Quick Search icon. Display of Tags must be activated from the [Settings - JOC Cockpit](/settings-joc) page.

## History Panel

Display is limited to a maximum of 5000 entries if not otherwise specified from [Profile - Preferences](/profile-preferences).

### History of Orders

- **Order ID** is the unique identifier assigned an Order. Clicking the arrow-down icon will display the Order variables and the Jobs passed by the Order. 
- **Workflow** indicates the Workflow passed by the Order.
  - Clicking the Workflow name navigates to the [Workflows](/workflows) view.
  - Clicking the pencil icon navigates to the [Configuration - Inventory - Workflows](/configuration-inventory-workflows) view.
- **Label** indicates the latest position of an Order in the Workflow. Users can assign labels to Workflow Instructions that will be displayed and otherwise the technical position will be indicated.
- **History Status** indicates the *History Status* which is the latest outcome in the Order's life.
  - If Orders are completed, then the *History Status* will be *successful* or *failed*.
  - If Orders are not completed, the *History Status* will be *in progress*.
- **Order State** indicates the Order's latest state, see [Order States](/order-states).
  - If Orders are completed, then the *Order State* will be *finished*.
  - If Orders are not completed, the *Order State* will be *processing*.

### Access to Log Output

- **Order ID**: Clicking the *Order ID* will display the Order's log output from the [Order Log View](/order-log). The log includes output created by any jobs executed with the Workflow.
- **Download Icon**: clicking the icon will download the Order's log to a file.

By default display of Order logs is limited to 10MB log size and otherwise logs are downloaded to files. Users can adjust the limit from the [Settings - JOC Cockpit](/settings-joc) page.

### Operations on the Task History

Users find an action menu per Task that offers the following operation:

- **Add Workflow to Ignore List** will permanently hide the Workflow's Orders from display. This can be useful for cyclic Workflows that populate the *Order History*.

The *Ignore List* is managed from the related button in the upper-right corner of the window:

- **Edit Ignore List** will display the Workflows in the *Ignore List* and offers to individually remove entries from the *Ignore List*. 
- **Enable Ignore List** will activate the filtering to hide Workflows that have been individually added to the *Ignore List*. An active *Ignore List* is indicated from the related button.
- **Disable Ignore List** will deactivate the filtering of  Workflows. The operation is available for an active *Ignore List*.
- **Reset Ignore List** will remove Workflows from the *Ignore List* which results in display of all Workflows.

## Filters

User's can apply filters available on top of the window to limit display of Orders.

- **Successful**, **Failed**, **In Progress** filter buttons limit display to Orders holding the related *History Status*.
- **Date Range** filter buttons offer choosing the date range for display of Orders.
- **Current Controller** checkbox limits Orders to the currently selected Controller.

## References

### Context Help

- [Cleanup Service](/service-cleanup)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Configuration - Inventory - Schedules](/configuration-inventory-schedules)
- [Order Log View](/order-log)
- [Order States](/order-states)
- [Profile - Preferences](/profile-preferences)
- [Settings - JOC Cockpit](/settings-joc)
- [Task History](/history-tasks)
- [Workflows](/workflows)

### Product Knowledge Base

- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Task History](https://kb.sos-berlin.com/display/JS7/JS7+-+Task+History)
