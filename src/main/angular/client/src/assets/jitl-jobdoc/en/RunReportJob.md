# Job: RunReportJob
<summary>
Generates reports about job and order execution.
</summary>

# Purpose
<detail>

The job generate reports for a given period from predefined templates.

- Successful and failed execution of orders.
- Successful and failed exeuction of jobs.
- Parallelism of workflows and jobs.
- Uses of Agents.
</detail>

# Arguments

## Argument: report_paths
<article id="report_paths">

Specifies the list of reports that should be created. Report names are seperated by semicolon. Entries for reports that do not exist are ignored.

If the argument value is empty and the *report_folders* argument value is empty, then all reports will be generated.
</article>

## Argument: report_folders
<article id="report_folders">

Specifies the list of folders holding reports reports that should be created. Folder names are seperated by semicolon. 

A folder is processed recursively if the name ends with /\*.

If the argument value is empty and the *report_paths* argument value is empty, then all reports will be generated.
</article>

# Return Variables

The job does not return variables.
