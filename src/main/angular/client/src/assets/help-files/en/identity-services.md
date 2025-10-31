# Identity Services

Identity Services rule access to JOC Cockpit for authentication and authorisation.

Identity Services implement Authentication Methods and access to Identity Providers. For example, credentials such as user account/password are used as Authentication Method to access an LDAP Directory Service acting as the Identity Provider. See [JS7 - Identity and Access Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+and+Access+Management).

- [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
- [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
- [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)
- [JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
- [JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)

For details see [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services).

By default users find the JOC-INITIAL Identity Service which is added during initial installation.

- The Identity Service holds the single user account *root* with password *root*. Users should modify the *root* user account's password.
- Users can add accounts and roles to the Identity Service.
- Users can modify the existing Identity Service or can add new Identity Services.

## Triggering of Identity Services

Identity Services can be qualified being optional or required. They indicate an ordering by which they will be triggered.

- Identity Services will be triggered in the sequence of their ordering.
- If Identity Services are qualified being optional, then login is completed with the first successful login. In case of failed login, the next Identity Service is triggered.
- If Identity Services are qualified being required, then all of them will be triggered for login by a user.

## List of Identity Services

For each Identity Service the following attributes are displayed:

- **Identity Service Name** can be freely chosen.
- **Identity Service Type** is one of JOC,  LDAP, OIDC, CERTIFICATE, FIDO. For LDAP and OIDC the service types LDAP-JOC and OIDC-JOC can be used that store role assignment with JOC Cockpit.
- **Authentication Scheme** is one of *single-factor* or *two-factor*. 
- **Second Factor** indicates if the second factor is in place for *two-factor* authentication.
- **Ordering** indicates the order in which the Identity Service will be triggered for authentication.
- **Disabled** indicates if the Identity Service can be used to login.
- **Required** indicates that the Identity Service will be triggered in addition to Identtiy Services with an earlier ordering.

## Operations on Identity Services

Users can add an Identity Service from the related button in the right upper corner of the screen.

For existing Identity Services the following operations are offered from their 3-dots action menu:

- **Edit** offers specifying the properties of the Identity Service.
- **Disable** deactivates the Identity Service, it will not be used for login.
- **Delete** removes the Identity Service.

## References

### Context Help

- [Profile](/profile)

### Product Knowledge Base

- [JS7 - Identity and Access Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+and+Access+Management)
  - [JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
  - [JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
  - [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
  - [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
  - [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)
