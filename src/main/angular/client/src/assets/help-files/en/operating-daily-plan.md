# Operating Daily Plan

A number of operations are available from the Daily Plan view.

For operations related to the calendar widget see [Operating Daily Plan Calendar](/operating-daily-plan-calendar).

## Order States

The Daily Plan is a view for future execution of Orders:

- **Planned**: Orders have been created but have not been *submitted* to the Controller and Agents.
- **Submitted**: Orders have been forwarded to the Controller and Agents that will start Orders autonomously. The status applies to Orders scheduled for future execution and to running Orders in execution.
- **Finished**: Orders have completed. The History view explains if execution was successful or failed.

## Order State Transitions

The Daily Plan view offers the following state transitions:

<pre>
      ┌──────────────────┐
      ▼                  ▲
   Create                │
      │                  │
      ▼                  │
  ┌───├──────┐   Remove  ▲
  │ Planned  │───────────┘
  │ Orders   │───────────┐
  ┖───┌──────┘           ▲
      │                  │
   Submit                │
      │                  │
      ▼                  │
  ┌───├───────┐          │
  │ Submitted │          │
  │ Orders    │          │
  ┖───┌───────┘          │
      │                  │
      ▼          Cancel  ▲
      ├──────────────────┘
      │                  ▲
   Execute / Let Run     │
      │                  │
      ▼                  │
  ┌───├───────┐          │
  │ Finished  │          │
  │ Orders    │          │
  ┖───┌───────┘          │
      │                  │
      ▼          Cancel  ▲
      ┖──────────────────┘
</pre>

## Order Status Operations

Operations are available individually from an Order's action menu and from bulk operations.

The following filter buttons limit the scope of operations: 

- **All**: The operation will be applied to Orders holding any status.
- **Planned**: The *submit* and *remove* operations can be applied to *planned* Orders that are not *submitted* to the Controller.
- **Submitted**: The *let run* and *cancel* operations can be applied to Orders *submitted* to the Controller and Agents.
- **Finished**: The *cancel* operation can be applied to Orders that completed.

### Life Cycle Operations

- **Let Run Orders**
  - When applied to *submitted* Orders, then they will start immediately. Orders in scope of a bulk operation will start simultaneously.
- **Submit Orders**
  - When applied to *planned* Orders, then they will be set to the *submitted* status and will be forwarded to Controller and Agents.
- **Cancel Orders**
  - When applied to *submitted* Orders, then Orders will be recalled from the Controller & Agents and will be set to the *planned* status.
- **Remove Orders**
  - When applied to *planned* Orders, then Orders will be removed from the Daily Plan. A later run of the Daily Plan Service will not try to add Orders to the given date.
- **Copy Orders**
  - **Start Time**: Copies Orders to a future daily plan date. Date/time input is similar to modifying an Order's start time.
  - **Keep Daily Plan Assignment**: Calendar-based dependencies from Notice Boards will be resolved to the original daily plan date.
  - **Ignore Job Admission Times**: Jobs can be limited to run on certain days and/or in certain timeslots. Orders arriving have to wait for the next available timeslot. The option forces Jobs to start independently from such limitations.

### Modify Start Time

- **Now**: Orders will start immediately.
- **Specific Date**: Orders will start on the given date and time. Orders will be assigned the related daily plan date when it comes to resolving calendar-based dependencies.
- **Relative to Current Time**: Orders will start with an offset to the current time in seconds or in hours, minutes, seconds, for example *15* to start in 15 seconds or *01:30:15* to start 1 hour, 30 minutes and 15 seconds later.
- **Relative to Start Time**: Orders will start with a positive or negative offset to their original start time in seconds or in hours, 
minutes, seconds, for example *-04:00:00* to start 4 hours earlier or *+12:00:00* to start 12 hours later. The Orders' assignment to the original daily plan date remains in place when it comes to resolving calendar-based dependencies.

### Modify Parameterization

For related Workflows specifying variables, the values can be modified. When used with bulk operations, all Orders will carry the same values for variables.

- **Modify Variable**: 
  - If the Workflow specifies variables without default values, then the Order has to specify related values.
  - If the Workflow specifies variables with default values, then their specification from an Order is optional.

A position can be specified if Orders should not start from the first node in the Workflow but from a later node.

- **Block Position**: For Workflows holding block instructions such as *Try/Catch*, *Resource Lock*, *Fork/Join*, the related instruction can be selected.
- **Start Position**: If no *Start Position* is specified, then the Order will start from the first node in the Workflow or *Block Position*
  - If no *Block Position* is specified, then any top-level instruction in the Workflow can be selected from which the Order will start.
  - If a *Block Position* is specified, then the Start Position is a same-level node inside the block.
- **End Positions**
  - If no *Block Position* is specified, then any top-level instruction in the Workflow can be selected before which the Order will terminate.
  - If a *Block Position* is specified, then any same-level node inside the block can be specified before which the Order will terminate.
  - More than one *End Position* can be specified.

### Modify Priority

- **Priority**; 
  - If an Order will meet a *Resource Lock* instruction in the Workflow that limits parallelism, then its priority determines the position in the queue of waiting Orders.
  - Priorities are specified from negative, zero and positive integers or from the shortcuts offered. A higher priority has precedence. Shortcuts offer the following priority values:
    - **Low**: -20000
    - **Below Normal**: -10000
    - **Normal**: 0
    - **Above Normal**: 10000
    - **High**: 20000

## References

- [Operating Daily Plan Calendar](/operating-daily-plan-calendar)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
