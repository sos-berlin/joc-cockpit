# Configuración - Inventario - Recursos de Lock

El *Panel de Recursos de Lock* permite especificar Recursos de Lock para su uso con Workflows.

Los Recursos de Lock limitan el paralelismo de Jobs y otras Instrucciones de Workflow. Pueden considerarse como un semáforo, más precisamente un [Semáforo](https://en.wikipedia.org/wiki/Semaphore_%28programming%29) con la implicación de que:

- Las Órdenes deben adquirir el lock para continuar en el Workflow y, de lo contrario, permanecerán en estado *esperando* hasta que el lock esté disponible.
- Las Órdenes que esperan un lock no consumirán recursos computacionales como CPU.
- Los intentos de las Órdenes de adquirir un lock se considerarán para cualquier Job y otras Instrucciones de Workflow en todos los Workflows y Agentes.

Los siguientes tipos están disponibles para Recursos de Lock:

- **Locks Exclusivos** permiten el uso único de un lock por una [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction).
- **Locks Compartidos** permiten el uso paralelo de un lock por varias *Instrucciones de Lock* del mismo Workflow o de Workflows diferentes.
  - El caso de uso subyacente es un recurso como una tabla de base de datos a la que puede acceder un número limitado de Jobs al mismo tiempo. Para evitar bloqueos en la base de datos, se limita el número de Jobs que acceden a la tabla.
  - Cada *Instrucción de Lock* especifica un *Peso* que se cuenta hacia la *Capacidad* del Recurso de Lock. Si el *Peso* coincide con la *Capacidad* disponible, la Orden puede continuar; de lo contrario, la Orden esperará hasta que la parte requerida de la *Capacidad* esté disponible.

Lo siguiente aplica al uso de Recursos de Lock por *Instrucciones de Lock*:

- Las *Instrucciones de Lock* son instrucciones de bloque utilizadas en un Workflow que pueden contener cualquier número de Jobs y otras Instrucciones de Workflow.
- Las *Instrucciones de Lock* pueden anidarse en cualquier número de niveles.
- En caso de errores de Job, por defecto la Orden liberará el lock y será movida al inicio de la *Instrucción de Lock*. Los usuarios que deseen que una Orden *fallida* continúe usando el lock pueden aplicar la [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction) con el valor *false* para la opción *StopOnFailure*.

Los Recursos de Lock se gestionan desde los siguientes paneles:

- El [Panel de Navegación - Configuración - Inventario](/configuration-inventory-navigation) en el lado izquierdo de la ventana ofrece navegación por carpetas que contienen Recursos de Lock. Además, el panel ofrece operaciones sobre Recursos de Lock.
- El *Panel de Recursos de Lock* en el lado derecho de la ventana contiene los detalles de configuración del Recurso de Lock.

## Panel de Recursos de Lock

Para un Recurso de Lock están disponibles los siguientes campos de entrada:

- **Nombre** es el identificador único de un Recurso de Lock, ver [Reglas de Nomenclatura de Objetos](/object-naming-rules).
- **Título** contiene una explicación opcional del propósito del Recurso de Lock.
- **Capacidad** es un número que representa la aceptación máxima de *Pesos* de *Instrucciones de Lock* paralelas:
  - una *Capacidad* de 1 limita el Recurso de Lock a uso único independientemente de si las *Instrucciones de Lock* son *Exclusivas* o *Compartidas*.
  - una *Capacidad* mayor permite el uso paralelo del Recurso de Lock por *Locks Compartidos*. Las *Instrucciones de Lock* relacionadas pueden especificar el uso de la *Capacidad* del Lock:
    - El uso *Exclusivo* intentará adquirir el lock de forma exclusiva independientemente de su *Capacidad*.
    - El uso *Compartido* verificará si el *Peso* de la *Instrucción de Lock* coincide con la *Capacidad* restante.

### Operaciones sobre Recursos de Lock

Para las operaciones disponibles ver [Panel de Navegación - Configuración - Inventario](/configuration-inventory-navigation).

### Prioridades de Órdenes

Los Recursos de Lock consideran las *Prioridades* de las Órdenes. Al agregar Órdenes desde [Configuración - Inventario - Planificaciones](/configuration-inventory-schedules) y al agregar Órdenes ad hoc mediante [Workflows - Agregar Órdenes](/workflows-orders-add), se puede especificar la *Prioridad*.

Si varias Órdenes están esperando frente a un Recurso de Lock, la Orden con la *Prioridad* más alta será la primera en adquirir el Recurso de Lock.

## Referencias

### Ayuda Contextual

- [Panel de Navegación - Configuración - Inventario](/configuration-inventory-navigation)
- [Reglas de Nomenclatura de Objetos](/object-naming-rules)
- [Panel de Navegación - Inventario - Workflow](/configuration-inventory-navigation)

### Base de Conocimiento del Producto

- [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction)
- [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction)
- [Semaphore](https://en.wikipedia.org/wiki/Semaphore_%28programming%29)
