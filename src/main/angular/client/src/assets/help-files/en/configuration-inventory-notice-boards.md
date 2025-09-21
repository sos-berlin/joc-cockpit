# Configuration - Inventory - Notice Boards

The *Notice Boards* panel offers specifying Notice Boards for use with Workflows. For details see [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards).

Notice Boards implement dependencies between Workflows:

- Notice Boards allow
  - adding Notices from user intervention, see [Resoreces - Notice Boards](/resources-notice-boards).
  - adding Notices from the *PostNotices Instruction* in a Workflow, see [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction).
- Workflows can be configured to make Orders expect Notices from the following instructions:
  - *ExpectNotices Instruction* is used to check if Notices are available from one or more Notice Boards that are added by a *PostNotices Instruction* or by the user. If the Notice does not exist, then the Order will remain in the *waiting* state with the instruction. A Workflow can include any number of *ExpectNotices Instructions* to expect Notices from the same or from different Notice Boards. For details see [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction).
  - *ConsumeNotices Instruction* is used to make Orders expect one or more Notices from Notice Boards that are added by a *PostNotices Instruction* or by the user. The *ConsumeNotices Instruction* is a block instruction that can include any other instructions and that will delete the Notices that have been expected when an Order reaches the end of the instruction block. For details see [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction).

The following flavors are available for Notice Boards:

- **Global Notice Boards** implement Notces at global scope which makes the same Notice available for any Workflow at any time.
- **Schedulable Notice Boards** implement Notices in scope of the [Daily Plan](/daily-plan). A Notice exists in scope of the *Daily Plan* date, for example
  - Workflow 1 runs Mon-Fri.
  - Workflow 2 runs Mon-Sun and depends on previous execution of Workflow 1.
  - During weekends Workflow 1 will not start. To allow Workflow 2 starting on weekends, the dependency is mapped to the Daily Plan by use of *Schedulable Notice Boards*: if no Order is announced for Workflow 1, then the dependency can be ignored.

Notice Boards are managed from the following panels:

- The [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) on the left side of the window offers navigation by folders holding Notice Boards. In addition, the panel offers operations on Notice Boards.
- The *Notice Board* panel on the right side of the window holds details for Notice Board configuration.

## Notice Boards Panel

For a Notice Board the following inputs are available:

- **Name** is the unique identifier of a Notice Board, see [Object Naming Rules](/object-naming-rules).
- **Title** holds an optional explanation of the Notice Board's purpose.
- **Notice Board Type** is one of *Global Notice Board* or *Schedulable Notice Board*
- **Notice ID for Posting Order** holds a constant value or an expression derived from the posting Order:
  - A string can be used specifying a constant value.
  - A Regular Expression can be used:
    - *Matching Daily Plan Date* extracts the Daily Plan date from the Order ID using the expression: *replaceAll($js7OrderId, '^#([0-9]{4}-[0-9]{2}-[0-9]{2})#.\*$', '$1')*
    - *Matching Daily Plan Date and Order Name* extracts the Daily Plan date and Order name from the Order ID using the expression: *replaceAll($js7OrderId, '^#(\[0-9\]{4}-\[0-9\]{2}-\[0-9\]{2})#.\*-([^:]\*)(?::\[^|\]\*)?(\[|\].*)?$', '$1$2$3')*
    - *Matching Order Name* extracts the Order name using the expression: *replaceAll($js7OrderId, '^#\[0-9\]{4}-\[0-9\]{2}-\[0-9\]{2}#.\*-(\[^:\]\*)(?::\[^|\]\*)?(\[|\].*)?$', '$1$2')*
- **Notice ID for Expecting Order** is available for *Global Notice Boards* and should hold the same expression as the *Notice ID for Posting Orders*.

### Operations on Notice Boards

For available operations see [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

## References

### Context Help

- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Daily Plan - Dependencies](/daily-plan-dependencies)
- [Object Naming Rules](/object-naming-rules)
- [Resources - Notice Boards](/resources-notice-boards)

### Product Knowledge Base

- [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  - [JS7 - Schedulable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedulable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)  
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)
