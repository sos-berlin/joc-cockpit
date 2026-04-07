# Resume Orders

The *Resume Orders* pop-up window is displayed for *suspended* and *failed* Orders that should be resumed. A number of sections are offered for user input.

- **Variables** are displayed with values that are historically specific before the current Workflow position. For example, if a failed job did modify a *Dynamic Variable*, then the variable will be displayed from its historic value before executing the job.
- **Options** allow changing the behavior of resumed Orders.
- **Positions** allow resuming Orders from an earlier or later position in the Workflow.

## Section: Variables

### Variables with constant values

The section displays *Workflow Variables* with their effective values carried by the Order.

Such variables hold constant values that cannot be modified.

### Variables with modifiable values

The section displays *Dynamic Variables* not declared with the workflow. Such variables are dynamically created by jobs executed by the Order.

Users can modify the values of *Dynamic Variables*. 

- **Operations**
  - **Keep Value**: the variable is passed with its current value to the subsequent Workflow instruction.
  - **Change Value**: the changed value of the variable will be used provided that the related checkbox is in *checked* state.
  - **Remove Variable**: the original value of the variable will be used that was assigned before the current Workflow instruction.
  - **Add Variable**: offers adding the name and value of a new *Dynamic Variable*.
- **Variables**
  - **returnCode**: is a built-in variable that holds the numeric outcome of the previous Workflow instruction. By default, a zero value indicates success, non-zero values indicate failure.

The subsequent Workflow instruction is the one to which a users will drag&drop the Order which includes instructions earlier or later to the Order's current position.

## Section: Options

### Forcing jobs to be restarted

The **Force Resumption** checkbox affects jobs that are configured being *not restartable*. Such jobs will not be executed once more after failure.

The intention is to prevent jobs not designed for restart capabilities from being automatically resumed. Instead, users have to hit the related checkbox. Typical use cases include for example jobs performing financial transactions for which the outcome should be checked before causing a restart.

### Specifying the Cycle End Time

The **Cycle End Time** input field is available for Orders that started a minimum of one cycle in a *Cycle Instruction*.

A period shorter than configured with the *Cycle Instruction* can be specified.
Periods are specified by *seconds* or *hours:minutes:seconds*. Specifying a value *0* for the period will cause the Order

- to continue from the resumed position in the Workflow,
- to execute subsequent jobs,
- to leave the cycle next time it meets the *Cycle Instruction*.

A period that is specified longer than configured with the Cycle Instruction is accepted.

## Section: Positions for drag&drop of Orders

Orders can be resumed from a previous or later position in the Workflow that matches the same instruction level. 
Users can drag&drop the Order to the Workflow instruction from which it should be resumed.

- **Allowed Positions**
  - Orders can be moved to later Workflow instructions at the same block level as the current Workflow position.
  - Orders can be moved to a position in the *true* branch or *false* branch of an *If Instruction*.
- **Denied Positions**
  - Orders cannot be moved into the branch of a *Fork Instruction*. The reason being that the *Parent Order* remains with the *Fork Instruction* while *Child Orders* are created per branch.
    - *Child Orders* cannot be moved between branches of a *Fork Instruction*.
    - Orders can be moved directly to a *Fork Instruction*.
  - Orders cannot be moved inside *Lock Instructions*, *ExpectNotices* or *ConsumeNotices* instructions. The operation is denied as it affects the condition of a *Resource Lock* being acquired or a *Notice* being available.

The above similarly applies to nested Workflow instructions, for example an inner *Fork Instruction* inside the branch of an outer *Fork Instruction*.

When unchanged, the Order will be resumed from its current Workflow position.

## References

### Context Help

- [Workflows](workflows.md)

### Product Knowledge Base

- [JS7 - Workflows - Status Operations on Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows+-+Status+Operations+on+Orders)
