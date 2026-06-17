# Identity Service - OIDC Settings

Identity Services rule access to JOC Cockpit by authentication and authorization, see [Identity Services](/identity-services).

Identity Services are specified from the following configuration:

- **General Configuration** that holds properties available to all Identity Services, see [Identity Service - Configuration](/identity-service-configuration).
- **Settings** that are specific for the OIDC Identity Service Type.

## Settings

The following settings are available:

- **OIDC Name** is used by JOC Cockpit for the caption of the related login button in the login page.
- **OIDC Authentication URL** is used by the Client to login to the OIDC Identity Provider. The URL is called by the Client for login and returns the Access Token from the OIDC Identity Provider. It is similarly used when reading settings of the OIDC Identity Provider with the */.well-known/openid-configuration* URL and is used as the issuer during token verification.
- **Flow Type**
  - **Authorization Code Flow** is the most commonly used flow with proven security.
  - **Implicit Flow** is a former flow that is considered insecure.
  - **Client Credentials Flow** ís a simplified flow for batch processing without user interaction.
- **OIDC Client ID** identifies the Client with the OIDC Identity Provider.
- **OIDC Client Secret** is the password assigned the *OIDC Client ID* in the OIDC Identity Provider.
- **OIDC User Name Attribute** is the name of the attribute used by the OIDC Identity Service to identify the user account.
  - The following strategy is applied to identify the attribute used to map to the JOC Cockpit account:
    - the URL *https://identity-provider/.well-known/openid-configuration* is called.
    - the response is checked for the object *claims_supported*
      - if not available or empty then the *email* attribute will be used
      - if available and if it includes the *preferred_username* attribute, then this attribute will be used.
    - if no attribute has been identified, then the *email* attribute is used.
  - Should this not result in an identifiable user account, then users can specify the name attribute. Frequently OIDC Identity Providers support attribute names such as *username* or *email*.
- **OIDC Claims** specify OIDC *roles* or *groups* that are used for the mapping to JS7 roles. Default *OIDC Claims* include *roles*, *groups*.
- **OIDC Scopes** specify the scope for which *OIDC Claims* will be returned by the OIDC Identity Service Provider. Default *OIDC Scopes* include *roles*, *groups*,  *profile*
- **OIDC Group/Roles Mapping** includes to assign roles to accounts.
  - A list of claims containing the groups configured in the OIDC Identity Service Provider can be specified. Available claims can be made available by checking the *JSON Web Token* during registration.
 - During assignment, the groups available from the OIDC Identity Service Provider are assigned to roles configured with the Identity Service. Any number of roles can be assigned to each group.
- **OIDC Image** optionally can be uploaded and will be displayed with the login page. Users can click the image to login with the OIDC Identity Service.
- **OIDC Truststore Path** if indicated must include an X.509 certificate specified for the Extended Key Usage of Server Authentication for the Identity Provider.
  - For connections to well known OIDC Identity Providers such as Azure® users should specify the path to the Java *cacerts* truststore file that ships with the Java JDK used with JOC Cockpit.
  - The truststore must include a Self-signed Certificate from a Private CA or Public CA. Typically the CA Certificate is used as otherwise the complete certificate chain involved in signing the Server Authentication Certificate must be available with the truststore.
  - If this setting is not specified, then the JOC Cockpit will use the truststore that is configured with the *JETTY_BASE/resources/joc/joc.properties* configuration file. This includes use of settings for the *OIDC Truststore Password* and *OIDC Truststore Type*.
  - The path to the truststore can be specified relative to the *JETTY_BASE/resources/joc* directory. If the truststore is located in this directory, then only the file name is specified, typically with a .p12 or .pfx extension. Other relative locations can be specified using for example *../../joc-truststore.p12* if the truststore is located in the *JETTY_BASE* directory.
  - An absolute path can be specified.
- **OIDC Truststore Type** is either PKCS12 or JKS (deprecated).
- **OIDC Truststore Password** specifies the password that protects the truststore.For the Java JDK's *cacerts* truststore the default password is *changeit*.

## References

### Context Help

- [Identity Service - Configuration](/identity-service-configuration)
- [Identity Services](/identity-services)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
- [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)
