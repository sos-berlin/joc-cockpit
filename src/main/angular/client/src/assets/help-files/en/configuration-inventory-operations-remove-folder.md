# Configuration - Inventory - Operations - Remove Folder

Removing objects includes to delete them from Controllers and from the inventory. This applies to objects such as Workflows and Schedules available from the *Controller* and *Automation* system folders.

Removing a folder includes to remove sub-folders recursively. Removed objects remain available in the Inventory trash.

The *Configuration->Inventory* view offers removing a single object, see [Configuration - Inventory - Operations - Remove Object](/configuration-inventory-operations-remove-object), and removing objects from folders.

When removing a folder using the *Remove* operation available from the folder's 3-dots action menu in the navigation panel, a pop-up window will be displayed like this:

<img src="remove-folder.png" alt="Remove Folder" width="600" height="560" />

## Removing Objects from Controllers

When removing objects, they will be removed from all Controllers to which they have been deployed.

## Updating the Daily Plan

Removal of objects such as Workflows and Schedules impacts the [Daily Plan](/daily-plan). 

Existing Orders for related Workflows will be cancelled from Controllers and will be removed from the Daily Plan.

## Including Dependencies

Inventory objects are related by dependencies, see [Dependency Matrix](/dependencies-matrix). For example, a Workflow referencing a Job Resource and a Resource Lock; a Schedule referencing a Calendar and one or more Workflows.

When removing objects, consistency is considered, for example:

- If a Job Resource is referenced by a Workflow, then removal of the Job Resource includes revoking the Workflow.
- If a Workflow is removed, then a Schedule referencing the Workflow will be recalled and related Orders will be cancelled and removed from the Daily Plan.

Users control consistent removal of objects from the following options:

- **Include Dependencies**
  - when checked, this will include both referencing and referenced objects.
    - If related objects have previously been deployed or released, then common removal/revocation is offered: the object for which the *Remove* operation is performed will be removed, related objects will be offered being revoked/recalled. Revocation will be enforced, if required by object relationships.
    - This similarly applies to objects in draft status that have previously been deployed or released.
  - when unchecked, this will not consider dependencies. Users must verify if related objects are valid and deployed/released. The Controller will raise error messages in case of missing objects due to inconsistent revocation.

## References

### Context Help

- [Configuration - Inventory - Operations - Remove Object](/configuration-inventory-operations-remove-object)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Dependency Matrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
