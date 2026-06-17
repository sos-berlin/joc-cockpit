# Product Status

The Product Status panel provides information about the following JS7 products:

- **JOC Cockpit** is used to monitor and control the scheduling environment and to manage the job inventory.
- **Controller** orchestrates Agents and manages deployment of Orders, Workflows and Jobs.
- **Agents** execute Jobs. 

JS7 products can be operated stand alone and from active-passive clustering.

## Component Status and Connection Status

### JOC Cockpit

The JOC Cockpit connects to the database and to Controller instances.

- Component Status
  - The Component Status is indicated from the color of the tile in the upper-left corner of the JOC Cockpit rectangle.
  - **Tile in Green Color** indicates a healthy JOC Cockpit instance.
  - **Tile in Red Color** indicates an unknown status. 
- Database Connection Status
  - **Line in Green Color** indicates a healthy connection.
  - **Line in Yellow Color** indicates connection problems, for example if JOC Cockpit misses heartbeats to the database.
- Controller Connection Status
  - **Line in Green Color** indicates a healthy connection to the Controller.
  - **Line in Red Color** indicates a failed connection to the Controller.

### Controller

The Controller connects to Agent instances. In a Controller Cluster its members hold bi-directional connections.

- Component Status
  - The Component Status is indicated from the color of the tile in the upper-left corner of the Controller rectangle.
  - **Tile in Green Color** indicates a healthy Controller instance.
  - **Tile in Yellow Color** indicates a running, unhealthy Controller instance, for example in case that coupling failed in a cluster. 
  - **Tile in Red Color** indicates an *unknown* status. 
- Cluster Connection Status
  - **Line in Green Color** indicates a healthy cluster that is actively synchronized between Controller instances.
  - **Line in Yellow Color** indicates a connection to the pairing Controller instance without successful coupling.
  - **Line in Red Color** indicates a failed connection between Controller instances.

## Operations

### JOC Cockpit Operations

Operations offered for all visible, healthy JOC Cockpit instance:

- **Switch-over** in a cluster will pass the active role to the standby instance which can take 20s to ca. 60s. The operation is offered for standby instances.
- **Update URL** allows to modify the display URL. JOC Cockpit might be accessible from a number of URLs and the first used is displayed. If this is not what users want, they can specify the URL that should be displayed. The operation does not change JOC Cockpit's URL but its display.

Operations on JOC Cockpit offered for the instance to which the browser is connected:

- **Restart Services** will restart all services such as Cluster Service, Proxy Service, History Service etc. 
- **Restart Service** allows to restart a specific service:
  - **Cleanup Service** purges the database from outdated information that exceeded its retention period.
  - **Daily Plan Service** creates Orders for the Daily Plan. The service runs once per day to create and to submit Orders to Controller and Agents.
  - **History Service** receives the job history and log output of jobs from the Controller via the *Proxy Service*.
  - **Log Notification Service** is a syslog service that receives errors and warnings from registered Controller and Agent instances.
  - **Monitor Service** creates notifications for the *Monitor* view and optionally sends alerts by mail.
  - **Proxy Service** establishes the connection to the active Controller instance. This allows to send commands to the Controller and to receive the job history and log output of jobs.
- **Run Service** forces a service to run immediately:
  - **Cleanup Service** purges the database.
  - **Daily Plan Service** creates Orders for the Daily Plan. The service can be executed any number of times per day. An individual run will not prevent the service from running at the point in time specified by its settings.
- **Download Log** offers JOC Cockpit's *joc.log* file for download.

### Controller Operations

Controller instances offer the following operations from the 3-dots action menu in each instance's rectangle:

- **Terminate**, **Terminate and Restart** will shutdown the instance. For the active instance in a cluster the menu is expanded:
  - **with switch-over** to pass the active role to the standby instance.
  - **without switch-over**: to have the active role remain with the active instance. Users should be aware that no fail-over will take place and that no instance will be active.
- **Cancel**, **Cancel and Restart** will forcibly terminate the instance. If applied to the active instance in a cluster, this will force fail-over:
  - **with fail-over** will pass the active role to the standby instance.
- **Download Log** offers the Controller's controller.log file for download from a .gz file in gzipped format.

The Cluster Status rectangle offers the following operations from its 3-dots action menu:

- **Switch-over** will pass the active role to the standby instance. The operation is available if the cluster is coupled.
- **Confirm loss of Controller Instance** is applicable if no JOC Cockpit instance was available when a Controller instance in a cluster crashed. JOC Cockpit is required as a witness in the cluster. In this situation users have to check which Controller instance was standby at the time of crash and have to confirm that the standby instance is shutdown to allow the active instance to resume.
