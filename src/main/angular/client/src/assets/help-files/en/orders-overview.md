# Orders Overview

The *Orders Overview* view offers monitoring and control of Orders for Workflows.

- Users can identify Orders being processed per [Order State](/order-states).
- Users can transition Orders, for example, by cancelling *running* Orders.
- The view holds Orders that are added by the [Daily Plan](/daily-plan) and Orders that have been added on demand.

## Order State Selection Panel

The left panel indicates the number of Orders available per state. Clicking the related state or number displays related Orders in the Order panel.

## Tag Panel

The middle panel is organized in tabs that allow filtering of Orders by Tags.

- **Workflow Tags** are assigned from the [Configuration - Inventory - Workflows](/configuration-inventory-workflows) view.
- **Order Tags** are assigned from the [Configuration - Inventory - Schedules](/configuration-inventory-schedules) view.

Tags are selected from + and - icons and can be looked up using the Quick Search icon. Display of Tags must be activated from the [Settings - JOC Cockpit](/settings-joc) page.

## Order Panel

The panel offers the list of Orders for the given state:

- **Order ID** is the unique identifier assigned an Order.
  - Clicking the arrow-down icon will display variables carried by the Order.
- **Workflow Name** is the unique name assigned a Workflow.
  - Clicking the *Workflow Name* navigates to the [Workflows](/workflows) view.
  - Clicking the pencil icon navigates to the [Configuration - Inventory - Workflows](/configuration-inventory-workflows) view.
- **Label** indicates the Order's position from the label of the Workflow instruction. In absence of labels the technical position is indicated.
- **State** indicates the [Order State](/order-states).
  - Hovering the mouse over the state indicator displays details if available. For example, *waiting* Orders indicate reasons such as *waiting for process*, *waiting for Notice Board* etc.
- **Scheduled For** indicates the start date of the Order.

## History Panel

The panel is displayed in the lower part of the window when users click the Order ID. The panel holds sub-tabs for the *Order History* and *Audit Log*.

### Order History

- **Order ID** is the unique identifier assigned an Order. Clicking the arrow-down icon will display the Order Variables.
- **Label** indicates the latest position of an Order in the Workflow. Users can assign *Labels* to Workflow Instructions that will be displayed and otherwise the technical position will be indicated.
- **History Status** indicates the latest outcome in the Order's life.
  - If Orders are completed, then the *History Status* will be *successful* or *failed*.
  - If Orders are not completed, the *History Status* will be *in progress*.
- **Planned Time** indicates the original date and time the Order was scheduled for.
- **Start Time** indicates the effective date and time the Order started.
- **End Time** indicates the date and time the Order completed.

#### Access to Log Output

- **Order ID**: Clicking the *Order ID* in the *History* panel will display the Order's log output from the [Order Log View](/order-log). The log includes output created by any Jobs executed with the Workflow.
- **Download Icon**: clicking the icon will download the Order's log to a file.

By default display of Order logs is limited to 10MB log size and otherwise logs are downloaded to files. Users can adjust the limit from the [Settings - JOC Cockpit](/settings-joc) page.

### Audit Log

The *Audit Log* indicates modifying operations performed on the Order.

- **Created** indicates the date the operation was performed.
- **Account** indicates the user account that performed the operation.
- **Request** indicates the REST API endpoint that was called.
- **Category** specifies the classification of the operation such as CONTROLLER when cancelling Orders or DAILYPLAN when creating Orders from the [Daily Plan](/daily-plan).
- **Reason** explains why an Order was modified. The JOC Cockpit can be configured to enforce specifying reasons when modifying objects.
  - The setting is available from [Profile - Preferences](/profile-preferences).
  - The setting can be enforced from the [Settings - JOC Cockpit](/settings-joc) page.
- **Time Spent** similar to specifying *Reasons* the time spent on an operation can be added when modifying Orders.
- **Ticket Link** similar to specifying *Reasons* a reference to a ticket system can be added when modifying Orders.

## Operations

### Operations on Orders

Users find an action menu per Order that offers operations available for the given Order state.

For Orders in the *pending*, *scheduled*, *in progress*, *running*, *suspended*, *prompting*, *waiting*, *failed* state the following operations are offered:

- **Modify Priority** 
  - If an Order will meet a *Resource Lock* instruction in the Workflow that limits parallelism, then its *Priority* determines the position in the queue of *waiting* Orders.
  - *Priorities* are specified from negative, zero and positive integers or from the shortcuts offered. A higher *Priority* has precedence. Shortcuts offer the following values:
    - **Low**: -20000
    - **Below Normal**: -10000
    - **Normal**: 0
    - **Above Normal**: 10000
    - **High**: 20000
- **Cancel** will terminate the Order. Running Orders will complete the current Job or Workflow Instruction and will leave the Workflow with a failed history status.
- **Cancel/terminate task** will forcibly terminate Orders running a Job. Orders will leave the Workflow with a failed history status.
- **Cancel/reset** will forcibly terminate Orders running a Job. Orders will leave the Workflow with a failed history status.
- **Suspend** will suspend the Order. Running Orders will be suspended after they completed the current Job or Workflow Instruction.
- **Suspend/terminate task** will forcibly terminate running Orders and will suspend the Orders.
- **Suspend/reset** will immediately reset the current Workflow Instruction and will put the Order to the *suspended* state. The option can be combined with forcibly terminating tasks for *running* Orders.
- **Resume** will continue a *suspended* or *failed* resumable Order.

For Orders holding the *completed* state and for disrupted Orders in the *failed* state the following operations are offered:

- **Leave Workflow** will terminate the Order. 
  - *Completed* Orders will leave the Workflow with a *successful* history status.
  - *Failed/disrupted* Orders will leave the Workflow with a *failed* history status.

Additional operations can be available that are specific for the Order state.

### Bulk Operations

Bulk operations are available when selecting Orders from related checkboxes. They offer the same operations as for individual Orders.

When selecting Orders, then related buttons for bulk operations become visible in the upper part of the window holding captions similar to the above explained operations.

## Filters

Users can apply filters to limit display of Orders. Filter buttons are available at top of the window.

### Date Range Filter Button

The drop-down button offers selecting Orders from a date range:

- **All** specifies Orders scheduled for any past and future date being displayed.
- **Today** Orders are related to the current day which is calculated from the time zone in the [Profile - Preferences](/profile-preferences).
- **Next hour** includes Orders that should start within the next hour.
- **Next 12 hours** includes Orders that should start within the next 12 hours.
- **Next 24 hours** includes Orders that should start within the next 24 hours.
- **Next day** includes Orders that should start until end of the next day.
- **Next 7 days** includes Orders that should start within the next 7 days.

### State Filter Buttons

Similar to the *Order State Selection Panel* a filter button is available per Order state to filter display of Orders.

### From .. To Date Input Filter

For Orders in the *in progress*, *running*, *failed*, *completed* state input fields are available to specify the date and time for which an Order holds the related state.

Users can specify absolute or relative dates and times.

### Results Filter

The filter limits display to matching *Order IDs* and *Workflow Names*. The filter is applied to visible Orders and works case-insensitive.

## References

### Context Help

- [Configuration - Inventory - Schedules](/configuration-inventory-schedules)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Order Log View](/order-log)
- [Order State](/order-states)
- [Profile - Preferences](/profile-preferences)
- [Settings - JOC Cockpit](/settings-joc)
- [Workflows - Add Orders](/workflows-orders-add)

### Product Knowledge Base

- [JS7 - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Orders)
