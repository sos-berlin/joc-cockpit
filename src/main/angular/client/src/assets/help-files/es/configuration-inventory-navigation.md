# Configuration Inventory - Navigation

The *Configuration - Inventory* view is used to manage inventory objects such as Workflows, Schedules etc. 

- The *Navigation Panel* offers navigation by Tags and folders. In addition, it offers operations on inventory objects.
- The *Object Panel* holds the representation of the related object, for example [Configuration - Inventory - Workflows](/configuration-inventory-workflows).

## Navigation Panel

The left panel is organized in tabs that allow navigation from folders and from Tags for Workflows and Jobs.

- **Folder** navigation will display inventory objects from the selected folder.
- Tag filtering is offered from the following tabs to select Workflows:
  - **Workflow Tags** are assigned from the [Configuration - Inventory - Workflows](/configuration-inventory-workflows) view at Workflow level.
  - **Job Tags** are assigned from the same view at Job level.

### Folders

By default *Inventory Folders* are displayed per scheduling object type. Users can create their own folders at any depth of hierarchy. The same *User Folder* name can occur any number of times in different folder hierarchy levels.

The folder hierarchy knows the following folder types:

- **Inventory Folders** hold the following object types:
  - **Controller** objects are deployed to a Controller and Agents:
    - [Workflows](/configuration-inventory-workflows) include Jobs and other Workflow Instruction. For details see [JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows).
    - [File Order Sources](/configuration-inventory-file-order-sources) are used for File Watching to automatically start Workflows in the event of arrival of a file in a directory. For details see [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching).
    - [Job Resources](/configuration-inventory-job-resources) are used to centralize configuration of variables that are re-used in a number of Jobs. For details see [JS7 - Job Resources](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Resources).
    - [Notice Boards](/configuration-inventory-notice-boards) specify dependencies between Workflows. For details see [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards).
    - [Resource Locks](/configuration-inventory-resource-locks) limit parallel execution of Jobs and other instructions. For details see [JS7 - Resource Locks](https://kb.sos-berlin.com/display/JS7/JS7+-+Resource+Locks).
  - **Automation** objects are used for automation in JOC Cockpit:
    - [Script Includes](/configuration-inventory-script-includes) are code snippets that can be re-used in a number of Shell Jobs. For details see [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes).
    - [Schedules](/configuration-inventory-schedules) determine the point in time when Orders for Workflow execution will start. They are assigned one or more Workflows and optionally Order Variables that are used by Jobs in the given Workflow. They make use of one or more *Calendars*. For details see [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules).
    - [Calendars](/configuration-inventory-calendars) specify the days on which scheduling events can occur. They hold rules for recurring days and lists of days that are used by *Schedules* to create Orders for Workflow execution with the [Daily Plan](/daily-plan). For details see [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars).
    - [Job Templates](/configuration-inventory-job-templates) are provided by user's Jobs Templates or by Java classes that ship with JS7 and can be used for any OS platforms. For details see [JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates).
    - [Reports](/configuration-inventory-reports) summarize Workflow and Job execution results for given periods. For details see [JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports).
- **User Folders** are created by the user at any depth of hierarchy. Each *User Folder* will hold a set of *Inventory Folders*.

#### Object Quick Search

Right to the top-level folder in the *Navigation Panel* users find a Search Icon that can be used to lookup inventory objects.

- A minimum of two characters must be entered to have Quick Search look up objects that start with the given characters.
- Quick Search is case-insensitive and right-truncated.
- Quick Search returns objects with matching names per category such as Workflows, Schedules.
- The \* meta character can be used as a placeholder for zero or more characters:
  - **\*test** will find the objects ***test**Initial*, *my**Test***
  - **te\*st** will find the objects ***test**Initial*, ***te**rminate**St**illstand*

#### Object Trash

When inventory objects are removed, they will be put to the Trash. The Trash allows to restore objects and to permanently delete objects.

The Trash is opened from the Trash Icon right to the top-level folder in the *Navigation Panel*.

- Clicking the Trash Icon will switch display to objects in the Trash. The Return Icon is offered to return from Trash view to inventory view.
- The Trash's folder structure is the same as for inventory objects.
- The Trash offers action menus per object and per folder to restore objects and to permanently delete objects.

### Tags

Tags are considered an alternative way for navigating between inventory objects. When activating the *Workflow Tags* or "Job Tags* tabs in the *Navigation Panel*, then the panel displays the list of available Tags.

Tags can be added from the + icon. Options for ascending and descending ordering are available. Display of Tags in other views must be activated from the [Settings - JOC Cockpit](/settings-joc) page.

- By clicking the related Tag the Workflows will be displayed that are assigned the Tag.
- Tags offer the following operations from their 3-dots action menu:
  - **Rename** offers modifying the Tag's name.
  - **Delete**  offers deleting the Tag and it's assignment to Workflows and Jobs.

## Operations

Operations are available at folder level and object level from the 3-dots actions menu displayed with the *Navigation Panel*.

### Folder Level Operations

Operations are available for *Inventory Folders* and *User Folders*.

The top-level folder / (slash) offers the following operations:

- **Redeploy** is used in case of Journal loss if a Controller's memory is wiped and the Controller is initialized. The operation will *deploy* all objects that have previously been deployed to a Controller. 
- **Update Dependencies** recreates the internal representation of object dependencies. This happens automatically and is triggered on creation or deletion of inventory objects and in case of changes to object names. If users find reason to assume that dependencies are not in sync, then the operation can be performed. Users should consider that this will take time, approx. three minutes for an inventory of 5000 objects. However, users can continue working with JOC Cockpit while dependencies are updated.

#### Inventory Folder Operations

The following operations are available for *Inventory Folders*:

- Operations on Controller Objects
  - *Workflows*
    - **New** creates a Workflow.
    - **Rename** allows to rename a workflow. Object dependencies will be considered and referencing inventory objects such as *Schedules* and *File Order Sources* will hold the updated name. The Workflow and referencing objects will be put to *draft* status. For details see [Rename Folder](/configuration-inventory-operations-rename-folder).
    - **Manage Tags** offers adding and deleting Tags to/from Workflows in the folder, see [Manage Tags](/configuration-inventory-operations-manage-tags).
    - **Export** allows creating an export archive file in .zip or .tar.gz format that holds the folder hierarchy and the JSON representation of Workflows. For details see [Export Folder](/configuration-inventory-operations-export-folder).
    - **Git Repository** offers integration with a Git Server. Workflows can be committed to Git repositories and can be pulled and pushed. For details see [Git - Clone Repository](/configuration-inventory-operations-git-clone).
    - **Change** offers operations for change management of Workflows. Users can add a Workflow under construction to a *Change* that allows common deployment and export of changed objects. For details see [Changes](/changes).
    - **Deploy** will make Workflows available to the Controller and Agents. The Workflows will be put to the *deployed* status. For details see [Deploy Folder](/configuration-inventory-operations-deploy-folder).
    - **Revoke** reverts a previous *Deploy* operation. Workflows will be put to *draft* status. This implies that Orders for Workflows will be removed from the [Daily Plan](/daily-plan). Object dependencies are considered and referencing objects such as *Schedules* and *File Order Sources* will be revoked/recalled too. For details see [Revoke Folder](/configuration-inventory-operations-revoke-folder).
    - **Remove** will move Workflows to the Trash. Removed Workflows can be restored or can be permanently deleted from the Trash. For details see [Remove Folder](/configuration-inventory-operations-remove-folder).
    - **Revert Draft** will delete the current draft version of Workflows. If a previously *deployed* version exists, then it will be made the current version of the related Workflow.
    - **Update Jobs from Templates** will update Jobs from Workflows in the selected *Inventory Folder* from *Job Templates* located in any folder.
  - *File Order Sources*, *Job Resources*, *Notice Boards*, *Resource Locks* offer similar operations as *Workflows*.
- Operations on Automation Objects
  - **Release** makes *draft* objects available
    - for use with other objects, for example *Script Includes* will be considered for next deployment of Workflows, *Job Templates* can be updated in referencing Workflows.
    - for use with the [Daily Plan](/daily-plan), for example *Schedules* will be considered for creation of Orders.
    - for details see [Release Folder](/configuration-inventory-operations-release-folder).
  - **Recall** reverts a previous *Release* operation. The inventory objects will be put to *draft* status. This implies that draft *Schedules* and *Calendars* will not be considered by the [Daily Plan](/daily-plan). The operation considers object dependencies and will recall/revoke referencing objects too. For details see [Recall Folder](/configuration-inventory-operations-recall-folder).
  - **Apply Template to Jobs** will update Jobs in Workflows located in any folder that hold references to *Job Templates* included with the selected *Inventory Folder* or any sub-folder.
  - Other operations are available similar to *Operations on Controller Objects*.

#### User Folder Operations

*User Folders* are created by users and hold a set of *Inventory Folders*. The following operations are offered:

- Operations on all Objects
  - **New** creates the object offered from action menu items: a folder or an inventory object, see [Object Naming Rules](/object-naming-rules).
  - **Cut** will *cut* the folder, any sub-folders and inventory objects for later pasting to a different location in the folder hierarchy.
  - **Copy** will *copy* the folder, any sub-folders and inventory objects including referenced inventory objects that might be located in other folders. The operation is a *deep copy* that works on any referenced objects.
  - **Shallow Copy** will *copy* the folder, any sub-folders and inventory objects. References to inventory objects in other folders are not considered.
  - **Rename** allows to rename the folder and optionally included inventory objects. For details see [Rename Folder](/configuration-inventory-operations-rename-folder).
  - **Manage Tags** offers to add and to delete Tags to/from Workflows in the given folder hierarchy, see [Manage Tags](/configuration-inventory-operations-manage-tags).
  - **Export** allows creating an export archive file in .zip or .tar.gz format that holds the folder hierarchy and the JSON representation of included inventory objects. For details see [Export Folder](/configuration-inventory-operations-export-folder).
  - **Git Repository** offers integration with a Git Server. Inventory objects can be committed to Git repositories and can be pulled and pushed. For details see [Git - Clone Repository](/configuration-inventory-operations-git-clone).
  - **Change** offers operations for change management of inventory objects. Users can add objects such as Workflows that are under construction to a *Change* that allows common deployment and export of changed objects. For details see [Changes](/changes).
- Operations on Controller Objects
  - **Deploy** will make objects available to the Controller and Agents. Inventory objects will be put to the *deployed* status. For details see [Deploy Folder](/configuration-inventory-operations-deploy-folder).
  - **Revoke** reverts a previous *Deploy* operation. The inventory objects will be put to *draft* status. This implies that Orders for Workflows will be removed from the [Daily Plan](/daily-plan). For details see [Revoke Folder](/configuration-inventory-operations-revoke-folder).
  - **Revalidate** checks the validity of inventory objects that can become inconsistent for example after import of objects.
  - **Synchronize** will bring the status of scheduling objects with the Controller and the inventory in sync:
    - *Synchronize to Controller* will *Deploy* or *Revoke* inventory objects to/from the Controller and Agents depending on their *deployed* or *draft* inventory status. The operation can be used in case of Journal loss when a Controller's memory is wiped and the Controller is initialized.
    - *Synchronize to Inventory* will put inventory objects to *deployed* or *draft* status depending on object availability with the Controller.
- Operations on Automation Objects
  - **Release** makes *draft* objects available
    - for use with other objects, for example *Script Includes* will be considered for next deployment of Workflows, *Job Templates* can be updated in referencing Workflows.
    - for use with the [Daily Plan](/daily-plan), for example *Schedules* will be considered for creation of Orders.
    - for details see [Release Folder](/configuration-inventory-operations-release-folder).
  - **Recall** reverts a previous *Release* operation. The inventory objects will be put to *draft* status. This implies that draft *Schedules* and *Calendars* will not be considered by the [Daily Plan](/daily-plan). For details see [Recall Folder](/configuration-inventory-operations-recall-folder).
- Removal Operations
  - **Remove** will move the folder, any sub-folders and included objects to the Trash. Removed inventory objects can be restored or can be permanently deleted from the Trash. For details see [Remove Folder](/configuration-inventory-operations-remove-folder).
  - **Revert Draft** will delete the current draft version of objects in the folder and any sub-folders. If a previously *deployed* or *released* version exists, then it will be made the current version of the related object.
- Job Template Operations
  - **Update Jobs from Templates** will update Jobs in Workflows located in any folder that hold references to *Job Templates* included with the selected *User Folder* or any sub-folder.
  - **Apply Template to Jobs** will update Jobs in Workflows located in the selected *User Folder* from *Job Templates* located in any folder.

### Object Level Operations

The following operations are offered for individual inventory objects:

- All Objects
  - **Cut** will *cut* the object for later pasting to a different location in the folder hierarchy.
  - **Copy** will *copy* the object for later pasting.
  - **Rename** allows modifying the object's name. Object dependencies will be considered and referencing inventory objects will hold the updated name. The renamed object and referencing objects will be put to *draft* status. For details see [Rename Object](/configuration-inventory-operations-rename-object).
  - **Change** offers operations for change management of inventory objects. Users can add objects such as Workflows that are under construction to a *Change* that allows common deployment and export of changed objects. For details see [Changes](/changes).
  - **Show Dependencies** displays the list of referencing objects and referenced objects. For example, a Workflow can hold references to Job Resources and can be referenced by *Schedules* or *File Order Sources*.
  - **New Draft** creates a draft version from a previously *deployed* or *released* version of the object.
  - JSON Operations
    - **Show JSON** displays the JSON storage format of the inventory object.
    - **Edit JSON** offers modifying an object directly from its JSON storage format.
    - **Download JSON** will download the object in JSON storage format to a .json file.
    - **Upload JSON** offers to upload a .json file that will replace the object.
  - Removal Operations
    - **Remove** will move the object to the Trash. Removed inventory objects can be restored or can be permanently deleted from the Trash. For details see [Remove Object](/configuration-inventory-operations-remove-object).
    - **Revert Draft** will delete the current draft version of the object. If a previously *deployed* or *released* version exists, then it will be made the current version of the object.
- Controller Objects
  - **Manage Tags** is available for Workflows and offers adding and deleting Tags to/from the Workflow.
  - **Deploy** will make the object available to the Controller and Agents. The object will be put to the *deployed* status. Deployment considers object dependencies of referenced and referencing inventory objects. For details see [Deploy Object](/configuration-inventory-operations-deploy-object).
  - **Revoke** reverts a previous *Deploy* operation. The object will be put to *draft* status. For use with Workflows this implies that Orders will be removed from the [Daily Plan](/daily-plan). For details see [Revoke Object](/configuration-inventory-operations-revoke-object).
- Automation Objects
  - **Release** makes *draft* objects available
    - for use with other objects, for example *Script Includes* will be considered for next deployment of Workflows, *Job Templates* can be updated in referencing Workflows.
    - for use with the [Daily Plan](/daily-plan), for example *Schedules* will be considered for creation of Orders.
    - for details see [Release Object](/configuration-inventory-operations-release-object).
  - **Recall** reverts a previous *Release* operation. The inventory objects will be put to *draft* status. This implies that draft *Schedules* and *Calendars* will not be considered by the [Daily Plan](/daily-plan). For details see [Recall Object](/configuration-inventory-operations-recall-object).

## References

### Context Help

- [Changes](/changes)
- [Daily Plan](/daily-plan)
- [Object Naming Rules](/object-naming-rules)
- Controller Objects
  - [Workflows](/configuration-inventory-workflows)
  - [File Order Sources](/configuration-inventory-file-order-sources)
  - [Job Resources](/configuration-inventory-job-resources)
  - [Notice Boards](/configuration-inventory-notice-boards)
    - [Resources - Notice Boards](/resources-notice-boards)
  - [Resource Locks](/configuration-inventory-resource-locks)
    - [Resources - Resource Locks](/resources-resource-locks)
- Automation Objects
  - [Script Includes](/configuration-inventory-script-includes)
  - [Schedules](/configuration-inventory-schedules)
  - [Calendars](/configuration-inventory-calendars)
  - [Job Templates](/configuration-inventory-job-templates)
  - [Reports](/configuration-inventory-reports)
- Object Operations
  - [Deploy Object](/configuration-inventory-operations-deploy-object)
  - [Revoke Object](/configuration-inventory-operations-revoke-object)
  - [Release Object](/configuration-inventory-operations-release-object)
  - [Recall Object](/configuration-inventory-operations-recall-object)
  - [Remove Object](/configuration-inventory-operations-remove-object)
  - [Rename Object](/configuration-inventory-operations-rename-object)
- User Folder Operations
  - [Deploy Folder](/configuration-inventory-operations-deploy-folder)
  - [Revoke Folder](/configuration-inventory-operations-revoke-folder)
  - [Release Folder](/configuration-inventory-operations-release-folder)
  - [Recall Folder](/configuration-inventory-operations-recall-folder)
  - [Remove Folder](/configuration-inventory-operations-remove-folder)
  - [Rename Folder](/configuration-inventory-operations-rename-folder)
  - [Export Folder](/configuration-inventory-operations-export-folder)
  - [Git - Clone Repository](/configuration-inventory-operations-git-clone)
  - [Manage Tags](/configuration-inventory-operations-manage-tags)

### Product Knowledge Base

- Controller Objects
  - [JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows)
  - [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching)
  - [JS7 - Job Resources](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Resources)
  - [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Resource Locks](https://kb.sos-berlin.com/display/JS7/JS7+-+Resource+Locks)
- Automation Objects
  - [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes)
  - [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
  - [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
    - [JS7 - Management of Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Calendars)
  - [JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates)
  - [JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports)
