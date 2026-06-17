# Initial Operation - Register Agent Cluster

Initial Operation is performed after installation of the JS7 Controller, Agent and JOC Cockpit. Registration of an Agent Cluster occurs after [Initial Operation - Register Controller](/initial-operation-register-controller) is completed.

Operation of an Agent Cluster is subject to the agreements of the [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License).

- Use of Standalone Agent:
  - available to Open Source License holders and to commercial license holders.
- Use of Agent Cluster:
  - available to commercial license holders,
  - for details see [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)

## Architecture

### Agents

- **Standalone Agents** execute Jobs on remote machines on-premises and from containers. They are operated individually and are managed by the Controller.
- **Agent Cluster**
  - **Director Agents** orchestrate *Subagents* in an Agent Cluster. They are operated from two instances in active-passive clustering and are managed by the Controller.
  - **Subagents** execute Jobs on remote machines on-premises and from containers. They can be considered worker nodes in an Agent Cluster and are managed by *Director Agents*.

### Connections

- **Standalone Agent**, **Director Agent** connections are established by the Controller. 
- **Subagent** connections in an Agent Cluster are established by *Director Agents*.

## Register Agent Cluster

Registration of an Agent Cluster includes to register the Primary and Secondary Director Agents. For later registration of Subagents see - [Initial Operation - Register Subagent](/initial-operation-register-agent-subagent).

Prerequisites before installation include:

- JOC Cockpit, Controller and all Director Agent instances must be equipped with a valid JS7 license key.
- The Secondary Director Agent must hold in its ./config/agent.conf file the setting: *js7.journal.cluster.node.is-backup = yes*
- Both Primary and Secondary Director Agent instances must be up and running.

Users should verify that network connections from the Controller's server to both Director Agents' servers are available and that firewall rules allow connections to the Director Agents' ports.

The *Manage Controllers/Agents* page is available from the wheel icon in the main menu bar and offers the *Add Agent Cluster* operation from the Controller's action menu. This brings up the pop-up window for registration of an Agent Cluster.

Users provide the following inputs:

- **Agent ID** is the unique identifier of the Agent Cluster that cannot be changed during the Cluster's lifetime. The *Agent ID* is not visible with Jobs and Workflows.
  - Hint: Use a unique name such as *agent-cluster-001*.
- **Agent Cluster Name** is the unique name of an Agent Cluster. When assigning a Job an Agent then the *Agent Cluster Name* is used.
  - Hint: If you use separate environments for production and non-production, you should use the same *Agent Cluster Name* for both. Therefore, enter a descriptive name, e.g., for a business department such as *sales*, *finance* etc.
  - Hint: Changing the *Agent Cluster Name* later on offers continuing use of the previous *Agent Cluster Name* from an *Alias Name*.
- **Title** is a description that can be added for an Agent Cluster.
- **Alias Names** are alternative names for the same Agent Cluster. When assigning a Job an Agent, then *Alias Cluster Names* will be offered too. *Alias Cluster Names* can be used for example, if a test environment includes fewer Agent Clusters than the production environment: to keep Agent assignments unchanged between environments, the missing Agent Clusters are mapped from *Alias Cluster Names* of the same Agent Cluster.
- **Primary Director Agent**
  - **Subagent ID** is the unique identifier of the Primary Director Agent that cannot be changed during the Director Agent's lifetime. The *Subagent ID* is not visible with Jobs and Workflows.
    - Hint: Use a unique name such as the FQDN of the host and the port of the Subagent.
  - **Title** is a description that can be added for a Director Agent.
  - **URL** expects the URL from protocol, host and port used by the Controller to connect to the Primary Director Agent, for example http://localhost:4445.
    - The URL starts from the *http* protocol if the Director Agent makes use of plain HTTP. The *https* protocol is used, if the Director Agent is configured for HTTPS.
    - The hostname can be *localhost* if the Director Agent is installed on the same machine as the Controller. Otherwise the FQDN of the Director Agent's host should be specified.
    - The Director Agent's *port* is determined during installation. 
  - **As own Subagent Cluster** optionally creates Subagent Clusters for each Primary and Secondary Director Agent, see [Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster).
- **Secondary Director Agent**
  - **Subagent ID** is the unique identifier of the Secondary Director Agent that cannot be changed during the Director Agent's lifetime. The *Subagent ID* is not visible with Jobs and Workflows.
    - Hint: Use a unique name such as the FQDN of the host and the port of the Subagent.
  - **Title** is a description that can be added for a Director Agent.
  - **URL** expects the URL from protocol, host and port used by the Controller to connect to the Secondary Director Agent similarly as for the *Primary Director Agent*.

After successful registration the Agent will be displayed from the [Resources - Agents](/resources-agents) view.

## References

### Context Help

- [Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone)
- [Initial Operation - Register Subagent](/initial-operation-register-agent-subagent)
- [Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster)
- [Initial Operation - Register Controller](/initial-operation-register-controller)

### Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - How to troubleshoot Agent Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Agent+Initial+Operation)
- [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)
