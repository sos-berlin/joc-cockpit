# Configuration - Inventory - Job Resources

The *Job Resource Panel* offers specifying Job Resources for use with Workflows and Jobs.

Job Resources hold variables from key/value pairs that are used for the following purposes:

- For JVM Jobs running in the Agent's Java Virtual Machine variables are specified from *Arguments*. When a Job Resource is assigned a Job, then matching Job arguments will be populated.
- For Shell Jobs variables are specified from *Environment Variables*. When a Job Resource is assigned a Job, then Environment Variables will be created automatically.

Job Resources are assigned a Workflow or Job from the related object property, see [Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options). When assigned at Workflow level, then Job Resource variables are available to all Jobs in the Workflow.

Job Resources are managed from the following panels:

- The [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) on the left side of the window offers navigation by folders holding Job Resources. In addition, the panel offers operations on Job Resources.
- The *Job Resource Panel* on the right side of the window holds details for Job Resource configuration.

## Job Resource Panel

For a Job Resource the following inputs are available:

- **Name** is the unique identifier of a Job Resource, see [Object Naming Rules](/object-naming-rules).
- **Title** holds an optional explanation of the Job Resource's purpose.

The panel offers configuration of Job Resource variables from the following tabs:

- **Arguments** are used by JVM Jobs created from Java, JavaScript etc.
- **Environment Variables** are used by Shell Jobs.

Job Resource variables are configured for each tab from the following inputs:

- **Name** can be freely chosen within [Object Naming Rules](/object-naming-rules).
  - For *Arguments* Java limits apply. Spelling of *Argument* names is case-sensitive.
  - For *Environment Variables* operating system limits apply, for example excluding dashes and spaces. A frequent naming convention includes uppercase spelling. On Unix the names of Environment Variables are considered case-sensitive, on Windows they are considered case-insensitive.
- **Value** can be direct input from strings, numbers or expressions, see [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables).

Should the same variable be made available for both *Arguments* and *Environment Variables*, then the value of the Environment Variable can reference the *Argument* name like this: *$argument*

### Operations on Job Resources

For available operations see [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

## References

### Context Help

- [Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options)
- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Object Naming Rules](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
