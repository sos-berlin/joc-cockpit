# Deployment History

The *Deployment History* view summarizes deployments of inventory objects performed from the [Configuration](/configuration) view.

JS7 implements a distributed architecture that allows running Jobs of the same Workflow on different Agents and platforms. Successful deployment includes each Agent's confirmation of new and updated objects which arrives asynchronously.

When using the *deploy* operation in the *Configuration* view, then confirmation will arrive depending on Agent availability. For example, a shutdown Agent will confirm  deployment when it is restarted which might happen some time later.

The *Deployment History* is updated asynchronously to reflect the deployment status of inventory objects.

## Display

### History of Deployments

Display is groupd in one block per deployment and in blocks per inventory object.

- **Deployment Date** indicates the point in time of deployment.
- **Account** indicates the JOC Cockpit user account that performed the deployment operation.
- **Status** indicates if deployment was successful or failed.
  - *Deployed* indicates that all inventory objects were successfully deployed.
  - *Not Deployed* indicates that one or more inventory objects could not be desployed.
- **Number of Items** indicates the number of inventory objects such as Workflows, Job Resources etc. in scope of deployment.

### History of Deployments per Inventory Object

When clicking the arrow-down icon from the *Deployment Date* then details per inventory object will be displayed:

- **Message** indicates an error message in case of failed deployment.
- **Object Type** indicates the inventory object type such as *Workflow*, *Job Resource* etc.
- **Path** indicates the inventory object name and folder. For Workflow objects
  - clicking the Workflow name navigates to the [Workflows](/workflows) view,
  - clicking the pencil icon navigates to the [Configuration - Workflows](/configuration-workflows) view.
- **Operation** is one of *store* or *delete*. Updated objects occur with both operations.
- **Date** indicates the point in time of the deployment operation.

## References

- [Workflows](/workflows)
- [Configuration - Workflows](/configuration-workflows)
- [JS7 - Deployment of Scheduling Objects](https://kb.sos-berlin.com/display/JS7/JS7+-+Deployment+of+Scheduling+Objects)
