# Submission History

The *Submission History* keeps track of Orders submitted from the [Daily Plan](/daily-plan).

Orders are created by the Daily Plan in two steps: first they are *planned*, next they are *submitted* to Controller and Agents. Submission includes that Orders will start autonomously with Agents.

The *Submission History* is subject to purge of the database performed by the [Cleanup Service](/service-cleanup).

## History Panel

Display is grouped in blocks per Daily Plan date, per Submission and Orders included.

Display is limited to a maximum of 5000 entries if not otherwise specifed from [User Profile - Preferences](/profile-preferences).

### History of Daily Plan

The following information is displayed per Daily Plan date.

- **Daily Plan Date** indicates the day for which Orders are scheduled.
- **Total Count** indicates the number of Orders subject to all Submissions for the given date.
- **Submission Count** indicates the number of successfully submitted Orders.
  - If the number corresponds to the *Total Count*, then all orders are successfully submitted.
  - If the number is above zero but below the *Total Count* then
    - the setting to submit orders indivdidually is in place, see section *joc* in [Settings](/settings) and
    - a number of orders could not be submitted.
  - If the number is zero, then this indicates
    - the setting to submit orders indivdidually not being in place, see section *joc* in [Settings](/settings), and/or
    - failure to submit all orders.

### History of Submissions

There can be any number of Submissions for a given Daily Plan date. When users deploy changes to inventory objects such as Workflows and Schedules, and choose the option to update the Daily Plan, then a Submission is added for the given objects.

When clicking the arrow-down icon from the *Daily Plan Date*, details per Submission will be displayed:

- **Total Submission Count** indicates the number of Orders subject to the given Submission.
- **Submission Count** indicates the number of Orders successfully submitted in scope of the given Submission.
  - If the number corresponds to the *Total Submission Count*, then all orders are successfully submitted.
  - If the number is zero or above zero, then previous explanations about Submissions per Daily Plan date apply.

### History of Submissions per Order

When clicking the arrow-down icon from the *Submission Date*, details per Order will be displayed:

- **Message** can indicate an error message in case of failed Submission.
- **Order ID** is the unique identifier assigned an Order.
- **Workflow** indicates the Workflow passed by the Order.
  - Clicking the Workflow name navigates to the [Workflows](/workflows) view.
  - Clicking the pencil icon navigates to the [Configuration - Workflows](/configuration-workflows) view.
- **Scheduled For** indicates the date and time for which the Order is expected to start.
- **Status** is one of *Submitted* or *Not Submitted*.
  - *Submitted* indicates that the Order is available with an Agent.
  - *Not Submitted* indicates a failed Submission.

## Filters

User's can apply filters available on top of the window to limit display of Daily Plan dates and of Submissions.

- **Submitted**, **Not Submitted** filter buttons limit display to Submisisons holding the related status.
- **Date Range** filter buttons offer choosing the date range for display of Submissions.
- **Current Controller** checkbox limits Submissions to the currently selected Controller.

## References

- [Daily Plan](/daily-plan)
- [Workflows](/workflows)
- [Configuration - Workflows](/configuration-workflows)
- [Settings](/settings)
- [Cleanup Service](/service-cleanup)
- [User Profile - Preferences](/profile-preferences)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
