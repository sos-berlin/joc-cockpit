# Daily Plan Service

The [JS7 - Daily Plan Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan+Service) is used to create and to submit Orders for the [Daily Plan](/daily-plan) to Controllers. The service is operated in background and acts on a daily basis to plan and to submit Orders a few days ahead.

The Daily Plan Service runs existing [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules) and generates Orders for the given start times. This applies to both Schedules which specify a single start time for an order and Schedules which specify cyclic start times. An individual Order is created for each start time in a cycle. In a subsequent step these Orders are submitted to related Controllers.

A similar functionality is available in the Daily Plan view for operation by users. However, the Daily Plan Service performs this task automatically.

The Daily Plan Service is started based on its settings and it can be started in the Dashboard view from the active JOC Cockpit instances' rectangle offering the *Run Service - Daily Plan Service* operation. There is no harm from starting the Daily Plan Service a number of times per day.

<img src="dashboard-run-daily-plan-service.png" alt="Run Daily Plan Service" width="750" height="280" />

## Daily Plan Service Settings

For settings of the Daily Plan Service see [Settings - Daily Plan](/settings-daily-plan).

## References

### Context Help

- [Daily Plan](/daily-plan)
- [Settings - Daily Plan](/settings-daily-plan)

### Product Knowledge Base

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - Daily Plan Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan+Service)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
