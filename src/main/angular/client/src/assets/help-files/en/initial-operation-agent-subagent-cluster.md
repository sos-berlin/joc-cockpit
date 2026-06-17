# Initial Operation - Subagent Cluster

Initial Operation is performed after installation of the JS7 Controller, Agent and JOC Cockpit. Registration of a Subagent Cluster occurs after [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster) is completed.

## Subagent Cluster

Configuration of a Subagent Cluster includes

- the *Selection* of Director Agents and Subagents in an Agent Cluster
- the *Sequence* in which Subagents will be operated
  - *active-passive*: only the first Subagent will be used for job execution. If the Subagent is unavailable, then the next Subagent will be used. For details see [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster).
  - *active-active*: each next Job will be executed with the next Subagent. This means that all selected Subagents are involved. For details see - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster).
  - *metrics-based*: based on rules such as CPU and memory consumption, the next Subagent will be selected for job execution. For details see [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster).

### Selection of Agents

In the left panel users find the list of Subagents including Director Agents that are available for selection.

Subagents can be dragged & dropped to the right panel into the related drag area. To unselect a Subagent, it can be dragged & dropped in the right panel to the drag area indicated *Drop here to remove Subagent*.

### Sequence of Agents

The sequence of Subagents determines the type of cluster:

#### Active-passive Subagent Cluster

Subagents are dragged & dropped to the *same column*:

- Subagents in the same column specify an active-passive cluster (fixed-priority) in which the first Subagent will be used for any jobs as long as it is available. Only when the first Subagent is unavailable, then the next Subagent will be used.
- For details see [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster).

#### Active-active Subagent Cluster

Subagents are dragged & dropped to the *same row*:

- Subagents in the same row specify an active-active cluster (round-robin) in which each next job will be executed with the next Subagent.
- For details see [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster).

#### Metrics-based Subagent Cluster

Subagents are dragged & dropped to the *same row* and are assigned a *Metrics-based Priority*:

- Subagents in the same row specify a metrics based priority:
    - Hovering the mouse on the Subagent's rectangle offers its 3-dots action menu: the *Metrics-based Priority* action allows specifying the priority from an expression.
- For details see [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster).

Expressions for metric-based priorities:

| Indicator Variable | Metric |
| ----- | ----- |
| $js7SubagentProcessCount | Number of processes running with the Subagent. |
| $js7ClusterSubagentProcessCount | Number of processes for the given Subagent Cluster running with the Subagent. |
|      | The following indicators are available as explained with https://docs.oracle.com/en/java/javase/17/docs/api/jdk.management/com/sun/management/OperatingSystemMXBean.html |
| $js7CpuLoad | Returns the "recent cpu usage" for the operating environment. This value is a double in the [0.0,1.0] interval. A value of 0.0 means that all CPUs were idle during the recent period of time observed, while a value of 1.0 means that all CPUs were actively running 100% of the time during the recent period being observed. All values betweens 0.0 and 1.0 are possible depending of the activities going on. If the recent cpu usage is not available, the method returns a negative value. A negative value is reported as missing. CPU load is not available for MacOS and is reported as missing. |
| $js7CommittedVirtualMemorySize | Returns the amount of virtual memory that is guaranteed to be available to the running process in bytes, or -1 if this operation is not supported. A negative value is reported as missing. |
| $js7FreeMemorySize | Returns the amount of free memory in bytes. Returns the amount of free memory. |
| $js7TotalMemorySize | Returns the total amount of memory in bytes. Returns the total amount of memory |

## References

### Context Help

- [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster)
- [Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster)

### Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
  - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster)
  - [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster)
  - [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster)
