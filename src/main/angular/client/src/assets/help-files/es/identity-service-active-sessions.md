# Servicio de Identidad - Sesiones Activas

Los Servicios de Identidad controlan el acceso a JOC Cockpit mediante autenticación y autorización, consulte [Servicios de Identidad](/identity-services).

Los usuarios pueden identificar las cuentas con sesiones activas al invocar la vista *Gestión de Servicios de Identidad* desde el icono de rueda en la barra de menú.

Las sesiones activas se muestran desde la cuenta en uso, desde el Servicio de Identidad utilizado para el inicio de sesión y desde el tiempo restante de la sesión.

- JOC Cockpit no limita el número de sesiones por cuenta.
- El tiempo restante de la sesión está limitado por los siguientes factores:
  - El parámetro *session_idle_timeout* configurado en la página [Configuración - Servicio de Identidad](/settings-identity-service) limita la duración máxima que una sesión puede permanecer activa sin actividad del usuario.
  - Los Proveedores de Servicio de Identidad, como OIDC y Keycloak, pueden limitar la duración máxima de una sesión de usuario.

## Operaciones sobre las Sesiones Activas

Los usuarios encuentran las siguientes operaciones sobre las Sesiones Activas:

- **Agregar a Lista de Bloqueo** agregará la cuenta correspondiente a la [Lista de Bloqueo del Servicio de Identidad](/identity-service-blocklist), lo que deniega futuros inicios de sesión. La operación no terminará la sesión actual de la cuenta.
- **Cancelar Sesión** terminará forzosamente la sesión actual de la cuenta. Esto no impedirá que la cuenta realice una nueva operación de inicio de sesión.
- **Cancelar todas las Sesiones de la Cuenta** de manera similar a *Cancelar Sesión*, terminará todas las sesiones de la cuenta indicada.

Al seleccionar una o más sesiones, la operación *Cancelar Sesión* está disponible como operación masiva con el botón correspondiente en la esquina superior derecha de la sub-vista.

## Referencias

### Ayuda Contextual

- [Lista de Bloqueo del Servicio de Identidad](/identity-service-blocklist)
- [Servicios de Identidad](/identity-services)
- [Configuración - Servicio de Identidad](/settings-identity-service)

### Base de Conocimiento del Producto

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
