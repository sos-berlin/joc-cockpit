# Configuration - Inventory - Schedules - Run-time

The *Schedule Panel* offers specifying rules for creating Orders from the [Daily Plan](/daily-plan).

The *Run-time* button offers specifying start times for Orders from a pop-up window: first, a Calendar is assigned, then periods are specified and optionally restrictions apply.

## Time Zone

Run-times are specified from a **Time Zone** that is populated from the user's [Profile - Preferences](/profile-preferences). For input, time zone identifiers are accepted such as *UTC*, *Europe/London* etc. For a full list of time zone identifiers see [List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

- Start times for Orders are considered in the time zone specified.
- It is possible using a time zone different from the [Settings - Daily Plan](/settings-daily-plan) and for Order run-times. Users should consider that 
  - Orders are assigned a Daily Plan date.
  - Start times are calculated from the Schedule's time zone.
- As a result, the Daily Plan can hold Orders for a given date that overlap with a previous or later day. For example,
  - assume the Daily Plan time zone being UTC,
  - assume the Schedule's time zone being Asia/Calcutta (UTC+05:30) and the start time being *23:00*,
  - if an Order is created for Tuesday's Daily Plan, it will indicate a start time for Wednesday *04:30* UTC. The result is correct but can be considered confusing by users who are lost in time zones.

Most surprisingly for some users, a day is not 24 hours long, but can span up to 50 hours. The period of a day always is 24 hours long as it depends on earth's rotation. However, for any given time zone there is a 50 hours' coverage to include all possible times around the planet.

## Calendar Assignment

First, a Calendar should be assigned:

- **Working Day Calendar** is available from a button with the same name and specifies the days for which Orders should be created. When repeatedly used, it will add run-time entries with periods per Working Day Calendar.
- **Non-working Day Calendar** is available from a button with the same name and offers specifying the days for which no Orders should be created. Any number of Non-working Day Calendars can be added and will be merged.

## Periods

Next, one or more periods for start times should be specified. The *Repeat Interval* input offers the following options:

- **Single Start** is a single point in time.
  - **Start Time** is specified using the syntax *HH:MM:SS*.
  - **On Non-working Day** specifies what should happen if a period meets a day indicated by a Non-working Day Calendar.
    - **suppress execution** is the default behavior not to create an Order.
    - **ignore non-working day** overrules the Non-working Day Calendar and creates an Order.
    - **before non-working day** adds an Order to the next working day prior to the non-working day. For example:
      - A Working Day Calendar specifies Mon-Thu for working days. 
      - A Non-working Day Calendar indicates a specific Monday in the year a non-working day.
      - The next day prior to the non-working day will be previous Sunday. Should weekends be excluded and are added to the Non-working Day Calendar, then the resulting day will be previous Friday.
    - **after non-working day** adds an Order to the next working day after the non-working day. For example:
      - A Working Day Calendar specifies Tue-Fri for working days. 
      - A Non-working Day Calendar indicates a specific Friday in the year a non-working day.
      - The next day after to the non-working day will be next Saturday. Should weekends be excluded and are added to the Non-working Day Calendar, then the resulting day will be next Monday.        
- **Repeat** specifies a repeated period for Cyclic Orders. For input the following syntax is used: *HH:MM:SS*.
  - **Repeat Time** is the interval between cycles, for example *02:00* for 2-hourly cycles.
  - **Begin** is the start time of the first cycle, for example *06:00* for 6am.
  - **End** is the end time of the last cycle, for example *22:00* for 10pm.
  - **On Non-working Day** specifies what should happen if a period meets a day indicated by a Non-working Day Calendar. Configuration is the same as for *Single Start* periods.

## Restrictions

*Restrictions* are used to limit the days for which Orders will be created:

- Assigned Working Day Calendars and Non-working Day Calendars are merged to resulting days for Workflow execution by Orders.
- Restrictions further apply and hold rules similar to [Configuration - Inventory - Calendars](/configuration-inventory-calendars):
  - **Weekdays** specify the day of week.
  - **Specific Weekdays** specify relative weekdays such as the first or last Monday of a month.
  - **Specific Days** specify days of year.
  - **Month Days** specify relative days in a month, for example the first or last day of month.
  - **Every** specifies recurring periods, for example every 2nd day, every 1st week, every 3rd month. This requires specifying the *Valid From* date starting from which days will be counted.
  - **National Holidays** specify known public holidays. Resulting days are not authoritative and might differ from local legislation.
  - **Non-working Day Calendars** exclude related days from Non-working Day Calendars for the current Calendar.

*Restrictions* allow limiting the number of Calendars in use. Instead, of creating individual Calendars for specific rules such as the first day of month, users can apply a standard Calendar covering all days of year and can apply the desired *Restriction*.

Use of Non-working Day Calendars is different when assigned the *Run-time* and when assigned the *Restriction*:

- Example:
  - Assume a Working Day Calendar Mon-Fri.
  - Assume a Schedule *Restriction* for *4th of month*.
  - Resulting days are calculated from the Working Day Calendar and the 4th day of the resulting list of days.
- Schedules can hold references to Non-working Day Calendars too.
  - The Non-working Day Calendars are applied *after* the calculation of each Schedule's *Restriction*.
  - If users want to exclude certain non-working days from the Calendar *before* the *4th of month* *Restriction* is applied, then they have the option
    - to specify non-working days from the *Excluded Frequencies* of the Working Day Calendar.
    - to specify days from Non-working Day Calendars that are added the *Restriction*

## Cyclic Orders vs. Cyclic Workflows

Users should consider implications of Cyclic Orders: they create individual Order instances per cycle. As an alternative to Cyclic Orders created by Schedules using repeat intervals, the [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction) is available for Cyclic Workflows.

- Execution
  - A *Cycle Instruction* spawning a complete Workflow is equivalent to the use of Cyclic Orders from a Schedule.
  - A *Cycle Instruction* can be used to execute parts of a Workflow in cycles.
- Efficiency
  - Schedules create a number of Order instances for each period of a Cyclic Order. Running a single Workflow every 30s adds up to 2880 Orders per day.
  - *Cycle Instructions* cause cyclic execution of a Workflow from a single Order.
  - Processing of Cyclic Workflows is by far more efficient than processing of Cyclic Orders.
- Error Handling
  - Failure
    - If a job in a Workflow fails, then this will occur individually for each Order instance of a Cyclic Order.
    - If a job within a *Cycle Instruction* fails, then depending on the error handling in place, any cycles that would occur while an Order is in a *failed* state will be skipped.
  - Notification
    - For each failing Order instance of a Cyclic Order a Notification is created.
    - For the single Order of a Cyclic Workflow a single Notification is created.
  - Intervention
    - Any operations on Cyclic Orders are applied to all Order instances included, for example, resuming execution after failure. This results in parallel execution of Orders previously scheduled for execution in intervals.
    - For Cyclic Workflows there is a single Order that waits for user intervention.
- Logging
  - For each Order instance of a Cyclic Order a separate entry is created in the [Order History](/history-orders) and in the [Task History](/history-tasks).
  - For a Cyclic Workflow there is a single entry in the Order History that is appended the log output of each cycle. Individual entries per job execution are added to the Task History.

## References

### Context Help

- [Configuration - Inventory - Calendars](/configuration-inventory-calendars)
- [Configuration - Inventory - Schedules](/configuration-inventory-schedules)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Daily Plan Service](/service-daily-plan)
- [Object Naming Rules](/object-naming-rules)
- [Order History](/history-orders)
- [Profile - Preferences](/profile-preferences)
- [Settings - Daily Plan](/settings-daily-plan)
- [Task History](/history-tasks)

### Product Knowledge Base

- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
- [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
- [List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
