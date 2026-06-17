# Cleanup Service

The Cleanup Service will purge the [JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database) from outdated records.

This includes data from the following sources:

- [Order History](/history-orders)
- [Task History](/history-tasks)
- [File Transfer History](/history-file-transfers)
- [Daily Plan](/daily-plan)
- [Audit Log](/audit-log)

For each Job executed during the day an entry in the *Task History* will be created, similarly for the *Order History*. Depending on the number of daily Jobs this can add up to huge numbers.

- Users should consider applicable log retention policies, i.e. the period for which the job execution history and logs must be maintained by legal requirements and by compliance requirements.
- A database cannot grow indefinitely. Using a performant DBMS might allow having 100 million records in a *Task History* table. However, this tends to be detrimental for performance and might not be required. Purging the database is a reasonable measure for smooth operations. Additional measures for database maintenance such as recreating indexes are the responsibility of the user.

The Cleanup Service is started based on its settings and it can be started in the Dashboard view from the active JOC Cockpit instances' rectangle offering the *Run Service - Cleanup Service* operation.

<img src="dashboard-run-cleanup-service.png" alt="Run Cleanup Service" width="750" height="280" />

## Cleanup Service Settings

For Cleanup Service configuration details see [Settings - Cleanup](/settings-cleanup).

## References

### Context Help

- [Audit Log](/audit-log)
- [Daily Plan](/daily-plan)
- [File Transfer History](/history-file-transfers)
- [Order History](/history-orders)
- [Task History](/history-tasks)
- [Settings - Cleanup](/settings-cleanup)

### Product Knowledge Base

- [JS7 - Cleanup Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Cleanup+Service)
- [JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database)
