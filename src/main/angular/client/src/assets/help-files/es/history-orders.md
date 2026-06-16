# Historial de Órdenes

La vista *Historial de Órdenes* resume el historial de ejecución de Órdenes. Esto incluye el historial de ejecución de Jobs utilizados en Workflows disparados por las Órdenes correspondientes.

El *Historial de Órdenes* está sujeto a la depuración de la base de datos realizada por el [Servicio de Limpieza](/service-cleanup).

Para el historial de tareas, consulte [Historial de Tareas](/history-tasks).

## Panel de Navegación

El panel izquierdo permite filtrar por Etiquetas de Workflows y Órdenes.

- Las **Etiquetas de Workflow** se asignan desde la vista [Configuración - Inventario - Workflows](/configuration-inventory-workflows).
- Las **Etiquetas de Orden** se asignan desde la vista [Configuración - Inventario - Planificaciones](/configuration-inventory-schedules).

Las Etiquetas se seleccionan con los iconos + y - y pueden buscarse usando el icono de Búsqueda Rápida. La visualización de Etiquetas debe activarse desde la página [Configuración - JOC Cockpit](/settings-joc).

## Panel de Historial

La visualización está limitada a un máximo de 5000 entradas salvo que se especifique lo contrario desde [Perfil - Preferencias](/profile-preferences).

### Historial de Órdenes

- **ID de Orden** es el identificador único asignado a una Orden. Al hacer clic en el icono de flecha hacia abajo se mostrarán las variables de la Orden y los Jobs por los que pasó la Orden.
- **Workflow** indica el Workflow por el que pasó la Orden.
  - Al hacer clic en el nombre del Workflow se navega a la vista [Workflows](/workflows).
  - Al hacer clic en el icono del lápiz se navega a la vista [Configuración - Inventario - Workflows](/configuration-inventory-workflows).
- **Etiqueta** indica la última posición de una Orden en el Workflow. Los usuarios pueden asignar etiquetas a las instrucciones del Workflow que se mostrarán; de lo contrario, se indicará la posición técnica.
- **Estado del Historial** indica el *Estado del Historial*, que es el último resultado en la vida de la Orden.
  - Si las Órdenes están completadas, el *Estado del Historial* será *exitoso* o *fallido*.
  - Si las Órdenes no están completadas, el *Estado del Historial* será *en progreso*.
- **Estado de la Orden** indica el último estado de la Orden; consulte [Estados de las Órdenes](/order-states).
  - Si las Órdenes están completadas, el *Estado de la Orden* será *finalizado*.
  - Si las Órdenes no están completadas, el *Estado de la Orden* será *procesando*.

### Acceso a la Salida de Log

- **ID de Orden**: Al hacer clic en el *ID de Orden* se mostrará la salida de log de la Orden desde la [Vista de Log de Orden](/order-log). El log incluye la salida creada por cualquier Job ejecutado con el Workflow.
- **Icono de Descarga**: al hacer clic en el icono se descargará el log de la Orden a un archivo.

Por defecto, la visualización de los logs de Orden está limitada a 10 MB de tamaño de log; de lo contrario, los logs se descargan a archivos. Los usuarios pueden ajustar el límite desde la página [Configuración - JOC Cockpit](/settings-joc).

### Operaciones sobre el Historial de Tareas

Los usuarios encuentran un menú de acción por Tarea que ofrece la siguiente operación:

- **Agregar Workflow a la Lista de Ignorados** ocultará permanentemente las Órdenes del Workflow en la visualización. Esto puede ser útil para Workflows cíclicos que llenan el *Historial de Órdenes*.

La *Lista de Ignorados* se gestiona desde el botón correspondiente en la esquina superior derecha de la ventana:

- **Editar Lista de Ignorados** mostrará los Workflows en la *Lista de Ignorados* y ofrecerá la posibilidad de eliminar entradas individualmente de la *Lista de Ignorados*.
- **Habilitar Lista de Ignorados** activará el filtrado para ocultar los Workflows que han sido añadidos individualmente a la *Lista de Ignorados*. Una *Lista de Ignorados* activa se indica desde el botón correspondiente.
- **Deshabilitar Lista de Ignorados** desactivará el filtrado de Workflows. La operación está disponible para una *Lista de Ignorados* activa.
- **Restablecer Lista de Ignorados** eliminará los Workflows de la *Lista de Ignorados*, lo que resulta en la visualización de todos los Workflows.

## Filtros

Los usuarios pueden aplicar los filtros disponibles en la parte superior de la ventana para limitar la visualización de Órdenes.

- Los botones de filtro **Exitoso**, **Fallido**, **En Progreso** limitan la visualización a las Órdenes con el *Estado del Historial* correspondiente.
- Los botones de filtro **Rango de Fechas** ofrecen la posibilidad de elegir el rango de fechas para la visualización de Órdenes.
- La casilla de verificación **Controlador Actual** limita las Órdenes al Controlador seleccionado actualmente.

## Referencias

### Ayuda Contextual

- [Servicio de Limpieza](/service-cleanup)
- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
- [Configuración - Inventario - Planificaciones](/configuration-inventory-schedules)
- [Vista de Log de Orden](/order-log)
- [Estados de las Órdenes](/order-states)
- [Perfil - Preferencias](/profile-preferences)
- [Configuración - JOC Cockpit](/settings-joc)
- [Historial de Tareas](/history-tasks)
- [Workflows](/workflows)

### Base de Conocimiento del Producto

- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Task History](https://kb.sos-berlin.com/display/JS7/JS7+-+Task+History)
