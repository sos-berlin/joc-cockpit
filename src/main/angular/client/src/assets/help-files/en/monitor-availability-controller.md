# Monitor - Controller Availability

The view displays indicators for availability of a Controller.

If a Controller Cluster is used then cluster availability is considered. For example, if a Controller instance in a cluster is shut down for maintenance purposes and the remaining instance picks up the load, then this does not reduce availability.

The right-upper corner of the screen offers the *Current Controller* checkbox: when unchecked availability will be displayed for all connected Controllers and otherwise the information is displayed for the currently selected Controller only.

Users should be aware that historic data for Controller availability are subject to purge by the [Cleanup Service](/service-cleanup).

## Date Filters

The upper-right corner of the panel offers selecting a date range for display of availability:

- **Week** makes the date slider switch for a week's period.
- **Month** makes the date slider switch for a month's period.
- **Range** offers specifying the start date and end date.

## Running Time

Gives the percentage for which the Controller is confirmed being available in the given period.

## Statistics

Shows availability from a bar chart on a daily basis in the given period.

## Overview

Shows availability per Controller and day in the given period.

- The chart indicates hours in green color for which Controller availability is confirmed. 
- The red color indicates unavailability.
- The grey color indicates missing data.

## References

- [Cleanup Service](/service-cleanup)
- [Monitor - Availability - Agent](/monitor-availability-agent)
- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
