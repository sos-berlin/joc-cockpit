# Initial Operation - Register Standalone Agent

Initial Operation is performed after installation of the JS7 Controller, Agent and JOC Cockpit. Agent registration occurs after [Initial Operation - Register Controller](/initial-operation-register-controller) is completed.

## Register Standalone Agent

Users should verify that network connections from the Controller's server to the Agent's server are available and that firewall rules allow connections to the Agent's port.

The *Manage Controllers/Agents* page is available from the wheel icon in the main menu bar and offers the *Add Standalone Agent* operation from the Controller's action menu. This brings up the pop-up window for registration of a Standalone Agent.

Users provide the following inputs:

- **Agent ID** is the unique identifier of an Agent that cannot be changed during the Agent's lifetime. The *Agent ID* is not visible with Jobs and Workflows.
  - Hint: Use a unique name such as the FQDN of the host and the port of the Agent.
- **Agent Name** is the unique name of an Agent. When assigning a Job an Agent then the *Agent Name* is used.
  - Hint: If you use separate environments for production and non-production, you should use the same *Agent Name* for both. Therefore, enter a descriptive name, e.g., for a business process such as *Invoicing*, *Accounting*, *Reporting*, etc.
  - Hint: Changing the *Agent Name* later on offers continuing use of the previous *Agent Name* from an *Alias Name*.
- **Title** is a description that can be added for an Agent.
- **Alias Names** are alternative names for the same Agent. When assigning a Job an Agent, then *Alias Names* will be offered too. *Alias Names* can be used for example, if a test environment includes fewer Agents than the production environment: to keep Agent assignments unchanged between environments, the missing Agents are mapped from *Alias Names* of the same Agent.
- **URL** expects the URL from protocol, host and port used by the Controller to connect to the Agent, for example http://localhost:4445.
  - The URL starts from the *http* protocol if the Agent makes use of plain HTTP. The *https* protocol is used, if the Agent is configured for HTTPS.
  - The hostname can be *localhost* if the Agent is installed on the same machine as the Controller. Otherwise the FQDN of the Agent's host should be specified.
  - The Agent's *port* is determined during installation. 

After successful registration the Agent will be displayed from the [Resources - Agents](/resources-agents) view.

## References

### Context Help

- [Dashboard - Product Status](/dashboard-product-status)
- [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster)
- [Initial Operation - Register Controller](/initial-operation-register-controller)

### Product Knowledge Base

- [JS7 - How to troubleshoot Agent Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Agent+Initial+Operation)
- [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)
