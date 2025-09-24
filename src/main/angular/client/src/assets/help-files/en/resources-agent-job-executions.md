# Agent Job Executions

The *Agent Job Executions* view summarizes job executions for Agents in a given period.

Agents come in the following flavors:

- **Standalone Agents** execute Jobs on remote machines on-premises and from containers. They are operated individually and are managed by the Controller.
- **Agent Cluster**
  - **Director Agents** orchestrate *Subagents* in an Agent Cluster. In addition they can be used to execute Jobs.
  - **Subagents** execute Jobs on remote machines on-premises and from containers. They can be considered worker nodes in an Agent Cluster and are managed by *Director Agents*.

## Agent Job Executions Panel

The following information is displayed:

- **Agent Name** is the unique name of an Agent.
- **URL** is the URL by which the Agent can be reached from the Controller.
- **Number of successfully executed tasks** is what the title suggests.
- **Number of tasks executed** includes successful and failed job executions.

## Exporting Agent Job Executions

Users can export the summary information displayed to an Excel file in .xlsx format. Active filters and sort order will be applied to export.

## Filters

User's can apply filters available on top of the window to limit the summary of job executions:

- **Date Range** filter buttons offer choosing the date range for summary of job executions.
- **Current Controller** checkbox limits job executions to Agents registered with the currently selected Controller.

## Advanced Filter

The *Advanced Filter* offers filter criteria for a wider date range, for specific Agent instances and Controller instances.

The *Advanced Filter* allows exporting data subject to the criteria specified.

## References

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
