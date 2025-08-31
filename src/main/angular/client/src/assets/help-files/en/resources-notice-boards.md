# Notice Boards

The *Notice Boards* view displays live information about use of Notice Boards.

Notice Boards implement dependencies across Workflows, they are available from the following flavors:

- **Global Notice Boards** hold *Notices* of global scope. A global *Notice* exists or does not exist in JS7.
- **Schedulable Notice Boards** hold *Notices* in scope of the *Daily Plan*. The *Notice* exists or does not exist per *Daily Plan* date, for example
  - Workflow 1 runs Mon-Fri.
  - Workflow 2 runs Mon-Sun and depends on previous execution of Workflow 1.
  - During weekends Workflow 1 will not start. To allow Workflow 2 starting on weekends, the dependency is mapped to the Daily Plan by use of *Schedulable Notice Boards*: if no Order is announced for Workflow 1, then the dependency can be ignored.

*Notice Boards* are referenced in Workflows from the following instructions:

- **PostNotices Instruction** posts one or more *Notices*.
- **ExpectNotices Instruction** waits for one or more *Notices* being present.
- **ConsumeNotices Instruction** is a block instruction that
  - can span a number of Jobs and Workflow Instructions in the same Workflow,
  - waits for one or more *Notices* being present and deletes *Notices* on completion of the block.

## Navigation

The left panel displays the tree of inventory folders that hold Notice Boards.

- Clicking the folder displays Notice Boards from that folder.
- Clicking the chevron-down icon available when hovering on a folder displays Notice Boards from the folder and any sub-folders.

The Quick Search icon offers looking up Notice Boards based on user input:

- Typing **Test** will display Notice Boards with names such as *test-board-1* and *TEST-board-2*. 
- Typing **\*Test** will display Notice Boards with names such as *test-board-1* and *my-TEST-board-2*

## Display

Display is focused on *Notice Boards*, related *Notices* and Orders.

The [Daily Plan - Dependencies](/operating-daily-plan-dependencies) view is focused on display of *Notice Boards*, *Notices* and Orders related to a specific Daily Plan date.

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

The [Resources - Notice Boards - Search](/resources-notice-boards-search offers criteria for looking up Notice Boards from dependencies, for example by searching for Workflows including a specific Job name, the Notice Boards used by the Workflow will be returned.

## References

- [Resources - Notice Boards - Search](/resources-notice-boards-search)
- [Daily Plan - Dependencies](/operating-daily-plan-dependencies)
- [JS7 - Notice Baords](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
