# Identity Service Permissions

Identity Services rule access to JOC Cockpit by authentication and authorization, see [Identity Services](/identity-services).

For authorization the JS7 offers a Role Based Access Model (RBAC) which includes that

- roles are freely configured from available permissions,
- users are assigned one or more roles that are merged for resulting permissions.

## Scope of Roles

Roles are specified for the following scopes:

- A role optionally can be limited to one or more inventory folders.
- Every role is assigned a permission set for operations in JOC Cockpit.
- Every role is assigned a permission set for default operations on any Controllers.
- Every role can be assigned additional permission sets per Controller.

Permissions specify one of the following states in the related scope:

- the permission is unassigned,
- the permissions is granted,
- the permission is denied.

Permission are merged from all roles for resulting permissions of a user account:

- JOC Cockpit
  - If a permission is unassigned in the scope of a single role, then additional roles can grant the permission. If no role grants the permission, then it is not granted from resulting permissions.
  - If a permission is granted in scope of a single role, then it will be granted for resulting permissions.
  - If a permission is denied in scope of a single role, then it will be denied from resulting permissions. Denied permissions overrule granted permissions.
- Controller
  - if a permission is unassigned in the default scope, then scopes for individual Controllers can grant the permission for the related Controller.
  - if a permission is granted in the default scope, then by default this applies to all Controllers.
  - if a permission is granted for a given Controller, then resulting permissions for the Controller will include the permission.
  - If a permission is denied from a given Controller, then this overrules the same permission granted from the default scope and from other roles for the same Controller.
  - If a permission is denied from the default scope, then this overrules the same permission granted for any Controller.

## Permission Tree

Permissions can be considered as a tree that offers a hierarchy of branches. Granting or denying permissions at a higher level inherits the permission assignment recursively to deeper levels of the tree.

## Operations on Permissions

Permission are visualized from a rectangle similar to a battery:

- A rectangle using white background color indicates an unassigned permission.
- A rectangle using blue background color indicates a granted permission that will be passed to descendent permissions. Clicking the middle of the rectangle switches between the unassigned and the granted permission status.
- A rectangle using light blue background color indicates an inherited, granted permission. Changes to the permission status require not to grant the parent permission but to grant child permissions individually.
- A rectangle using grey background color indicates a denied permission. Clicking the + icon in a permission's rectangle switches to the denied status, clicking the - icon of a denied permission makes it an unassigned permission.

## References

### Context Help

- [Identity Service - Roles](/identity-service-roles)
- [Identity Services](/identity-services)

### Product Knowledge Base

- [JS7 - Default Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Default+Roles+and+Permissions)
- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
- [JS7 - Management of User Accounts, Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+User+Accounts%2C+Roles+and+Permissions)
