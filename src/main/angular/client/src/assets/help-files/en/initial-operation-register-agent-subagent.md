# Initial Operation - Register Subagent

Initial Operation is performed after installation of the JS7 Controller, Agent and JOC Cockpit. Subagent registration occurs after [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster) is completed.

## Architecture

### Agents

- **Standalone Agents** execute Jobs on remote machines on-premises and from containers. They are operated individually and are managed by the Controller.
- **Agent Cluster**
  - **Director Agents** orchestrate *Subagents* in an Agent Cluster. They are operated from two instances in active-passive clustering and are managed by the Controller.
  - **Subagents** execute Jobs on remote machines on-premises and from containers. They can be considered worker nodes in an Agent Cluster and are managed by *Director Agents*.

### Connections

- **Standalone Agent**, **Director Agent** connections are established by the Controller. 
- **Subagent** connections in an Agent Cluster are established by *Director Agents*.

## Register Subagent

Users should verify that network connections from the Director Agents' servers to the Subagent's server are available and that firewall rules allow connections to the Subagent's port.

The *Manage Controllers/Agents* page is available from the wheel icon in the main menu bar and offers the *Add Subagent* operation from the Agent Cluster's action menu. This brings up the pop-up window for registration of a Subagent.

Users provide the following inputs:

- **Subagent ID** is the unique identifier of a Subagent that cannot be changed during the Subagent's lifetime. The *Subagent ID* is not visible with Jobs and Workflows.
  - Hint: Use a unique name such as the FQDN of the host and the port of the Subagent.
- **Title** is a description that can be added for a Subagent.
- **URL** expects the URL from protocol, host and port used by Director Agents to connect to the Subagent, for example http://localhost:4445.
  - The URL starts from the *http* protocol if the Subagent makes use of plain HTTP. The *https* protocol is used, if the Subagent is configured for HTTPS.
  - The hostname can be *localhost* if the Subagent is installed on the same machine as the Director Agents. Otherwise the FQDN of the Subagent's host should be specified.
  - The Subagent's *port* is determined during installation. 
  - **As own Subagent Cluster** optionally creates a Subagent Cluster for the Subagent, see [Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster).

After successful registration the Subagent will be displayed from the [Resources - Agents](/resources-agents) view.

## References

### Context Help

- [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster)
- [Initial Operation - Register Controller](/initial-operation-register-controller)
- [Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster)

### Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
- [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)
