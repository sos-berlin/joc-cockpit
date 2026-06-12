# Servicio de Identidad - Cuentas

Los Servicios de Identidad controlan el acceso a JOC Cockpit mediante autenticación y autorización, consulte [Servicios de Identidad](/identity-services).

Las cuentas de usuario se gestionan y almacenan en JOC Cockpit para los siguientes Tipos de Servicio de Identidad:

| Tipo de Servicio de Identidad | Documentación |
| ----- | ----- |
| *JOC* | [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service) |
| *KEYCLOAK-JOC* | [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service) |
| *LDAP-JOC* | [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service) |
| *OIDC-JOC* | [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service) |
| *CERTIFICATE* | [JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service) |
| *FIDO* | [JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service) |

Para los siguientes Tipos de Servicio de Identidad, las cuentas de usuario no se gestionan en JOC Cockpit sino con el Proveedor del Servicio de Identidad:

| Tipo de Servicio de Identidad | Documentación |
| ----- | ----- |
| *KEYCLOAK* | [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service) |
| *LDAP* | [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service) |
| *OIDC* | [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service) |

## Lista de Cuentas

Para cada cuenta se muestran las siguientes propiedades:

- **Cuenta** indica la cuenta tal como se especificó durante el inicio de sesión.
- **Roles** indica la lista de [Servicio de Identidad - Roles](/identity-service-roles) asignados a la cuenta.
- **Forzar Cambio de Contraseña** indica si la cuenta de usuario debe cambiar su contraseña en el próximo inicio de sesión.
- **Bloqueado** indica que la cuenta ha sido añadida a una [Lista de Bloqueo del Servicio de Identidad](/identity-service-blocklist) y se le deniega el acceso.
- **Deshabilitado** indica que la cuenta está inactiva y se le deniega el acceso.

## Operaciones sobre las Cuentas

Los usuarios pueden agregar una cuenta usando el botón correspondiente en la esquina superior derecha de la vista.

### Operaciones sobre Cuentas Individuales

Las siguientes operaciones están disponibles desde el menú de acción de 3 puntos de cada cuenta:

- **Editar** permite especificar la [Configuración de Cuenta del Servicio de Identidad](/identity-service-account-configuration).
- **Duplicar** copia la cuenta seleccionada a una nueva cuenta. Los usuarios deben especificar el nombre de la nueva cuenta.
- **Restablecer Contraseña** elimina la contraseña de la cuenta y asigna la contraseña especificada con el parámetro *initial_password* en la página [Configuración - Servicio de Identidad](/settings-identity-service). La cuenta de usuario correspondiente debe iniciar sesión con la *initial_password* y debe cambiar su contraseña en el próximo inicio de sesión.
- **Forzar Cambio de Contraseña** obliga a la cuenta a cambiar su contraseña en el próximo inicio de sesión.
- **Agregar a Lista de Bloqueo** deniega el acceso a la cuenta durante el tiempo que la cuenta esté añadida a la [Lista de Bloqueo del Servicio de Identidad](/identity-service-blocklist).
- **Deshabilitar** desactiva la cuenta y deniega el acceso desde esta cuenta.
- **Eliminar** borra la cuenta del Servicio de Identidad.
- **Mostrar Permisos** muestra la lista de permisos resultantes de la combinación de los roles de la cuenta indicada.

### Operaciones Masivas sobre Cuentas

Los usuarios encuentran las siguientes operaciones masivas desde los botones en la parte superior de la pantalla:

- **Exportar** agregará las cuentas seleccionadas a un archivo de exportación en formato JSON que puede utilizarse para importar cuentas a un Servicio de Identidad diferente en la misma o en una instancia diferente de JOC Cockpit.
- **Copiar** copiará las cuentas seleccionadas a un portapapeles interno desde el cual pueden pegarse a un Servicio de Identidad diferente en la misma instancia de JOC Cockpit.

Los usuarios pueden seleccionar una o más *Cuentas* para realizar las operaciones anteriores en forma masiva para las *Cuentas* seleccionadas.

- **Restablecer Contraseña** elimina la contraseña de las cuentas seleccionadas y asigna la contraseña especificada con el parámetro *initial_password* en la página [Configuración - Servicio de Identidad](/settings-identity-service). Las cuentas de usuario correspondientes deben iniciar sesión con la *initial_password* y deben cambiar su contraseña en el próximo inicio de sesión.
- **Forzar Cambio de Contraseña** obliga a las cuentas seleccionadas a cambiar su contraseña en el próximo inicio de sesión.
- **Deshabilitar** desactiva las cuentas seleccionadas y deniega el acceso desde dichas cuentas.
- **Habilitar** activa las cuentas seleccionadas que estaban deshabilitadas.
- **Eliminar** borra las cuentas seleccionadas del Servicio de Identidad.

## Referencias

### Ayuda Contextual

- [Servicio de Identidad - Configuración](/identity-service-configuration)
- [Configuración de Cuenta del Servicio de Identidad](/identity-service-account-configuration)
- [Servicio de Identidad - Roles](/identity-service-roles)
- [Lista de Bloqueo del Servicio de Identidad](/identity-service-blocklist)
- [Servicios de Identidad](/identity-services)
- [Configuración - Servicio de Identidad](/settings-identity-service)
- [Configuración - JOC Cockpit](/settings-joc)

### Base de Conocimiento del Producto

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
