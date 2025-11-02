# Identity Service Configuration

Identity Services rule access to JOC Cockpit by authentication and authorization, see [Identity Services](/identity-services).

Identity Services are specified from the following configuration:

- **General Configuration** that holds properties available to all Identity Services.
- **Settings** that are specific for the Identity Service Type, see [Identity Service - Settings](/identity-service-settings).

## General Configuration

For any Identity Service the following properties are displayed:

- **Identity Service Name** can be freely chosen.
- **Identity Service Type** is one of JOC,  LDAP, OIDC, CERTIFICATE, FIDO, KEYCLOAK. For LDAP, OIDC and KEYCLOAK the additional service types LDAP-JOC, OIDC-JOC and KEYCLOAK-JOC can be used that store role assignment with JOC Cockpit.
- **Ordering** indicates the sequence in which the Identity Service will be triggered for authentication.
  - Users can specify an integer value to indicate the ordering.
  - Users can modify the ordering by moving the service in the list of [Identity Services](/identity-services).
- **Required** indicates that the Identity Service will be triggered in addition to Identity Services with an earlier ordering.
- **Disabled** indicates if the Identity Service is inactive and will not be used for login.
- **Authentication Scheme** is one of *single-factor* or *two-factor*. 
  - if *two-factor* is chosen, then the user must select the second factor from one of the Identity Services of the FIDO or CERTIFICATE Identity Service Types.

## References

### Context Help

- [Identity Service - Settings](/identity-service-settings)
- [Identity Services](/identity-services)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
