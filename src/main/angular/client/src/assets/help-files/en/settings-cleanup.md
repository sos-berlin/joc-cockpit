# Settings - Cleanup

The following settings are applied to the [Cleanup Service](/service-cleanup). Changes become effective immediately.

The *Settings* page is accessible from the ![wheel icon](assets/images/wheel.png) icon in the menu bar.

## Start Time Settings

### Setting: *time\_zone*, Default: *UTC*

Specifies the time zone that is applied to the start time and period of the Cleanup Service.

### Setting: *period*

Specifies weekdays on which the Cleanup Service is performed. The first day of week is assumed being Monday. When initially installing JS7, then default values specify: 1,2,3,4,5,6,7 for daily clean-up. If no weekdays are specified, the Cleanup Service will not start.

In most cases it is recommended to run the Cleanup Service on a daily basis, as this keeps the number of records to be purged low. There can be exceptions if daily job execution is very dense for 24 hours and if off-peak periods for example are available on weekends.

### Setting: *period\_begin*, Default: *01:00:00*

Specifies the start time of the Cleanup Service in the related *Time Zone*.

### Setting: *period\_end*, Default: *04:00:00*

Specifies the end of the period for which the Cleanup Service is allowed to run in the related *Time Zone*. The Cleanup Service most probably will complete purge of the database before the indicated time. However, if it detects activity from the *History Service*, then the Cleanup Service will stop and will restart later on. The Cleanup Service will not continue to run beyond the indicated *Period End*.

### Setting: *force\_cleanup*, Default: *false*

If set to *true*, specifies that the Cleanup Service will be forcibly executed at the given *Period Begin*. By default the Cleanup Service will stop if it detects activity of the History Service. The setting allows the Cleanup Service to pause the History Service for a configurable duration.

If set to *true*, the following settings are considered:

- **history\_pause\_duration**: period for which the History Service will be paused.
- **history\_pause\_delay**: delay after the History Service is resumed from a pause and for which the Cleanup Service will wait until it restarts.

Users who run Jobs 24/7 without sufficient idle time of the History Service allowing the Cleanup Service to become active, should activate the setting to force execution of the Cleanup Service. Missing purge of the database will result in reduced performance and growing resource consumption of the database.

### Setting: *history\_pause\_duration*, Default: *60*s

If the *force\_cleanup* setting is set to *true*, then the History Service will be paused for the indicated duration or for completion of clean-up whichever occurs first. While the History Service is paused, no new history entries referring to execution of Orders and tasks are made available in JOC Cockpit. On completion of the History Service pause, any pending history entries will be processed.

### Setting: *history\_pause\_delay*, Default: *30*s

If the *force\_cleanup* setting is set to *true* and the History Service pause is completed, then the Cleanup Service will wait for the indicated delay and will restart if further purge of the database is required.

## Database Connection Settings

### Setting: *batch\_size*, Default: *1000*

Specifies the number of records that are purged within a single transaction. Increasing this value can improve performance - at the same time it will increase the risk of conflicts with concurrent transactions if Services are operating on the database in parallel.

### Setting: *max\_pool\_size*, Default: *8*

Specifies the maximum number of parallel database connections used by the service.

## Retention Period Settings

### Setting: *order\_history\_age*, Default: *90*d

Specifies the retention period for the [Order History](/history-orders) and [Task History](/history-tasks). Any history entries older than the value specified will be purged.

### Setting: *order\_history\_logs\_age*, Default: *90*d

Specifies the retention period for Orders and task logs. Any logs older than the value specified will be purged. Note that this value should not exceed the value of the *cleanup\_order\_history\_age* setting as otherwise navigation to logs cannot be provided by the JOC Cockpit GUI.

### Setting: *file\_transfer\_history\_age*, Default: *90*d

Specifies the retention period for [File Transfer History](/history-file-transfers). Any entries older than the value specified will be purged.

### Setting: *audit\_log\_age*, Default: *90*d

Specifies the retention period for the [Audit Log](/audit-log). Any Audit Log entries older than the value specified will be purged.

### Setting: *daily\_plan\_history\_age*, Default: *30*d

Specifies the retention period for the history of submissions with the [Daily Plan](/daily-plan). Any history entries older than the value specified will be purged.

### Setting: *monitoring\_history\_age*, Default: *1*d

Specifies the retention period for entries in the *Monitor* view. As this suggests to be a tactical view, longer retention periods are not recommended.

### Setting: *notification\_history\_age*, Default: *1*d

Specifies the retention period for notifications, for example about job errors and warnings. As notifications are typically handled on the same day, longer retention periods are not recommended.

### Setting: *profile\_age*, Default: *365*d

Specifies the retention period for unused [Profiles](/profile), i.e. profiles of user accounts that did not login for the given period.

### Setting: *failed\_login\_history\_age*, Default: *90*d

Specifies the retention period for the history of failed logins. Unsuccessful logins that occurred before the given period will be purged.

### Setting: *reporting\_age*, Default: *365*d

Specifies the retention period for [Reports](/reports).

### Setting: *deployment\_history\_versions*, Default: *10*

Specifies the number of versions per deployed object that should be retained. Versions can be used to re-deploy an object from an earlier state. Any earlier deployed versions of deployed objects are removed.

## References

### Context Help

- [Audit Log](/audit-log)
- [Daily Plan](/daily-plan)
- [Daily Plan - Projections](/daily-plan-projections)
- [Profile](/profile)
- [Reports](/reports)
- [Resources - Notice Boards](/resources-notice-boards)
- [Cleanup Service](/service-cleanup)
- [Settings](/settings)

### Product Knowledge Base

- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
