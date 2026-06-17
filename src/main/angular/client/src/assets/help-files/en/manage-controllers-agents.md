# Manage Controller and Agents

The *Manage Controller/Agents* page is used 

- to register Standalone Controllers and Controller Clusters,
- to register Standalone Agents with Controllers,
- to register Cluster Agents with Controllers,
  - specifying a Cluster of *Director Agents*
  - specifying any number of *Subagents* that act as worker nodes.
  - specifying any number of *Subagent Clusters* that rule use of Agents and that can be assigned Jobs in Workflows.

Operation of a Controller Cluster or Agent Cluster is subject to the agreements of the [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License).

## Register Controller

The operation to register a Controller is available from the *New Controller* button. During initial operation when JOC Cockpit is used for the first time, the pop-up window to register a Controller is automatically displayed.

For explanations see [Initial Operation - Register Controller](/initial-operation-register-controller).

## Operations on Controllers

For an existing Controller the following operations are offered from its 3-dots action menu:

- **Edit** allows modifying a Controller's properties including the URLs of Controller instances.
- **Add Standalone Agent** offers registering an autonomous Agent.
  - For explanations see [Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone).
- **Add Cluster Agent** offers registering a Cluster of Agents. 
  - The operation includes specifying *Director Agents* and *Subagents*.
  - For explanations see [Initial Operation - Register Cluster Agent](/initial-operation-register-agent-cluster).
- **Create one-time token** 
- **Export Agent Configuration** offers for download an export file in JSON format holding Agent configurations of the selected Controller.
- **Import Agent Configuration** offers uploading an export file in JSON format holding previously exported Agent configurations. Related Agents will be registered with the Controller.
- **Delete** allows deleting the Controller configuration including all Agent configurations. This will not wipe the Controller and Agents from disk but drops the configuration in JOC Cockpit.

## Filters

The following filter buttons for Agents are available from the top of the screen:

- **All Agents** displays all Agent configurations independently from their deployment status.
- **Synchronized** displays Agent configurations that have been deployed to a Controller.
- **Not Synchronized** displays Agent configurations for which changes have not been deployed to a Controller.
- **Not Deployed** displays Agent configurations that have not been initially deployed to a Controller.
- **Unknown** displays Agent configurations in an unknown status, for example after a Controller is reinitialised. Users should deploy the Agent configuration.

## References

### Context Help

- [Initial Operation - Register Cluster Agent](/initial-operation-register-agent-cluster)
- [Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone)
- [Initial Operation - Register Controller](/initial-operation-register-controller)

### Product Knowledge Base

- [JS7 - How to troubleshoot Controller Cluster Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Controller+Cluster+Initial+Operation)
- [JS7 - Initial Operation for Controller Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Controller+Cluster)
- [JS7 - Initial Operation for Standalone Controller](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Standalone+Controller)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)
