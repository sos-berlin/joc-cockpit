# Initial Operation - Register Controller

Initial Operation is performed after installation of the JS7 Controller, Agent and JOC Cockpit.

Operation of a Controller Cluster is subject to the agreements of the [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License).

- Use of Standalone Controller:
  - available to Open Source License holders and to commercial license holders.
- Use of Controller Cluster:
  - available to commercial license holders,
  - for details see [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)

For a Standalone Controller initial operation includes

- registering a Standalone Controller,
- registering Agents, see [Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone) and [Initial Operation - Register Cluster Agent](/initial-operation-register-agent-cluster).

For a Controller Cluster initial operation includes

- registering a Controller Cluster,
- registering Standalone Agents or Cluster Agents.

## Register Controller

After first login a pop-up window is displayed that offers registering a Controller. The pop-up window similarly is available from the wheel icon in the main menu bar selecting the *Manage Controllers/Agents* page.

The pop-up window offers registration of a Standalone Controller. Registration of a Controller Cluster is offered if a JS7 license key is in place for JOC Cockpit. Clicking the JS7 logo in the upper-left corner of the JOC Cockpit GUI will display the license type in use.

Users should verify that network connections from JOC Cockpit's server to the Controller's server are available and that firewall rules allow connections.

After successful registration Controller instances will be displayed from the *Dashboard* view.

### Register Standalone Controller

Users provide the following inputs:

- **Caption** is the title of the Controller that will be displayed with the Controller's rectangle in the [Dashboard - Product Status](/dashboard-product-status) panel.
- **JOC Cockpit Connection to Controller** expects the URL from protocol, host and port used by JOC Cockpit to connect to the Controller, for example http://localhost:4444.
  - The URL starts from the *http* protocol if the Controller makes use of plain HTTP. The *https* protocol is used, if the Controller is configured for HTTPS.
  - The hostname can be *localhost* if the Controller is installed on the same machine as JOC Cockpit. Otherwise the FQDN of the Controller's host should be specified.
  - The Controller's *port* is determined during installation. 

When the registration information is submitted, JOC Cockpit will establish a connection to the Standalone Controller.

### Register Controller Cluster

Prerequisites before installation include:

- JOC Cockpit and all Controller instances must be equipped with a valid JS7 license key.
- The Secondary Controller must hold in its ./config/controller.conf file the setting: *js7.journal.cluster.node.is-backup = yes*
- Both Primary and Secondary Controller instances must be up and running.

Users provide the following inputs:

- **Primary Controller** is the Controller instance that initially will be assigned the active role. The active role can be switched later on.
  - **Caption** is the title of the Controller that will be displayed with the Controller's rectangle in the [Dashboard - Product Status](/dashboard-product-status) panel.
  - **JOC Cockpit Connection to Primary Controller** expects the URL from protocol, host and port used by JOC Cockpit to connect to the Primary Controller, for example http://primary-server:4444.
  - **Secondary Controller connection to Primary Controller** in most situations is the same as *JOC Cockpit Connection to Primary Controller*. A different URL is applied if a Proxy Server is operated between Primary and Secondary Controller. The URL is used by the Secondary Controller to connect to the Primary Controller.
- **Secondary Controller** is the Controller instance that initially will be assigned the standby role.
  - **Caption** is the title of the Controller that will be displayed with the Controller's rectangle in the [Dashboard - Product Status](/dashboard-product-status) panel.
  - **JOC Cockpit Connection to Secondary Controller** expects the URL from protocol, host and port used by JOC Cockpit to connect to the Secondary Controller, for example http://secondary-server:4444.
  - **Primary Controller connection to Secondary Controller** in most situations is the same as *JOC Cockpit Connection to Secondary Controller*. A different URL is applied if a Proxy Server is operated between Primary and Secondary Controller. The URL is used by the Primary Controller to connect to the Secondary Controller.

When the registration information is submitted, JOC Cockpit will establish a connection to both Primary and Secondary Controller instances.

## References

### Context Help

- [Dashboard - Product Status](/dashboard-product-status)
- [Initial Operation - Register Cluster Agent](/initial-operation-register-agent-cluster)
- [Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone)

### Product Knowledge Base

- [JS7 - How to troubleshoot Controller Cluster Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Controller+Cluster+Initial+Operation)
- [JS7 - Initial Operation for Controller Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Controller+Cluster)
- [JS7 - Initial Operation for Standalone Controller](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Standalone+Controller)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)
