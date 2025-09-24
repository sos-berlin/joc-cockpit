# Daily Plan Projections

The Daily Plan holds Orders that are submitted to Controller and Agents a few days ahead for resilience purposes. In addition it offers projections of future Order start times that are calculated for the next 6 months.

Users who wish a longer projection period can modify the related setting in the [Settings - Daily Plan](/settings-daily-plan) page.

### Dates, Periods and Time Zones

Projections are related to daily plan dates, not calendar dates. 

- Periods
  - If the Daily Plan's 24 hours' period starts at midnight, then it will match the calendar day.
  - For Daily Plan periods starting during the day, the 24 hours' period will overlap with two calendar days.
- Time Zones
  - If Schedules make use of time zones different to the Daily Plan, then Order start times can overlap with the previous or next day. Such Orders are displayed with the related daily plan date but indicate start times for a different date.
  - Use of time zones can result in start times of -14 hours and +12 hours in addition to the 24 hours' Daily Plan period. Most surprisingly for some users, a day is not 24 hours long, but can span up to 50 hours. The period of a day always is 24 hours long as it depends on earth's rotation. However, for a given time zone there is a 50 hours' coverage to include all possible times around the planet.

Any dates and times are displayed in the time zone specified by the user's profile.

### Display Options

Users can switch tabs between *Monthly* and *Yearly* view of projected Orders using the related links in the left upper corner of the window.

For each day the number of the day in month and the number of projected Orders are displayed:

- **Green Orders**: They represent Orders that have been submitted to the Controller and Agents.
- **Orange Orders**: They indicate projected Orders that are calculated based on start time rules.
- **Inverted Projection**:
  - *Unchecked*: The projection indicates the days for which Orders are calculated and the number of Orders. Users can click an individual day to identify Order start times.
  - *Checked*: When inverting the projection, then days are highlighted for which Schedules exist that will not create Orders. When clicking the related day then Schedules without Orders will be displayed.

### Advanced Filter

The filter offers to limit display of Orders to certain folders holding Workflows or Schedules.

## Operations on Projections

### Creating Projections

- Projections are calculated by the Daily Plan Service during its daily run. Later changes to the Daily Plan during the day are not reflected.
- Users can re-create projections on demand from the related button.
- The *Survey Date* indicates the creation date of the current daily plan projection.

### Exporting Projections

Projections can be exported to a file in .xlsx format with the daily plan date in the x-axis and the Workflow and Schedule in the y-axis.

- The *Export* shortcut will export Orders visible from the window. 
- The *Export* button offers to select Orders for export:
  - **Start Date**, **End Date**: First and last daily plan date for which Orders will be exported.
  - **Workflows**, **Schedules**: Users can limit export to certain Schedules and Workflows, optionally limited by folders.
  - **Inverted Projection**: 
    - *Unchecked*: Exports dates for which Orders are calculated.
    - *Checked*: Exports dates for which no Orders are calculated. This can be used to check if non-working days are considered.

## References

- [Daily Plan](/daily-plan)
- [Settings - Daily Plan](/settings-daily-plan)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
