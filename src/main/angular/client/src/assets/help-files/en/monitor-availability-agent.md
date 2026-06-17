# Monitor - Agent Availability

The view displays indicators for availability of Agent instances.

If an Agent Cluster is used then cluster availability is considered. For example, if an Agent instance in a cluster is shut down for maintenance purposes and the remaining instance picks up the load, then this does not reduce availability.

The right-upper corner of the screen offers the *Current Controller* checkbox: when unchecked availability will be displayed for Agents from all connected Controllers and otherwise the information is displayed for Agents registered with the currently selected Controller only.

Users should be aware that historic data for Agent availability are subject to purge by the [Cleanup Service](/service-cleanup).

## Date Filters

The upper-right corner of the panel offers selecting a date range for display of availability:

- **Week** makes the date slider switch for a week's period.
- **Month** makes the date slider switch for a month's period.
- **Range** offers specifying the start date and end date.

## Running Time

Gives the percentage for which Agents are confirmed being available in the given period.

## Statistics

Shows availability from a bar chart on a daily basis in the given period. Each Agent is indicated individually per day. 

## Overview

Shows availability per Agent and day in the given period.

- The chart indicates hours in green color for which Agent availability is confirmed. 
- The red color indicates unavailability.
- The grey color indicates missing data.

## References

- [Cleanup Service](/service-cleanup)
- [Monitor - Availability - Controller](/monitor-availability-controller)
- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
