# Initial Operation - Register Subagent Cluster

Initial Operation is performed after installation of the JS7 Controller, Agent and JOC Cockpit. Registration of a Subagent Cluster occurs after [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster) is completed.

## Architecture

### Agents

- **Standalone Agents** execute Jobs on remote machines on-premises and from containers. They are operated individually and are managed by the Controller.
- **Agent Cluster**
  - **Director Agents** orchestrate *Subagents* in an Agent Cluster. They are operated from two instances in active-passive clustering and are managed by the Controller.
  - **Subagents** execute Jobs on remote machines on-premises and from containers. They can be considered worker nodes in an Agent Cluster and are managed by *Director Agents*.

### Connections

- **Standalone Agent**, **Director Agent** connections are established by the Controller. 
- **Subagent** connections in an Agent Cluster are established by *Director Agents*.

## Register Subagent Cluster

Registration of a Subagent Cluster includes registering

- the *Selection* of Director Agents and Subagents in an Agent Cluster
- the *Sequence* in which Subagents will be operated
  - *active-active*: each next Job will be executed with the next Subagent. This means that all selected Subagents are involved. For details see - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster).
  - *active-passive*: only the first Subagent will be used for job execution. If it is unavailable, then the next Subagent will be used. For details see [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster).
  - *metrics-based*: based on rules such as CPU and memory consumption, the next Subagent will be selected for job execution. For details see [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster).

For details see [Initial Operation - Subagent Cluster](/initial-operation-agent-subagent-cluster)

## References

### Context Help

- [Dashboard - Product Status](/dashboard-product-status)
- [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster)
- [Initial Operation - Register Controller](/initial-operation-register-controller)
- [Initial Operation - Register Subagent](/initial-operation-register-agent-subagent)
- [Initial Operation - Subagent Cluster](/initial-operation-agent-subagent-cluster)

### Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
  - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster)
  - [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster)
  - [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster)
