# Configuration Inventory - Workflows

The *Workflow* panel offers designing Workflows from a sequence of instructions that shape the Workflow for a [Directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph). 

Users can drag & drop instructions from the *Toolbar* to create Workflow patterns such as a sequence of Jobs, forking and joining Jobs, conditional execution etc.

## Toolbar Panel

The *Toolbar* holds the following instructions:

- **Job Instruction** implements a Job. Workflows can include any number of Jobs. For details see [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction).
- **Try/Catch Instruction** implements exception handling from a *Try* block that holds Jobs or other instructions. If a Job fails, then the instructions in the *Catch* block will be executed. An empty *Catch* block will resolve the error status of a previously failed instruction. For details see [JS7 - Try-Catch Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Try-Catch+Instruction).
- **Retry Instruction** implements repeated execution of a sequence of Jobs or other instructions in case of failure. If one of the Jobs in the *Retry* block fails, then the Order is moved to the begin of the *Retry* block to repeat execution. For details see [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction).
- **Finish Instruction** makes an Order leave the Workflow with a successful or unsuccessful outcome in the [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History). For details see [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction).
- **Fail Instruction** makes an Order fail. Without further error handling the Order will remain in the *failed* state, see [Order States](/order-states). A surrounding *Try/Catch Instruction* or *Retry Instruction* is triggered by the *Fail Instruction*. For details see [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction).
- **Fork Instruction** allows Orders to be forked and joined to enable parallel processing of Jobs and other instructions in a Workflow. Branches are created by dragging & dropping instructions on the *Fork Instruction*. When an Order enters the *Fork Instruction*, then a Child Order is created for each branch. For details see [JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction).
  - Each Child Order will pass the nodes in its branch independently of parallel Child Orders.
  - Child Orders can return results to Parent Orders by passing variables.
  - Child Orders take the role of Parent Orders in nested *Fork Instructions*.
- **ForkList Instruction** is the dynamic version of a *Fork Instruction* and comes in the following flavors:
  - The instruction expects an Order to provide a *List Variable* that is implemented as a list (array) of values. The list can include any number of name/value pairs (variables). The *ForkList Instruction* is designed as a single branch: depending on the number of entries provided with the *List Variable* carried by the Order, the Agent will dynamically create branches for each entry of the *List Variable*. This allows for example to execute Jobs for each entry of a *List Variable*. For details see [JS7 - ForkList-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction).
  - The instruction allows a number of Child Orders and branches to be created dynamically to execute the same sequence of Jobs or other instructions on a number of Subagents: users can run the same Jobs in parallel on a number of servers or containers operating Subagents. Use cases include for example executing similar backup Jobs on a larger number of servers. For details see [JS7 - ForkList-Join Instruction for Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction+for+Agent+Clusters).
- **Cycle Instruction** offers repeated execution of all or some of the Jobs and other instructions in a Workflow. It's a block instruction that can spawn the complete Workflow or selected Jobs and instructions in a Workflow. The *Cycle Instruction* can be nested. For details see [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction).
- **Break Instruction** is used in a *Cycle Instruction* to terminate the cycle and to make an Order leave the cycle. For details see [JS7 - Break Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Break+Instruction).
- **Lock Instruction** is a block instruction that is used to specify one or more Jobs and other instructions for mutual exclusion, to prevent Jobs from being executed in parallel either in the same Workflow or in different Workflows. *Lock Instructions* can be nested. For details see [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction).
- **Sleep Instruction** is used to delay further processing in a Workflow by a given amount of time. For details see [JS7 - Sleep Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Sleep+Instruction).
- **Prompt Instruction** halts execution of an Order in a Workflow until the prompt is confirmed. The Order is assigned the *prompting* state. Users can confirm or cancel *prompting* orders, see [Order States](/order-states). For details see [JS7 - Prompt Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Prompt+Instruction).
- **AddOrder Instruction** is used in a Workflow to create a new Order for a different Workflow. By default added Orders run asynchronously and in parallel to the current Order in a separate Workflow, i.e. their execution result is not synchronized and does not have an impact on the current Order. If the execution of the added Order should be synchronized, then the *ExpectNotices Instruction* and *ConsumeNotices Instruction* can be used. For details see [JS7 - AddOrder Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AddOrder+Instruction).
- **PostNotices Instruction** is used to create one or more Notices for Notice Boards. The Notices will be waited for by the corresponding *ExpectNotices Instruction* and *ConsumeNotices Instruction* from the same or from different Workflows. A Workflow can include any number of *PostNotices Instructions* to post Notices to the same or to different Notice Boards. Posting a Notice will not block further execution of an Order in a Workflow. The Order continues immediately having posted the Notice. For details see [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction).
- **ExpectNotices Instruction** is used to check if one or more Notices are available from Notice Boards that are expected to add Notices by a *PostNotices Instruction* or by the user. If the Notice does not exist, then the Order will remain in the *waiting* state with the instruction. A Workflow can include any number of *ExpectNotices Instructions* to wait for Notices from the same or from different Notice Boards. For details see [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction).
- **ConsumeNotices Instruction** is used to make orders wait for one or more Notices from Notice Boards that have been added by a *PostNotices Instruction*. The *ConsumeNotices Instruction* is a block instruction that can include any other instructions and that will delete the Notices that have been waited for when an Order reaches the end of the instruction block. For details see [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction).
- **If Instruction** is a block instruction used for conditional processing in a Workflow. It allows to check return codes and return values of previous Jobs and to evaluate Order Variables. For details see [JS7 - If Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+If+Instruction).
- **Case Instruction** is used for conditrional processing of Jobs and other instructions in a Workflow. The instruction extends the *If Instruction*. The *Case Instruction* is be used with repeated *Case-When Instructions* and optionally a single *Case-Else Instruction*. For details see [JS7 - Case Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Case+Instruction).
- **CaseWhen Instruction** is used to check a predicate similar to the *If Instruction*. The instruction can occur any number of times in a *Case Instruction*.
- **CaseElse Instruction** is used if all checks from *CaseWhen Instructions* fail.
- **StickySubagent Instruction** can be used to execute a number of Jobs with the same Subagent of an Agent Cluster. The block instruction checks the first available Subagent of a Subagent Cluster. This Subagent will be used for subsequent jobs within the block instruction. Use of Agent Clusters is subject to the terms for clustering with the [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License). For details see [JS7 - StickySubagent Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+StickySubagent+Instruction+for+Agent+Clusters).
- **Options Instruction** is a block instruction that rules error handling for the *Lock Instruction* and *ConsumeNotices Instruction*. If the *Options Instruction* is in place and specifies the *Stop on Failure* property then *failed* Orders will remain with the failing instruction, for example a Job. If the instruction is not in place, then Orders that fail within a *Lock Instruction* or *ConsumeNotices Instruction* will be moved to the begin of the instruction block and will remain in the *failed* state. For details see [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction).
- **Paste** offers to drag & drop a previously copied or cut instruction to the Workflow.

## Workflow Panel

The panel holds the graphical representation of a Workflow.

- Users can drag & drop instructions from the *Toolbar Panel* to the Workflow.
  - To drag & drop the first instruction in a Workflow, users hold the mouse key pressed and drop the instruction in the indicated drop area of the Workflow.
  - To drag & drop further instructions, users hold the mouse key pressed, navigate to the desired connector line between instructions and release the mouse key.
- For the *Fork Instruction* users can drag & drop a *Job Instruction* directly on the *Fork* node to create a new branch.
- For the *If Instruction* users can drag & drop a *Job Instruction* directly on the *If* block: the first instruction represents the *true* branch, the second instruction dragged & dropped creates the *false* branch.

### Operations on Workflows

#### Operations on Instructions

When hovering the mouse on an instruction then the 3-dots action menu is offered for the following operations:

- **All Instructions** offer the *Copy*, *Cut* and *Remove* operation. Block instructions such as the *Fork Instruction* offer in addition the *Remove All* operation: whiie *Remove* will remove the instruction only, the *Remove All* operation will remove the instruction and any included instructions such as Jobs.
- **Job Instruction** offers the *Make Job Template* operation that creates a Job Template from the current Job. The Job Template can be used by other Jobs in the same or in different Workflows.

#### Copy, Cut, Paste Operations

**Copy** and **Cut** operations are available from an instruction's 3-dots action menu. The *copy* and *cut* operations on a block instruction act on any instructions included with the block instruction. To copy or cut more than one instruction that doesn't hold a block, users can keep the mouse key pressed and mark the instructions similar to use of a lasso. 

- **Ctrl+C** keyboard shortcut will copy the highlighted instructions.
- **Ctrl+X** keyboard shortcut will cut the highlighted instructions.

**Paste** operations are available from the *Toolbar Panel* that allows dragging & dropping the copied or cut instructions to the Workflow.

- **Ctrl+V** keyboard shortcut will paste the copied or cut instructions when the user clicks a connector line between Workflow instructions.

## References

- [Daily Plan](/daily-plan)
- [Order History](/history-orders)
- [Order States](/order-states)
- [Directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph)
- [JS7 - Workflow Instructions - Processing](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Processing)
  - [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
  - [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction)
  - [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction)
  - [JS7 - Prompt Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Prompt+Instruction)
  - [JS7 - Sleep Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Sleep+Instruction)
- [JS7 - Workflow Instructions - Clustering](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Clustering)
  - [JS7 - ForkList-Join Instruction for Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction+for+Agent+Clusters)
  - [JS7 - StickySubagent Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+StickySubagent+Instruction+for+Agent+Clusters)
- [JS7 - Workflow Instructions - Conditional Processing](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Conditional+Processing)
  - [JS7 - If Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+If+Instruction)
  - [JS7 - Case Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Case+Instruction)
- [JS7 - Workflow Instructions - Cyclic Execution](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Cyclic+Execution)
  - [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction)
  - [JS7 - Break Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Break+Instruction)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)
  - [JS7 - AddOrder Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AddOrder+Instruction)
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)
- [JS7 - Workflow Instructions - Error Handling](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Error+Handling)
  - [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction)
  - [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction)
  - [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction)
  - [JS7 - Try-Catch Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Try-Catch+Instruction)
- [JS7 - Workflow Instructions - Forking](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Forking)
  - [JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction)
  - [JS7 - ForkList-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
