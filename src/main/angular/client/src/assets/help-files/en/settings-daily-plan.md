# Settings - Daily Plan

The following settings are applied to the [Daily Plan](/daily-plan). Changes become effective immediately.

The *Settings* page is accessible from the ![wheel icon](assets/images/wheel.png) icon in the menu bar.

## Daily Plan Settings

### Setting: *time\_zone*, Default: *UTC*

Specifies the time zone that is applied to the start time of the [Daily Plan Service](/service-daily-plan) and period of the Daily Plan.

### Setting: *period\_begin*, Default: *00:00*

Specifies the begin of the 24 hours' Daily Plan period with the indicated time zone.

### Setting: *start\_time*, Default: *30 minutes before period\_begin*

Specifies the start time for running the Daily Plan on a daily basis with the indicated time zone. Without this setting the Daily Plan will run 30 minutes before the point in time specified by the *period\_begin* setting. This setting accepts a time value, for example 23:00:00.

### Setting: *days\_ahead\_plan*, Default: *7*

Specifies the number of days ahead for which Orders are generated and are made available with the *planned* status. A *0* value indicates that no Orders should be generated and disables the functionality.

### Setting: *days\_ahead\_submit*, Default: *3*

Specifies the number of days ahead for which *planned* Orders are submitted to Controllers and are made available with the *submitted* state. A *0* value indicates that no Orders should be submitted and disables the functionality.

### Setting: *submit\_orders\_individually*, Default: *false*

The Daily Plan Service by default submits Orders from a single transaction that is rolled back if submission of an Order fails. With the setting in place Orders are submitted individually and independently from failure to submit other Orders. The Daily Plan Service will require more time to submit Orders individually.

### Setting: *age\_of\_plans\_to\_be\_closed\_automatically*, Default: *1*

Specifies the number of days after which the Daily Plan will be closed and will not allow adding Orders that resolve dependencies for [Resources - Notice Boards](/resources-notice-boards) for the original date.

### Setting: *projections\_month\_ahead*, Default: *6*

Specifies the number of months ahead for which [Daily Plan - Projections](/daily-plan-projections) are calculated that indicate future Order execution.

## References

### Context Help

- [Daily Plan](/daily-plan)
- [Daily Plan - Projections](/daily-plan-projections)
- [Daily Plan Service](/service-daily-plan)
- [Resources - Notice Boards](/resources-notice-boards)
- [Settings](/settings)

### Product Knowledge Base

- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
