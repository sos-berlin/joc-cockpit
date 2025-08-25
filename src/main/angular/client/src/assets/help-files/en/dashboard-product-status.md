# Product Status

The Product Status panel provides information about the following JS7 products:

- **JOC Cockpit** is used to monitor and control the scheduling environment and to manage the job inventory.
- **Controller** orchestrates Agents and manages deployment of orders, workflows and jobs.
- **Agents** execute jobs. 

JS7 products can be operated standalone and from active-passive clustering.

## Component Status and Connection Status

### JOC Cockpit

The JOC Cockpit connects to the database and to Controller instances.

- Component Status
  - The Component Status is indicated from the color of the tile in the left upper corner of the JOC Cockpit rectangle.
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
  - The Component Status is indicated from the color of the tile in the left upper corner of the Controller rectangle.
  - **Tile in Green Color** indicates a healthy Controller instance.
  - **Tile in Yellow Color** indicates a running, unhealthy Controller instance, for example in case that coupling failed in a cluster. 
  - **Tile in Red Color** indicates an unknown status. 
- Cluster Connection Status
  - **Line in Green Color** indicates a healthy cluster that is actively synchronized between Controller instances.
  - **Line in Yellow Color** indicates a connection to the pairing Controller instance without successful coupling.
  - **Line in Red Color** indicates a failed connection between Controller instances.

## Operations

### JOC Cockpit Operations

Operations on JOC Cockpit are offered for the instance to which the browser is connected:

- **Switch-over** in a cluster will pass the active role to the standby instance which can take 20s to ca. 60s. 
- **Update URL** allows to modify the display URL. JOC Cockpit might be accessbile from a number of URLs and the first used is displayed. If this is not what users want, they can specify the URL that should be displayed. The operation does not change JOC Cockpit's URL but its display.
- **Download Log** offers JOC Cockpit's joc.log file for download from a .gz file in gzipped format.

### Controller Operations

Active and Standby Controller instances in a Cluster offer the following operations from the 3-dots action menu in each Controller rectangle:

- **Terminate**, **Terminate and Restart** will shutdown the instance. For the active instance in a cluster the menu is expanded to
  - **with switch-over** to pass the active role to the standby instance.
  - **without switch-over**: to have the active role remain with the active instance.
- **Cancel**, **Cancel and Restart** will forcibly terminate the instance. If applied to the active instance in a cluster, this will force fail-over.
  - **with fail-over** will pass the active role to the standby instance.
- **Download Log** offers the Controller's controller.log file for download from a .gz file in gzipped format.

The Cluster Status rectangle offers the following operations from its 3-dots action menu:

- **Switch-over** will pass the active role to the standby instance. The operation is available if the cluster is coupled.
- **Confirm loss of Controller Instance** is applicable if no JOC Cockpit instance was available when a Controller instance in a cluster crashed. JOC Cockpit is required as a witness in the cluster. In this siutation users have to check which Controller instance was standby at the time of crash and have to confirm that the standby instance is shutdown to allow the active instance to resume.
