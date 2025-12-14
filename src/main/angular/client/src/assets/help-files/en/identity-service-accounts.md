# Identity Service - Accounts

Identity Services rule access to JOC Cockpit by authentication and authorization, see [Identity Services](/identity-services).

User accounts will be managed and stored with JOC Cockpit for the following Identity Service Types:

| Identity Service Type | Documentation |
| ----- | ----- |
| *JOC* | [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service) |
| *KEYCLOAK-JOC* | [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service) |
| *LDAP-JOC* | [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service) |
| *OIDC-JOC* | [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service) |
| *CERTIFICATE* | [JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service) |
| *FIDO* | [JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service) |

For the following Identity Service Types user accounts are not managed with JOC Cockpit but with the Identity Service Provider:

| Identity Service Type | Documentation |
| ----- | ----- |
| *KEYCLOAK* | [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service) |
| *LDAP* | [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service) |
| *OIDC* | [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service) |

## List of Accounts

For each account the following properties are displayed:

- **Account** indicates the account as specified during login.
- **Roles** indicates the list of [Identity Service - Roles](/identity-service-roles) that are assigned the account.
- **Force Password Change** indicates if the user account must change its password on next login.
- **Blocked** indicates that the account has been added to a [Identity Service - Blocklist](/identity-service-blocklist) and is denied access.
- **Disabled** indicates that the account is inactive and is denied access.

## Operations on Accounts

Users can add an account using the related button from the upper-right corner of the view.

### Operations on Single Accounts

The following operations are available from each account's 3-dots action menu:

- **Edit** allows specifying the [Identity Service - Account Configuration](/identity-service-account-configuration).
- **Duplicate** copies the selected account to a new account. Users must specify the name of the new account.
- **Reset Password** drops the account's password and assigns the password specified with the *initial_password* setting in the [Settings - Identity Service](/settings-identity-service) page. The related user account must login with the *initial_password* and must change its password on next login.
- **Force Password Change** forces the account to change its password on next login.
- **Add to Blocklist** denies access to the account for the duration that the account is added the [Identity Service - Blocklist](/identity-service-blocklist).
- **Disable** deactivates the account and denies access from this account.
- **Delete** wipes the account from the Identity Service.
- **Show Permissions** displays the list of permissions resulting from merged roles of the given account.

### Bulk Operations on Accounts

Users find the following bulk operations from buttons at the top of the screen:

- **Export** will add selected accounts to an export file in JSON format that can be used for importing accounts to a different Identity Service in the same or in a different JOC Cockpit instance.
- **Copy** will copy selected accounts to an internal clipboard from which they can be pasted to a different Identity Service in the same JOC Cockpit instance.

Users can select one or more *Accounts* to perform above operations in bulk for selected *Accounts*.

- **Reset Password** drops the selected accounts' password and assigns the password specified with the *initial_password* setting in the [Settings - Identity Service](/settings-identity-service) page. The related user accounts must login with the *initial_password* and must change their password on next login.
- **Force Password Change** forces selected accounts to change their password on next login.
- **Disable** deactivates selected accounts and denies access from the given accounts.
- **Enable** activates selected, disabled accounts.
- **Delete** wipes selected accounts from the Identity Service.

## References

### Context Help

- [Identity Service - Configuration](/identity-service-configuration)
- [Identity Service - Account Configuration](/identity-service-account-configuration)
- [Identity Service - Roles](/identity-service-roles) 
- [Identity Service - Blocklist](/identity-service-blocklist)
- [Identity Services](/identity-services)
- [Settings - Identity Service](/settings-identity-service)
- [Settings - JOC Cockpit](/settings-joc)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
