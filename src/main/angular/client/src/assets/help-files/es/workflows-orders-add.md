# Agregar Órdenes a Workflows

Las Órdenes pueden agregarse bajo demanda y se ejecutarán independientemente del Plan Diario.

Los usuarios que estén conformes con los valores predeterminados y deseen enviar una Orden para ejecución inmediata no necesitarán agregar ninguna entrada adicional.

### Atributos de la Orden

- **Nombre de la Orden**: Un nombre opcional que puede usarse para filtrar Órdenes en varias vistas.
- **Nombre de Etiqueta**: Se puede especificar cualquier número de Etiquetas que se agregarán a la Orden. Las Etiquetas se muestran en varias vistas si se especifican desde la página [Configuración - JOC Cockpit](/settings-joc).
- **Ignorar Ventanas de Admisión de Jobs**: Los Jobs pueden limitarse para ejecutarse en ciertos días y/o en ciertos intervalos de tiempo. Las Órdenes que llegan fuera de un intervalo de tiempo deben esperar al próximo intervalo disponible. La opción fuerza a los Jobs a iniciarse independientemente de tales limitaciones.

### Hora de Inicio

- **Ahora**: La Orden iniciará de inmediato.
- **Fecha Específica**: La Orden iniciará en la fecha y hora especificadas.
- **Relativo a la Hora Actual**: La Orden iniciará con un desplazamiento de horas, minutos, segundos desde la hora actual. Ejemplos:
  - **30s**: 30 segundos después
  - **15m**: 15 minutos después
  - **1h**: 1 hora después
  - **1h 15m 30s** o **01:15:30**: 1 hora, 15 minutos y 30 segundos después
- **Sin Hora de Inicio**: La Orden no iniciará pero estará disponible desde el estado *pendiente* y se le puede asignar una hora de inicio más adelante.

### Dependencias de la Orden

- **Clave del Espacio de Avisos**: Si el Workflow tiene dependencias basadas en Avisos, se puede especificar una fecha del Plan Diario a la cual se resolverán las dependencias. De forma predeterminada se usa el día actual.
  - Se aceptan fechas pasadas para las cuales hay un plan abierto.
  - Se aceptan fechas futuras.

### Posición de la Orden

Si una Orden no debe comenzar desde el primer nodo del Workflow, se puede especificar una posición.

- **Posición del Bloque**: Para Workflows que contienen instrucciones de bloque como Try/Catch, Lock, Fork/Join, Cycle, se puede seleccionar la instrucción correspondiente.
- **Posición de Inicio**: Si no se especifica una Posición de Inicio, la Orden comenzará desde el primer nodo.
  - Si no se especifica una Posición de Bloque, se puede seleccionar cualquier instrucción de nivel superior en el Workflow desde la cual comenzará la Orden.
  - Si se especifica una Posición de Bloque, la Posición de Inicio es un nodo del mismo nivel dentro del bloque.
- **Posiciones de Fin**:
  - Si no se especifica una Posición de Bloque, se puede seleccionar cualquier instrucción de nivel superior en el Workflow antes de la cual terminará la Orden.
  - Si se especifica una Posición de Bloque, se puede especificar cualquier nodo del mismo nivel dentro del bloque antes del cual terminará la Orden.
  - Se puede especificar más de una Posición de Fin.
- **Prioridad**:
  - Si la Orden encuentra una instrucción de Recurso de Lock en el Workflow que limita el paralelismo, su *Prioridad* determina la posición en la cola de Órdenes *en espera*.
  - Las *Prioridades* se especifican mediante enteros negativos, cero y positivos o mediante los accesos directos ofrecidos. Una *Prioridad* más alta tiene precedencia. Los accesos directos ofrecen los siguientes valores:
    - **Baja**: -20000
    - **Por debajo de lo Normal**: -10000
    - **Normal**: 0
    - **Por encima de lo Normal**: 10000
    - **Alta**: 20000

### Parametrización de la Orden

- **Asignar Parametrización desde Planificación**: Si el Workflow tiene asignada una Planificación, se puede seleccionar para copiar su parametrización, como variables y etiquetas, a la Orden actual.
- **Modificar Variable**:
  - Si el Workflow especifica variables sin valores predeterminados, la Orden actual debe especificar los valores correspondientes.
  - Si el Workflow especifica variables con valores predeterminados, el enlace permite seleccionar una variable para la cual se debe especificar un nuevo valor.
- **Modificar Variables**: Se comporta de manera similar a *Modificar Variable* pero muestra todas las variables disponibles.

### Órdenes Adicionales

- **Agregar Orden**: Si se debe agregar más de una Orden al Workflow, el enlace agregará la parametrización para la Orden adicional.
- **Agregar Órdenes desde Planificaciones**: Si el Workflow tiene asignada una o más Planificaciones, se agregará una Orden parametrizada desde una Planificación por cada Planificación.

## Referencias

- [Configuración - JOC Cockpit](/settings-joc)
- [Workflows](/workflows)
- [JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows)
