# Plan Diario

La vista *Plan Diario* proporciona una descripción general de las Órdenes planificadas para ejecución futura y permite a los usuarios gestionar el *Plan Diario*.

El [Servicio de Plan Diario](/service-daily-plan) se usa para crear y enviar Órdenes del Plan Diario a los Controladores. El servicio opera en segundo plano y actúa diariamente para planificar y enviar Órdenes con varios días de anticipación.

El Plan Diario está sujeto a la depuración de la base de datos realizada por el [Servicio de Limpieza](/service-cleanup).

Para las operaciones relacionadas con el *Panel de Calendario*, consulte [Plan Diario - Calendario](/daily-plan-calendar).

## Estados de Órdenes

El Plan Diario incluye Órdenes con uno de los siguientes estados:

- **Planificado**: Las Órdenes han sido creadas pero no han sido *enviadas* al Controlador y a los Agentes.
- **Enviado**: Las Órdenes han sido enviadas al Controlador y a los Agentes, que iniciarán las Órdenes de forma autónoma. El estado se aplica a las Órdenes planificadas para ejecución futura y a las Órdenes en ejecución.
- **Finalizado**: Las Órdenes han finalizado. La vista [Historial de Órdenes](/history-orders) explica si la ejecución fue exitosa o fallida.

## Transiciones de Estado de Órdenes

El Plan Diario ofrece las siguientes transiciones de estado:

<pre>
      ┌───────────────────────┐
      ▼                       ▲
   Crear                      │
      │                       │
      ▼                       │
  ┌───├──────────┐  Eliminar  ▲
  │ Órdenes      │────────────┘
  │ Planificadas │────────────┐
  ┖───┌──────────┘            ▲
      │                       │
   Enviar                     │
      │                       │
      ▼                       │
  ┌───├──────────┐            │
  │ Órdenes      │            │
  │ Enviadas     │            │
  ┖───┌──────────┘            │
      │                       │
      ▼             Cancelar  ▲
      ├───────────────────────┘
      │                       ▲
   Ejecutar / Dejar Ejecutar  │
      │                       │
      ▼                       │
  ┌───├──────────┐            │
  │ Órdenes      │            │
  │ Finalizadas  │            │
  ┖───┌──────────┘            │
      │                       │
      ▼             Cancelar  ▲
      ┖───────────────────────┘
</pre>

## Panel del Plan Diario

### Operaciones de Estado de Órdenes

Las operaciones están disponibles individualmente desde el menú de acción de una Orden y desde operaciones masivas.

Los siguientes botones de filtro limitan el alcance de las operaciones:

- **Todos**: La operación se aplicará a Órdenes con cualquier estado.
- **Planificado**: Las operaciones *Enviar* y *Eliminar* pueden aplicarse a Órdenes *planificadas* que no han sido *enviadas* al Controlador.
- **Enviado**: Las operaciones *dejar ejecutar* y *cancelar* pueden aplicarse a Órdenes *enviadas* al Controlador y a los Agentes.
- **Finalizado**: La operación *Cancelar* puede aplicarse a Órdenes que hayan finalizado.
- **Retrasado** es un filtro adicional sobre los estados de las Órdenes que indica que las Órdenes se iniciaron más tarde de lo esperado.

#### Operaciones del Ciclo de Vida

- **Dejar Ejecutar Órdenes**
  - Cuando se aplica a Órdenes *enviadas*, se iniciarán inmediatamente. Las Órdenes en el ámbito de una operación masiva se iniciarán simultáneamente.
- **Enviar Órdenes**
  - Cuando se aplica a Órdenes *planificadas*, se establecerán al estado *enviado* y se enviarán al Controlador y a los Agentes.
- **Cancelar Órdenes**
  - Cuando se aplica a Órdenes *enviadas*, las Órdenes serán recuperadas del Controlador y los Agentes y se establecerán al estado *planificado*.
- **Eliminar Órdenes**
  - Cuando se aplica a Órdenes *planificadas*, las Órdenes se eliminarán del Plan Diario. Una ejecución posterior del Servicio de Plan Diario no intentará agregar Órdenes para la fecha indicada.
- **Copiar Órdenes**
  - **Hora de Inicio**: Copia Órdenes a una fecha futura del Plan Diario. La entrada de fecha/hora es similar a la modificación de la hora de inicio de una Orden.
  - **Mantener Asignación del Plan Diario**: Las dependencias basadas en calendario de los Tableros de Avisos se resolverán a la fecha original del Plan Diario.
  - **Ignorar Ventanas de Admisión de Jobs**: Los Jobs pueden estar limitados para ejecutarse en ciertos días y/o en ciertos intervalos de tiempo. Las Órdenes que llegan deben esperar al próximo intervalo disponible. Esta opción fuerza a los Jobs a iniciarse independientemente de tales limitaciones.

#### Modificar Hora de Inicio

- **Ahora**: Las Órdenes se iniciarán inmediatamente.
- **Fecha específica**: Las Órdenes se iniciarán en la fecha y hora especificadas. A las Órdenes se les asignará la fecha del Plan Diario correspondiente al resolver las dependencias basadas en calendario.
- **Relativo a la Hora Actual**: Las Órdenes se iniciarán con un desplazamiento respecto a la hora actual en segundos o en horas, minutos y segundos; por ejemplo, *15* para iniciar en 15 segundos o *01:30:15* para iniciar 1 hora, 30 minutos y 15 segundos después.
- **Relativo a la Hora de Inicio**: Las Órdenes se iniciarán con un desplazamiento positivo o negativo respecto a su hora de inicio original en segundos o en horas, 
minutos y segundos; por ejemplo, *-04:00:00* para iniciar 4 horas antes o *+12:00:00* para iniciar 12 horas después. La asignación de las Órdenes a la fecha original del Plan Diario se mantiene al resolver las dependencias basadas en calendario.

#### Modificar Parametrización

Para los Workflows relacionados que especifican variables, los valores pueden modificarse. Cuando se usa con operaciones masivas, todas las Órdenes llevarán los mismos valores para las variables.

- **Modificar Variable**:
  - Si el Workflow especifica variables sin valores predeterminados, la Orden debe especificar los valores correspondientes.
  - Si el Workflow especifica variables con valores predeterminados, su especificación desde una Orden es opcional.

Se puede especificar una posición si las Órdenes no deben iniciarse desde el primer nodo del Workflow sino desde un nodo posterior.

- **Posición de Bloque**: Para Workflows que contienen instrucciones de bloque como *Try/Catch*, *Resource Lock*, *Fork/Join*, se puede seleccionar la instrucción relacionada.
- **Posición de Inicio**: Si no se especifica una *Posición de Inicio*, la Orden se iniciará desde el primer nodo del Workflow o la *Posición de Bloque*.
  - Si no se especifica una *Posición de Bloque*, se puede seleccionar cualquier instrucción de nivel superior del Workflow desde la que se iniciará la Orden.
  - Si se especifica una *Posición de Bloque*, la Posición de Inicio es un nodo del mismo nivel dentro del bloque.
- **Posiciones Finales**:
  - Si no se especifica una *Posición de Bloque*, se puede seleccionar cualquier instrucción de nivel superior del Workflow antes de la cual se terminará la Orden.
  - Si se especifica una *Posición de Bloque*, se puede especificar cualquier nodo del mismo nivel dentro del bloque antes del cual se terminará la Orden.
  - Se puede especificar más de una *Posición Final*.

#### Modificar Prioridad

- **Prioridad**:
  - Si una Orden encontrará una instrucción de *Resource Lock* en el Workflow que limita el paralelismo, su *Prioridad* determina la posición en la cola de Órdenes en estado *esperando*.
  - Las *Prioridades* se especifican mediante enteros negativos, cero y positivos, o a partir de los accesos directos ofrecidos. Una *Prioridad* más alta tiene precedencia. Los accesos directos ofrecen los siguientes valores:
    - **Baja**: -20000
    - **Inferior a lo Normal**: -10000
    - **Normal**: 0
    - **Superior a lo Normal**: 10000
    - **Alta**: 20000

## Referencias

### Ayuda Contextual

- [Servicio de Limpieza](/service-cleanup)
- [Plan Diario - Calendario](/daily-plan-calendar)
- [Servicio de Plan Diario](/service-daily-plan)
- [Historial de Órdenes](/history-orders)
- [Configuración - Plan Diario](/settings-daily-plan)

### Base de Conocimiento del Producto

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
