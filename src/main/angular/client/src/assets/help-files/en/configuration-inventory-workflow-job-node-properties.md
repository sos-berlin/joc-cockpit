# Configuration - Inventory - Workflow - Job Node Properties

The *Workflow* panel offers designing Workflows from a sequence of instructions. Users can drag & drop the *Job Instruction* from the *Toolbar* to a position in the Workflow.

The GUI offers a number of tabs for specifying Job details. The fourth tab is offered for *Node Properties*.

## Node Properties

A Node is the position of a Job in the Workflow. If the same Job occurs a number of times in the same Workflow, then it will use the same *Job Name* but different *Labels*. The *Label* identifies the Node in the Workflow.

Should the same Job be used with different parameter sets per occurrence in the Workflow, then *Node Properties* can be used. They offer key/value pairs that create Node Variables.

- **Name** specifies the name of the Node Variable that can be used
  - in Shell Jobs by assigning an Environment Variable the *Name* of the Node Variable using the syntax *$myNodeVariable*.
  - in JVM Jobs by assigning a Job Variable the *Name* of the Node Variable using the syntax *$myNodeVariable*.
- **Value** accepts input from strings, numbers and references to Workflow Variables as in *$myWorkflowVariable*.

Node Variable names are case-sensitive.

## References

### Context Help

- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  - [Configuration - Inventory - Workflows - Job Options](/configuration-inventory-workflows-job-options)
  - [Configuration - Inventory - Workflows - Job Properties](/configuration-inventory-workflows-job-properties)
  - [Configuration - Inventory - Workflows - Job Notifications](/configuration-inventory-workflows-job-notifications)
  - [Configuration - Inventory - Workflows - Job Tags](/configuration-inventory-workflows-job-tags)

### Product Knowledge Base

- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
