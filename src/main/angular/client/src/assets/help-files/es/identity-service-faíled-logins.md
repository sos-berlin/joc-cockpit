# Servicio de Identidad - Inicios de Sesión Fallidos

Los Servicios de Identidad controlan el acceso a JOC Cockpit mediante autenticación y autorización, consulte [Servicios de Identidad](/identity-services).

Las cuentas de usuario que fallan al iniciar sesión quedan registradas en la sub-vista *Inicios de Sesión Fallidos*.

- La lista de Inicios de Sesión Fallidos incluye entradas para cualquier Servicio de Identidad que fue activado sin éxito. Si se usan varios Servicios de Identidad opcionales, el inicio de sesión se considera exitoso si uno de los Servicios de Identidad fue activado con éxito. En esta situación no se registra ningún Inicio de Sesión Fallido.
- JOC Cockpit implementa retrasos para inicios de sesión repetidamente fallidos para evitar el análisis de los tiempos de respuesta y para prevenir ataques de fuerza bruta.
- Tenga en cuenta que varios Proveedores de Identidad, por ejemplo LDAP utilizado para el acceso a Active Directory, pueden no aceptar intentos de inicio de sesión repetidamente fallidos y pueden bloquear la cuenta de usuario relevante.

Los usuarios deben tener en cuenta que los datos históricos de Inicios de Sesión Fallidos están sujetos a depuración por el [Servicio de Limpieza](/service-cleanup).

## Operaciones sobre los Inicios de Sesión Fallidos

Los usuarios encuentran las siguientes operaciones sobre los Inicios de Sesión Fallidos:

- **Agregar a Lista de Bloqueo** agregará la cuenta correspondiente a la [Lista de Bloqueo del Servicio de Identidad](/identity-service-blocklist), lo que deniega futuros inicios de sesión. La operación está disponible si se indica una cuenta. Para los inicios de sesión realizados sin cuenta se indica el marcador *\*none*.

## Referencias

### Ayuda Contextual

- [Servicio de Limpieza](/service-cleanup)
- [Lista de Bloqueo del Servicio de Identidad](/identity-service-blocklist)
- [Servicios de Identidad](/identity-services)

### Base de Conocimiento del Producto

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
