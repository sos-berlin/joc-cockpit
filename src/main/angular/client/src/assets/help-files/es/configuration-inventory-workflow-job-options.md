# Configuración - Inventario - Workflow - Opciones del Job

El panel *Workflow* ofrece el diseño de Workflows a partir de una secuencia de instrucciones. Los usuarios pueden arrastrar y soltar la *Instrucción de Job* desde la *Barra de Herramientas* a una posición en el Workflow.

La interfaz gráfica ofrece una serie de pestañas para especificar los detalles del Job. La segunda pestaña corresponde a las *Opciones del Job*.

## Opciones del Job de Uso Frecuente

- **Paralelismo** especifica el número de instancias paralelas en las que el Job puede ejecutarse. Si más de una Orden está procesando el Workflow, pueden ejecutar el Job en paralelo. Además del *Paralelismo*, se aplica el límite de procesos que imponen los Agentes Autónomos y los Clústeres de Agentes.
- **Criticidad** especifica la relevancia de los fallos del Job. La *Criticidad* está disponible con las Notificaciones sobre fallos de Job.

### Períodos de Ejecución de Job

- **Tiempo de Espera** especifica el período de ejecución máximo que se permite al Job consumir. Si el Job supera el *Tiempo de Espera*, el Agente lo cancelará teniendo en cuenta el *Tiempo de Gracia* del Job. La entrada puede especificarse en los siguientes formatos:
  - *1* o *1s*: un número o un número seguido de *s* especifica el *Tiempo de Espera* en segundos.
  - *1m 2d 3h*: especifica 1 mes, 2 días y 3 horas como período de ejecución máximo.
  - *01:02:03*: especifica 1 hora, 2 minutos y 3 segundos como período de ejecución máximo.
- **Advertir si ejecución es más corta** genera una advertencia y la Notificación correspondiente si el Job termina antes del período especificado. Los formatos de entrada incluyen:
  - *1* o *1s*: un número o un número seguido de *s* especifica el período de ejecución en segundos.
  - *01:02:03*: especifica 1 hora, 2 minutos y 3 segundos para el período de ejecución.
  - *30%*: especifica un período de ejecución un 30% más corto que el promedio de ejecuciones anteriores del Job. El cálculo utiliza el [Historial de Tareas](/history-tasks) que está sujeto a depuración por el [Servicio de Limpieza](/service-cleanup).
- **Advertir si ejecución es más larga** genera una advertencia y la Notificación correspondiente si el Job supera el período especificado. Los formatos de entrada incluyen:
  - *1* o *1s*: un número o un número seguido de *s* especifica el período de ejecución en segundos.
  - *01:02:03*: especifica 1 hora, 2 minutos y 3 segundos para el período de ejecución.
  - *30%*: especifica un período de ejecución un 30% más largo que el promedio de ejecuciones anteriores del Job. El cálculo utiliza el [Historial de Tareas](/history-tasks) que está sujeto a depuración por el [Servicio de Limpieza](/service-cleanup).

### Salida de Log del Job

- **Fallar ante salida en stderr** especifica que el Agente fallará el Job si este escribe en el canal stderr. Esta comprobación se suma a la verificación del *Valor de Retorno* (para Jobs de Shell: código de salida) de un Job.
- **Advertir ante salida en stderr** especifica que se realiza la misma comprobación que para *Fallar ante salida en stderr*. Sin embargo, el Job no fallará, sino que se generará una advertencia y se creará una Notificación.

### Ventanas de Admisión de Job

Las *Ventanas de Admisión* determinan cuándo puede iniciarse o debe omitirse un Job, y el período absoluto durante el cual puede ejecutarse. Para más detalles, consulte [JS7 - Admission Times for Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Admission+Times+for+Jobs).

- **Omitir Job sin admisión en fecha de la Orden** especifica que el Job se omitirá si su *Hora de Admisión* no coincide con la fecha de la Orden. Por ejemplo, el *Hora de Admisión* del Job puede excluir los fines de semana, lo que hace que el Job se ejecute de lunes a viernes y sea omitido por Órdenes planificadas para sábado y domingo. Los usuarios deben considerar que lo relevante es la fecha para la que está planificada la Orden, no la fecha de llegada de la Orden al Job. Si la fecha planificada de la Orden coincide con el *Hora de Admisión*, pero la Orden llega en un momento posterior fuera del *Hora de Admisión*, el Job no se omitirá y la Orden esperará al próximo *Hora de Admisión*.
- **Terminar el Job al fin del período** especifica que el Agente cancelará el Job si supera el punto en el tiempo especificado con el período del *Hora de Admisión*.
- **Hora de Admisión** ofrece la posibilidad de especificar los días y horas en que los Jobs pueden ejecutarse desde el enlace *Mostrar períodos*.

#### Tipos de Admisión

Los *Tipos de Admisión* permiten especificar los días en que puede iniciarse el Job. Además, se pueden especificar rangos de meses que limitan el *Tipo de Admisión* a ciertos meses.

- **Días de semana** especifica los días de la semana en que puede iniciarse el Job.
- **Días de semana específicos** especifica días de la semana relativos, como el primer o último lunes del mes.
- **Días específicos** especifica días del año.
- **Días del mes** especifica días relativos del mes; por ejemplo, el primer o último día del mes.

#### Período de Ejecución

El *Período de Ejecución* se especifica a partir de su *inicio* y *duración*:

- **Inicio** se especifica mediante una hora en formato HH:MM:SS; por ejemplo, 10:15:00 para las 10:15 de la mañana.
- **Duración** se especifica usando los siguientes formatos:
  - *1* o *1s*: un número o un número seguido de *s* especifica la *Duración* en segundos.
  - *1m 2d 3h*: especifica 1 mes, 2 días y 3 horas para la *Duración*.
  - *01:02:03*: especifica 1 hora, 2 minutos y 3 segundos para la *Duración*.

## Opciones del Job disponibles desde *Más opciones*

La vista *Configuración - Inventario* ofrece el control deslizante *Más opciones* en la parte superior de la ventana, que está inactivo por defecto. El uso del control deslizante hace disponibles opciones adicionales.

- **Tiempo de Gracia** se aplica a Jobs en Unix a los que se envía una señal SIGTERM cuando superan su *Tiempo de Espera* o cuando son terminados forzosamente por intervención del usuario. Si el Job no finaliza en respuesta a SIGTERM, transcurrido el *Tiempo de Gracia* el Agente enviará una señal SIGKILL para forzar la terminación del Job. Para más detalles consulte [JS7 - FAQ - How does JobScheduler terminate Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+FAQ+-+How+does+JobScheduler+terminate+Jobs) y [JS7 - Agent Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Operation).
- **Compatibilidad** ofrece el nivel de compatibilidad *v1* para usuarios de la rama 1.x de JobScheduler. En modo de compatibilidad se modifica el siguiente comportamiento:
  - Las *Variables de Entorno* no tienen que especificarse, sino que se crean automáticamente para todas las Variables de Workflow. Los nombres de las Variables de Entorno tienen el prefijo *SCHEDULER_PARAM_* usando únicamente letras mayúsculas.
  - Para el uso de argumentos de Job, el modo de compatibilidad ofrece una pestaña correspondiente.

### Reinicio de Jobs

- **Job no reiniciable** se aplica a Jobs que han sido terminados forzosamente por el Agente o por su proceso de vigilancia al detener o cancelar el Agente. Por defecto los Jobs se consideran reiniciables y se reiniciarán cuando el Agente se reinicie. Los usuarios pueden impedir este comportamiento activando la casilla de verificación.

### Ejecución de Jobs en Windows con Diferentes Cuentas de Usuario

Las siguientes opciones especifican para Jobs ejecutados con Agentes para Windows que el Job debe cambiar el contexto de usuario; consulte [JS7 - Running Jobs as a different User](https://kb.sos-berlin.com/display/JS7/JS7+-+Running+Jobs+as+a+different+User).

- **Clave de credencial** especifica la clave de la entrada en el Administrador de Credenciales de Windows que contiene las credenciales de la cuenta de usuario de destino.
- **Cargar perfil de usuario** especifica si el perfil de la cuenta de usuario de destino, incluidas las entradas del registro, debe cargarse al iniciar el Job.

## Referencias

### Ayuda Contextual

- [Servicio de Limpieza](/service-cleanup)
- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
  - [Configuración - Inventario - Workflows - Propiedades del Job](/configuration-inventory-workflows-job-properties)
  - [Configuración - Inventario - Workflows - Propiedades de Nodo de Job](/configuration-inventory-workflows-job-node-properties)
  - [Configuración - Inventario - Workflows - Notificaciones de Job](/configuration-inventory-workflows-job-notifications)
  - [Configuración - Inventario - Workflows - Etiquetas de Job](/configuration-inventory-workflows-job-tags)
- [Historial de Tareas](/history-tasks)

### Base de Conocimiento del Producto

- [JS7 - Admission Times for Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Admission+Times+for+Jobs).
- [JS7 - Agent Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Operation)
- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - FAQ - How does JobScheduler terminate Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+FAQ+-+How+does+JobScheduler+terminate+Jobs)
- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
- [JS7 - Running Jobs as a different User](https://kb.sos-berlin.com/display/JS7/JS7+-+Running+Jobs+as+a+different+User)
