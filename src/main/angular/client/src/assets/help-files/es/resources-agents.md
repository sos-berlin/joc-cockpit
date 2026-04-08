# Resources - Agents

The *Agent* view summarizes the connection status of registered Agents.

## Architecture

### Agents

- **Standalone Agents** execute Jobs on remote machines on-premises and from containers. They are operated individually and are managed by the Controller.
- **Agent Cluster**
  - **Director Agents** orchestrate *Subagents* in an Agent Cluster. They are operated from two instances in active-passive clustering and are managed by the Controller.
  - **Subagents** execute Jobs on remote machines on-premises and from containers. They can be considered worker nodes in an Agent Cluster and are managed by *Director Agents*.

### Connections

- **Standalone Agent**, **Director Agent** connections are established by the Controller. 
- **Subagent** connections in an Agent Cluster are established by *Director Agents*.

## Connection Status

Agent status display makes use of the following color indicators:

- **Green Color** indicates healthy Agent connections.
- **Yellow Color** indicates Agents that are currently resetting, this means they are initializing their journal and are restarting.
- **Red Color** indicates failed connections to Agent's, for example if the Agent cannot be reached.
- **Grey Color** indicates an *unknown* connection status, for example if a Director Agent cannot be reached, then for Subagents the status is *unknown*.

Users should consider the following implications:

- If an Agent connection is considered failed, then this does not confirm that the Agent is down. There can be network issues that prevent the connection.
- The JOC Cockpit receives information about the Agent connection status from the Controller. If the Controller is not available then this information is not present. This does not mean that Agents are down, but it means that Agents will be indicated from an *unknown* status.
- The Controller reports connections to *Standalone Agents* and to *Director Agents*. Failed connections to *Director Agents* suggest that the Controller does not know the status of *Subagents* in the Agent Cluster that is accordingly indicated being *unknown*.

## References

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
