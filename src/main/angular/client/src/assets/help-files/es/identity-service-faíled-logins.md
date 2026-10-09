# Servicio de Identidad - Intentos fallidos de Inicio de Sesión

Los Servicios de Identidad controlan el acceso a JOC Cockpit mediante autenticación y autorización, consulte [Servicios de Identidad](/identity-services).

Las cuentas de usuario que fallan al iniciar sesión quedan registradas en la sub-vista *Intentos fallidos de Inicio de Sesión*.

- La lista de Intentos fallidos de Inicio de Sesión incluye entradas para cualquier Servicio de Identidad que fue activado sin éxito. Si se usan varios Servicios de Identidad opcionales, el inicio de sesión se considera exitoso si uno de los Servicios de Identidad fue activado con éxito. En esta situación no se registra ningún Intento fallido de Inicio de Sesión.
- JOC Cockpit implementa retrasos para inicios de sesión repetidamente fallidos para evitar el análisis de los tiempos de respuesta y para prevenir ataques de fuerza bruta.
- Tenga en cuenta que varios Proveedores de Identidad, por ejemplo LDAP utilizado para el acceso a Active Directory, pueden no aceptar intentos de inicio de sesión repetidamente fallidos y pueden bloquear la cuenta de usuario relevante.

Los usuarios deben tener en cuenta que los datos históricos de Intentos fallidos de Inicio de Sesión están sujetos a depuración por el [Servicio de Limpieza](/service-cleanup).

## Operaciones sobre los Intentos fallidos de Inicio de Sesión

Los usuarios encuentran las siguientes operaciones sobre los Intentos fallidos de Inicio de Sesión:

- **Agregar a Lista de Bloqueo** agregará la cuenta correspondiente a la [Servicio de Identidad - Lista de Bloqueo](/identity-service-blocklist), lo que deniega futuros inicios de sesión. La operación está disponible si se indica una cuenta. Para los inicios de sesión realizados sin cuenta se indica el marcador *\*none*.

## Referencias

### Ayuda Contextual

- [Servicio de Limpieza](/service-cleanup)
- [Servicio de Identidad - Lista de Bloqueo](/identity-service-blocklist)
- [Servicios de Identidad](/identity-services)

### Base de Conocimiento del Producto

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
