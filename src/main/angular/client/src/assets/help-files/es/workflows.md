# Workflows

La vista *Workflows* ofrece monitoreo y control de Workflows.

- Los usuarios pueden identificar las Órdenes que se procesan para Workflows específicos.
- Los usuarios pueden agregar Órdenes a Workflows bajo demanda. Dichas Órdenes no se agregan al [Plan Diario](/daily-plan), sino que se agregan de forma ad hoc.

## Panel de Navegación

El panel izquierdo está organizado en pestañas que permiten la navegación por carpetas y el filtrado por Etiquetas para Workflows y Órdenes.

- La navegación por **Carpetas** ofrece el ícono chevron-down al pasar el cursor sobre el nombre de una carpeta. Esto mostrará Workflows de la carpeta actual y de cualquier subcarpeta. El uso del ícono chevron-up restablece la selección a la carpeta actual.
- El filtrado por Etiquetas se ofrece desde las siguientes pestañas:
  - Las **Etiquetas de Workflow** se asignan desde la vista [Configuración - Inventario - Workflows](/configuration-inventory-workflows).
  - Las **Etiquetas de Orden** se asignan desde la vista [Configuración - Inventario - Planificaciones](/configuration-inventory-schedules).

Las Etiquetas se seleccionan con los íconos + y - y pueden buscarse usando el ícono de Búsqueda Rápida. La visualización de Etiquetas debe activarse desde la página [Configuración - JOC Cockpit](/settings-joc).

## Panel de Workflows

### Resumen de Órdenes

La parte superior de la ventana contiene el resumen de Órdenes similar al [Panel de Control - Órdenes](/dashboard-orders). Los usuarios pueden hacer clic en el número indicado de Órdenes para un estado dado para abrir una ventana emergente que mostrará la lista de Órdenes.

El resumen de Órdenes se indica para las Órdenes relacionadas con los Workflows mostrados para las carpetas o Etiquetas seleccionadas.

### Visualización de Workflows

- **Nombre del Workflow** es el nombre único asignado a un Workflow.
  - Hacer clic en el *Nombre del Workflow* mostrará el panel de *Historial* en la parte inferior de la ventana que muestra el historial de ejecución reciente del Workflow.
  - Hacer clic en el ícono grande de flecha hacia abajo mostrará todos los Jobs e Instrucciones de Workflow.
  - Hacer clic en el ícono pequeño de flecha hacia abajo mostrará los Jobs e Instrucciones de Workflow de nivel superior.
  - Hacer clic en el ícono de lápiz navega a la vista [Configuración - Inventario - Workflows](/configuration-inventory-workflows).
  - Hacer clic en el ícono + abre una ventana emergente para [Agregar Órdenes](/workflows-orders-add).
- Los íconos **Vista Tabular**, **Vista Gráfica** están disponibles para mostrar Workflows
  - en formato tabular, que se centra en la estructura concisa y ahorra espacio en la ventana.
  - en formato gráfico, que es más ilustrativo para muchos usuarios.
- **Fecha de Despliegue** indica la fecha en que se desplegó el Workflow.
- **Estado de Despliegue** indica si el Workflow está desplegado en el Controlador y los Agentes.
  - Los Workflows **Sincronizados** están desplegados y disponibles en el Controlador y los Agentes.
  - Los Workflows **No Sincronizados** no están desplegados en el Controlador y los Agentes, sino que solo están disponibles desde el inventario.
  - Los Workflows **Suspendidos** están congelados; aceptan Órdenes pero no permitirán que las Órdenes inicien hasta que los Workflows sean reanudados.
  - Los Workflows **Pendientes** esperan la confirmación de uno o más Agentes de que el Workflow está suspendido o reanudado.
- **N.° de Órdenes** indica el número de Órdenes asignadas al Workflow.
  - Hasta tres Órdenes se muestran directamente con el Workflow. Ofrecen un menú de acción para operaciones sobre Órdenes.
    - Los usuarios pueden hacer clic en el ID de Orden indicado para mostrar la salida de log de la Orden desde la [Vista de Log de Orden](/order-log). El log incluye la salida creada por cualquier Job ejecutado con el Workflow.
  - Hacer clic en el *N.° de Órdenes* abre una ventana emergente que muestra todas las Órdenes relacionadas y ofrece operaciones sobre Órdenes individuales y operaciones masivas sobre Órdenes seleccionadas.

### Visualización de Jobs e Instrucciones de Workflow

Cuando se expande un Workflow usando el ícono de flecha hacia abajo disponible para un Workflow, se mostrarán sus Jobs e Instrucciones de Workflow.

## Panel de Historial

El panel se muestra en la parte inferior de la ventana cuando los usuarios hacen clic en el nombre del Workflow o agregan una Orden.

### Historial de Órdenes

- **ID de Orden** es el identificador único asignado a una Orden. Hacer clic en el ícono de flecha hacia abajo mostrará las variables de la Orden y los Jobs por los que pasó la Orden.
- **Etiqueta** indica la última posición de una Orden en el Workflow. Los usuarios pueden asignar *Etiquetas* a las Instrucciones de Workflow que se mostrarán; de lo contrario se indica la posición técnica.
- **Estado del Historial** indica el último resultado en la vida de la Orden.
  - Si las Órdenes están completadas, el *Estado del Historial* será *exitoso* o *fallido*.
  - Si las Órdenes no están completadas, el *Estado del Historial* será *en progreso*.
- **Estado de la Orden** indica el último estado de la Orden; véase [Estados de Órdenes](/order-states).
  - Si las Órdenes están completadas, el *Estado de la Orden* será *exitoso* o *fallido*.
  - Si las Órdenes no están completadas, el *Estado de la Orden* será *procesando*.

Para acceder a la salida de log están disponibles las siguientes opciones:

- **ID de Orden**: hacer clic en el *ID de Orden* mostrará la salida de log de la Orden desde la [Vista de Log de Orden](/order-log). El log incluye la salida creada por todos los Jobs ejecutados con el Workflow.
- **Ícono de Descarga**: hacer clic en el ícono descargará el log de la Orden a un archivo.

De forma predeterminada, la visualización de logs de Órdenes está limitada a 10 MB de tamaño de log; de lo contrario, los logs se descargan a archivos. Los usuarios pueden ajustar el límite desde la página [Configuración - JOC Cockpit](/settings-joc).

### Historial de Tareas

- **Job** indica el nombre del Job.
- **Etiqueta** indica la posición del Job en el Workflow.
- **Estado** es el resultado de la ejecución del Job, indicado por *en progreso*, *exitoso* o *fallido*.
- **Hora de Inicio**, **Hora de Fin** indican el inicio y fin de la ejecución del Job.
- **Criticidad** se especifica en [Configuración - Inventario - Workflows - Opciones de Job](/configuration-inventory-workflow-job-options) e indica la relevancia de un Job:
  - *Menor*
  - *Normal*
  - *Mayor*
  - *Crítica*
- **Código de Retorno** es el código de salida de un Job de Shell o el código de retorno de un Job de JVM. El panel [Configuración - Inventario - Workflows - Propiedades del Job](/configuration-inventory-workflow-job-properties) ofrece la configuración de códigos de retorno para la ejecución exitosa y fallida de Jobs.

Para acceder a la salida de log está disponible la siguiente acción:

- **Job**: hacer clic en el *Nombre del Job* mostrará la salida de log del Job desde la [Vista de Log de Tarea](/task-log).

De forma predeterminada, la visualización de logs de Tareas está limitada a 10 MB de tamaño de log; de lo contrario, los logs se descargan a archivos. Los usuarios pueden ajustar el límite desde la página [Configuración - JOC Cockpit](/settings-joc).

### Registro de Auditoría

El panel muestra la misma información que el [Registro de Auditoría](/audit-log) centrada en el Workflow actual.

El número de entradas del Registro de Auditoría mostradas puede modificarse desde la configuración *Número máximo de entradas del Registro de Auditoría por objeto* en las [Preferencias del Perfil](/profile-preferences) del usuario.

## Operaciones

### Operaciones sobre Workflows

En la parte superior de la ventana se ofrecen los siguientes botones para operaciones sobre Workflows:

- **Suspender Todos** actúa como una *Parada de Emergencia* y suspenderá todos los Workflows independientemente de la selección de Workflows mostrada actualmente. Los Workflows suspendidos están congelados; aceptan Órdenes pero no iniciarán Órdenes a menos que el Workflow sea reanudado. Las Órdenes en ejecución completan el Job actual u otra instrucción antes de ser suspendidas.
- **Reanudar Todos** reanuda todos los Workflows suspendidos independientemente de la selección de Workflows mostrada actualmente.

### Operaciones sobre Jobs e Instrucciones de Workflow

Las siguientes operaciones están disponibles para Jobs desde su menú de acción relacionado:

- **Omitir Job** evita que una Orden ejecute el Job relacionado y hace que continúe con la siguiente Instrucción de Workflow.
- **Dejar de Omitir Job** revierte un Job previamente omitido.
- **Detener Job** suspenderá las Órdenes que lleguen al Job. Las Órdenes pueden continuarse desde una operación *Reanudar* que permite continuar el procesamiento desde un nodo diferente del Workflow o forzar el procesamiento del Job detenido.
- **Dejar de Detener Job** revierte un Job previamente detenido.

### Operaciones sobre Órdenes

Los usuarios encuentran un menú de acción por Orden que ofrece las siguientes operaciones:

- **Cancelar** terminará la Orden. Las Órdenes *en ejecución* completarán el Job o Instrucción de Workflow actual y abandonarán el Workflow con un *Estado del Historial* *fallido*.
- **Cancelar/terminar tarea** terminará forzosamente las Órdenes que ejecutan un Job. Las Órdenes abandonarán el Workflow con un *Estado del Historial* *fallido*.
- **Suspender** suspenderá la Orden. Las Órdenes en ejecución se suspenderán después de completar el Job o Instrucción de Workflow actual.
- **Suspender/terminar tarea** terminará forzosamente las Órdenes *en ejecución* y las suspenderá.
- **Suspender/restablecer** restablecerá inmediatamente la Instrucción de Workflow actual y pondrá la Orden en estado *suspendido*. La opción puede combinarse con la terminación forzosa de tareas para Órdenes *en ejecución*.
- **Reanudar** continuará una Orden *suspendida* o *fallida* reanudable.

Pueden estar disponibles operaciones adicionales específicas para el estado de la Orden.

## Filtros

Los usuarios pueden aplicar filtros para limitar la visualización de Workflows. Los botones de filtro están disponibles en la parte superior de la ventana:

- **Agentes** ofrece filtrar Workflows que contienen Jobs asignados a uno o más Agentes seleccionados.
- Los Workflows **Sincronizados** están desplegados y disponibles en el Controlador y los Agentes.
- Los Workflows **No Sincronizados** no están desplegados en el Controlador y los Agentes, sino que solo están disponibles desde el inventario.
- Los Workflows **Suspendidos** están congelados; aceptan Órdenes pero no permitirán que las Órdenes inicien hasta que los Workflows sean reanudados.
- Los Workflows **Pendientes** esperan la confirmación de uno o más Agentes de que el Workflow está suspendido.
- El **Filtro de Órdenes** ofrece especificar el rango de fechas para el cual se mostrarán las Órdenes *planificadas* para los Workflows seleccionados.

El *Filtro Avanzado* ofrece criterios más detallados para el filtrado de Workflows.

## Búsqueda

La [Búsqueda de Workflows](/workflows-search) ofrece criterios para buscar Workflows por dependencias, por ejemplo buscando Workflows que incluyan un nombre de Job específico o que usen Tableros de Avisos específicos.

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Planificaciones](/configuration-inventory-schedules)
- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
  - [Configuración - Inventario - Workflows - Propiedades del Job](/configuration-inventory-workflow-job-properties)
  - [Configuración - Inventario - Workflows - Opciones de Job](/configuration-inventory-workflow-job-options)
- [Plan Diario](/daily-plan)
- [Vista de Log de Orden](/order-log)
- [Estados de Órdenes](/order-states)
- [Preferencias del Perfil](/profile-preferences)
- [Configuración - JOC Cockpit](/settings-joc)
- [Workflows - Agregar Órdenes](/workflows-orders-add)
- [Búsqueda de Workflows](/workflows-search)

### Base de Conocimiento del Producto

- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
- [JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows)
