# Report Templates

## Report Template: Top n Workflows with highest/lowest number of failed executions

The Report Template counts failed Workflow executions:

- A Workflow execution is considered being failed if the Order leaves the Workflow with an unsuccessful outcome, for example if an Order is cancelled or if a [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction) is used indicating unsuccessful outcome.
- A Workflow execution is not considered being failed just because some Job failed, for example if a [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction) is used a later retry of a Job can be successful. Instead, the resulting history status of an Order is considered.

## Report Template: Top n Jobs with highest/lowest number of failed executions

The Report Template counts failed Job executions.

- Shell Job execution is considered being failed based on a Job's exit code and optionally output to the stderr channel.
- JVM Job execution is considered being failed based on the Job's outcome that can hold exceptions.

## Report Template: Top n Agents with highest/lowest number of parallel Job execution

The Report Template counts parallel Job executions with Agents. A Job1 is considered in parallel to Job2 if

- Job1 starts after Job2 has started and before Job2 will end or
- Job1 ends after Job2 is started and before Job2 will end.

## Report Template: Top n high criticality Jobs with highest/lowest number of failed executions

The Report Template counts failed executions of Jobs with criticality critical. The criticality is a Job attribute, see JS7 - Job Instruction.

Counting is performed similar to Report Template: Top n Jobs with highest/lowest number of failed executions.

## Report Template: top n Workflows with highest/lowest number of failed executions for cancelled Orders

The Report Template counts failed Workflow executions due to Orders that have been cancelled.

The *cancel* operation is applied to an Order by user intervention .

## Report Template: Top n Workflows with highest/lowest need for execution time

The Report Template considers the duration of successful Workflow executions. Failed Workflow executions will not be considered.

## Report Template: Top n Jobs with highest/lowest need for execution time

The Report Template considers the duration of successful Job executions. Failed Job executions will not be considered.

## Report Template: Top n periods with highest/lowest number of Job executions

The Report Template divides the Reporting Period into steps. The duration of a step is determined by the *Step Duration* setting in the [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration). The start of the next step is determined by the "Step Overlap" setting in the Report Configuration.

Example: 

- Step Duration: 5m
- Step Overlap: 2m
  - 00:00-00:05
  - 00:02-00:07
  - 00:04-00:09

The number of Jobs in execution is counted per step.

## Report Template: Top n periods with highest/lowest number of Workflows executions

The Report Template divides the *Reporting Period *into steps. The duration of a step is determined by the *Step Duration* setting in the [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration). The start of the next step is determined by the *Step Overlap* setting in the Report Configuration.

The number of Orders in execution is counted per step.

## Report Template: Top n Jobs with highest/lowest number of successful executions

The Report Template counts Jobs that completed successfully. Failed Jobs are not considered.

For possible reasons of Job failure see Report Template: Top n Jobs with highest/lowest number of failed executions.

## Report Template: Top n Workflows with highest/lowest number of successful executions

The Report Template counts Workflows that completed successfully. Failed Workflow executions are not considered.

For reasons of Workflow failure see *Report Template: Top n Workflows with highest/lowest number of failed executions*.

## References

### Context Help

- [Configuration - Inventory - Reports](/configuration-inventory-reports)
- [Reports](/reports)
- [Report - Creation](/report-creation)
- [Report - Run History](/report-run-history)

### Product Knowledge Base

- Reports
  - [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration)
  - [JS7 - Reports - Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Templates)
- Workflow Instructions
  - [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction)
  - [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction)
