# Configuration - Inventory - Operations - Import

Importing objects includes adding them to the inventory from a .zip or .tar.gz archive file.

This applies to objects from the *Controller* and *Automation* system folders and to objects from user folders. Objects can be imported from the same or from a different JOC Cockpit instance.

When using different JOC Cockpit versions for export and import, then import to a newer version will be supported, import to older versions will not.

When importing objects using the related *Import* operation from the a button with the same caption in the right-upper corner of the window, then a pop-up window will be displayed:

- **Folder** specifies the inventory folder to which objects will be imported. 
  - If the folder does not exist, then it will be created. More than one folder can be specified using slashes (/) as in */a/b/c*.
  - The folder hierarchy available in the archive file will added to the *Folder* specified.
- **File Format** specifies either .zip or .tar.gz for the compression type.
- **Overwrite** specifies that existing objects with the same name will be overwritten.
  - In the JOC Cockpit inventory object names are unique per object type such as Workflows, Schedules etc.
- **Overwrite Tags** specifies that tags of existing objects such as Workflows will be overwritten by tags from imported objects with the same name.
- **Object Name** offers options available if the *Overwrite* option is not selected: 
  - **Ignore if exists**: The object will not be imported. An existing object of the same type with the same name remains in place.
  - **Add Prefix**: A prefix is specified that will be prepended any imported objects, separated by an additional dash.
  - **Add Suffix**: A suffix is specified that will be appended any imported objects, separated by an additional dash.
- **File Name**: Users can drag&amp;drop a file or can use the *choose files for upload* option to select a file for import.
  
## References

### Context Help

- [Dependency Matrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import)
- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
