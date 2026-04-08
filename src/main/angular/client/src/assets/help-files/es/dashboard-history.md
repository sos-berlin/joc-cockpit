# Dashboard - History

The *History* panel provides information about past execution of Orders and Jobs.

<img src="dashboard-history.png" alt="History" width="330" height="80" />

## History Status

The history status is the final status when an Order or Job is completed. The history status does not consider Orders and Jobs that are in progress. No operations are available on indicated Orders or Jobs - they are history.

- **Successful Orders** are completed with a successful outcome. This includes Orders that might have failed during their lifetime but recovered by automated error handling or by user intervention.
- **Failed Orders** did meet a problem such as a failed Job or *Fail Instruction*.
- **Successful Jobs** are completed with a successful outcome. This includes Jobs in Workflows for which related Orders are not completed.
- **Failed Jobs** did meet a problem when executing the Job.

Clicking the indicated number of Orders or Jobs navigates to the [Order History](/history-orders) view or [Task History](/history-tasks) view that displays Orders and Jobs in detail.

## Filters

The drop-down button in the upper-right corner of the panel offers selecting past Orders and Jobs from a date range:

- **Today** Orders and Jobs are related to the current day which is calculated from the time zone in the user's profile.
- **Last hour** includes Orders and Jobs that completed during the last hour.
- **Last 12 hours** includes Orders and Jobs that completed during the last 12 hours.
- **Last 24 hours** includes Orders and Jobs that completed during the last 24 hours.
- **Last 7 days** includes Orders and Jobs that completed during the last 7 days.

## References

- [Order History](/history-orders)
- [Task History](/history-tasks)
- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Task History](https://kb.sos-berlin.com/display/JS7/JS7+-+Task+History)
