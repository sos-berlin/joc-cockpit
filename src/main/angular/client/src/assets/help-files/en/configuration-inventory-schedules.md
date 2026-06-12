# Configuración - Inventario - Planificaciones

El *Panel de Planificaciones* permite especificar reglas para crear Órdenes desde el [Plan Diario](/daily-plan). Para más detalles ver [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules).

- Las Planificaciones determinan el momento en que las Órdenes para la ejecución de Workflows comenzarán. Se asignan a uno o más Workflows y, opcionalmente, a variables que usan los Jobs en dichos Workflows.
  - Las **fechas de inicio** se especifican mediante [Configuración - Inventario - Calendarios](/configuration-inventory-calendars) y limitan los días de ejecución de los Workflows.
  - Los **horarios de inicio** se especifican en las Planificaciones indicando uno o más horarios durante el día. Pueden además limitar los días de ejecución de los Workflows.
- Las Planificaciones crean Órdenes diariamente
  - para la ejecución única de Workflows. Esto incluye Workflows que comienzan en varios momentos del día.
  - para la ejecución cíclica de Workflows. Esto especifica la ejecución repetida de Workflows basada en intervalos configurables.
- Las Planificaciones son aplicadas por el [Plan Diario](/daily-plan) para crear Órdenes para las fechas y horarios resultantes.
  - Las Planificaciones pueden aplicarse manualmente desde la vista del Plan Diario.
  - Las Planificaciones son aplicadas automáticamente por el [Servicio de Plan Diario](/service-daily-plan).

Las Planificaciones se gestionan desde los siguientes paneles:

- El [Panel de Navegación - Configuración - Inventario](/configuration-inventory-navigation) en el lado izquierdo de la ventana ofrece navegación por carpetas que contienen Planificaciones. Además, el panel ofrece operaciones sobre Planificaciones.
- El *Panel de Planificaciones* en el lado derecho de la ventana contiene los detalles de configuración de la Planificación.

## Panel de Planificaciones

Para una Planificación están disponibles los siguientes campos de entrada:

- **Nombre** es el identificador único de una Planificación, ver [Reglas de Nomenclatura de Objetos](/object-naming-rules).
- **Título** contiene una explicación opcional del propósito de la Planificación.
- **Nombres de Workflow** contiene la lista de Workflows que deben iniciarse.
- **Planificar Orden automáticamente** especifica que la Planificación será considerada por el [Servicio de Plan Diario](/service-daily-plan).
- **Enviar Orden al Controlador cuando se planifique** especifica que las Órdenes serán enviadas inmediatamente a un Controlador cuando sean planificadas. Sin esta opción, el Servicio de Plan Diario enviará las Órdenes *planificadas* según lo establecido en [Configuración - Plan Diario](/settings-daily-plan).

### Parametrización de Órdenes

- **Nombre de Orden**: Un nombre opcional que puede usarse para filtrar Órdenes en varias vistas.
- **Nombre de Etiqueta**: Se puede especificar cualquier número de Etiquetas que se agregarán a la Orden. Las Etiquetas de Órdenes se muestran en varias vistas si se especifican desde la página [Configuración - JOC Cockpit](/settings-joc).
- **Ignorar Tiempos de Admisión**: Los Jobs pueden limitarse a ejecutarse en ciertos días y/o en ciertos intervalos de tiempo. Esto también aplica al uso de la *Instrucción AdmissionTimes*. Las Órdenes que llegan fuera de un intervalo de tiempo deben esperar al próximo intervalo disponible. Esta opción fuerza a los Jobs y otras instrucciones a iniciar independientemente de dichas limitaciones.

### Posición de la Orden

Si una Orden no debe comenzar desde el primer nodo del Workflow, se puede especificar una posición.

- **Posición de Bloque**: Para Workflows que contienen instrucciones de bloque como Try/Catch, Lock, Fork/Join, Cycle se puede seleccionar la instrucción relacionada.
- **Posición de Inicio**: Si no se especifica una *Posición de Inicio*, la Orden comenzará desde el primer nodo.
  - Si no se especifica una *Posición de Bloque*, se puede seleccionar cualquier instrucción de nivel superior en el Workflow desde la cual comenzará la Orden.
  - Si se especifica una *Posición de Bloque*, la *Posición de Inicio* es un nodo del mismo nivel dentro del bloque.
- **Posiciones de Fin**:
  - Si no se especifica una *Posición de Bloque*, se puede seleccionar cualquier instrucción de nivel superior en el Workflow antes de la cual terminará la Orden.
  - Si se especifica una *Posición de Bloque*, se puede especificar cualquier nodo del mismo nivel dentro del bloque antes del cual terminará la Orden.
  - Se puede especificar más de una *Posición de Fin*.
- **Prioridad**:
  - Si la Orden encuentra una instrucción de Recurso de Lock en el Workflow que limita el paralelismo, su *Prioridad* determina la posición en la cola de Órdenes *esperando*.
  - Las *Prioridades* se especifican mediante enteros negativos, cero o positivos, o mediante los accesos directos ofrecidos. Una *Prioridad* más alta tiene precedencia. Los accesos directos ofrecen los siguientes valores:
    - **Baja**: -20000
    - **Por Debajo de Normal**: -10000
    - **Normal**: 0
    - **Por Encima de Normal**: 10000
    - **Alta**: 20000

### Variables de Órdenes

Las Variables de Órdenes se especifican si un Workflow declara variables para parametrizar la ejecución de Jobs:

- Las variables requeridas son declaradas por un Workflow sin valor predeterminado. Se ponen automáticamente a disposición de la Planificación y deben asignárseles los valores correspondientes.
- Las variables opcionales son declaradas por un Workflow con un valor predeterminado. Se pueden invocar usando los siguientes enlaces:
  - **Modificar Variable** permite seleccionar variables específicas de la lista de Variables del Workflow. Las variables se rellenan con su valor predeterminado.
  - **Modificar Variables** agrega campos de entrada para todas las Variables del Workflow. Las variables se rellenan con su valor predeterminado.

La asignación de valores a variables incluye especificar cadenas de texto y números. Se puede asignar una cadena vacía usando dos comillas simples.

## Tiempo de Ejecución

El botón *Tiempo de Ejecución* permite especificar los horarios de inicio de las Órdenes desde una ventana emergente. Para más detalles ver [Configuración - Inventario - Planificaciones - Tiempo de Ejecución](/configuration-inventory-schedules-run-time).

## Operaciones sobre Planificaciones

Para las operaciones disponibles ver [Panel de Navegación - Configuración - Inventario](/configuration-inventory-navigation).

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Calendarios](/configuration-inventory-calendars)
- [Panel de Navegación - Configuración - Inventario](/configuration-inventory-navigation)
- [Configuración - Inventario - Planificaciones - Tiempo de Ejecución](/configuration-inventory-schedules-run-time)
- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
- [Plan Diario](/daily-plan)
- [Servicio de Plan Diario](/service-daily-plan)
- [Reglas de Nomenclatura de Objetos](/object-naming-rules)
- [Historial de Órdenes](/history-orders)
- [Perfil - Preferencias](/profile-preferences)
- [Configuración - Plan Diario](/settings-daily-plan)
- [Historial de Tareas](/history-tasks)

### Base de Conocimiento del Producto

- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
- [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
- [List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
