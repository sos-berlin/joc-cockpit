# Reanudar Órdenes

La ventana emergente *Reanudar Órdenes* se muestra para Órdenes *suspendidas* y *fallidas* que deben ser reanudadas. Se ofrecen varias secciones para la entrada del usuario según si la reanudación se realiza para una Orden individual o desde una operación masiva sobre Órdenes.

- **Variables** se muestran con los valores que son históricamente específicos antes de la posición actual en el Workflow. Por ejemplo, si un Job fallido modificó una *Variable Dinámica*, la variable se mostrará con su valor histórico anterior a la ejecución del Job.
- **Opciones** permiten cambiar el comportamiento de las Órdenes reanudadas.
- **Posiciones** permiten reanudar Órdenes desde una posición anterior o posterior en el Workflow.

## Operaciones sobre Órdenes individuales

### Variables con valores constantes

La sección muestra las *Variables de Workflow* con sus valores efectivos que lleva la Orden.

Estas variables contienen valores constantes que no pueden modificarse.

### Variables con valores modificables

La sección muestra las *Variables Dinámicas* no declaradas en el Workflow. Estas variables son creadas dinámicamente por los Jobs ejecutados por la Orden.

Los usuarios pueden modificar los valores de las *Variables Dinámicas*.

- **Operaciones**
  - **Mantener Valor**: la variable se pasa a la instrucción siguiente del Workflow con su valor actual.
  - **Cambiar Valor**: se utilizará el valor modificado de la variable, siempre que la casilla de verificación correspondiente esté *marcada*.
  - **Eliminar Variable**: se utilizará el valor original de la variable que estaba vigente en el Job respectivo desde el cual se reanudará la Orden.
  - **Agregar Variable**: permite agregar el nombre y el valor de una nueva *Variable Dinámica*.
- **Variables**
  - **returnCode**: es una variable incorporada que contiene el resultado numérico de la instrucción anterior del Workflow. Por defecto, un valor cero indica éxito; los valores distintos de cero indican fallo.

La instrucción siguiente del Workflow es la misma o aquella a la cual el usuario arrastrará y soltará la Orden, lo que incluye instrucciones anteriores o posteriores a la posición actual de la Orden.

### Opciones

#### Forzar el reinicio de Jobs

La casilla de verificación **Forzar Reanudación** afecta a los Jobs configurados como *no reiniciables*, véase [Configuración - Inventario - Workflow - Opciones de Job](/configuration-inventory-workflow-job-options). Estos Jobs no se ejecutarán nuevamente en caso de haber sido terminados por el Agente o por el sistema operativo. La opción no afecta a Órdenes *suspendidas* ni a Órdenes *fallidas* por errores del Job.

La intención es evitar que Jobs no diseñados para ser reiniciados sean reanudados automáticamente tras una terminación forzada. En su lugar, los usuarios deben marcar la casilla correspondiente. Los casos de uso típicos incluyen, por ejemplo, Jobs que realizan transacciones financieras para los cuales el resultado debe verificarse antes de provocar un reinicio.

#### Especificar la Hora de Fin del Ciclo

El campo de entrada **Hora de Fin del Ciclo** está disponible para Órdenes que iniciaron al menos un ciclo en una *Instrucción Cycle*.

Se puede especificar un período más corto o más largo que el configurado en la *Instrucción Cycle*.
Los períodos se especifican en *segundos* o en *horas:minutos:segundos*. Especificar el valor *0* para el período hará que la Orden:

- continúe desde la posición reanudada en el Workflow,
- ejecute los Jobs siguientes,
- salga del ciclo la próxima vez que encuentre la *Instrucción Cycle*.

### Posiciones para arrastrar y soltar Órdenes

Las Órdenes pueden reanudarse desde una posición anterior o posterior en el Workflow.
Los usuarios pueden arrastrar y soltar la Orden hacia la instrucción del Workflow desde la cual debe reanudarse.

- **Posiciones Permitidas**
  - Las Órdenes pueden reanudarse desde instrucciones posteriores del Workflow al mismo nivel de bloque que la posición actual.
  - Las Órdenes pueden reanudarse desde una posición en la rama *verdadera* o *falsa* de una *Instrucción If*.
  - Las Órdenes pueden reanudarse desde una posición dentro de la instrucción ConsumeNotices, omitiendo así la verificación de existencia de los Avisos relacionados.
- **Posiciones No Permitidas**
  - Las Órdenes no pueden moverse a una posición dentro de una rama de una *Instrucción Fork*. El motivo es que la *Orden Padre* permanece con la *Instrucción Fork* mientras se crean *Órdenes Hijas* por rama.
    - Las *Órdenes Hijas* no pueden moverse entre ramas de una *Instrucción Fork*. Se acepta reanudar una *Orden Hija* desde una posición dentro de su propia rama.
    - Las Órdenes pueden reanudarse directamente desde una *Instrucción Fork*.
  - Las Órdenes no pueden moverse a una posición dentro de *Instrucciones Lock*. La operación no está permitida ya que afecta la condición de adquisición de un *Recurso de Lock*. Se acepta reanudar una Orden desde el inicio del bloque de la *Instrucción Lock*.

Lo anterior aplica de igual forma a instrucciones de Workflow anidadas, por ejemplo una *Instrucción Fork* interna dentro de una rama de una *Instrucción Fork* externa.

Cuando no se modifica, la Orden se reanudará desde su posición actual en el Workflow.

## Operaciones Masivas sobre Órdenes

La operación masiva está disponible desde la vista [Vista General de Órdenes](/orders-overview), que permite seleccionar varias Órdenes del mismo o de diferentes Workflows.

- **Reanudar desde la misma Posición** permite la reanudación desde la instrucción actual del Workflow en la que la Orden está *suspendida* o *fallida*.
- **Reanudar desde el Bloque Actual** permite la reanudación desde el inicio de la instrucción de bloque actual. Por ejemplo:
  - si una Orden está en alguna instrucción dentro de una *Instrucción Lock*, se reanudará desde el inicio de la *Instrucción Lock*.
  - si una Orden está en alguna instrucción dentro de una rama de la *Instrucción Fork*, se reanudará desde el inicio de la rama.
- **Reanudar desde Etiqueta** permite especificar el nombre de una *Etiqueta* que sea común a todos los Workflows para los cuales deben reanudarse Órdenes. La reanudación de las Órdenes se efectuará desde la posición del Workflow indicada por la *Etiqueta*. Si la *Etiqueta* no existe en un Workflow, la Orden se reanuda desde su posición actual.

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Workflow - Opciones de Job](/configuration-inventory-workflow-job-options)
- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
- [Vista General de Órdenes](/orders-overview)
- [Workflows](/workflows)

### Base de Conocimiento del Producto

- [JS7 - Workflows - Status Operations on Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows+-+Status+Operations+on+Orders)
