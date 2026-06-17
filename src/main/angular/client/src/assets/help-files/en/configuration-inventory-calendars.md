# Configuration - Inventory - Calendars

The *Calendar Panel* offers specifying rule-based Calendars that are used by [Configuration - Inventory - Schedules](/configuration-inventory-schedules) for creating Orders from the [Daily Plan](/daily-plan). For details see [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars).

- Calendars specify the days for which Workflows will be executed.
  - **Working Day Calendars** specify days for Workflow execution.
  - **Non-working Day Calendars** specify days for which Workflows will not be executed.
- Schedules 
  - hold references to any number of Working Day Calendars and Non-working Day Calendars that are merged to receive the list of resulting days.
  - determine the point in time when Orders for Workflow execution will start. 

Calendars are managed from the following panels:

- The [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) on the left side of the window offers navigation by folders holding Calendars. In addition, the panel offers operations on Calendars.
- The *Calendar Panel* on the right side of the window holds details for Calendar configuration.

## Calendar Panel

For a Calendar the following inputs are available:

- **Name** is the unique identifier of a Calendar, see [Object Naming Rules](/object-naming-rules).
- **Title** holds an optional explanation of the Calendar's purpose.
- **Type** is one of Working Day Calendar or Non-working Day Calendar.
- **Valid from**, **Valid to** optionally specify the validity period of a Calendar. Before and past validity a Calendar will not return resulting days. If no validity period is specified, the Calendar will be valid for an unlimited period.

### Frequencies

Frequencies come in two flavors that can be combined:

- **Included Frequencies** specify positive days.
- **Excluded Frequencies** specify days that will be removed from the list of resulting days.

The implication about *Excluded Frequencies* is that they deny use of the dates specified and overrule *Included Frequencies* on matching days.

Consider the example of a Working Day Calendar:

- Assume an *Included Frequency* from Mon-Fri.
- Assume an *Excluded Frequency* for National Holidays such as January 1st, May 1st.
- When used with Schedules specifying the **On Non-working Day** property with the value
  - **before non-working day** 
    - if January 1st is a Monday, then the Order will be created for previous Sunday which is not part of the *Included Frequencies* and not part of the *Excluded Frequencies*. 
    - if January 1st is a Saturday, then no Order will be created as the previous non-working day is Friday for which an Order is created from the *Included Frequencies*.
  - **after non-working day**
    - if January 1st is a Saturday, then the Order will be created for next Sunday which is not part of the *Included Frequencies* and not part of the *Excluded Frequencies*. 
    - if January 1st is a Sunday, then no Order will be created as the next non-working day is Monday for which an Order is created from the *Included Frequencies*.

For use with Non-working Day Calendars corresponding rules apply: *Included Frequencies* specify non-working days, *Excluded Frequencies* specify working days.

A Calendar can hold any number of *Frequencies* that will be merged. The *Add Frequency* button is offered for each of *Included Frequencies* and *Excluded Frequencies*.

#### Frequency Types

When adding *Frequencies* a number of types can be selected:

  - **Weekdays** specify the day of week.
  - **Specific Weekdays** specify relative weekdays such as the first or last Monday of a month.
  - **Specific Days** specify days of year.
  - **Month Days** specify relative days in a month, for example the first or last day of month.
  - **Every** specifies recurring periods, for example every 2nd day, every 1st week, every 3rd month. This requires specifying the *Valid From* date starting from which days will be counted.
  - **National Holidays** specify known public holidays. Resulting days are not authoritative and might differ from local legislation.
  - **Non-working Day Calendars** exclude related days from Non-working Day Calendars for the current Calendar.

*Frequency Types* can be combined by repeatedly applying the same or different *Frequency Type*.

#### Example

Assume the example of a Calendar that should return every 2nd business day:

- Assume Mon-Fri being business days, Sat-Sun being non-working days.
- Assume National Holidays for January 1st, May 1st.

Counting every 2nd business day should exclude weekends and National Holidays:

- Create a Working Day Calendar using
  - *Included Frequencies*: Add the **Weekdays** *Frequency Type* and select *Every Day*. The result will hold all days of year.
  - *Excluded Frequencies*: Add the **Every** *Frequency Type* and select *2* for the interval and *Days* for the unit. Specify the *Valid From* date. This halves resulting days.
  - *Excluded Frequencies*: Add the **National Holidays** *Frequency Type* and select your *Country* and *Year*. This further limits resulting days.

Check results from the *Show Preview* button that should give you every 2nd business day excluding weekends and National Holidays.

An alternative solution includes to specify the **Every** *Frequency Type* from the *Restriction* of a Schedule.

## Operations on Calendars

For available operations see [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

## References

### Context Help

- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Configuration - Inventory - Schedules - Run-time](/configuration-inventory-schedules-run-time)
- [Daily Plan](/daily-plan)
- [Object Naming Rules](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
