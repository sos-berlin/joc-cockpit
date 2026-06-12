# Recursos - Tableros de Avisos

La vista *Tableros de Avisos* muestra información en tiempo real sobre el uso de Tableros de Avisos.

Los Tableros de Avisos implementan dependencias entre Workflows mediante el uso de Avisos. Un Aviso es un indicador que está adjunto a un Tablero de Avisos o no existe. Los Tableros de Avisos están disponibles en las siguientes modalidades:

- **Tableros de Avisos Globales** implementan Avisos en alcance global, lo que hace que el mismo Aviso esté disponible para cualquier Workflow en cualquier momento.
- **Tableros de Avisos Planificables** implementan Avisos en el alcance del [Plan Diario](/daily-plan). El Aviso existe o no existe por fecha del *Plan Diario*, por ejemplo:
  - El Workflow 1 se ejecuta de lunes a viernes.
  - El Workflow 2 se ejecuta de lunes a domingo y depende de la ejecución previa del Workflow 1.
  - Durante los fines de semana el Workflow 1 no iniciará. Para permitir que el Workflow 2 inicie los fines de semana, la dependencia se mapea al Plan Diario mediante el uso de *Tableros de Avisos Planificables*: si no se anuncia ninguna Orden para el Workflow 1, la dependencia puede ignorarse.

Los *Tableros de Avisos* son referenciados en Workflows desde las siguientes instrucciones:

- La **Instrucción PostNotices** publica uno o más *Avisos*.
- La **Instrucción ExpectNotices** espera a que uno o más *Avisos* estén presentes.
- La **Instrucción ConsumeNotices** es una instrucción de bloque que:
  - puede abarcar varios Jobs e Instrucciones de Workflow en el mismo Workflow,
  - espera a que uno o más *Avisos* estén presentes y elimina los *Avisos* al completar el bloque.

## Panel de Navegación

El panel izquierdo muestra el árbol de carpetas del inventario que contienen Tableros de Avisos.

- Hacer clic en la carpeta muestra los Tableros de Avisos de esa carpeta.
- Hacer clic en el ícono chevron-down disponible al pasar el cursor sobre una carpeta muestra los Tableros de Avisos de la carpeta y de cualquier subcarpeta.

El ícono de Búsqueda Rápida ofrece la posibilidad de buscar Tableros de Avisos basándose en la entrada del usuario:

- Escribir **Test** mostrará Tableros de Avisos con nombres como *test-board-1* y *TEST-board-2*.
- Escribir **\*Test** mostrará Tableros de Avisos con nombres como *test-board-1* y *my-TEST-board-2*.

## Panel de Tableros de Avisos

La visualización se centra en los *Tableros de Avisos*, los *Avisos* relacionados y las Órdenes.

La vista [Plan Diario - Dependencias](/daily-plan-dependencies) se centra en la visualización de *Tableros de Avisos*, *Avisos* y Órdenes relacionados con una fecha específica del Plan Diario.

### Visualización de Tableros de Avisos

Se muestra la siguiente información:

- **Nombre** es el nombre único de un Tablero de Avisos.
- **Fecha de Despliegue** es la fecha en que se desplegó el Tablero de Avisos.
- **Estado** es uno de *Sincronizado* y *No Sincronizado* si el Tablero de Avisos no ha sido desplegado al Controlador.
- **Número de Avisos** indica el número de *Avisos* del Tablero de Avisos.
  - Los **Tableros de Avisos Globales** contienen *Avisos* únicos.
  - Los **Tableros de Avisos Planificables** contienen *Avisos* por fecha del Plan Diario.
- **Número de Órdenes en Espera** indica el número de Órdenes que esperan que se publique un *Aviso*.

### Visualización de Avisos y Órdenes

Hacer clic en el ícono de flecha hacia abajo expandirá el Tablero de Avisos y mostrará información detallada sobre los *Avisos* que han sido publicados y las Órdenes que están esperando que se publiquen *Avisos*.

### Operaciones sobre Tableros de Avisos

Las siguientes operaciones están disponibles:

- **Publicar Aviso** publicará el *Aviso* relacionado de manera similar a una *Instrucción PostNotices*.
- **Eliminar Aviso** eliminará el *Aviso* de manera similar a una *Instrucción ConsumeNotices*.

## Búsqueda

La [Búsqueda de Tableros de Avisos](/resources-notice-boards-search) ofrece criterios para buscar Tableros de Avisos por dependencias, por ejemplo buscando Workflows que incluyan un nombre de Job específico; se devolverán los Tableros de Avisos utilizados por el Workflow.

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Tableros de Avisos](/configuration-inventory-notice-boards)
- [Plan Diario](/daily-plan)
- [Plan Diario - Dependencias](/daily-plan-dependencies)
- [Búsqueda de Tableros de Avisos](/resources-notice-boards-search)

### Base de Conocimiento del Producto

- [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  - [JS7 - Schedulable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedulable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)
