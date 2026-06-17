# Configuration - Inventory - Operations - Export Folder

Exporting objects includes adding them to a .zip or .tar.gz archive file that is offered for download. This applies to objects from the *Controller* and *Automation* system folders and to objects in user folders. Archive files can be used for later import to the same or to a different JOC Cockpit instance.

When exporting objects from folders using the related *Export* operation from the folder's 3-dots action menu, a pop-up window will be displayed that offers 

- **File Name** specifies the name of the archive file.
- **File Format** specifies either .zip or .tar.gz for the compression type.
- **Export Type** is one of
  - export of *Individual Objects*
  - export of *Folders*
  - export of *Changes*
- **Filer Type**
  - **Controller** considers objects such as Workflows and Job Resources stored in *Controller* system folders.
  - **Automation** considers objects such as Schedules and Calendars stored in *Automation* system folders.
- **Filter**
  - **valid only** limits export to valid objects.
  - **Draft** includes objects in draft status.
  - **Deployed** includes objects such as Workflows and Job Resources in deployed status.
  - **Released** includes objects such as Schedules and Calendars in released status. 
  - **Use relative Path** specifies whether the export file will include the folder hierarchy from an absolute path or from a relative path indicated by the latest folder in the hierarchy for which export is performed.
- **Handle recursively** allows adding objects from sub-folders recursively to the export archive.

## Export Types

The **Export Type** allows selecting individual objects, objects from folders and objects from changes.

### Exporting Individual Objects

The *Export Type* allows selecting individual objects from the list of objects displayed.

<img src="export-object.png" alt="Export Object" width="600" height="580" />

### Exporting Objects from Folders

The *Export Type* offers limiting export to certain scheduling object types such as Workflows or Schedules. Users can select the desired object types that will be added to the export archive file.

<img src="export-folder.png" alt="Export Folder" width="600" height="580" />

### Exporting Objects from Changes

The *Export Type* offers selecting a Change from the list of [Changes](/changes). Export will be limited to objects related to the Change.

<img src="export-change.png" alt="Export Change" width="600" height="320" />

## Including Dependencies

Inventory objects are related by dependencies, see [Dependency Matrix](/dependencies-matrix). For example, a Workflow referencing a Job Resource and a Resource Lock; a Schedule referencing a Calendar and one or more Workflows.

When exporting objects, consistency is considered, for example:

- If a Workflow references a Job Resource, then both the Workflow and the Job Resource can be exported, even in case they are stored in folders unrelated to the selected folder.
- If a Schedule references a Calendar and should be exported, then both the Schedule and the Calendar can be exported.

Users control consistent export from the following options:

- **Include Dependencies**
  - when checked, this will include both referencing and referenced objects located in any folder.
  - when unchecked, this will not consider dependencies. Users must verify if related objects are valid and deployed/released. The Controller will raise error messages in case of missing objects due to inconsistent deployment.
  
## References

### Context Help

- [Changes](/changes)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Dependency Matrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
