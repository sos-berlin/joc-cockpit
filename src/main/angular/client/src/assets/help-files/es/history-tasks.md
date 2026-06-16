# Historial de Tareas

La vista *Historial de Tareas* resume el historial de ejecución de Jobs que se indican de forma independiente del Workflow y la Orden para los que fueron ejecutados.

El *Historial de Tareas* está sujeto a la depuración de la base de datos realizada por el [Servicio de Limpieza](/service-cleanup).

Para el historial de Órdenes, consulte [Historial de Órdenes](/history-orders).

## Panel de Navegación

El panel izquierdo permite filtrar por Etiquetas de Workflows y Órdenes que dispararon la ejecución del Job.

- Las **Etiquetas de Workflow** se asignan desde la vista [Configuración - Inventario - Workflows](/configuration-inventory-workflows).
- Las **Etiquetas de Orden** se asignan desde la vista [Configuración - Inventario - Planificaciones](/configuration-inventory-schedules).

Las Etiquetas se seleccionan con los iconos + y - y pueden buscarse usando el icono de búsqueda. La visualización de Etiquetas debe activarse desde la página [Configuración - JOC Cockpit](/settings-joc).

## Panel de Historial

La visualización está limitada a un máximo de 5000 entradas salvo que se especifique lo contrario desde [Perfil - Preferencias](/profile-preferences).

### Historial de Jobs

- **Nombre del Job** indica el Job correspondiente.
- **Workflow** indica el Workflow para el que se ejecutó el Job.
  - Al hacer clic en el nombre del Workflow se navega a la vista [Workflows](/workflows).
  - Al hacer clic en el icono del lápiz se navega a la vista [Configuración - Inventario - Workflows](/configuration-inventory-workflows).
- **Etiqueta** indica la posición del Job en el Workflow. Los usuarios asignan *Etiquetas* a los Jobs que se mostrarán. Si el mismo Job aparece más de una vez en un Workflow, se indicará con diferentes *Etiquetas*.
- **Estado del Historial** indica el resultado del Job.
  - Si los Jobs están completados, el *Estado del Historial* será *exitoso* o *fallido*.
  - Si los Jobs no están completados, el *Estado del Historial* será *en progreso*.

### Acceso a la Salida de Log

- **Nombre del Job**: Al hacer clic en el *Nombre del Job* se mostrará la salida de log del Job desde la [Vista de Log de Tarea](/task-log).
- **Icono de Descarga**: al hacer clic en el icono se descargará el log del Job a un archivo.

Por defecto, la visualización de los logs de tarea está limitada a 10 MB de tamaño de log; de lo contrario, los logs se descargan a archivos. Los usuarios pueden ajustar el límite desde la página [Configuración - JOC Cockpit](/settings-joc).

### Operaciones sobre el Historial de Tareas

Los usuarios encuentran un menú de acción por Tarea que ofrece las siguientes operaciones:

- **Agregar Job a la Lista de Ignorados** ocultará permanentemente el Job en la visualización. Esto puede ser útil para Jobs que se ejecutan repetidamente y llenan el *Historial de Tareas*.
- **Agregar Workflow a la Lista de Ignorados** ocultará permanentemente los Jobs del Workflow en la visualización. Esto puede ser útil para Workflows cíclicos que llenan el *Historial de Tareas*.

La *Lista de Ignorados* se gestiona desde el botón correspondiente en la esquina superior derecha de la ventana:

- **Editar Lista de Ignorados** mostrará los Jobs y Workflows en la *Lista de Ignorados* y ofrecerá la posibilidad de eliminar entradas individualmente de la *Lista de Ignorados*.
- **Habilitar Lista de Ignorados** activará el filtrado para ocultar los Jobs que han sido añadidos individualmente a la *Lista de Ignorados* o que están incluidos en un Workflow que fue añadido. Una *Lista de Ignorados* activa se indica desde el botón correspondiente.
- **Deshabilitar Lista de Ignorados** desactivará el filtrado de Jobs y Workflows. La operación está disponible para una *Lista de Ignorados* activa.
- **Restablecer Lista de Ignorados** eliminará Jobs y Workflows de la *Lista de Ignorados*, lo que resulta en la visualización de todos los jobs.

## Filtros

Los usuarios pueden aplicar los filtros disponibles en la parte superior de la ventana para limitar la visualización de Jobs.

- Los botones de filtro **Exitoso**, **Fallido**, **En Progreso** limitan la visualización a los Jobs con el *Estado del Historial* correspondiente.
- Los botones de filtro **Rango de Fechas** ofrecen la posibilidad de elegir el rango de fechas para la visualización de Jobs.
- La casilla de verificación **Controlador Actual** limita los Jobs al Controlador seleccionado actualmente.

## Referencias

### Ayuda Contextual

- [Servicio de Limpieza](/service-cleanup)
- [Configuración - Inventario - Planificaciones](/configuration-inventory-schedules)
- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
- [Historial de Órdenes](/history-orders)
- [Perfil - Preferencias](/profile-preferences)
- [Configuración - JOC Cockpit](/settings-joc)
- [Vista de Log de Tarea](/task-log)

### Base de Conocimiento del Producto

- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Task History](https://kb.sos-berlin.com/display/JS7/JS7+-+Task+History)
