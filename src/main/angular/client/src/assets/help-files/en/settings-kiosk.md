# Configuración - Kiosco

El JOC Cockpit puede operarse en [JS7 - Kiosk Mode](https://kb.sos-berlin.com/display/JS7/JS7+-+Kiosk+Mode), que incluye:

- operación desatendida,
- visualización de varias páginas, cada una durante un período predefinido,
- actualización de páginas cuando llegan nuevos eventos, como la finalización de Jobs.

La página de *Configuración* es accesible desde el ícono ![ícono de rueda](assets/images/wheel.png) en la barra de menú.

## Configuración del modo kiosco

### Configuración: *kiosk\_role*, Predeterminado: *kiosk*

Especifica el nombre del Rol que se asigna a una cuenta utilizada para operar en modo kiosco:

- El Rol debe ser creado por el usuario.
- El Rol debe incluir permisos de solo lectura.
- El Rol es el único asignado a la cuenta.

### Configuración: *view\_dashboard\_duration*, Predeterminado: *20*

Especifica la duración en segundos durante la cual se mostrará el Panel de Control.

Los usuarios pueden modificar el diseño del Panel de Control para la cuenta utilizada en modo kiosco.

- Un valor 0 especifica que la vista no se mostrará.
- Un valor >10 especifica la duración deseada.

### Configuración: *view\_monitor\_order\_notification\_duration*, Predeterminado: *15*

Especifica la duración en segundos durante la cual se mostrará la vista [Monitor - Notificaciones de Órdenes](/monitor-notifications-order).

- Un valor 0 especifica que la vista no se mostrará.
- Un valor >10 especifica la duración deseada.

### Configuración: *view\_monitor\_system\_notification\_duration*, Predeterminado: *15*

Especifica la duración en segundos durante la cual se mostrará la vista [Monitor - Notificaciones del Sistema](/monitor-notifications-system).

- Un valor 0 especifica que la vista no se mostrará.
- Un valor >10 especifica la duración deseada.

### Configuración: *view\_history\_tasks\_duration*, Predeterminado: *30*

Especifica la duración en segundos durante la cual se mostrará la vista [Historial de Tareas](/history-tasks).

- Un valor 0 especifica que la vista no se mostrará.
- Un valor >10 especifica la duración deseada.

### Configuración: *view\_history\_orders\_duration*, Predeterminado: *0*

Especifica la duración en segundos durante la cual se mostrará la vista [Historial de Órdenes](/history-orders).

Un valor 0 especifica que la vista no se mostrará.
Un valor >10 especifica la duración deseada.

## Referencias

### Ayuda Contextual

- [Monitor - Notificaciones de Órdenes](/monitor-notifications-order)
- [Monitor - Notificaciones del Sistema](/monitor-notifications-system)
- [Historial de Órdenes](/history-orders)
- [Historial de Tareas](/history-tasks)
- [Configuración](/settings)

### Base de Conocimiento del Producto

- [JS7 - Kiosk Mode](https://kb.sos-berlin.com/display/JS7/JS7+-+Kiosk+Mode)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
