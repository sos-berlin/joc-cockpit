# Servicio de Identidad - Lista de Bloqueo

Los Servicios de Identidad controlan el acceso a JOC Cockpit mediante autenticación y autorización, consulte [Servicios de Identidad](/identity-services).

Las cuentas de usuario administrativas pueden añadir cuentas de cualquier Servicio de Identidad a una lista de bloqueo:

- Las cuentas bloqueadas tienen denegado el acceso a JOC Cockpit; no están bloqueadas con el Proveedor del Servicio de Identidad como LDAP, OIDC, etc.
- Las cuentas bloqueadas permanecen en la lista de bloqueo hasta que sean eliminadas de la lista.

## Agregar Cuentas a la Lista de Bloqueo

La sub-vista *Lista de Bloqueo* ofrece agregar cuentas a la lista de bloqueo desde el botón correspondiente en la esquina superior derecha de la vista.

Las cuentas de usuario pueden agregarse a la lista de bloqueo desde las siguientes sub-vistas:

- [Registro de Auditoría - Inicios de Sesión Fallidos](/identity-service-faíled-logins): si se identifica que cuentas generan inicios de sesión fallidos con frecuencia, esto puede indicar un ataque. Dichas cuentas pueden ser añadidas a la lista de bloqueo.
- [Servicio de Identidad - Sesiones Activas](/identity-service-active-sessions): si se identifica que las cuentas en sesiones activas son no deseadas, pueden ser añadidas a la lista de bloqueo.

Ambas sub-vistas ofrecen la posibilidad de agregar cuentas individuales a la lista de bloqueo y de agregar cuentas seleccionadas mediante una operación masiva.

### Eliminar Cuentas de la Lista de Bloqueo

En la sub-vista *Lista de Bloqueo*, por cada cuenta mostrada se ofrece el elemento de menú de acción *Eliminar de la Lista de Bloqueo*.

Se ofrece una operación masiva usando el botón *Eliminar de la Lista de Bloqueo* en la esquina superior derecha de la sub-vista para las cuentas seleccionadas.

## Referencias

### Ayuda Contextual

- [Registro de Auditoría - Inicios de Sesión Fallidos](/identity-service-faíled-logins)
- [Servicio de Identidad - Sesiones Activas](/identity-service-active-sessions)
- [Servicios de Identidad](/identity-services)

### Base de Conocimiento del Producto

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
