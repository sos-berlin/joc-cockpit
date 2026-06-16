# Servicios de Identidad

Los Servicios de Identidad controlan el acceso a JOC Cockpit mediante autenticación y autorización.

Los Servicios de Identidad implementan Métodos de Autenticación y acceso a Proveedores de Identidad. Por ejemplo, las credenciales como cuenta de usuario/contraseña se utilizan como Método de Autenticación para acceder a un Servicio de Directorio LDAP que actúa como Proveedor de Identidad. Consulte [JS7 - Identity and Access Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+and+Access+Management).

- [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
- [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)
- [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
- [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)
- [JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
- [JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)

Para más detalles consulte [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services).

Por defecto los usuarios encuentran el Servicio de Identidad JOC-INITIAL que se agrega durante la instalación inicial.

- El Servicio de Identidad contiene la única cuenta de usuario *root* con contraseña *root*. Los usuarios deben modificar la contraseña de la cuenta de usuario *root* en el primer inicio de sesión.
- Los usuarios pueden agregar [Servicio de Identidad - Cuentas](/identity-service-accounts) y [Servicio de Identidad - Roles](/identity-service-roles) al Servicio de Identidad.
- Los usuarios pueden modificar el Servicio de Identidad existente o agregar nuevos Servicios de Identidad.

## Activación de los Servicios de Identidad

Los Servicios de Identidad pueden marcarse como opcionales o requeridos. Indican un orden por el cual serán activados.

- Los Servicios de Identidad serán activados en orden ascendente.
- Si los Servicios de Identidad están calificados como opcionales, el inicio de sesión se completa con el primer Servicio de Identidad que se active exitosamente. En caso de inicio de sesión fallido, se activa el siguiente Servicio de Identidad.
- Si los Servicios de Identidad están calificados como requeridos, todos ellos serán activados para el inicio de sesión de un usuario.

## Lista de Servicios de Identidad

Para cada Servicio de Identidad se muestran las siguientes propiedades:

- **Nombre del Servicio de Identidad** puede elegirse libremente.
- **Tipo de Servicio de Identidad** es uno de JOC, LDAP, OIDC, CERTIFICATE, FIDO, KEYCLOAK. Para LDAP, OIDC y KEYCLOAK se pueden usar los tipos de servicio adicionales LDAP-JOC, OIDC-JOC y KEYCLOAK-JOC que almacenan la asignación de roles en JOC Cockpit.
- **Esquema de Autenticación** puede ser *single-factor* o *two-factor*.
- **Segundo Factor** indica si un segundo factor está habilitado para la autenticación *two-factor*.
- **Orden** indica la secuencia en la que el Servicio de Identidad es activado para la autenticación.
- **Deshabilitado** indica si el Servicio de Identidad está inactivo y no se utiliza para el inicio de sesión.
- **Requerido** indica que el Servicio de Identidad será activado además de los Servicios de Identidad con un orden anterior.

## Operaciones sobre los Servicios de Identidad

Los usuarios pueden hacer clic en uno de los Servicios de Identidad para navegar a la vista [Servicio de Identidad - Roles](/identity-service-roles) o a la vista [Servicio de Identidad - Cuentas](/identity-service-accounts) si está disponible para el servicio.

Los usuarios pueden agregar un Servicio de Identidad desde el botón correspondiente en la esquina superior derecha de la pantalla.

Para los Servicios de Identidad existentes se ofrecen las siguientes operaciones desde su menú de acción de 3 puntos:

- **Editar** ofrece especificar la configuración general del Servicio de Identidad.
- **Gestionar Configuración** ofrece especificar la configuración específica para un tipo de servicio.
- **Deshabilitar** desactiva el Servicio de Identidad; no se utilizará para el inicio de sesión.
- **Eliminar** elimina el Servicio de Identidad.

## Referencias

### Ayuda Contextual

- [Servicio de Identidad - Cuentas](/identity-service-accounts)
- [Servicio de Identidad - Configuración](/identity-service-configuration)
- [Servicio de Identidad - Roles](/identity-service-roles)

### Base de Conocimiento del Producto

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
