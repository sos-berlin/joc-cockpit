# Identity Service - LDAP Settings

Identity Services rule access to JOC Cockpit by authentication and authorization, see [Identity Services](/identity-services).

Identity Services are specified from the following configuration:

- **General Configuration** that holds properties available to all Identity Services, see [Identity Service - Configuration](/identity-service-configuration).
- **Settings** that are specific for the LDAP Identity Service Type.

## Settings

For LDAP the tabs for *Fewer Options* and *More Options* are offered.

- *Fewer Options* can be applied if Microsoft Active Directory® or similar are in use.
- *More Options* offer fine-grained configuration for any LDAP Server.

For details see
- [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
  - [JS7 - LDAP Identity Service Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service+Configuration)
  - [JS7 - LDAP over TLS using STARTTLS and LDAP over SSL using LDAPS](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+over+TLS+using+STARTTLS+and+LDAP+over+SSL+using+LDAPS)

### Settings: Fewer Options

- **LDAP Server Host** expects the hostname or IP address of the LDAP Server host. If TLS/SSL protocols are used then the Fully Qualified Domain Name (FQDN) of the host has to be used for which the LDAP Server SSL certificate is issued.
- **LDAP Server Protocol** can be Plain Text, TLS or SSL. Plain Text is not recommended as the user account and password will be sent through the network without encryption. TLS and SSL protocols are considered being secure as they encrypt the content/connection to the LDAP Server.
- **LDAP Server Port** is the port the LDAP Server is listening to. For Plain Text and TLS connections port 389 is frequently used, for SSL connections port 636 is a frequent option.
- **LDAP Server is Active Directory** simplifies the configuration if the LDAP Server is implemented by Active Directory. A number of attributes for user search and group search are automatically assumed if Active Directory is used.
- **LDAP Server offers samAccountName attribute** specifies if the *samAccountName* attribute acts as the unique identifier of a user account. This attribute frequently is available with Active Directory LDAP Servers.
- **LDAP Server offers memberOf attribute** simplifies the search for Security Groups for which the user account has membership. This attribute frequently is available with LDAP Servers of type Active Directory, however, other LDAP products similarly can implement the attribute.
- **LDAP User DN Template** is a placeholder for the Distinguished Name (DN) that identifies a user account. The value *{0}* can be used for Active Directory LDAP Servers and will be replaced by the user account specified during login.
- **LDAP Server Search Base** is used for looking up user accounts in the hierarchy of LDAP Server entries, for example *OU=Operations, O=IT, O=Users, DC=example, DC=com*.
- **LDAP User Search Filter** specifies an LDAP query that is used to identify the user account in the hierarchy of LDAP entries.

### Settings: More Options

#### General Settings

- **LDAP Server URL** specifies the protocol, for example *ldap://* for Plain Text and TLS connections, *ldaps://* for SSL connections. The protocol is added the hostname (FQDN) and port of the LDAP Server.
- **LDAP Server Read Timeout** specifies the duration in seconds for which JOC Cockpit will wait for LDAP Server responses when the connection is established.
- **LDAP Server Connect Timeout** specifies the duration in seconds for which JOC Cockpit will wait for LDAP Server responses when establishing the connection.
- **LDAP Start TLS** switch makes TLS the protocol for the connection to the LDAP Server.
- **LDAP Host Name Verification** switch has to be active to verify if hostnames in the LDAP Server URL and in the LDAP Server certificate match.
- **LDAP Truststore Path** specifies the location of a truststore should the LDAP Server be configured for TLS/SSL protocols. The indicated truststore must include an X.509 certificate specified for the Extended Key Usage of Server Authentication.
  - For connections to well known LDAP Identity Providers such as Azure® users should specify the path to the Java *cacerts* truststore file that ships with the Java JDK used with JOC Cockpit.
  - The truststore can include a Private CA-signed Certificate or a Public CA-signed Certificate. Typically the Root CA Certificate is used as otherwise the complete certificate chain involved in signing the Server Authentication Certificate has to be available with the truststore.
  - If the LDAP Server is operated for TLS/SSL connections and this setting is not specified, then JOC Cockpit will use the truststore that is configured with the *JETTY_BASE/resources/joc/joc.properties* configuration file. This includes use of settings for the truststore password and truststore type.
  - The path to the truststore is specified relative to the *JETTY_BASE/resources/joc* directory. If the truststore is located in this directory, then specify the file name only, typically with a .p12 extension. Other relative locations can be specified using e.g. *../../joc-truststore.p12* if the truststore is located in the *JETTY_BASE* directory. No absolute path can be specified and no path can be specified that is located before the *JETTY_BASE* directory in the file system hierarchy.
- **LDAP Truststore Password** specifies the password that protects the LDAP truststore. If the Java JDK *cacerts* truststore is used, then the default password is *changeit*.
- **LDAP Truststore Type** specifies the type of truststore which is one of *PKCS12* or *JKS* (deprecated).

#### Authentication Settings

- **LDAP User DN Template** is a placeholder for the Distinguished Name (DN) that identifies a user account. The value *{0}* can be used for Active Directory LDAP Servers and will be replaced by the user account specified during login. 
- **LDAP System User DN Template** is applied if a *System User Account* is used to bind to the LDAP Server and to verify if the user account performing login exists with the given account and password. Use of a *System User Account* is discouraged as it exposes the account's password. The setting is similar to the *LDAP User DN Template* and specifies the placeholder for the *System User Account's* Distinguished Name.
- **LDAP System User Account** specifies the user account similar to login from the *samAccountName* or other attribute, for example using *account@domain*.
- **LDAP System User Password** specifies the *System User Account's* password.

#### Authorization Settings

- **LDAP Search Base** is used for looking up user accounts in the hierarchy of LDAP Server entries, for example *OU=Operations, O=IT, O=Users, DC=example,DC=com*.
- **LDAP Group Search Base** is used similarly to the *Search Base* to look up Security Groups which a user account has membership of.
- **LDAP Group Search Filter** specifies an LDAP query which is used to identify Security Groups the user account is a member of. The filter is applied to search results provided starting from the Group Search Base.
- **LDAP Group Name Attribute** specifies the attribute that provides the name of the Security Group that a user account is a member of, for example the *CN* (Common Name) attribute.
- LDAP Group/Roles Mapping
  - **Disable nested group search** specifies that Security Groups will not be looked up recursively if they are members of Security Groups.
  - **Group/Name Mapping** specifies the mapping of Security Groups which the user account is a member of and JS7 roles. Security Groups have to be specified depending on the *LDAP Group Search Attribute* as Distinguished Names, for example *CN=js7_admins, OU=Operations, O=IT, O=Groups, DC=example, DC=com*, or as Common Names, for example *js7_admins*.

## References

### Context Help

- [Identity Service - Configuration](/identity-service-configuration)
- [Identity Services](/identity-services)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
  - [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
    - [JS7 - LDAP Identity Service Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service+Configuration)
    - [JS7 - LDAP over TLS using STARTTLS and LDAP over SSL using LDAPS](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+over+TLS+using+STARTTLS+and+LDAP+over+SSL+using+LDAPS)
