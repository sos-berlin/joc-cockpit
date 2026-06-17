# Configuration - Inventory - Operations - Deploy Object

Deploying objects includes to transfer them to one or more Controllers. This applies to objects such as Workflows and Job Resources available from the *Controller* system folder.

The *Configuration->Inventory* view offers deploying a single object and deploying objects from folders, see [Deploy Folder](/configuration-inventory-operations-deploy-folder).

When deploying a single object from the related *Deploy* button, a pop-up window will be displayed like this:

<img src="deploy-workflow.png" alt="Deploy Workflow" width="600" height="460" />

## Deploying to Controllers

The **Controller** input field accepts one or more Controllers to which the object will be deployed.

By default the currently selected Controller will be used.

## Updating the Daily Plan

Deployment of objects such as Workflows, Schedules and Calendars impacts the [Daily Plan](/daily-plan). Frequently, the updated version of an object should be used for Orders in the Daily Plan. Users control the behavior from the following options:

- **Update Daily Plan**
  - **Now** specifies updating the Daily Plan for Orders scheduled for a point in time starting from now.
  - **Start Date** when selected will add an input field for the target date starting from which the Daily Plan will be updated.
  - **No** specifies that the Daily Plan will not be updated. Existing Orders will stick to using previously deployed versions of objects.
- **Include today's late Orders** when checked this will include Orders that have been scheduled for a past time in the current day but that are delayed and did not start.

## Including Dependencies

Inventory objects are related by dependencies, see [Dependency Matrix](/dependencies-matrix). For example, a Workflow referencing a Job Resource and a Resource Lock; a Schedule referencing a Calendar and one or more Workflows.

When deploying objects, consistency is considered, for example:

- If a Job Resource is created and is referenced by a newly created Workflow, then deployment of the Workflow includes deploying the Job Resource.
- If a Job Resource is referenced by a deployed Workflow and should be revoked or removed, then the Workflow must be revoked or removed too.

Users control consistent deployment from the following options:

- **Include Dependencies**
  - when checked, this will include both referencing and referenced objects.
    - If related objects are in draft status, then common deployment is offered. It will be enforced, if required by changes to object relationships.
    - If related objects are in deployed/released status, then common deployment is optional. Users can select related objects for common deployment.
  - when unchecked, this will not consider dependencies. Users must verify if related objects are valid and deployed/released. The Controller will raise error messages in case of missing objects due to inconsistent deployment.

## References

### Context Help

- [Configuration - Inventory - Operations - Deploy Folder](/configuration-inventory-operations-deploy-folder)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Dependency Matrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
