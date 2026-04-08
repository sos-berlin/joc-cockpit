# Configuration - Inventory - Workflow - Job Properties

The *Workflow* panel offers designing Workflows from a sequence of instructions. Users can drag & drop the *Job Instruction* from the *Toolbar* to a position in the Workflow.

The GUI offers a number of tabs for specifying Job details. The first tab is offered for *Job Properties*.

## Required Job Properties

The minimum properties for a Job are as follows:

- **Name** identifies the Job from a unique name. If more than one Job in the Workflow use the same name, then only one copy of the Job is stored and other occurrences reference the Job using different *Job Labels*.
- **Label** is a unique identifier for instructions in a Workflow. Uniqueness is enforced across Jobs and other instructions. If the same *Job Name* is used a number of times in a Workflow, then different *Labels* have to be used.
- **Agent** assigns an Agent for execution of the Job.
  - *Standalone Agents* are selected from their *Agent Name*.
  - *Cluster Agents* are specified by selecting the *Agent Cluster* and desired *Subagent Cluster*.
- **Script** holds the shell commands, calls to scripts and executable files that are executed by the Job for the related Unix or Windows platform.

## Optional Job Properties

- **Title** describes the job's purpose. Users can add links by using markdown syntax, for example \[Example\]\(https://example.com\). The *Title* is considered when filtering results, for example in the [Workflows](/workflows) view.
- **Job Resources** are inventory objects that hold variables from key/value pairs that can be made available from Workflow Variables and from Environment Variables. *Job Resources* can be assigned at Job level and they can be assigned at Workflow level which makes them available to all Jobs in a Workflow. For details see [Configuration - Inventory - Job Resources](/configuration-inventory-job-resources).
- **Return Code** specifies if a Job is considered successful or failed. By default the 0 value indicates success, other values indicate failure. A number of successful return codes can be separated by comma, for example *0,2,4,8*. A range of return codes can be specified by two dots, for example *0..8* or *0,2,4,8,16..64*. separated by comma. Negative return codes are undefined.
  - **On Success** specifies successful return codes.
  - **On Failure** specifies unsuccessful return codes that indicate failure.
  - **Ignore** will not consider return codes as an indicator of success or failure of a Job.
- **Return Code on Warning** is a subset of successful return codes. If a successful return code is specified as a warning, then a notification will be created, however, the flow of the Order in the Workflow will not be affected by warnings.

### Job Classes

- **Job Class** specifies the type of Job being executed. For details see [JS7 - Job Classes](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Classes).
  - **Shell Jobs** are executed with the operating system shell, for example the Windows Shell or the Unix Shell available from /bin/sh. Shell jobs can include any shell commands, calls to scripts and executable files. Shell Jobs allow use of scripting languages such as Node.js, Perl, Python, PowerShell etc. They require an interpreter to be installed with the operating system that can be executed from the command line.
  - **JVM Jobs** are implemented in a number of languages operated for a Java Virtual Machine for which the JS7 Agent offers the [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API). The languages supported include:
    - *Job Templates*
      - **JITL Jobs** are Java Jobs that ship with JS7 and that are used from [JS7 - Integration Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Integration+Job+Templates), for example to access databases, to access remote hosts by SSH etc.
    - *User Defined Jobs*
      - **Java Jobs** are executed in the JVM used with for JS7 Agent.
      - **JavaScript Jobs**, **Python Jobs** require use of Oracle® Graal Polyglot libraries with the JS7 Agent. The libraries provide the JIT compiler.

### Environment Variables

For *Shell Jobs* the parameterization is made available from Environment Variables.

- **Name** can be freely chosen within operating system limits, for example excluding dashes and spaces. A frequent naming convention includes uppercase spelling. On Unix *Names* are considered case-sensitive, on Windows they are considered case-insensitive.
- **Value** can be direct input from strings or numbers. In addition, Workflow Variables can be specified that are declared with the Workflow and that are preceded with a $ character as in *$variable*. Spelling of Workflow Variables is case-sensitive.

## Job Properties available from *More Options*

The *Configuration - Inventory* view offers the *More Options* slider on top of the window which is inactive by default. Use of the slider makes additional options available.

- **Documentation** holds a reference to [Resources - Documentations](/resources-documentations) that can be used to explain the job. The reference to the documentation is visible with the [Workflows](/workflows) view.

## References

### Context Help

- [Configuration - Inventory - Job Resources](/configuration-inventory-job-resources)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  - [Configuration - Inventory - Workflows - Job Options](/configuration-inventory-workflows-job-options)
  - [Configuration - Inventory - Workflows - Job Node Properties](/configuration-inventory-workflows-job-node-properties)
  - [Configuration - Inventory - Workflows - Job Notifications](/configuration-inventory-workflows-job-notifications)
  - [Configuration - Inventory - Workflows - Job Tags](/configuration-inventory-workflows-job-tags)
- [Resources - Documentations](/resources-documentations)

### Product Knowledge Base

- [JS7 - Integration Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Integration+Job+Templates)
- [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API)
- [JS7 - Job Classes](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Classes)
- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
