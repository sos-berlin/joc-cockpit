# Configuración - Inventario - Workflows

El *Panel de Workflow* ofrece el diseño de Workflows a partir de una secuencia de instrucciones que dan forma al Workflow como un [grafo acíclico dirigido](https://en.wikipedia.org/wiki/Directed_acyclic_graph).

- Los usuarios pueden arrastrar y soltar instrucciones desde la *Barra de Herramientas* para crear patrones de Workflow como una secuencia de Jobs, bifurcación y unión de Jobs, ejecución condicional, etc.
- El [Panel de Navegación - Configuración - Inventario](/configuration-inventory-navigation) ofrece navegación por Etiquetas y carpetas. Además, el panel ofrece operaciones sobre Workflows.

## Panel de Barra de Herramientas

La *Barra de Herramientas* contiene las siguientes instrucciones:

- **Job Instruction** implementa un Job. Los Workflows pueden incluir cualquier número de Jobs. Para más detalles, consulte [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction).
- **Try/Catch Instruction** implementa el manejo de excepciones desde un bloque *Try* que contiene Jobs u otras instrucciones. Si un Job falla, se ejecutarán las instrucciones del bloque *Catch*. Un bloque *Catch* vacío resolverá el estado de error de una instrucción fallida anterior. Para más detalles, consulte [JS7 - Try-Catch Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Try-Catch+Instruction).
- **Retry Instruction** implementa la ejecución repetida de una secuencia de Jobs u otras instrucciones en caso de fallo. Si uno de los Jobs del bloque *Retry* falla, la Orden se mueve al inicio del bloque *Retry* para repetir la ejecución. Para más detalles, consulte [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction).
- **Finish Instruction** hace que una Orden salga del Workflow con un resultado exitoso o no exitoso en el [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History). Para más detalles, consulte [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction).
- **Fail Instruction** hace que una Orden falle. Sin más manejo de errores, la Orden permanecerá en estado *fallido*, consulte [Estados de Órdenes](/order-states). Un *Try/Catch Instruction* o *Retry Instruction* circundante es activado por la *Fail Instruction*. Para más detalles, consulte [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction).
- **Fork Instruction** permite que las Órdenes se bifurquen y unan para habilitar el procesamiento paralelo de Jobs y otras instrucciones en un Workflow. Las ramas se crean arrastrando y soltando instrucciones sobre la *Fork Instruction*. Cuando una Orden entra en la *Fork Instruction*, se crea una Orden Hija para cada rama. Para más detalles, consulte [JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction).
  - Cada Orden Hija pasará por los nodos de su rama independientemente de las Órdenes Hijas paralelas.
  - Las Órdenes Hijas pueden devolver resultados a las Órdenes Padre pasando variables.
  - Las Órdenes Hijas toman el rol de Órdenes Padre en *Fork Instructions* anidadas.
- **ForkList Instruction** es la versión dinámica de una *Fork Instruction* y se presenta en las siguientes variantes:
  - La instrucción espera que una Orden proporcione una *Variable de Lista* implementada como lista (array) de valores. La lista puede incluir cualquier número de pares nombre/valor (variables). La *ForkList Instruction* está diseñada como una sola rama: dependiendo del número de entradas proporcionadas con la *Variable de Lista* que lleva la Orden, el Agente creará dinámicamente ramas para cada entrada de la *Variable de Lista*. Esto permite, por ejemplo, ejecutar Jobs para cada entrada de una *Variable de Lista*. Para más detalles, consulte [JS7 - ForkList-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction).
  - La instrucción permite crear dinámicamente un número de Órdenes Hijas y ramas, y ejecutar la misma secuencia de Jobs u otras instrucciones en un número de Subagentes: los usuarios pueden ejecutar los mismos Jobs en paralelo en varios servidores o contenedores que operan Subagentes. Los casos de uso incluyen, por ejemplo, ejecutar Jobs de respaldo similares en un gran número de servidores. Para más detalles, consulte [JS7 - ForkList-Join Instruction for Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction+for+Agent+Clusters).
- **Cycle Instruction** ofrece la ejecución repetida de todos o algunos de los Jobs y otras instrucciones de un Workflow. Es una instrucción de bloque que puede abarcar el Workflow completo o Jobs e instrucciones seleccionadas de un Workflow. La *Cycle Instruction* puede anidarse. Para más detalles, consulte [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction).
- **Break Instruction** se usa en una *Cycle Instruction* para terminar el ciclo y hacer que una Orden salga del ciclo. Para más detalles, consulte [JS7 - Break Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Break+Instruction).
- **Lock Instruction** es una instrucción de bloque que se usa para especificar uno o más Jobs y otras instrucciones de exclusión mutua, para evitar que los Jobs se ejecuten en paralelo, ya sea en el mismo Workflow o en Workflows diferentes. Las *Lock Instructions* pueden anidarse. Para más detalles, consulte [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction).
- **Sleep Instruction** se usa para retrasar el procesamiento posterior en un Workflow durante un tiempo especificado en segundos. Para más detalles, consulte [JS7 - Sleep Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Sleep+Instruction).
- **Prompt Instruction** detiene la ejecución de una Orden en un Workflow hasta que se confirme el prompt. La Orden recibe el estado *prompting*. Los usuarios pueden confirmar o cancelar las Órdenes en estado *prompting*, consulte [Estados de Órdenes](/order-states). Para más detalles, consulte [JS7 - Prompt Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Prompt+Instruction).
- **AdmissionTimes Instruction** detiene la ejecución de una Orden en un Workflow hasta que se alcance el intervalo de tiempo especificado. La Orden recibe el estado *esperando*. Además, las Órdenes pueden ser terminadas si superan el intervalo de tiempo especificado. La instrucción puede configurarse para que una Orden omita todas las instrucciones incluidas en caso de que no se encuentre ningún intervalo de tiempo coincidente para la fecha del Plan Diario de la Orden. Para más detalles, consulte [JS7 - AdmissionTimes Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AdmissionTimes+Instruction).
- **AddOrder Instruction** se usa en un Workflow para crear una Orden para un Workflow diferente. Por defecto, las Órdenes agregadas se ejecutan de forma asíncrona en un Workflow separado y en paralelo a la Orden actual; es decir, su resultado de ejecución no está sincronizado y no tiene impacto en la Orden actual. Si la ejecución de la Orden agregada debe sincronizarse, se pueden usar la *ExpectNotices Instruction* y la *ConsumeNotices Instruction*. Para más detalles, consulte [JS7 - AddOrder Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AddOrder+Instruction).
- **PostNotices Instruction** se usa para crear uno o más Avisos para Tableros de Avisos. Los Avisos son esperados por la *ExpectNotices Instruction* y la *ConsumeNotices Instruction* correspondientes del mismo o de diferentes Workflows. Un Workflow puede incluir cualquier número de *PostNotices Instructions* para publicar Avisos en el mismo o en diferentes Tableros de Avisos. Publicar un Aviso no bloquea la ejecución posterior de una Orden en un Workflow. La Orden continúa inmediatamente después de publicar el Aviso. Para más detalles, consulte [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction).
- **ExpectNotices Instruction** se usa para comprobar si hay Avisos disponibles en uno o más Tableros de Avisos agregados por una *PostNotices Instruction* o por el usuario. Si el Aviso no existe, la Orden permanecerá en estado *esperando* con la instrucción. Un Workflow puede incluir cualquier número de *ExpectNotices Instructions* para esperar Avisos del mismo o de diferentes Tableros de Avisos. Para más detalles, consulte [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction).
- **ConsumeNotices Instruction** se usa para que las Órdenes esperen Avisos de uno o más Tableros de Avisos agregados por una *PostNotices Instruction* o por el usuario. La *ConsumeNotices Instruction* es una instrucción de bloque que puede incluir cualquier otra instrucción y que eliminará los Avisos que se esperaban cuando una Orden llegue al final del bloque de instrucciones. Para más detalles, consulte [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction).
- **If Instruction** es una instrucción de bloque usada para el procesamiento condicional en un Workflow. Permite comprobar códigos de retorno y valores de retorno de Jobs anteriores, y evaluar Variables de Órdenes. Para más detalles, consulte [JS7 - If Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+If+Instruction).
- **Case Instruction** se usa para el procesamiento condicional de Jobs y otras instrucciones en un Workflow. La instrucción extiende la *If Instruction*. La *Case Instruction* puede usarse con *Case-When Instructions* repetidas y opcionalmente con una única *Case-Else Instruction*. Para más detalles, consulte [JS7 - Case Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Case+Instruction).
- **CaseWhen Instruction** se usa para comprobar un predicado similar a la *If Instruction*. La instrucción puede aparecer cualquier número de veces en una *Case Instruction*.
- **CaseElse Instruction** se usa cuando fallan todas las comprobaciones de las *CaseWhen Instructions*.
- **StickySubagent Instruction** puede usarse para ejecutar un número de Jobs con el mismo Subagente de un Clúster de Agentes. La instrucción de bloque comprueba el primer Subagente disponible de un Clúster de Subagentes. Este Subagente se usará para los Jobs posteriores dentro de la instrucción de bloque. El uso de Clústeres de Agentes está sujeto a los términos de agrupamiento en clúster de la [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License). Para más detalles, consulte [JS7 - StickySubagent Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+StickySubagent+Instruction+for+Agent+Clusters).
- **Options Instruction** es una instrucción de bloque que controla el manejo de errores para la *Lock Instruction* y la *ConsumeNotices Instruction*. Si la *Options Instruction* está presente y especifica la propiedad *Stop on Failure*, las Órdenes *fallidas* permanecerán con la instrucción que falló, por ejemplo un Job. Si la instrucción no está presente, las Órdenes que fallen dentro de una *Lock Instruction* o *ConsumeNotices Instruction* se moverán al inicio del bloque de instrucciones y permanecerán en estado *fallido*. Para más detalles, consulte [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction).
- **Paste** ofrece arrastrar y soltar una instrucción previamente copiada o cortada al Workflow.

## Panel de Workflow

El panel contiene la representación gráfica de un Workflow.

- Los usuarios pueden arrastrar y soltar instrucciones desde el *Panel de Barra de Herramientas* al Workflow.
  - Para arrastrar y soltar la primera instrucción en un Workflow, los usuarios mantienen presionada la tecla del ratón y sueltan la instrucción en el área de colocación indicada del Workflow.
  - Para arrastrar y soltar instrucciones adicionales, los usuarios mantienen presionada la tecla del ratón, navegan hasta la línea de conexión deseada entre instrucciones y sueltan la tecla del ratón.
- Para la *Fork Instruction* y la *If Instruction*, los usuarios pueden arrastrar y soltar una *Job Instruction* directamente sobre el nodo *Fork* para crear una nueva rama.
- Para la *If Instruction*, los usuarios pueden arrastrar y soltar una *Job Instruction* directamente sobre el bloque *If*: la primera instrucción representa la rama *true* (verdadero), la segunda instrucción arrastrada y soltada crea la rama *false* (falso).

Los Workflows se almacenan automáticamente en el Inventario. Esto ocurre cada 30 segundos y al salir del *Panel de Workflow*.

Para un Workflow están disponibles las siguientes entradas:

- **Name** es el identificador único de un Workflow, consulte [Reglas de Nomenclatura de Objetos](/object-naming-rules).
- **Title** contiene una explicación opcional del propósito del Workflow.
- **Job Resources** son objetos del Inventario que contienen variables en pares clave/valor y que pueden ponerse a disposición a través de Variables de Workflow y Variables de Entorno. Los *Recursos de Job* pueden asignarse a nivel de Job y a nivel de Workflow, lo que los hace disponibles para todos los Jobs del Workflow. Para más detalles, consulte [Configuración - Inventario - Recursos de Job](/configuration-inventory-job-resources).
- **Time Zone** que se toma del [Perfil - Preferencias](/profile-preferences) del usuario. Para la entrada se aceptan identificadores de zona horaria como *UTC*, *Europe/London*, etc. Para una lista completa de identificadores de zona horaria, consulte [List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).
  - La *Zona Horaria* se aplica a los períodos en las Ventanas de Admisión de Jobs y en las *Cycle Instructions*.
  - Es posible usar una *Zona Horaria* diferente a la de [Configuración - Plan Diario](/settings-daily-plan). Sin embargo, puede generar resultados confusos.
- **Allow undeclared variables** permite el uso de Variables de Órdenes que no están declaradas en el Workflow. Esto incluye que las Órdenes pueden llevar variables que no son verificadas por tipo de dato ni por uso obligatorio. Los Jobs fallarán al referenciar variables no declaradas que no estén disponibles en una Orden.

### Variables de Workflow

Las Variables de Workflow se declaran desde el Workflow y se usan para parametrizar la ejecución de Jobs:

- Las variables requeridas son declaradas por el Workflow sin valor predeterminado. Las Órdenes agregadas al Workflow deben especificar valores para las variables requeridas.
- Las variables opcionales son declaradas por el Workflow con un valor predeterminado. Las Órdenes agregadas al Workflow pueden especificar valores; de lo contrario, se usa el valor predeterminado.

Para las Variables de Workflow se ofrecen los siguientes tipos de datos:

- **String** contiene cualquier carácter. Opcionalmente los valores pueden encerrarse con comillas simples.
  - Valores constantes: *hello world*
  - Funciones: *now( format='yyyy-MM-dd hh:mm:ss', timezone='Europe/London' )*, *env('HOSTNAME')*
- **Number** contiene enteros y números de punto flotante como 3.14.
- **Boolean** los valores son *true* o *false*.
- **Final** los valores son evaluados por el Controlador cuando se agrega una Orden. Los demás tipos de datos son evaluados por el Agente cuando se inicia una Orden.
  - El uso principal son funciones como: *jobResourceVariable( 'myJobResource', 'myVariable' )*
  - Para más detalles, consulte [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables).
- **List** es un tipo de datos de array que ofrece agregar cualquier número de variables, cada una con su tipo de dato individual y valor predeterminado.
  - Las referencias a variables de array usan la sintaxis: *$colors(0).lightblue*, *$colors(0).blue*, *$colors(1).lightgreen*, *$colors(1).green*
- **Map** es una lista de variables, cada una con su tipo de dato individual y valor predeterminado.
  - Las referencias a variables de mapa usan la sintaxis: *$colors.blue*, *$colors.green*

### Búsqueda en Workflows

En la parte superior del *Panel de Workflow* hay disponible un icono de búsqueda. Al hacer clic en el icono se ofrece especificar una cadena que coincida con el nombre de un Job o de una Instrucción de Workflow.

- Al escribir el primer carácter, se abre un cuadro de lista que muestra las Instrucciones de Workflow coincidentes e indica las coincidencias en color rojo.
- Al hacer clic en una coincidencia, la ventana se desplaza a la Instrucción de Job o Workflow relacionada.
- La búsqueda de instrucciones no distingue entre mayúsculas y minúsculas, y es truncada por la izquierda y por la derecha. Por ejemplo, escribir el carácter **O** (o mayúscula) encontrará *J**o**b*.

### Operaciones en Workflows

#### Operaciones de Despliegue

En la parte superior del *Panel de Workflow* los usuarios encontrarán los siguientes indicadores de estado:

- **valid** / **not valid** indica mediante color azul / naranja si el Workflow es consistente y está listo para el despliegue. Los Workflows *inválidos* no pueden desplegarse; sin embargo, los cambios se almacenan en el Inventario. Por ejemplo, una asignación de Agente faltante en un Job hará que el Workflow sea *inválido*. Dentro del indicador de estado *not valid* está disponible el icono de información (i) que muestra la razón por la que el Workflow no es *válido*.
- **deployed** / **not deployed** indica si la versión actual del Workflow ha sido *desplegada* o es un Borrador que *no fue desplegado*.

El botón *Deploy* ofrece el despliegue a un Controlador con una sola operación de clic. Aparte de eso, las operaciones de despliegue están disponibles a nivel de carpeta; consulte [Configuración - Inventario - Panel de Navegación](/configuration-inventory-navigation).

#### Operaciones en Instrucciones

Al pasar el cursor sobre una instrucción, se ofrece el menú de acción de 3 puntos para las siguientes operaciones:

- **All Instructions** ofrecen las operaciones *Copy*, *Cut* y *Remove*. Las instrucciones de bloque como la *Fork Instruction* ofrecen adicionalmente la operación *Remove All*: mientras que *Remove* eliminará solo la instrucción, la operación *Remove All* eliminará la instrucción y cualquier instrucción incluida como Jobs.
- **Job Instruction** ofrece la operación *Make Job Template* que crea una Plantilla de Job a partir del Job actual. La Plantilla de Job puede ser usada por otros Jobs en el mismo Workflow o en Workflows diferentes.

#### Operaciones de Copiar, Cortar y Pegar

Las operaciones **Copy** y **Cut** están disponibles desde el menú de acción de 3 puntos de una instrucción. Las operaciones de *copiar* y *cortar* en una instrucción de bloque actúan sobre cualquier instrucción incluida en el bloque. Para copiar o cortar más de una instrucción del mismo nivel, los usuarios mantienen presionada la tecla del ratón y marcan las instrucciones de forma similar al uso de un lazo.

- El atajo de teclado **Ctrl+C** copiará las instrucciones resaltadas.
- El atajo de teclado **Ctrl+X** cortará las instrucciones resaltadas.

Las operaciones **Paste** están disponibles desde el *Panel de Barra de Herramientas* que permite arrastrar y soltar las instrucciones copiadas o cortadas al Workflow.

- El atajo de teclado **Ctrl+V** pegará las instrucciones copiadas o cortadas cuando el usuario haga clic en una línea de conexión entre instrucciones del Workflow.

#### Panel de Operaciones

Al hacer clic en el lienzo del *Panel de Workflow*, se hace visible un *Panel de Operaciones* que ofrece las siguientes operaciones:

- Operaciones de Zoom
  - **Zoom In** aumentará el tamaño de las Instrucciones de Workflow.
  - **Zoom Out** reducirá el tamaño de las Instrucciones de Workflow.
  - **Zoom to Default** establecerá el tamaño predeterminado de las Instrucciones de Workflow.
  - **Fit to Panel** elegirá un tamaño para las Instrucciones de Workflow que permita que el Workflow se ajuste al tamaño del panel.
- Operaciones de Deshacer y Rehacer
  - **Undo** revertirá el último cambio. Se pueden revertir hasta 20 operaciones.
  - **Redo** repetirá el último cambio que fue deshecho.
- Operaciones de Descargar y Cargar
  - **Download JSON** descargará el Workflow en formato de almacenamiento JSON a un archivo .json.
  - **Upload JSON** ofrece cargar un archivo .json que reemplazará el Workflow.
- Operaciones de Exportación
  - **Export Image** ofrece la descarga de un archivo de imagen .png del Workflow.

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Recursos de Job](/configuration-inventory-job-resources)
- [Configuración - Inventario - Panel de Navegación](/configuration-inventory-navigation)
- [Plan Diario](/daily-plan)
- [Historial de Órdenes](/history-orders)
- [Estados de Órdenes](/order-states)

### Base de Conocimiento del Producto

- [Directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph)
- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
- [JS7 - Workflow Instructions - Processing](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Processing)
  - [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
  - [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction)
  - [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction)
  - [JS7 - Prompt Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Prompt+Instruction)
  - [JS7 - Sleep Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Sleep+Instruction)
- [JS7 - Workflow Instructions - Clustering](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Clustering)
  - [JS7 - ForkList-Join Instruction for Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction+for+Agent+Clusters)
  - [JS7 - StickySubagent Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+StickySubagent+Instruction+for+Agent+Clusters)
- [JS7 - Workflow Instructions - Conditional Processing](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Conditional+Processing)
  - [JS7 - AdmissionTimes Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AdmissionTimes+Instruction)
  - [JS7 - If Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+If+Instruction)
  - [JS7 - Case Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Case+Instruction)
- [JS7 - Workflow Instructions - Cyclic Execution](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Cyclic+Execution)
  - [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction)
  - [JS7 - Break Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Break+Instruction)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)
  - [JS7 - AddOrder Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AddOrder+Instruction)
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)
- [JS7 - Workflow Instructions - Error Handling](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Error+Handling)
  - [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction)
  - [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction)
  - [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction)
  - [JS7 - Try-Catch Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Try-Catch+Instruction)
- [JS7 - Workflow Instructions - Forking](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Forking)
  - [JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction)
  - [JS7 - ForkList-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction)
