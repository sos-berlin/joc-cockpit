# Dashboard - Controller Status

The *Controller Status* panel provides information about registered Controllers.

## Controller Instances

Each Controller instance displayed offers the following attributes:

- **Controller ID** indicates a unique identifier specified when a Controller is installed. In a Controller Cluster all instances share the same Controller ID.
- **URL** specifies the URL by which the Controller instance can be reached.
- **Status** indicates the component status being *operational* or *unknown* if the Controller instance cannot be reached.
- **Cluster Role** indicates the *active* or *standby* role of a Controller instance in a cluster.

Clicking the Controller ID of an instance will switch the dashboard to display the product status of the related Controller.

## Operations on Controller Instances

The following operations are available:

Controller instances offer the following operations from the 3-dots action menu of each instance:

- **Terminate**, **Terminate and Restart** will shutdown the instance. For the active instance in a cluster the menu is expanded:
  - **with switch-over** to pass the active role to the standby instance.
  - **without switch-over**: to have the active role remain with the shutdown instance. Users should be aware that no fail-over will take place and that no instance will be active.
- **Cancel**, **Cancel and Restart** will forcibly terminate the instance. If applied to the active instance in a cluster, this will force fail-over:
  - **with fail-over** will pass the active role to the standby instance.
- **Download Log** offers the Controller's controller.log file for download from a .gz file in gzipped format.

## References

- [Dashboard - Product Status](/dashboard-product-status)
