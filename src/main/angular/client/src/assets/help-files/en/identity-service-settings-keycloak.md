# Identity Service - Keycloak Settings

Identity Services rule access to JOC Cockpit by authentication and authorization, see [Identity Services](/identity-services).

Identity Services are specified from the following configuration:

- **General Configuration** that holds properties available to all Identity Services, see [Identity Service - Configuration](/identity-service-configuration).
- **Settings** that are specific for the Keycloak Identity Service Type.

## Settings

- **Keycloak URL** is the base URL for which the Keycloak REST API is available
- **Keycloak Administrative Account** is a Keycloak account with an administrative role that is assigned the *realm-management.view-clients* and *realm-management.view-users* roles in Keycloak. The administrative account is used to retrieve the roles for a Keycloak account and for renewing access tokens.
- **Keycloak Administrative Password** is password for the *Keycloak Administration Account*.
- **Keycloak Truststore Path** specifies the location of a truststore should the Keycloak Server be configured for HTTPS connections. The indicated truststore must include an X.509 certificate specified for the Extended Key Usage of Server Authentication.
  - The truststore can include a Private CA-signed Certificate or a Public CA-signed Certificate. Typically the Root CA Certificate is used as otherwise the complete certificate chain involved in signing the Server Authentication Certificate has to be available with the truststore.
  - If the Keycloak Server is operated for HTTPS connections and this setting is not specified, then the JOC Cockpit will use the truststore that is configured with the *JETTY_BASE/resources/joc/joc.properties* configuration file. This includes use of settings for the truststore password and truststore type.
- The path to the truststore is specified relative to the *JETTY_BASE/resources/joc* directory. If the truststore is located in this directory, then only the file name is specified, typically with a .p12 extension. Other relative locations can be specified using, for example *../../joc-truststore.p12* if the truststore is located in the *JETTY_BASE* directory. An absolute path cannot be specified and a path cannot be specified that is located before the *JETTY_BASE* directory in the file system hierarchy.
- **Keycloak Truststore Password** specifies the password that protects the truststore if the Keycloak Server is configured for HTTPS connections.
- **Keycloak Truststore Type**  s one of *PKCS12* or *JKS*  (deprecated). The setting is used if the Keycloak Server is configured for HTTPS connections.
- Keycloak Clients are entities that request Keycloak to authenticate a user account. For example, an application such as JOC Cockpit acts as a Client to the Keycloak Server. Clients use Keycloak to authenticate and to provide a single sign-on solution.
  - **Keycloak Client ID** and *Keycloak Client Secret* are used for
    - requesting an access token
      - for user authentication,
      - for administrative access,
    - validating an existing access token,
    - renewing an existing access token.
  - **Keycloak Client Secret** is owned by the Client and needs to be known by both the Keycloak Server and the JOC Cockpit.
- **Keycloak Realm** manages a set of users, credentials, roles, and groups. A user belongs to a realm and performs a login to a realm. Realms are isolated from each other, they manage and authenticate exclusively user accounts that they control.
- **Keycloak Version 16 or earlier** is a compatibility switch for earlier Keycloak releases.

## References

### Context Help

- [Identity Service - Configuration](/identity-service-configuration)
- [Identity Services](/identity-services)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
- [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)
