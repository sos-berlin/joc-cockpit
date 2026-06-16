# Servicio de Identidad - Permisos

Los Servicios de Identidad controlan el acceso a JOC Cockpit mediante autenticación y autorización, consulte [Servicios de Identidad](/identity-services).

Para la autorización, JS7 ofrece un Modelo de Control de Acceso Basado en Roles (RBAC) que incluye que:

- los roles se configuran libremente a partir de los permisos disponibles,
- a los usuarios se les asignan uno o más roles que se combinan para obtener los permisos resultantes.

Los permisos especifican uno de los siguientes estados:

- el permiso no está asignado (color de fondo blanco),
- el permiso está concedido (color de fondo azul),
- el permiso está denegado (color de fondo gris).

Los permisos se combinan de todos los roles para obtener los permisos resultantes de una cuenta de usuario.

## Alcance de Carpeta

El alcance de los permisos en un rol puede limitarse a una o más carpetas del inventario.

- Los usuarios pueden usar el botón *Agregar Carpeta* en la esquina superior derecha de la vista para seleccionar una carpeta del inventario y especificar el uso recursivo.
- Los usuarios pueden agregar cualquier número de carpetas del inventario a un rol.

## Árbol de Permisos

Los permisos pueden considerarse un árbol que ofrece una jerarquía de ramas. Conceder o denegar permisos en un nivel superior hereda la asignación de permisos recursivamente a niveles más profundos del árbol.

### Conceder y Denegar Permisos

Los permisos se visualizan como un rectángulo similar a una batería:

- Al hacer clic en el polo en el lado derecho de una batería se expandirán/contraerán los permisos descendientes.
- Al hacer clic en el fondo de la batería se alternará el permiso entre el estado no asignado y el estado concedido:
  - Un rectángulo con color de fondo blanco indica un permiso no asignado.
  - Un rectángulo con color de fondo azul indica un permiso concedido que se propagará a los permisos descendientes. <br/><img src="identity-service-permissions-granted.png" alt="Granted Permissions" width="600" height="100" />
  - Un rectángulo con color de fondo azul claro indica un permiso concedido heredado. Los cambios al permiso requieren no conceder el permiso del padre sino conceder los permisos hijos individualmente. <br/><img src="identity-service-permissions-inherited.png" alt="Inherited Permissions" width="600" height="100" />
- Al hacer clic en el icono + dentro del rectángulo de un permiso se cambia el permiso al estado denegado, indicado con color de fondo gris. Al hacer clic en el icono - dentro de un permiso denegado, este pasa a ser un permiso no asignado con color de fondo blanco. <br/><img src="identity-service-permissions-denied.png" alt="Denied Permissions" width="600" height="100" />

### Contraer y Expandir Permisos

Se ofrecen los siguientes botones para expandir/contraer permisos:

- **Expandir Todo**, **Contraer Todo** expandirán o contraerán todos los permisos.
- **Expandir Activos** expandirá los permisos concedidos/denegados y mantendrá contraídos los permisos heredados.
- **Contraer Inactivos** contraerá los permisos no asignados.

## Vista Gráfica y Tabular

En la esquina superior derecha se ofrecen los siguientes botones para la visualización de permisos:

- **Vista Gráfica** muestra los permisos en un árbol con forma de batería.
- **Vista Tabular** muestra los permisos en una representación textual con los niveles de permisos separados por dos puntos.

## Referencias

### Ayuda Contextual

- [Servicio de Identidad - Roles](/identity-service-roles)
- [Servicios de Identidad](/identity-services)

### Base de Conocimiento del Producto

- [JS7 - Default Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Default+Roles+and+Permissions)
- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
- [JS7 - Management of User Accounts, Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+User+Accounts%2C+Roles+and+Permissions)
