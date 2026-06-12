# Configuración - Inventario - Tableros de Avisos

El *Panel de Tableros de Avisos* ofrece la especificación de Tableros de Avisos para su uso con Workflows. Para más detalles véase [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards).

Los Tableros de Avisos implementan dependencias entre Workflows:

- Los Tableros de Avisos permiten agregar Avisos:
  - mediante intervención del usuario, véase [Recursos - Tableros de Avisos](/resources-notice-boards).
  - mediante la *Instrucción PostNotices* en un Workflow, véase [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction).
- Los Workflows pueden configurarse para que las Órdenes esperen Avisos mediante las siguientes instrucciones:
  - La *Instrucción ExpectNotices* se usa para verificar si hay Avisos disponibles en uno o más Tableros de Avisos que hayan sido agregados por una *Instrucción PostNotices* o por el usuario. Si el Aviso no existe, por defecto la Orden permanecerá en estado *esperando* con la instrucción. Un Workflow puede incluir cualquier número de *Instrucciones ExpectNotices* para esperar Avisos del mismo o de diferentes Tableros de Avisos. Para más detalles véase [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction).
  - La *Instrucción ConsumeNotices* se usa para hacer que las Órdenes esperen uno o más Avisos de los Tableros de Avisos que hayan sido agregados por una *Instrucción PostNotices* o por el usuario. La *Instrucción ConsumeNotices* es una instrucción de bloque que puede incluir cualquier otra instrucción y que eliminará los Avisos que se hayan esperado cuando una Orden llegue al final del bloque de instrucciones. Para más detalles véase [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction).

Las siguientes variantes están disponibles para los Tableros de Avisos:

- Los **Tableros de Avisos Globales** implementan Avisos en ámbito global, lo que hace que el mismo Aviso esté disponible para cualquier Workflow en cualquier momento.
- Los **Tableros de Avisos Planificables** implementan Avisos en el ámbito del [Plan Diario](/daily-plan). Un Aviso existe en el ámbito de una fecha del *Plan Diario*, por ejemplo:
  - El Workflow 1 se ejecuta de Lun-Vie.
  - El Workflow 2 se ejecuta de Lun-Dom y depende de la ejecución previa del Workflow 1.
  - Durante los fines de semana el Workflow 1 no se iniciará. Para permitir que el Workflow 2 se inicie los fines de semana, la dependencia se mapea al Plan Diario mediante el uso de *Tableros de Avisos Planificables*: para los días en que no se anuncia ninguna Orden para el Workflow 1, la dependencia se ignora.

Los Tableros de Avisos se gestionan desde los siguientes paneles:

- El [Panel de Navegación - Configuración - Inventario](/configuration-inventory-navigation) en el lado izquierdo de la ventana ofrece navegación por carpetas que contienen Tableros de Avisos. Además, el panel ofrece operaciones sobre los Tableros de Avisos.
- El *Panel de Tableros de Avisos* en el lado derecho de la ventana contiene los detalles de configuración del Tablero de Avisos.

## Panel de Tableros de Avisos

Para un Tablero de Avisos están disponibles los siguientes campos de entrada:

- **Nombre** es el identificador único de un Tablero de Avisos, véase [Reglas de Nomenclatura de Objetos](/object-naming-rules).
- **Título** contiene una explicación opcional del propósito del Tablero de Avisos.
- **Tipo de Tablero de Avisos** es uno de *Tablero de Avisos Global* o *Tablero de Avisos Planificable*.

### Tableros de Avisos Globales

- **ID de Aviso para Orden Publicadora** contiene un valor constante o una expresión derivada de la Orden publicadora:
  - Se puede usar un valor vacío y se puede usar una cadena de texto que especifique un valor constante.
  - Se puede usar una Expresión Regular:
    - *Coincidencia con Fecha del Plan Diario* extrae la fecha del Plan Diario del ID de la Orden usando la expresión: *replaceAll($js7OrderId, '^#([0-9]{4}-[0-9]{2}-[0-9]{2})#.*$', '$1')*
    - *Coincidencia con Fecha del Plan Diario y Nombre de Orden* extrae la fecha del Plan Diario y el nombre de la Orden del ID de la Orden usando la expresión: *replaceAll($js7OrderId, '^#([0-9]{4}-[0-9]{2}-[0-9]{2})#.*-([^:]*)(?::[^|]*)?([|].*)?$', '$1$2$3')*
    - *Coincidencia con Nombre de Orden* extrae el nombre de la Orden usando la expresión: *replaceAll($js7OrderId, '^#[0-9]{4}-[0-9]{2}-[0-9]{2}#.*-([^:]*)(?::[^|]*)?([|].*)?$', '$1$2')*
- **ID de Aviso para Orden Esperante** debe contener la misma expresión que el *ID de Aviso para Orden Publicadora*.

### Tableros de Avisos Planificables

- **ID de Aviso para Orden Publicadora** contiene un valor constante o una expresión derivada de la Orden publicadora:
  - Se puede usar un valor vacío y se puede usar una cadena de texto que especifique un valor constante.
  - Se puede usar una Expresión Regular:
    - *Coincidencia con Nombre de Orden* extrae el nombre de la Orden usando la expresión: *replaceAll($js7OrderId, '^#[0-9]{4}-[0-9]{2}-[0-9]{2}#.*-([^:]\*)(?::[^|]*)?([|].*)?$', '$1$2')*

### Operaciones sobre Tableros de Avisos

Para las operaciones disponibles véase [Configuración - Inventario - Panel de Navegación](/configuration-inventory-navigation).

## Uso con Instrucciones de Workflow

Las Instrucciones de Workflow para Tableros de Avisos ofrecen las siguientes opciones:

- La **Instrucción PostNotices** contiene la lista de Tableros de Avisos para los que se publican Avisos. La instrucción no requiere opciones adicionales.
- La **Instrucción ExpectNotices** y la **Instrucción ConsumeNotices** contienen los siguientes campos de entrada:
  - **Expresión** especifica condiciones de uno o más Tableros de Avisos que evalúan a *verdadero* o *falso*:
    - **&&** como condición "y"
    - **||** como condición "o"
    - **()** los paréntesis especifican la precedencia con la que se evalúan las condiciones.
    - Los nombres de los Tableros de Avisos en las expresiones deben ir entre comillas.
    - Ejemplos:
      - **'NB1' && 'NB2'**: espera que estén presentes Avisos de ambos Tableros de Avisos *NB1* y *NB2* para evaluar a *verdadero*.
      - **( 'NB1' && 'NB2' ) || 'NB3'**: espera que estén presentes Avisos de *NB1* y *NB2*. Alternativamente, si hay un Aviso de *NB3* presente, la expresión evalúa a *verdadero*.
  - **Cuando no está anunciado** especifica el comportamiento en caso de que un Aviso no haya sido anunciado. Esto aplica a los días para los que no hay ninguna Orden disponible de un Workflow publicador.
    - **Esperar** es el valor predeterminado y hace que las Órdenes esperen la presencia de Avisos independientemente de si han sido anunciados o no.
    - **Omitir** hace que las Órdenes omitan la instrucción si el Aviso no está anunciado.
    - **Procesar** está disponible para la *Instrucción ConsumeNotices* y hace que una Orden entre en el bloque de instrucciones en caso de que el Aviso no esté anunciado.

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Panel de Navegación](/configuration-inventory-navigation)
- [Plan Diario - Dependencias](/daily-plan-dependencies)
- [Reglas de Nomenclatura de Objetos](/object-naming-rules)
- [Recursos - Tableros de Avisos](/resources-notice-boards)

### Base de Conocimiento del Producto

- [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  - [JS7 - Schedulable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedulable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)
