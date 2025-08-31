# Task History

The *Task History* view summarizes the execution history of Jobs that are indicated independently from the Workflow and Order for which they were executed.

The *Task History* is subject to purge of the database performed by the [Cleanup Service](/service-cleanup).

For the history of orders see [Order History](/history-orders).

## Navigation

The left panel allows filtering by Tags from Workflows and Orders that triggered execution of the Job.

- **Workflow Tags** are assigned from the [Configuration - Workflows](/configuration-workflows) view.
- **Order Tags** are assigned from the [Configuration - Schedules](/configuration-schedules) view.

Tags are selected fron + and - icons and can be looked up using the search icon. Display of Tags must be activated from the *joc* section in the [Settings](/settings) page.

## Display

Display is limited to a maximum of 5000 entries if not otherwise specifed from [User Profile - Preferences](/profile-preferences).

### History of Jobs

- **Job Name** indicates the related Job.
- **Workflow** indicates the Workflow for which the Job was executed.
  - Clicking the Workflow name navigates to the [Workflows](/workflows) view.
  - Clicking the pencil icon navigates to the [Configuration - Workflows](/configuration-workflows) view.
- **Label** indicates the position of the Job in the Workflow. Users assign labels to Jobs that will be displayed. If the same Job occurs more than once in a Workflow, it will be indicated from different *Labels*.
- **History Status** indicates the outcome of the Job.
  - If Jobs are completed, then the *History Status* will be *successful* or *failed*.
  - If Jobs are not completed, the *History Status* will be *in progress*.

### Access to Log Output

- **Job Name**: Clicking the *Job Name* will display the Job's log output from the [Task Log Viewer](/task-log).
- **Download Icon**: clicking the icon will download the Job's log to a file.

By default display of task logs is limited to 10MB log size and otherwise logs are downloaded to files. Users can adjust the limit from the [Settings](/settings) page.

### Operations on the Task History

Users find an action menu per Task that offers the following operations:

- **Add Job to Ignore List** will permanently hide the Job from display. This can be useful for repeatedly executed Jobs that populate the *Task History*.
- **Add Workflow to Ignore List** will permanently hide the Workflow's Jobs from display. This can be useful for cyclic Workflows that populate the *Task History*.

The *Ignore List* is managed from the related button in the right upper corner of the screen:

- **Edit Ignore List** will display the Jobs and Workflows in the *Ignore List* and offers to individually remove entries from the *Ignore List*. 
- **Enable Ignore List** will activate the filtering to hide Jobs that have been individually added to the *Ignore List* or that are included with a Workflow that was added. An active *Ignore List* is indicated from the related button.
- **Disable Ignore List** will deactivate the filtering of Jobs and Workflows. The operation is available for an active *Ignore List*.
- **Reset Ignore List** will remove Jobs and Workflows from the *Ignore List* which results in display of all jobs.

## Filters

User's can apply filters available on top of the window to limit display of Jobs.

- **Successful**, **Failed**, **In Progress** filter buttons limit display to Jobs holding the related status.
- **Date Range** filter buttons offer choosing the date range for display of Jobs.
- **Current Controller** checkbox limits Jobs to the currently selected Controller.

## References

- [Task Log Viewer](/task-log)
- [Order History](/history-orders)
- [Settings](/settings)
- [User Profile - Preferences](/profile-preferences)
- [Cleanup Service](/service-cleanup)
- [Configuration - Workflows](/configuration-workflows)
- [Configuration - Schedules](/configuration-schedules)
- [Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [Task History](https://kb.sos-berlin.com/display/JS7/JS7+-+Task+History)
