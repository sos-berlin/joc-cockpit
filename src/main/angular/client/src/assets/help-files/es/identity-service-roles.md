# Identity Service - Roles

Identity Services rule access to JOC Cockpit by authentication and authorization, see [Identity Services](/identity-services).

For authorization the JS7 offers a Role Based Access Model (RBAC) which includes that

- roles are freely configured from available permissions,
- users are assigned one or more roles that are merged for resulting permissions.

The JS7 ships with the following - [JS7 - Default Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Default+Roles+and+Permissions) that can be modified or deleted at the user's will:

| Role | Purpose | Permissions |
| ----- | ----- | ----- |
| administrator	| This is a technical role without any responsibilities in the IT process and business process. | The role includes all permissions to start, restart, switch-over etc. the JS7 products. |
| api_user | The role is intended for applications such as system monitors that access JS7 via its API. | The role preferably grants view permissions. On top come permissions to manage orders and to deploy workflows. |
| application_manager | This an engineering role with in-depth knowledge of workflows, for example for Change Management. This role is not necessarily involved in daily operations. | The role includes permissions for administrative tasks on Controller instances, cluster configuration, certificates and customizations. In addition, the role includes permissions to manage the JS7 inventory. Management of user accounts is not included. |
| business_user | The role is intended for back-office users who are not responsible for IT operations, but possibly for the business process and therefore interested to stay informed about the status of workflow execution. | The role offers read-only permissions. |
| incident_manager |The role is for the IT Service Desk, for example 1st and 2nd level support, interventions and incident management | The role is based on the *application_manager* role and adds full Controller and Agent permissions required for incident management, for example access to log files. |
| it_operator | This is the role for daily operations of workflows and daily plan. | The role preferably grants view permissions. On top come permissions to manage orders and to deploy workflows. |

Users are encouraged to drop unused roles and to adjust permissions for roles as needed.

## Scope of Roles

Roles are specified for the following scopes:

- Every role can be limited to one or more inventory folders.
- Every role is assigned a permission set for operations in JOC Cockpit.
- Every role is assigned a permission set for default operations on any Controllers.
- Every role can be assigned additional permission sets per Controller.

Permissions specify one of the following states in the related scope:

- the permission is unassigned,
- the permission is granted,
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
  - If a permission is denied for a given Controller, then this overrules the same permission granted from the default scope and from other roles for the same Controller.
  - If a permission is denied from the default scope, then this overrules the same permission granted for any Controller.

## Operations on Roles

The following operations are available from related buttons in the upper-right corner of the sub-view:

- **Account** limits display to roles assigned the selected account.
- **Import** offers importing roles form a file in JSON format that was previously created from an *Export* of roles.
- **Add Controller** offers adding the scope of a specific Controller.
- **Add Role** offers creating a new role.

### Operations on Single Roles

From the list of roles, users can drag & drop a role to a different position. The operation has no impact on the processing of roles.

From each role's 3-dots action menu the following operations are offered:

- **Edit** offers changing the role's name. Changes are considered for existing roles assigned any user accounts.
- **Duplicate** copies the role to a new role. The user specifies the name of the new role.
- **Delete** wipes the role from the inventory and from any user accounts assigned the role.

### Bulk Operations on Roles

The following bulk operations are available when selecting one or more roles:

- **Export** will offer a file for download in JSON format that holds the configuration of selected roles. The export file can be used for import with the same or with a different JOC Cockpit instance.
- **Copy** adds the roles to the internal clipboard for later pasting to a different Identity Service in the same JOC Cockpit instance.
- **Delete** wipes the selected roles from the inventory and from any user accounts assigned the roles.

## References

### Context Help

- [Identity Service - Permissions](/identity-service-permissions)
- [Identity Services](/identity-services)

### Product Knowledge Base

- [JS7 - Default Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Default+Roles+and+Permissions)
- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
- [JS7 - Management of User Accounts, Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+User+Accounts%2C+Roles+and+Permissions)
