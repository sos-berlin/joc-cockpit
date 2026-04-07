# Resume Orders

The *Resume Orders* pop-up window is displayed for *suspended* and *failed* Orders that should be resumed. A number of sections are offered for user input depending on resumption being performed for a single Order or from a bulk operation on Orders.

- **Variables** are displayed with values that are historically specific before the current Workflow position. For example, if a failed job did modify a *Dynamic Variable*, then the variable will be displayed from its historic value before executing the job.
- **Options** allow changing the behavior of resumed Orders.
- **Positions** allow resuming Orders from an earlier or later position in the Workflow.

## Operations on single Orders

### Variables with constant values

The section displays *Workflow Variables* with their effective values carried by the Order.

Such variables hold constant values that cannot be modified.

### Variables with modifiable values

The section displays *Dynamic Variables* not declared with the workflow. Such variables are dynamically created by jobs executed by the Order.

Users can modify the values of *Dynamic Variables*. 

- **Operations**
  - **Keep Value**: the variable is passed to the subsequent Workflow instruction with its current value.
  - **Change Value**: the changed value of the variable will be used, provided that the related checkbox is in *checked* state.
  - **Remove Variable**: the original value of the variable will be used that was assigned before the current Workflow instruction.
  - **Add Variable**: offers adding the name and value of a new *Dynamic Variable*.
- **Variables**
  - **returnCode**: is a built-in variable that holds the numeric outcome of the previous Workflow instruction. By default, a zero value indicates success, non-zero values indicate failure.

The subsequent Workflow instruction is the same or the one to which a users will drag&drop the Order which includes instructions earlier or later to the Order's current position.

### Options

#### Forcing jobs to be restarted

The **Force Resumption** checkbox affects jobs that are configured being *not restartable*, see [Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options.md). Such jobs will not be executed once again in case that they have been terminated by the Agent or by the operating system. The option does not affect *suspended* Order or Orders that *failed* due to job errors.

The intention is to prevent jobs not designed for restart capabilities from being automatically resumed after forceful termination. Instead, users have to hit the related checkbox. Typical use cases include for example, jobs performing financial transactions for which the outcome should be checked before causing a restart.

#### Specifying the Cycle End Time

The **Cycle End Time** input field is available for Orders that started a minimum of one cycle in a *Cycle Instruction*.

A period shorter or longer than configured with the *Cycle Instruction* can be specified.
Periods are specified by *seconds* or *hours:minutes:seconds*. Specifying a value *0* for the period will cause the Order

- to continue from the resumed position in the Workflow,
- to execute subsequent jobs,
- to leave the cycle next time it meets the *Cycle Instruction*.

### Positions for dragging & dropping Orders

Orders can be resumed from a previous or later position in the Workflow.
Users can drag&drop the Order to the Workflow instruction from which it should be resumed.

- **Allowed Positions**
  - Orders can be resumed from later Workflow instructions at the same block level as the current Workflow position.
  - Orders can be resumed from a position in the *true* branch or *false* branch of an *If Instruction*.
  - Orders can be resumed from a position inside the *ConsumeNotices* instruction, therefore skipping the check for existence of related Notices.
- **Denied Positions**
  - Orders cannot be moved to a position inside the branch of a *Fork Instruction*. The reason being that the *Parent Order* remains with the *Fork Instruction* while *Child Orders* are created per branch.
    - *Child Orders* cannot be moved between branches of a *Fork Instruction*. Resuming a *Child Order* from a position within its branch is accepted.
    - Orders can be resumed directly from a *Fork Instruction*.
  - Orders cannot be moved to a position inside *Lock Instructions*. The operation is denied as it affects the condition of a *Resource Lock* being acquired. Resuming an Order from the block begin of the *Lock Instruction* is accepted.

The above similarly applies to nested Workflow instructions, for example an inner *Fork Instruction* inside the branch of an outer *Fork Instruction*.

When unchanged, the Order will be resumed from its current Workflow position.

## Bulk Operations on Orders

The bulk operation is available from the [Orders Overview](/orders-overview.md) view which allows selecting a number of Orders from the same or different Workflows.

- **Resume from same Position** allows resumption from the current Workflow instruction at which the Order is *suspended* or *failed*.
- **Resume from current Block** offers resumption from the begin of the current block instruction. For example,
  - if an Order is sitting with some instruction inside a *Lock Instruction*, then it will be resumed from begin of the *Lock Instruction*.
  - if an Order is sitting with some instruction inside a branch of the *Fork Instruction*, then it will be resumed from begin of the branch.
- **Resume from Label** allows specifying the name of a *Label* that is common to all Workflows for which Orders should be resumed. Resumption of Orders will be effected from the Workflow position indicated by the *Label*. If the *Label* does not exist in a Workflow, then the Order is resumed from its current position.

## References

### Context Help

- [Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Orders Overview](/orders-overview)
- [Workflows](/workflows)

### Product Knowledge Base

- [JS7 - Workflows - Status Operations on Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows+-+Status+Operations+on+Orders)
