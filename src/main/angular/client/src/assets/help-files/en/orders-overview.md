# Vista General de Órdenes

La vista *Vista General de Órdenes* ofrece monitoreo y control de Órdenes para Workflows.

- Los usuarios pueden identificar las Órdenes que se están procesando por [Estado de Orden](/order-states).
- Los usuarios pueden hacer transiciones de Órdenes, por ejemplo, cancelando Órdenes *en ejecución*.
- La vista contiene Órdenes agregadas por el [Plan Diario](/daily-plan) y Órdenes que han sido agregadas bajo demanda.

## Panel de Selección de Estado de Orden

El panel izquierdo indica el número de Órdenes disponibles por estado. Hacer clic en el estado o número relacionado muestra las Órdenes correspondientes en el panel de Órdenes.

## Panel de Etiquetas

El panel central está organizado en pestañas que permiten filtrar Órdenes por Etiquetas.

- Las **Etiquetas de Workflow** se asignan desde la vista [Configuración - Inventario - Workflows](/configuration-inventory-workflows).
- Las **Etiquetas de Orden** se asignan desde la vista [Configuración - Inventario - Planificaciones](/configuration-inventory-schedules).

Las Etiquetas se seleccionan con los iconos + y - y pueden buscarse usando el icono de Búsqueda Rápida. La visualización de Etiquetas debe activarse desde la página [Configuración - JOC Cockpit](/settings-joc).

## Panel de Órdenes

El panel ofrece la lista de Órdenes para el estado dado:

- **Order ID** es el identificador único asignado a una Orden.
  - Hacer clic en el icono de flecha hacia abajo mostrará las variables que lleva la Orden.
- **Nombre del Workflow** es el nombre único asignado a un Workflow.
  - Hacer clic en el *Nombre del Workflow* navega a la vista [Workflows](/workflows).
  - Hacer clic en el icono de lápiz navega a la vista [Configuración - Inventario - Workflows](/configuration-inventory-workflows).
- **Etiqueta** indica la posición de la Orden por la etiqueta de la instrucción de Workflow. En ausencia de etiquetas, se indica la posición técnica.
- **Estado** indica el [Estado de Orden](/order-states).
  - Al pasar el ratón sobre el indicador de estado, se muestran detalles si están disponibles. Por ejemplo, las Órdenes en estado *esperando* indican razones como *esperando proceso*, *esperando Tablero de Avisos*, etc.
- **Programada Para** indica la fecha de inicio de la Orden.

## Panel de Historial

El panel se muestra en la parte inferior de la ventana cuando los usuarios hacen clic en el Order ID. El panel contiene subpestañas para el *Historial de Órdenes* y el *Registro de Auditoría*.

### Historial de Órdenes

- **Order ID** es el identificador único asignado a una Orden. Hacer clic en el icono de flecha hacia abajo mostrará las Variables de la Orden.
- **Etiqueta** indica la última posición de una Orden en el Workflow. Los usuarios pueden asignar *Etiquetas* a instrucciones de Workflow que se mostrarán; de lo contrario, se indicará la posición técnica.
- **Estado del Historial** indica el último resultado en la vida de la Orden.
  - Si las Órdenes están completadas, el *Estado del Historial* será *exitoso* o *fallido*.
  - Si las Órdenes no están completadas, el *Estado del Historial* será *en progreso*.
- **Hora Planificada** indica la fecha y hora original para la que estaba programada la Orden.
- **Hora de Inicio** indica la fecha y hora efectiva en que inició la Orden.
- **Hora de Fin** indica la fecha y hora en que completó la Orden.

#### Acceso a la Salida del Log

- **Order ID**: Hacer clic en el *Order ID* en el panel de *Historial* mostrará la salida del log de la Orden desde la [Vista del Log de Orden](/order-log). El log incluye la salida creada por cualquier Job ejecutado con el Workflow.
- **Icono de Descarga**: hacer clic en el icono descargará el log de la Orden a un archivo.

Por defecto, la visualización de logs de Órdenes está limitada a 10 MB de tamaño de log; de lo contrario, los logs se descargan a archivos. Los usuarios pueden ajustar el límite desde la página [Configuración - JOC Cockpit](/settings-joc).

### Registro de Auditoría

El *Registro de Auditoría* indica las operaciones de modificación realizadas sobre la Orden.

- **Creado** indica la fecha en que se realizó la operación.
- **Cuenta** indica la cuenta de usuario que realizó la operación.
- **Solicitud** indica el endpoint de la API REST que fue llamado.
- **Categoría** especifica la clasificación de la operación, como CONTROLLER al cancelar Órdenes o DAILYPLAN al crear Órdenes desde el [Plan Diario](/daily-plan).
- **Motivo** explica por qué se modificó una Orden. El JOC Cockpit puede configurarse para exigir la especificación de motivos al modificar objetos.
  - El ajuste está disponible en [Perfil - Preferencias](/profile-preferences).
  - El ajuste puede imponerse desde la página [Configuración - JOC Cockpit](/settings-joc).
- **Tiempo Invertido** similar a especificar *Motivos*, el tiempo invertido en una operación puede agregarse al modificar Órdenes.
- **Enlace de Ticket** similar a especificar *Motivos*, se puede agregar una referencia a un sistema de tickets al modificar Órdenes.

## Operaciones

### Operaciones sobre Órdenes

Los usuarios encuentran un menú de acción por Orden que ofrece las operaciones disponibles para el estado dado de la Orden.

Para Órdenes en estado *pendiente*, *planificada*, *en progreso*, *ejecutando*, *suspendida*, *a confirmar*, *esperando*, *fallida*, se ofrecen las siguientes operaciones:

- **Modificar Prioridad**
  - Si una Orden encontrará una instrucción de *Recurso de Lock* en el Workflow que limita el paralelismo, su *Prioridad* determina la posición en la cola de Órdenes *en espera*.
  - Las *Prioridades* se especifican con enteros negativos, cero y positivos, o con los atajos ofrecidos. Una *Prioridad* más alta tiene precedencia. Los atajos ofrecen los siguientes valores:
    - **Baja**: -20000
    - **Por Debajo de la Normal**: -10000
    - **Normal**: 0
    - **Por Encima de la Normal**: 10000
    - **Alta**: 20000
- **Cancelar** terminará la Orden. Las Órdenes en ejecución completarán el Job o instrucción de Workflow actual y saldrán del Workflow con un estado del historial fallido.
- **Cancelar/terminar tarea** terminará forzosamente las Órdenes que ejecutan un Job. Las Órdenes saldrán del Workflow con un estado del historial fallido.
- **Cancelar/reiniciar** terminará forzosamente las Órdenes que ejecutan un Job. Las Órdenes saldrán del Workflow con un estado del historial fallido.
- **Suspender** suspenderá la Orden. Las Órdenes en ejecución serán suspendidas después de completar el Job o instrucción de Workflow actual.
- **Suspender/terminar tarea** terminará forzosamente las Órdenes en ejecución y las suspenderá.
- **Suspender/reiniciar** reiniciará inmediatamente la instrucción de Workflow actual y pondrá la Orden en estado *suspendida*. La opción puede combinarse con la terminación forzosa de tareas para Órdenes *en ejecución*.
- **Reanudar** continuará una Orden *suspendida* o *fallida* reanudable.

Para Órdenes en estado *completada* y para Órdenes interrumpidas en estado *fallida* se ofrecen las siguientes operaciones:

- **Salir del Workflow** terminará la Orden.
  - Las Órdenes *Completadas* saldrán del Workflow con un estado del historial *exitoso*.
  - Las Órdenes *Fallidas/interrumpidas* saldrán del Workflow con un estado del historial *fallido*.

Pueden estar disponibles operaciones adicionales específicas para el estado de la Orden.

### Operaciones en Bloque

Las operaciones en bloque están disponibles al seleccionar Órdenes desde las casillas de verificación correspondientes. Ofrecen las mismas operaciones que para Órdenes individuales.

Al seleccionar Órdenes, los botones relacionados para operaciones en bloque se vuelven visibles en la parte superior de la ventana con títulos similares a las operaciones explicadas anteriormente.

## Filtros

Los usuarios pueden aplicar filtros para limitar la visualización de Órdenes. Los botones de filtro están disponibles en la parte superior de la ventana.

### Botón de Filtro por Rango de Fechas

El botón desplegable ofrece la selección de Órdenes por rango de fechas:

- **Todas** especifica que se muestren Órdenes programadas para cualquier fecha pasada y futura.
- **Hoy** las Órdenes están relacionadas con el día actual, calculado desde la zona horaria en [Perfil - Preferencias](/profile-preferences).
- **Próxima hora** incluye Órdenes que deben iniciarse dentro de la próxima hora.
- **Próximas 12 horas** incluye Órdenes que deben iniciarse dentro de las próximas 12 horas.
- **Próximas 24 horas** incluye Órdenes que deben iniciarse dentro de las próximas 24 horas.
- **Próximo día** incluye Órdenes que deben iniciarse hasta el final del día siguiente.
- **Próximos 7 días** incluye Órdenes que deben iniciarse dentro de los próximos 7 días.

### Botones de Filtro por Estado

Similar al *Panel de Selección de Estado de Orden*, hay un botón de filtro disponible por estado de Orden para filtrar la visualización de Órdenes.

### Filtro de Entrada de Fecha De..Hasta

Para Órdenes en estado *en progreso*, *ejecutando*, *fallida*, *completada*, hay campos de entrada disponibles para especificar la fecha y hora en que una Orden tiene el estado relacionado.

Los usuarios pueden especificar fechas y horas absolutas o relativas.

### Filtro de Resultados

El filtro limita la visualización a *Order IDs* y *Nombres de Workflow* coincidentes. El filtro se aplica a las Órdenes visibles y funciona sin distinción de mayúsculas y minúsculas.

## Referencias

### Ayuda de Contexto

- [Configuración - Inventario - Planificaciones](/configuration-inventory-schedules)
- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
- [Plan Diario](/daily-plan)
- [Vista del Log de Orden](/order-log)
- [Estado de Orden](/order-states)
- [Perfil - Preferencias](/profile-preferences)
- [Configuración - JOC Cockpit](/settings-joc)
- [Workflows - Agregar Órdenes](/workflows-orders-add)

### Base de Conocimiento del Producto

- [JS7 - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Orders)
