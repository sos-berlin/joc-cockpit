# Identity Service - Permissions

Identity Services rule access to JOC Cockpit by authentication and authorization, see [Identity Services](/identity-services).

For authorization the JS7 offers a Role Based Access Model (RBAC) which includes that

- roles are freely configured from available permissions,
- users are assigned one or more roles that are merged for resulting permissions.

Permissions specify one of the following states:

- the permission is unassigned (white background color),
- the permissions is granted (blue background color),
- the permission is denied (grey background color).

Permission are merged from all roles for resulting permissions of a user account.

## Folder Scope

The scope of permissions in a role can be limited to one or more inventory folders.

- Users can apply the *Add Folder* button in the upper-right corner of the view to select an inventory folder and to specify recursive use.
- Users can add any number of inventory folders to a role.

## Permission Tree

Permissions can be considered a tree that offers a hierarchy of branches. Granting or denying permissions at a higher level inherits permission assignment recursively to deeper levels of the tree.

### Granting and Denying Permissions

Permission are visualized from a rectangle similar to a battery:

- Clicking the pole at the right side of a battery will expand/collapse descendent permissions.
- Clicking the background of the battery will switch permission between the unassigned status and the granted status:
  - A rectangle using white background color indicates an unassigned permission.
  - A rectangle using blue background color indicates a granted permission that will be passed to descendent permissions. <br/><img src="identity-service-permissions-granted.png" alt="Granted Permissions" width="600" height="100" />
  - A rectangle using light blue background color indicates an inherited, granted permission. Changes to the permission require not to grant the parent permission but to grant child permissions individually.  <br/><img src="identity-service-permissions-inherited.png" alt="Inherited Permissions" width="600" height="100" />
- Clicking the + icon inside a permission's rectangle switches the permission to the denied status indicated from grey background color. Clicking the - icon inside a denied permission makes it an unassigned permission using white background color. <br/><img src="identity-service-permissions-denied.png" alt="Denied Permissions" width="600" height="100" />

### Collapsing and Expanding Permissions

The following buttons are offered to expand/collapse permissions:

- **Expand All**, **Collapse All** will expand or collapse all permissions.
- **Expand Active** will expand granted/denied permission and will keep inherited permissions collapsed.
- **Collapse Inactive** will collapse unassigned permissions.

## Graphical and Tabular View

In the upper-right corner the following buttons are offered for display of permissions:

- **Graphical View** displays permissions from a tree using battery shape.
- **Tabular View** displays permissions from a textual representation with permission levels being separated by colon.

## References

### Context Help

- [Identity Service - Roles](/identity-service-roles)
- [Identity Services](/identity-services)

### Product Knowledge Base

- [JS7 - Default Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Default+Roles+and+Permissions)
- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
- [JS7 - Management of User Accounts, Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+User+Accounts%2C+Roles+and+Permissions)
