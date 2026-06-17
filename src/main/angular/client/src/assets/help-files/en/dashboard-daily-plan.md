# Dashboard - Daily Plan

The *Daily Plan* panel provides information about execution of Orders created by the Daily Plan. This excludes Orders created on demand by user intervention and Orders created from file watching by *File Order Sources*.

<img src="dashboard-daily-plan.png" alt="Daily Plan" width="330" height="80" />

## Daily Plan Status

The Daily Plan status is the initial status when an Order is created by the Daily Plan Service.

- **Planned** Orders have not been submitted to the Controller and Agents. Any number of *Planned* Orders indicates a problem if the date range is in scope of the number of days for which Orders should be submitted.
- **Submitted** Orders are scheduled for later execution during the day or are in execution. The status does not reflect the current state of Orders that have been started but summarizes Orders that should be executed during the day.
- **Finished** Orders are completed. This is independent from the outcome if Orders completed successfully or with failure which is indicated by the *Order History* view.

Clicking the indicated number of Orders navigates to the *Daily Plan* view that displays Orders in detail.

## Filters

The drop-down button in the upper-right corner of the panel offers selecting Orders from a date range:

- **Today** Orders are related to the current day which is calculated from the time zone in the user's profile.
- **Next Day** Orders are targeted for execution on the next day. This excludes *Today's* Orders.
- **Next 2nd Day** Orders are targeted for execution on the next 2nd day.
- **Next 3rd Day** Orders are targeted for execution on the next 3rd day.
- **Next 4th Day** Orders are targeted for execution on the next 4th day.
- **Next 5th Day** Orders are targeted for execution on the next 5th day.
- **Next 6th Day** Orders are targeted for execution on the next 6th day.
- **Next 7th Day** Orders are targeted for execution on the next 7th day.

## References

- [Daily Plan](/daily-plan)
- [Dashboard - Orders](/dashboard-orders)
- [Order History](/history-orders)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
