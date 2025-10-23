# Daily Plan Service

The Daily Plan Service is used to create and to submit Orders for the [Daily Plan](/daily-plan) to Controllers. The service is operated in background and acts on a daily basis to plan a number of days ahead.

The Daily Plan Service runs existing [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules) and generates Orders for the given start times. This applies to both Schedules which specify a single start time for an order and Schedules which specify cyclic starts. An individual Order is created for each start time in a cycle. In a subsequent step these Orders are submitted to the appropriate Controllers.
A similar functionality is available in the JS7 - Daily Plan View for operation by users. However, the service performs this task automatically for a configurable number of days ahead.


The Cleanup Service will purge the [JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database) from outdated records.

This includes data from the following sources:

- [Order History](/history-orders)
- [Task History](/history-tasks)
- [File Transfer History](/history-file-transfers)
- [Daily Plan](/daily-plan)
- [Audit Log](/audit-log)

For each job executed during the day an entry in the *Task History* will be created, similarly for the *Order History*. Depending on the number of daily Jobs this can add up to huge numbers.

- Users should consider applicable log retention policies, i.e. the period for which the job execution history and logs must be maintained by legal requirements and by compliance requirements.
- A database cannot grow indefinitely. Using a performant DBMS might allow having 100 million records in a *Task History* table. However, this will tend to be detrimental to performance and might not be required. Purging the database is a reasonable measure for smooth operations.

The Cleanup Service is started based on its settings and it can be started in the Dashboard view from the active JOC Cockpit instances' rectangle offering the *Run Service - Cleanup Service* operation.

## Daily Plan Service Settings

For settings that shape the behavior of the Daily Plan Service refer to [Settings - Daily Plan](/settings-daily-plan).

## References

### Context Help

- [Audit Log](/audit-log)
- [Daily Plan](/daily-plan)
- [Settings - Daily Plan](/settings-daily-plan)

### Product Knowledge Base

- [JS7 - Daily Plan Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan+Service)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
