# Servicio de Identidad - Configuración

Los Servicios de Identidad controlan el acceso a JOC Cockpit mediante autenticación y autorización, consulte [Servicios de Identidad](/identity-services).

Los Servicios de Identidad se especifican desde la siguiente configuración:

- **Configuración General** que contiene las propiedades disponibles para todos los Servicios de Identidad.
- **Configuración** específica para el Tipo de Servicio de Identidad, consulte
  - [Configuración del Servicio de Identidad Keycloak](/identity-service-settings-keycloak)
  - [Configuración del Servicio de Identidad LDAP](/identity-service-settings-ldap)
  - [Configuración del Servicio de Identidad OIDC](/identity-service-settings-oidc)

## Configuración General

Para cualquier Servicio de Identidad se muestran las siguientes propiedades:

- **Nombre del Servicio de Identidad** puede elegirse libremente.
- **Tipo de Servicio de Identidad** es uno de JOC, LDAP, OIDC, CERTIFICATE, FIDO, KEYCLOAK. Para LDAP, OIDC y KEYCLOAK se pueden usar los tipos de servicio adicionales LDAP-JOC, OIDC-JOC y KEYCLOAK-JOC que almacenan la asignación de roles en JOC Cockpit.
- **Orden** indica la secuencia en la que el Servicio de Identidad será activado para la autenticación.
  - Los usuarios pueden especificar un valor entero para indicar el orden.
  - Los usuarios pueden modificar el orden moviendo el servicio en la lista de [Servicios de Identidad](/identity-services).
- **Requerido** indica que el Servicio de Identidad será activado además de los Servicios de Identidad con un orden anterior.
- **Deshabilitado** indica si el Servicio de Identidad está inactivo y no se usará para el inicio de sesión.
- **Esquema de Autenticación** es uno de *single-factor* o *two-factor*.
  - Si se elige *two-factor*, el usuario debe seleccionar el segundo factor de uno de los Servicios de Identidad de los Tipos FIDO o CERTIFICATE.

## Referencias

### Ayuda Contextual

- [Servicios de Identidad](/identity-services)
  - [JS7 - Keycloak Identity Service](/https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)
  - [JS7 - LDAP Identity Service](/https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
  - [JS7 - OIDC Identity Service](/https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)

### Base de Conocimiento del Producto

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
