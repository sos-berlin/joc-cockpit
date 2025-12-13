# Documentations

The *Documentations* view displays information about use of Documentations and allows management of Documentations.

Documentations are referenced by Workflows and Jobs, and are displayed with the [Workflows](/workflows) view.

## Navigation Panel

The left panel displays the tree of inventory folders that hold Documentations.

- Clicking the folder displays Documentations from that folder.
- Clicking the chevron-down icon available when hovering on a folder displays Documentations from the folder and any sub-folders.

The Quick Search icon offers looking up Documentations based on user input:

- Typing **Test** will display Documentations with names such as *test-documentation-1* and *TEST-documentation-2*. 
- Typing **\*Test** will display Documentations with names such as *test-documentation-1* and *my-TEST-documentation-2*

## Documentation Panel

### Display of Documentations

The following information is displayed:

- **Name** is the unique name of the Documentation.
- **Reference** indicates the name of the documentation file that was uploaded.
- **Type** is one of the supported types *Text*, *Markdown*, *HTML*, *XML*, *PDF* etc.
- **Modified** last modification date.

### Operations on Documentations

The following operations are available from a Documentation's action menu:

- **Edit Documentation** offers modification of the referenced file.
- **Preview Documentation** will open the application assigned the related mime-type for display of the Documentation.
- **Export** will export the Documentation to a .zip archive file.
- **Delete** will delete the Documentation.
- **Show Usage** will display Workflows that hold references to the Documentation.

On top of the window the *Add Documentation* button is offered:

- **upload of Documentation** allows to select a file that will be uploaded.
- **path** specifies the folder and name of the Documentation in the inventory.

## References

- [Workflows](/workflows)
- [JS7 - User Documentation](https://kb.sos-berlin.com/display/JS7/JS7+-+User+Documentation)
