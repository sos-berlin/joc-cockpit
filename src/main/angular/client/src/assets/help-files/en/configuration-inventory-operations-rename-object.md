# Configuration - Inventory - Operations - Rename Object

Inventory objects can be renamed or relocated. This applies to objects, user folders or both. For renaming user folders see [Configuration - Inventory - Operations - Rename Folder](/configuration-inventory-operations-rename-folder). 

When renaming objects, [Object Naming Rules](/object-naming-rules) apply.

The *Rename* operation is available from the *Navigation* panel and is offered for objects and user folders from their related 3-dots action menu.

<img src="rename-object.png" alt="Rename Object" width="400" height="125" />

## Renaming Object

Users can modify the location and the name of an object. The following assumes an object located in the **/Test/Users** folder with the name **myWorkflow**:

- If the object name is changed, the object remains in the given folder and is set to draft status.
- For the new name users can specify a different folder hierarchy and object name from an absolute path with a leading slash such as **/Test/Workflows/yourWorkflow**:
  - if the **/Test/Workflows** folder does not exist, it will be created.
  - the Workflow is renamed from **myWorkflow** to **yourWorkflow**.
- A relative path can be specified as in **Workflows/yourWorkflow**:
  - the **Workflows** folder will be created in the current folder.
  - the object will be renamed and will be located in **/Test/Users/Workflows/yourWorkflow**.
- If the object folder is changed but not the object name, then the object remains in deployed/released status.

## Dependencies

Inventory objects are related by dependencies, see [Dependency Matrix](/dependencies-matrix). For example, a Workflow referencing a Job Resource and a Resource Lock; a Schedule referencing a Calendar and one or more Workflows.

When renaming objects, consistency is considered and referencing objects are updated and set to draft status, for example:

- If a Job Resource is renamed that is referenced by a Workflow, then 
  - the Workflow will be updated to reflect the changed name,
  - the Workflow will be set to draft status,
  - a later *Deploy* operation will enforce common deployment of both objects.
- If a Workflow is renamed that is referenced by a Schedule, then
  - the Schedule will be updated to reflect the changed name,
  - the Schedule will be set to draft status,
  - a later *Deploy* operation on the Workflow will include a *Release* operation on the Schedule and vice versa.

## References

### Context Help

- [Configuration - Inventory - Operations - Rename Folder](/configuration-inventory-operations-rename-folder)
- [Dependency Matrix](/dependencies-matrix)
- [Object Naming Rules](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
