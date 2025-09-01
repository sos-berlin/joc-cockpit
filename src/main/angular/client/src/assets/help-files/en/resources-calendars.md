# Calendars

The *Calendars* view displays information about use of Calendars.

- **Working Day Calendars** specify days for which Orders should be created from the *Daily Plan*.
- **Non-working Day Calendars** specify days for which no Orders should be created. the dependency can be ignored.

Calendars are referenced by Schedules that are used by the Daily Plan to create Orders.

## Navigation Panel

The left panel displays the tree of inventory folders that hold Calendars.

- Clicking the folder displays Calendars from that folder.
- Clicking the chevron-down icon available when hovering on a folder displays Calendars from the folder and any sub-folders.

The Quick Search icon offers looking up Calendars based on user input:

- Typing **Test** will display Calendars with names such as *test-calendar-1* and *TEST-calendar-2*. 
- Typing **\*Test** will display Calendars with names such as *test-calendar-1* and *my-TEST-calendar-2*

## Calendar Panel

### Display of Calendars

The following information is displayed:

- **Name** is the unique name of the Calendar.
- **Type** is one of *Working day calendar* or *Non-working day calendar*.
- **Validity From**, **Validity To** optionally indicates the validity period. Calendars without validity period are valid for an unlimited period.

### Operations on Calendars

The following operations are available:

- **Show Preview** will display the dates returned by the Calendar.

## Search

The [Resources - Calendars - Search](/resources-calendars-search) offers criteria for looking up Calendars from dependencies, for example by searching for Workflows including a specific Job name, the Calendars used by Schedules for the Workflow will be returned.

## References

- [Resources - Calendars - Search](/resources-calendars-search)
- [Daily Plan](/daily-plan)
- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
