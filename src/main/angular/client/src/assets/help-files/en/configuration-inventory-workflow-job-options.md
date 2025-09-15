# Configuration Inventory - Workflow - Job Options

The *Workflow* panel offers designing Workflows from a sequence of instructions. Users can drag & drop the *Job Instruction* from the *Toolbar* to a position in the Workflow.

The GUI offers a number of tabs for specifying Job details. The second tab is offered for *Job Options*.

## Frequently used Job Options

- **Parallelism** specifies the number of parallel instances for which the Job can be executed. If more than one Order is processing the Workflow, then they can execute the Job in parallel. In addition to *Parallelism* the process limit applies that is enforced by Standalone Agents and Agent Clusters.
- **Criticality** specifies the relevance of failures of the Job. The *Criticality* is available with Notifications about job failures.

### Job Execution Periods

- **Timeout** specifies the maximum execution period the Job is allowed to consume. If the Job exceeds the *Timeout* it will be cancelled by the Agent considering the Job's *Grace Timeout*. Input can be specified in the following formats:
  - *1* or *1s*: either a number or a number followed by *s* specifies the *Timeout* in seconds.
  - *1m 2d 3h*: specifies 1 month, 2 days and 3 hours as the max. execution period.
  - *01:02:03*: specifies 1 hour, 2 minutes and 3 seconds for the max. execution period.
- **Warn on shorter execution period** raises a warning and related notification if the Job will terminate earlier than the period specified. Input formats include:
  - *1* or *1s*: either a number or a number followed by *s* specifies the execution period in seconds.
  - *01:02:03*: specifies 1 hour, 2 minutes and 3 seconds for the execution period.
  - *30%*: specifies a 30% shorter execution period than the average of previous executions of the job. The calculation makes use of the [Task History](/history-tasks) that is subject to purge by the [Cleanup Service](/service-cleanup).
- **Warn on longer execution period** raises a warning and related notification if the Job will exceed the period specified. Input formats include:
  - *1* or *1s*: either a number or a number followed by *s* specifies the execution period in seconds.
  - *01:02:03*: specifies 1 hour, 2 minutes and 3 seconds for the execution period.
  - *30%*: specifies a 30% longer execution period than the average of previous executions of the job. The calculation makes use of the [Task History](/history-tasks) that is subject to purge by the [Cleanup Service](/service-cleanup).

### Job Log Output

- **Fail on output to stderr** specifies that the Agent will fail the Job, if it writes output to the stderr channel. This check comes in addition to checking the *Return Value* (for Shell Jobs: Exit Code) of a Job.
- **Warn on output to stderr** specifies that the same check is performed as for *Fail on output to stderr*. However, the Job will not be failed but a warning will be raised and a Notification will be created.

### Job Admission Times

*Admission Times* rule when a Job can be started or should be skipped, and the absolute period for which a Job can be executed. For details see [JS7 - Admission Times for Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Admission+Times+for+Jobs).

- **Skip Job if no admission for Order's date** specifies that the Job will be skipped if its *Admission Time* does not match the Order's date. For example, the Job's *Admission Time* can exclude weekends which results in the fact that the Job will be executed Mon-Fri and will be skipped by Orders scheduled for Sat-Sun. Users should consider that the date for which the Order is scheduled is relevant, not the Order's arrival date at the Job. If the Order's scheduled date matches the *Admission Time* but the Order arrives a later point in time outside of the *Admission Time*, then the Job will not be skipped but the Order will wait for the next *Admission Time*.
- **Terminate Job at end of period** specifies that the Agent will cancel the Job if it exceeds the point in time specified with the *Admission Time* period.
- **Admission Time** are offered from the *Show Periods* link.

#### Admission Types

*Admission Types* allow specifying days on which the Job can start. In addition, month ranges can be specified limiting the *Admission Type* to certain months.

- **Weekdays** specifies the days of week on which the Job can start.
- **Specific Weekdays** specifies relative weekdays such as the first or last Monday in a month..
- **Specific Days** specifies days of year.
- **Month Days** specifies relative days in a month, for example the first or last of month.

### Execution Period

The *Execution Period* is specified from its *begin* and *duration*:

- **Begin** is specified by a time in the format HH:MM:SS, for example 10:15:00 for a quarter past 10am.
- **Duration** is specified by use of the following formats:
  - *1* or *1s*: either a number or a number followed by *s* specifies the *Duration* in seconds.
  - *1m 2d 3h*: specifies 1 month, 2 days and 3 hours for the *Duration*.
  - *01:02:03*: specifies 1 hour, 2 minutes and 3 seconds for the *Duration*.

## Job Options available from *More Options*

The *Configuration - Inventory* view offers the *More Options* slider on top of the screen which is inactive by default. Use of the slider makes additional options available.

- **Grace Timeout** is applied to Jobs with Unix that receive a SIGTERM signal when exceeding their *Timeout*. If the Job does not terminate then after the *Grace Timeout* a SIGKILL signal will forcibly terminate the Job.
- **Compatibility**

### Restarting Jobs

- **Job not restartable**

### Running Jobs for Windows using different User Accounts

- **Credential Key**
- **Load User Profile**

## References

- [Cleanup Service](/service-cleanup)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Task History](/history-tasks)
- [JS7 - Admission Times for Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Admission+Times+for+Jobs).
- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
