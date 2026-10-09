# Configuración - Inventario - Orígenes de Archivos Disparadores

El *Panel de Origen de Archivos Disparadores* ofrece la especificación de orígenes para el [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching) con Workflows:

- Un Agente monitorea un directorio en busca de archivos entrantes.
- Por cada archivo entrante se crea una Orden que representa el archivo.
  - Si el archivo es movido o eliminado por un Job antes de que el Workflow finalice, la Orden continuará el Workflow y lo abandonará al completarse.
  - Si el archivo permanece en su lugar al finalizar el Workflow, la Orden quedará disponible con el estado *completado*. Para que la Orden abandone el Workflow, el archivo entrante debe ser movido o eliminado.
- Las Órdenes contienen la variable *file* que almacena la ruta al archivo entrante. La variable *file* debe ser declarada por el Workflow y puede ser utilizada por los Jobs.

Los Orígenes de Archivos Disparadores se asignan a un Workflow al que agregarán una Orden por cada archivo entrante.

Los Orígenes de Archivos Disparadores se gestionan desde los siguientes paneles:

- El [Configuración - Inventario - Panel de Navegación](/configuration-inventory-navigation) en el lado izquierdo de la ventana ofrece navegación por carpetas que contienen Orígenes de Archivos Disparadores. Además, el panel ofrece operaciones sobre los Orígenes de Archivos Disparadores.
- El *Panel de Origen de Archivos Disparadores* en el lado derecho de la ventana contiene los detalles de configuración del Origen de Archivos Disparadores.

## Panel de Origen de Archivos Disparadores

Para un Origen de Archivos Disparadores están disponibles los siguientes campos de entrada:

- **Nombre** es el identificador único de un Origen de Archivos Disparadores, véase [Reglas de Nomenclatura de Objetos](/object-naming-rules).
- **Título** contiene una explicación opcional del propósito del Origen de Archivos Disparadores.
- **Nombre de Etiqueta** permite especificar un número de Etiquetas que serán asignadas a las Órdenes creadas para los archivos entrantes.
- **Nombre del Workflow** especifica el nombre del Workflow al que se agregarán Órdenes para los archivos entrantes.
- **Agente** especifica el Agente que monitoreará el directorio de entrada. Si se utiliza un Clúster de Agentes, el monitoreo de archivos es realizado por los Agentes Directores para alta disponibilidad: en caso de conmutación o conmutación por error, el Agente Director en Espera asumirá el rol activo de monitoreo de directorios.
- **Directorio** especifica el directorio que se monitorea en busca de archivos entrantes. La cuenta de ejecución del Agente debe tener permisos de lectura y escritura (mover, eliminar) sobre los archivos entrantes del *Directorio*.
- **Patrón** especifica una [Expresión Regular](https://en.wikipedia.org/wiki/Regular_expression) de Java para coincidir con los nombres de los archivos entrantes. Las Expresiones Regulares son diferentes del uso de comodines. Por ejemplo:
  - **.\*** coincide con cualquier nombre de archivo,
  - **.\*\\.csv$** coincide con nombres de archivo que tengan la extensión .csv.
- **Zona Horaria** especifica la zona horaria aplicable para asignar las Órdenes de los archivos entrantes a la fecha del Plan Diario correspondiente, véase [Plan Diario](/daily-plan). Para la entrada se aceptan identificadores de zona horaria como *UTC*, *Europe/London*, etc. Para una lista completa de identificadores de zona horaria véase [Lista de zonas horarias de la base de datos tz](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).
- **Retardo** especifica el número de segundos que el Agente esperará hasta que el archivo entrante se considere estable.
  - En Unix los archivos pueden escribirse al mismo tiempo que el Agente los lee. Esto no aplica a entornos Windows que por defecto no permiten leer y escribir archivos al mismo tiempo.
  - En un primer paso el Agente verificará el tamaño del archivo y la marca de tiempo de modificación. En un segundo paso el Agente esperará el *Retardo* y repetirá la verificación. Si el tamaño del archivo y la marca de tiempo de modificación no han cambiado, el Agente creará la Orden; de lo contrario repetirá el segundo paso.
- **Prioridad**
  - Si una Orden encuentra una instrucción de *Recurso de Lock* en el Workflow que limita el paralelismo, su *Prioridad* determina la posición en la cola de Órdenes *en espera*.
  - Las *Prioridades* se especifican mediante enteros negativos, cero y positivos, o mediante los accesos directos disponibles. Una *Prioridad* más alta tiene precedencia. Los accesos directos ofrecen los siguientes valores:
    - **Baja**: -20000
    - **Inferior a lo Normal**: -10000
    - **Normal**: 0
    - **Superior a lo Normal**: 10000
    - **Alta**: 20000

### Operaciones sobre Orígenes de Archivos Disparadores

Para las operaciones disponibles véase [Configuración - Inventario - Panel de Navegación](/configuration-inventory-navigation).

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Panel de Navegación](/configuration-inventory-navigation)
- [Plan Diario](/daily-plan)
- [Reglas de Nomenclatura de Objetos](/object-naming-rules)
- [Expresión Regular](https://en.wikipedia.org/wiki/Regular_expression)

### Base de Conocimiento del Producto

- [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching)
- [Lista de zonas horarias de la base de datos tz](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
