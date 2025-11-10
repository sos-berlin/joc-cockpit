# Identity Services

Identity Services rule access to JOC Cockpit by authentication and authorization.

Identity Services implement Authentication Methods and access to Identity Providers. For example, credentials such as user account/password are used as Authentication Method to access an LDAP Directory Service acting as the Identity Provider. See [JS7 - Identity and Access Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+and+Access+Management).

- [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
- [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)
- [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
- [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)
- [JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
- [JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)

For details see [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services).

By default users find the JOC-INITIAL Identity Service which is added during initial installation.

- The Identity Service holds the single user account *root* with password *root*. Users must modify the *root* user account's password on first login.
- Users can add [Identity Service - Accounts](/identity-service-accounts) and [Identity Service - Roles](/identity-service-roles) to the Identity Service.
- Users can modify the existing Identity Service or can add new Identity Services.

## Triggering of Identity Services

Identity Services can be makred being optional or required. They indicate an ordering by which they will be triggered.

- Identity Services will be triggered in ascending ordering.
- If Identity Services are qualified being optional, then login is completed on successful login with the first Identity Service. In case of failed login, the next Identity Service is triggered.
- If Identity Services are qualified being required, then all of them will be triggered for login by a user.

## List of Identity Services

For each Identity Service the following properties are displayed:

- **Identity Service Name** can be chosen freely.
- **Identity Service Type** is one of JOC, LDAP, OIDC, CERTIFICATE, FIDO, KEYCLOAK. For LDAP, OIDC and KEYCLOAK the additional service types LDAP-JOC, OIDC-JOC and KEYCLOAK-JOC can be used that store role assignment with JOC Cockpit.
- **Authentication Scheme** can be either *single-factor* or *two-factor*. 
- **Second Factor** indicates whether a second factor is enabled for *two-factor* authentication.
- **Ordering** indicates the sequence in which the Identity Service is triggered for authentication.
- **Disabled** indicates whether the Identity Service is inactive and not used for login.
- **Required** indicates that the Identity Service will be triggered in addition to Identity Services with an earlier ordering.

## Operations on Identity Services

Users can click one of the Identity Services to navigate to the [Identity Service - Roles](/identity-service-roles) view or [Identity Service - Accounts](/identity-service-accounts) view if offered for the service.

Users can add an Identity Service from the related button in the upper-right corner of the screen.

For existing Identity Services the following operations are offered from their 3-dots action menu:

- **Edit** offers specifying the general configuration of the Identity Service.
- **Manage Settings** offers specifying settings specific for a service type.
- **Disable** deactivates the Identity Service, it will not be used for login.
- **Delete** removes the Identity Service.

## References

### Context Help

- [Identity Service - Accounts](/identity-service-accounts)
- [Identity Service - Configuration](/identity-service-configuration)
- [Identity Service - Roles](/identity-service-roles)

### Product Knowledge Base

- [JS7 - Identity and Access Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+and+Access+Management)
  - [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
    - [JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
    - [JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
    - [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
    - [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)
    - [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
    - [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)
  - [JS7 - Authentication](https://kb.sos-berlin.com/display/JS7/JS7+-+Authentication)
  - [JS7 - Authorization](https://kb.sos-berlin.com/display/JS7/JS7+-+Authorization)
  