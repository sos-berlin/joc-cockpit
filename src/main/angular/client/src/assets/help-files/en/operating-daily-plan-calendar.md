# Operating Daily Plan from Calendar

A number of operations are available from the Daily Plan Calendar. 

For general operations available from the Daily Plan page see [Operating Daily Plan](/operating-daily-plan.md).

## Selecting single Date

Clicking a calendar date will display Orders available for the selected date.

## Selecting multiple Dates

To select a number of dates

- hold mouse and drag to select the date range,
- or press Ctrl key and select start date and end date using mouse click,
- or click calendar icon and select start date and end date using mouse click.

Selected dates will be highlighted and the *Remove Order* and *Cancel Order* buttons will become available below the main menu.

The following filter buttons limit the scope of operations: 

- **All**: The operation can be applied to Orders holding any status.
- **Planned**: The *submit* and *remove* operations can be applied to *planned* Orders that are not *submitted* to the Controller.
- **Submitted**: The *cancel* operation can be applied to Orders *submitted* to the Controller and Agents.
- **Finished**: The *cancel* operation can be applied to Orders that completed.

The following operations are offered.

### Cancel Orders

- When applied to *submitted* Orders in the selected date range, then Orders will be recalled from the Controller and Agents.
- When applied to *submitted* or *finished* Orders, the Orders will be set to the *planned* status.
- The operation is ignored for *planned* Orders.

### Remove Orders

- When applied to *planned* Orders, then the Orders will be removed from the Daily Plan.
  - When Orders are removed from a Daily Plan date, then they will not be executed and the Daily Plan Service will not try to add Orders to the given date.
  - When combined with the *Delete Daily Plan* operation, then any submissions for the given Daily Plan date will be deleted and the next run of the Daily Plan Service will plan Orders for the given date, see [Delete Daily Plan](#delete-daily-plan).
- The operation is ignored for *submitted* and *finished* Orders.

### Create Daily Plan

The operation is available from a button below the calendar widget for an individual date and for date ranges.

- For selected days the Daily Plan will be created.
  - Users have a choice to create all Orders or Orders from selected Schedules and Workflows, optionally limited by folders.
  - Users can specify to replace existing Orders from the same Schedules and to immediately submit Orders to the Controller.
  - Users can include Orders from Schedules that are not configured for consideration by the Daily Plan Service.
- If the Daily Plan for a given date is created, then the next run of the Daily Plan Service will not plan Orders for the date. However, the service will submit *planned* Orders in scope of the days ahead for which Orders are submitted, see Settings page, section Daily Plan.

### Delete Daily Plan

The operation is available from a button below the calendar widget for an individual date and for date ranges.

- For selected days the Daily Plan will be deleted, provided that no *submitted* or *finished* Orders are available. If *planned* Orders are available, then they will be dropped with the Daily Plan.
- If the Daily Plan for a given date is deleted, then the next run of the Daily Plan Service will plan Orders for the date, provided that the date is in scope of the days ahead for which Orders are planned, see Settings page, section Daily Plan.

## References

- [Operating Daily Plan](/operating-daily-plan)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
