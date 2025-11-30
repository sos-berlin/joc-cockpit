# Monitor Service

The Monitor Service is used to report the health of JS7 products and to report problems in Workflow execution. The Monitor Service populates the *Monitor* sub-views in JOC Cockpit:

- checking availability of JS7 products and reporting to the [Monitor - Controller Availability](/monitor-availability-controller) and [Monitor - Agent Availability](/monitor-availability-agent) sub-views.
- checking connected Controllers and Agents for warnings and errors raised during operation of the products. Results are added to the [Monitor - System Notifications](/monitor-notifications-system) sub-view.
- checking the results of Workflow execution and Job execution from any connected Controllers and adding notifications to the [Monitor - Order Notifications](/monitor-notifications-order) view.

As a result, errors and warnings that occur during Workflow execution will become visible in the *Monitor* sub-views of the GUI and can be forwarded by [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications). Due to the asynchronous nature of JS7 products this task is performed by a background service.

The Monitor Service is started automatically on start-up of JOC Cockpit. It can be restarted in the Dashboard view from the active JOC Cockpit instances' rectangle offering the *Restart Service - Monitor Service* operation.

<img src="dashboard-restart-monitor-service.png" alt="Restart Monitor Service" width="750" height="280" />

## References

### Context Help

- [Monitor - Agent Availability](/monitor-availability-agent)
- [Monitor - Controller Availability](/monitor-availability-controller)
- [Monitor - Order Notifications](/monitor-notifications-order)
- [Monitor - System Notifications](/monitor-notifications-system)

### Product Knowledge Base

- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Monitor Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor+Service)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
