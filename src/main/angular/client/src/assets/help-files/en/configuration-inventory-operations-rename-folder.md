# Configuration - Inventory - Operations - Rename Folder

Inventory objects can be renamed or relocated. This applies to objects, folders or both. For renaming objects see [Configuration - Inventory - Operations - Rename Object](/configuration-inventory-operations-rename-object). 

When renaming folders, [Object Naming Rules](/object-naming-rules) apply.

The *Rename* operation is available from the *Navigation* panel and is offered for objects and folders from their related 3-dots action menu.

When renaming a user folder then options are offered to modify the folder name and to modify the names of included objects recursively.

## Rename Folder

<img src="rename-folder.png" alt="Rename Folder" width="400" height="150" />

Users can modify the location and the name of a folder. The following assumes the **myWorkflows** folder located in the **/Test/Users** folder hierarchy:

- If the folder name is changed, the folder remains in the given folder hierarchy.
- For the new name users can specify a different folder hierarchy from an absolute path with a leading slash such as **/Test/yourWorkflows**:
  - if the **/Test/yourWorkflows** folder does not exist, it will be created.
  - the folder is renamed from **myWorkflows** to **yourWorkflows**.
- A relative path can be specified as in **Workflows/yourWorkflows**:
  - the **yourWorkflows** folder will be created in the current folder.
  - the folder will be renamed and will be located in **/Test/Users/Workflows/yourWorkflows**.

Changes to the name or location of folders leave included objects in deployed/released status.

## Renaming Objects Recursively

<img src="rename-folder-object.png" alt="Rename Folder Objects Recursively" width="400" height="180" />

Users can modify the names of objects included in a folder and in sub-folders recursively.

- **Search** expects a string that is looked up in object names.
- **Replace** expects a string that will replace the string searched.

Changes to object names set included objects to draft status.

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

- [Configuration - Inventory - Operations - Rename Object](/configuration-inventory-operations-rename-object)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Dependency Matrix](/dependencies-matrix)
- [Object Naming Rules](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
