# Servicio de Identidad - Configuración de Cuenta

Los Servicios de Identidad controlan el acceso a JOC Cockpit mediante autenticación y autorización, consulte [Servicios de Identidad](/identity-services).

Para algunos Servicios de Identidad están disponibles las operaciones para agregar, actualizar y eliminar cuentas, por ejemplo para el [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service).

## Configuración de Cuenta

Para una cuenta están disponibles las siguientes propiedades:

- **Cuenta** especifica la cuenta que se utiliza para iniciar sesión.
- **Contraseña** está disponible para el Tipo de Servicio de Identidad *JOC*. La *Contraseña* se aplicará un hash antes de almacenarse en la base de datos. Al iniciar sesión se realiza una operación de hash similar para comparar las contraseñas.
  - Se puede especificar una *Contraseña* individual. Si se deja vacío, se utilizará la *initial_password* especificada en la página [Configuración - Servicio de Identidad](/settings-identity-service). La *Contraseña* debe cumplir el requisito de *minimum_password_length* de la misma página de Configuración.
  - Independientemente de la fuente utilizada para la *Contraseña*, en el próximo inicio de sesión el usuario deberá cambiar la *Contraseña* de la cuenta.
- **Confirmar Contraseña** se utiliza para repetir una *Contraseña* especificada individualmente. Si la propiedad *Contraseña* está vacía, entonces la propiedad *Confirmar Contraseña* también debe estar vacía.
- **Roles** especifica la lista de [Servicio de Identidad - Roles](/identity-service-roles) asignados a la cuenta.
- **Forzar Cambio de Contraseña** indica si en el próximo inicio de sesión la cuenta de usuario debe cambiar su *Contraseña*. El cambio de contraseña se impone para evitar el uso continuado de la *Contraseña* especificada individualmente y de la *Contraseña* inicial.
- Las propiedades disponibles para cuentas existentes incluyen:
  - **Bloqueado** especifica que la cuenta debe ser añadida a la [Lista de Bloqueo del Servicio de Identidad](/identity-service-blocklist) y se le denegará el acceso.
  - **Deshabilitado** especifica que la cuenta está inactiva y se le denegará el acceso.

## Referencias

### Ayuda Contextual

- [Lista de Bloqueo del Servicio de Identidad](/identity-service-blocklist)
- [Servicio de Identidad - Roles](/identity-service-roles)
- [Servicios de Identidad](/identity-services)
- [Configuración - Servicio de Identidad](/settings-identity-service)

### Base de Conocimiento del Producto

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
