# Job: CheckHistoryJob
<summary>
The job checks the Order History or Task History for execution of predecessor workflows or jobs.
</summary>

# Purpose
<detail>

## What is the purpose of the job?

The job checks the order history and task history for execution results of workflows or jobs.

## How can results be reused in subsequent jobs?

### Use with *If Instruction*

The outcome of the job can be used in subsequent *If Instructions* in a workflow.

- `$returnCode > 0`
- `variable( 'js7CheckHistoryResult', label=jobCheckHistory )`

### Use with *Prompt Instruction*

The outcome of the job can be used in subsequent *Prompt Instructions* in a workflow.

- Example:  `$js7CheckHistoryQuery ++ '(' ++ $js7CheckHistoryQueryWorkflow ++ ') ==> ' ++ $returnCode`

### Use with *Retry Instruction*

The outcome of the job can be used in subsequent *Retry Instructions* in a workflow.

- In combination with an *If Instruction* that contains a *Fail Instruction* the workflow can be caused to retry until a query returns true.
</detail>

# Arguments

## Argument: query
<article id="query">

Specifies the query to be executed by the job. Queries determine 

- the history status of orders or jobs:
  - completed: the order or job completed successfully or failed
  - completed successful
  - completed failed
- the period for which the execution history is looked up for orders and jobs that
  - started between two dates
  - completed between two dates
  - with periods being specified as absolute or relative dates

### Syntax

Queries are specified from a function and optional arguments.

| Syntax | Explanation |
| :--- | :--- |
| `<function>` | Functions can be used without arguments by stating exclusively the name of the function. |
| `<function>( argument[, argument] )` | 	Functions can optionally be specified with one or more arguments that are separated by commas. |

### Functions

| Function | Arguments | Default | Explanation |
| :--- | :--- | :--- | :--- |
| `isStarted` | `startedFrom`,<br/>`startedTo`,<br/>`count` | `startedFrom=0d`,<br/>`startedTo=0d`,<br/>`count > 0` | - Scope: specifies that the workflow or job started without consideration if it completed or is still running.<br/>- Default Period: start on the same day. |
| `isCompleted` | `startedFrom`,<br/>`startedTo`,<br/>`completedFrom`,<br/>`completedTo`,<br/>`count` | `completedFrom=0d`,<br/>`completedTo=0d`,<br/>`count > 0` | - Scope: specifies that the workflow or job completed without consideration of success of failure.<br/>- Arguments: if the argument `startedFrom` is specified, then the default value of the `startedTo` argument is 0d.<br/>- Default Period: start and completion on the same day. |
| `isCompletedSuccessful` | `startedFrom`,<br/>`startedTo`,<br/>`completedFrom`,<br/>`completedTo`,<br/>`count` | `completedFrom=0d`,<br/>`completedTo=0d`,<br/>`count > 0` | - Scope: specifies that the workflow or job completed successfully.<br/>- Arguments: if the argument startedFrom is specified, then the default value of the startedTo argument is 0d.<br/>- Default Period: start and completion on the same day. |
| `isCompletedFailed` | `startedFrom`,<br/>`startedTo`,<br/>`completedFrom`,<br/>`completedTo`,<br/>`count` | `completedFrom=0d`,<br/>`completedTo=0d`,<br/>`count > 0` | - Scope: specifies that the workflow or job failed.<br/>- Arguments: if the argument startedFrom is specified, then the default value of the startedTo argument is 0d.<br/>- Default Period: start and completion on the same day. |
| `lastCompletedSuccessful` | `startedFrom`,<br/>`startedTo`,<br/>`completedFrom`,<br/>`completedTo`,<br/>`count` | `completedFrom=0d`,<br/>`completedTo=0d`,<br/>`count > 0` | - Scope: specifies that the last run of the job completed successfully.<br/>- Arguments: if the argument startedFrom is specified, then the default value of the startedTo argument is 0d.<br/>- Default Period: start and completion on the same day. |
| `lastCompletedFailed` | `startedFrom`,<br/>`startedTo`,<br/>`completedFrom`,<br/>`completedTo`,<br/>`count` | `completedFrom=0d`,<br/>`completedTo=0d`,<br/>`count > 0` | - Scope: specifies that the last run of the workflow or job failed.<br/>- Arguments: if the argument startedFrom is specified, then the default value of the startedTo argument is 0d.<br/>- Default Period: start and completion on the same day. |

#### Function Arguments

| Argument | Default | Explanation |
| :--- | :--- | :--- |
| `startedFrom` | `0d` | The workflow or job started after the given date. |
| `startedTo` | `0d` | The workflow or job started before the given date. |
| `completedFrom` | `0d` | The workflow or job completed after the given date. |
| `completedTo` | `0d` | The workflow or job completed before the given date. |
| `count` | `count > 0` | Count is used with an operator. The number of history items that is expected to be returned for the given period. By default at least one history item is expected (`count > 0`). The *CheckHistoryJob* will fail if the number of expected history entries specified by this argument not correspond to the number of history items returned.<br/><br/>Values for operator: `=, <=, <, >, >=`<br/><br/>Example `count > 10`<br/>The *CheckHistoryJob* will fail if the number of history entries is not greater then 10. |

#### Absolute Dates

Absolute date can be specified as values to the startedFrom, startedTo, completedFrom and completedTo arguments.

Dates are specified in ISO-8601 format like this:

- `2021-12-05`
  - The date is specified as yyyy-MM-dd
  - The time is assumed to be midnight UTC time.
- `2021-12-05T01:30:15`
  - The date and time are separated by the T character.
  - The time is specified as hh:mm:ss.
  - The time zone is assumed to be UTC.
- `2021-12-05T01:00:00+02:00`
  - In addition to date and time the time zone offset is specified. A + character specifies a positive offset to UTC time, a - character specifies a negative offset.

#### Relative Dates

Relative dates can be specified as values to the `startedFrom`, `startedTo`, `completedFrom` and `completedTo` arguments.

Relative dates are specified like this:

- `-1s`, `-2s`
  - one second ago, two seconds ago
- `-1m`, `-2m`
  - one minute ago, two minutes ago
- `-1h`, `-2h`
  - one hour ago, two hours ago
- `-1d`, `-2d`
  - one day ago, two days ago
- `-1w`, `-2w`
  - one week ago, two weeks ago
- `-1M`, `-2M`
  - one month ago, two months ago
- `-1y`, `-2y`
  - one year ago, two years ago
</article>

## Argument: workflow
<article id="workflow">
´
Specifies the name of a workflow for which the execution history is looked up. A workflow name or job name can be specified. This includes use of `*` and `?` wildcards:

- `*`: matches zero or more characters
- `?`: matches any single character
</article>

## Argument: job
<article id="job">
´
Specifies the name of a job for which the execution history is looked up. A workflow name or job name can be specified. This includes use of `*` and `?` wildcards:

- `*`: matches zero or more characters
- `?`: matches any single character
</article>

## Argument: controller_id
<article id="controller_id">

The identifier of a Controller can be specified to limit results to workflows and jobs executed with the indicated Controller.
</article>

# Return Variables

## Return Variable: js7CheckHistoryResult
<article id="js7CheckHistoryResult">

Returns the Boolean result of the query.

Note: The query result is similarly returned with the *returnCode* return variable and the values 0=true, 1=false.
</article>

## Return Variable: js7CheckHistoryResultControllerId
<article id="js7CheckHistoryResultControllerId">

Returns the Controller ID of the resulting history entry.

The value of the return variable is empty if the query returns no result. If the query returns a result then the return variable holds the Controller ID of the youngest resulting history entry.
</article>

## Return Variable: js7CheckHistoryResultWorkflow
<article id="js7CheckHistoryResultWorkflow">

Returns the workflow name of the resulting history entry.

The value of the return variable is empty if the query returns no result.
If the query returns a result then the return variable holds the workflow name of the youngest resulting history entry.
</article>

## Return Variable: js7CheckHistoryResultJob
<article id="js7CheckHistoryResultJob">

Returns the job name of the resulting history entry.

The value of the return variable is empty if the query returns no result.
If the query returns a result then the return variable holds the job name of the youngest resulting history entry.
</article>

## Return Variable: js7CheckHistoryResultStarted
<article id="js7CheckHistoryResultStarted">

Returns the start date and time of the resulting history entry.

The value of the return variable is empty if the query returns no result. If the query returns a result then the return variable holds the start date and time of the youngest resulting history entry in ISO-8601 format.
</article>

## Return Variable: js7CheckHistoryResultCompleted
<article id="js7CheckHistoryResultCompleted">

Returns the completion date and time of the resulting history entry.

The value of the return variable is empty if the query returns no result. If the query returns a result then the return variable contains the completion date and time of the youngest resulting history entry in ISO-8601 format
</article>

## Return Variable: js7CheckHistoryQuery
<article id="js7CheckHistoryQuery">

Returns the value of the *query* argument.

Returns a copy of the value of the *query* argument that was used with the query.
</article>

## Return Variable: js7CheckHistoryQueryControllerId
<article id="js7CheckHistoryQueryControllerId">

Returns the value of the *controller_id* argument.

Returns a copy of the value of the *controller_id* argument that was used with the query.
</article>

## Return Variable: js7CheckHistoryQueryWorkflow
<article id="js7CheckHistoryQueryWorkflow">

Returns the value of the *workflow* argument.

Returns a copy of the value of the *workflow* argument that was used with the query.
</article>

## Return Variable: js7CheckHistoryQueryJob
<article id="js7CheckHistoryQueryJob">

Returns the value of the *job* argument.

Returns a copy of the value of the *job* argument that was used with the query.
</article>