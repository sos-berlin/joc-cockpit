# Resources - Notice Boards

The *Notice Boards* view displays live information about use of Notice Boards.

Notice Boards implement dependencies across Workflows by use of Notices. A Notice is a flag that is attached a Notice Board or does not exist. Notice Boards are available from the following flavors:

- **Global Notice Boards** implement Notices* at global scope which makes the same Notice available for any Workflow at any time. 
- **Schedulable Notice Boards** implement Notices in scope of the [Daily Plan](/daily-plan). The Notice exists or does not exist per *Daily Plan* date, for example
  - Workflow 1 runs Mon-Fri.
  - Workflow 2 runs Mon-Sun and depends on previous execution of Workflow 1.
  - During weekends Workflow 1 will not start. To allow Workflow 2 starting on weekends, the dependency is mapped to the Daily Plan by use of *Schedulable Notice Boards*: if no Order is announced for Workflow 1, then the dependency can be ignored.

*Notice Boards* are referenced in Workflows from the following instructions:

- **PostNotices Instruction** posts one or more *Notices*.
- **ExpectNotices Instruction** waits for one or more *Notices* being present.
- **ConsumeNotices Instruction** is a block instruction that
  - can span a number of Jobs and Workflow Instructions in the same Workflow,
  - waits for one or more *Notices* being present and deletes *Notices* on completion of the block.

## Navigation Panel

The left panel displays the tree of inventory folders that hold Notice Boards.

- Clicking the folder displays Notice Boards from that folder.
- Clicking the chevron-down icon available when hovering on a folder displays Notice Boards from the folder and any sub-folders.

The Quick Search icon offers looking up Notice Boards based on user input:

- Typing **Test** will display Notice Boards with names such as *test-board-1* and *TEST-board-2*. 
- Typing **\*Test** will display Notice Boards with names such as *test-board-1* and *my-TEST-board-2*

## Notice Board Panel

Display is focused on *Notice Boards*, related *Notices* and Orders.

The [Daily Plan - Dependencies](/daily-plan-dependencies) view is focused on display of *Notice Boards*, *Notices* and Orders related to a specific Daily Plan date.

### Display of Notice Boards

The following information is displayed:

- **Name** is the unique name of a Notice Board.
- **Deployment Date** is the date on which the Notice Board was deployed.
- **Status** is one of *Synchronized* and *Not Synchronized* if the Notice Board has not been deployed to the Controller.
- **Number of Notices** indicates the number of *Notices* for the Notice Board.
  - **Global Notice Boards** hold unique *Notices*.
  - **Schedulable Notice Boards** hold *Notices* per Daily Plan date.
- **Number of Expecting Orders** indicates the number of Orders that expect a *Notice* being posted.

### Display of Notices and Orders

Clicking the arrow-down icon will expand the Notice Board and will display detailed information about *Notices* that have been posted and Orders that are waiting for *Notices* being posted.

### Operations on Notice Boards

The following operations are available:

- **Post Notice** will post the related *Notice* similar to a *PostNotices Instruction*.
- **Delete Notice** will delete the *Notice* similar to a *ConsumeNotides Instruction*.

## Search

The [Resources - Notice Boards - Search](/resources-notice-boards-search) offers criteria for looking up Notice Boards from dependencies, for example by searching for Workflows including a specific Job name, the Notice Boards used by the Workflow will be returned.

## References

### Context Help

- [Configuration - Inventory - Notice Boards](/configuration-inventory-notice-boards)
- [Daily Plan](/daily-plan)
- [Daily Plan - Dependencies](/daily-plan-dependencies)
- [Resources - Notice Boards - Search](/resources-notice-boards-search)

### Product Knowledge Base

- [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  - [JS7 - Schedulable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedulable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)  
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)
