# Servicio de Identidad - Roles

Los Servicios de Identidad controlan el acceso a JOC Cockpit mediante autenticación y autorización, consulte [Servicios de Identidad](/identity-services).

Para la autorización, JS7 ofrece un Modelo de Control de Acceso Basado en Roles (RBAC) que incluye que:

- los roles se configuran libremente a partir de los permisos disponibles,
- a los usuarios se les asignan uno o más roles que se combinan para obtener los permisos resultantes.

JS7 incluye los siguientes [JS7 - Default Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Default+Roles+and+Permissions) que pueden modificarse o eliminarse según la voluntad del usuario:

| Rol | Propósito | Permisos |
| ----- | ----- | ----- |
| administrator | Este es un rol técnico sin responsabilidades en el proceso de TI ni en el proceso de negocio. | El rol incluye todos los permisos para iniciar, reiniciar, realizar la conmutación, etc. de los productos JS7. |
| api_user | El rol está destinado a aplicaciones como monitores de sistema que acceden a JS7 a través de su API. | El rol concede preferentemente permisos de visualización. Además se incluyen permisos para gestionar órdenes y desplegar workflows. |
| application_manager | Este es un rol de ingeniería con conocimiento profundo de workflows, por ejemplo para la Gestión de Cambios. Este rol no está necesariamente involucrado en las operaciones diarias. | El rol incluye permisos para tareas administrativas en instancias del Controlador, configuración de clústeres, certificados y personalizaciones. Además, el rol incluye permisos para gestionar el inventario de JS7. La gestión de cuentas de usuario no está incluida. |
| business_user | El rol está destinado a usuarios de back-office que no son responsables de las operaciones de TI, pero posiblemente sí del proceso de negocio y por ello interesados en mantenerse informados sobre el estado de la ejecución de workflows. | El rol ofrece permisos de solo lectura. |
| incident_manager | El rol es para el Servicio de Atención de TI, por ejemplo soporte de 1.° y 2.° nivel, intervenciones y gestión de incidentes. | El rol está basado en el rol *application_manager* y agrega permisos completos de Controlador y Agente requeridos para la gestión de incidentes, por ejemplo acceso a archivos de log. |
| it_operator | Este es el rol para las operaciones diarias de workflows y el plan diario. | El rol concede preferentemente permisos de visualización. Además se incluyen permisos para gestionar órdenes y desplegar workflows. |

Se alienta a los usuarios a eliminar los roles no utilizados y a ajustar los permisos de los roles según sea necesario.

## Alcance de los Roles

Los roles se especifican para los siguientes ámbitos:

- Cada rol puede limitarse a una o más carpetas del inventario.
- A cada rol se le asigna un conjunto de permisos para las operaciones en JOC Cockpit.
- A cada rol se le asigna un conjunto de permisos para las operaciones predeterminadas en cualquier Controlador.
- A cada rol se le pueden asignar conjuntos de permisos adicionales por Controlador.

Los permisos especifican uno de los siguientes estados en el ámbito correspondiente:

- el permiso no está asignado,
- el permiso está concedido,
- el permiso está denegado.

Los permisos se combinan de todos los roles para obtener los permisos resultantes de una cuenta de usuario:

- JOC Cockpit
  - Si un permiso no está asignado en el ámbito de un solo rol, entonces los roles adicionales pueden conceder el permiso. Si ningún rol concede el permiso, entonces no se concede en los permisos resultantes.
  - Si un permiso está concedido en el ámbito de un solo rol, entonces se concederá en los permisos resultantes.
  - Si un permiso está denegado en el ámbito de un solo rol, entonces se denegará en los permisos resultantes. Los permisos denegados prevalecen sobre los permisos concedidos.
- Controlador
  - Si un permiso no está asignado en el ámbito predeterminado, entonces los ámbitos para Controladores individuales pueden conceder el permiso para el Controlador correspondiente.
  - Si un permiso está concedido en el ámbito predeterminado, entonces por defecto se aplica a todos los Controladores.
  - Si un permiso está concedido para un Controlador dado, entonces los permisos resultantes para el Controlador incluirán el permiso.
  - Si un permiso está denegado para un Controlador dado, esto prevalece sobre el mismo permiso concedido desde el ámbito predeterminado y desde otros roles para el mismo Controlador.
  - Si un permiso está denegado desde el ámbito predeterminado, esto prevalece sobre el mismo permiso concedido para cualquier Controlador.

## Operaciones sobre los Roles

Las siguientes operaciones están disponibles desde los botones correspondientes en la esquina superior derecha de la sub-vista:

- **Cuenta** limita la visualización a los roles asignados a la cuenta seleccionada.
- **Importar** ofrece importar roles desde un archivo en formato JSON que fue creado previamente mediante una *Exportación* de roles.
- **Agregar Controlador** ofrece agregar el ámbito de un Controlador específico.
- **Agregar Rol** ofrece crear un nuevo rol.

### Operaciones sobre Roles Individuales

Desde la lista de roles, los usuarios pueden arrastrar y soltar un rol a una posición diferente. La operación no tiene impacto en el procesamiento de los roles.

Desde el menú de acción de 3 puntos de cada rol se ofrecen las siguientes operaciones:

- **Editar** ofrece cambiar el nombre del rol. Los cambios se aplican a los roles existentes asignados a cualquier cuenta de usuario.
- **Duplicar** copia el rol a un nuevo rol. El usuario especifica el nombre del nuevo rol.
- **Eliminar** borra el rol del inventario y de cualquier cuenta de usuario a la que se le haya asignado el rol.

### Operaciones Masivas sobre Roles

Las siguientes operaciones masivas están disponibles al seleccionar uno o más roles:

- **Exportar** ofrecerá un archivo para descargar en formato JSON que contiene la configuración de los roles seleccionados. El archivo de exportación puede utilizarse para importar en la misma o en una instancia diferente de JOC Cockpit.
- **Copiar** agrega los roles al portapapeles interno para pegarlos posteriormente en un Servicio de Identidad diferente en la misma instancia de JOC Cockpit.
- **Eliminar** borra los roles seleccionados del inventario y de cualquier cuenta de usuario a la que se le hayan asignado los roles.

## Referencias

### Ayuda Contextual

- [Servicio de Identidad - Permisos](/identity-service-permissions)
- [Servicios de Identidad](/identity-services)

### Base de Conocimiento del Producto

- [JS7 - Default Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Default+Roles+and+Permissions)
- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
- [JS7 - Management of User Accounts, Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+User+Accounts%2C+Roles+and+Permissions)
