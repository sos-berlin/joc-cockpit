# Configuración - Inventario - Workflow - Propiedades de Job

El panel *Workflow* ofrece el diseño de Workflows a partir de una secuencia de instrucciones. Los usuarios pueden arrastrar y soltar la *Instrucción de Job* desde la *Barra de Herramientas* a una posición en el Workflow.

La interfaz gráfica ofrece una serie de pestañas para especificar los detalles del Job. La primera pestaña corresponde a las *Propiedades de Job*.

## Propiedades de Job Requeridas

Las propiedades mínimas para un Job son las siguientes:

- **Name** identifica el Job con un nombre único. Si más de un Job en el Workflow utiliza el mismo nombre, solo se almacena una copia del Job y las demás apariciones referencian el Job usando diferentes *Etiquetas de Job*.
- **Label** es un identificador único para las instrucciones en un Workflow. La unicidad se aplica entre Jobs y otras instrucciones. Si el mismo *Nombre de Job* se usa varias veces en un Workflow, deben usarse diferentes *Etiquetas*.
- **Agent** asigna un Agente para la ejecución del Job.
  - Los *Agentes Autónomos* se seleccionan por su *Nombre de Agente*.
  - Los *Agentes en Clúster* se especifican seleccionando el *Clúster de Agentes* y el *Clúster de Subagentes* deseado.
- **Script** contiene los comandos de shell, llamadas a scripts y archivos ejecutables que el Job ejecuta para la plataforma Unix o Windows correspondiente.

## Propiedades de Job Opcionales

- **Title** describe el propósito del Job. Los usuarios pueden agregar enlaces usando sintaxis markdown; por ejemplo, \[Example\]\(https://example.com\). El *Título* se tiene en cuenta al filtrar resultados, por ejemplo en la vista [Workflows](/workflows).
- **Job Resources** son objetos del Inventario que contienen variables en pares clave/valor y que pueden ponerse a disposición a través de Variables de Workflow y Variables de Entorno. Los *Recursos de Job* pueden asignarse a nivel de Job y a nivel de Workflow, lo que los hace disponibles para todos los Jobs del Workflow. Para más detalles, consulte [Configuración - Inventario - Recursos de Job](/configuration-inventory-job-resources).
- **Return Code** especifica si un Job se considera exitoso o fallido. Por defecto, el valor 0 indica éxito; otros valores indican fallo. Se pueden separar varios códigos de retorno exitosos por coma, por ejemplo *0,2,4,8*. Un rango de códigos de retorno puede especificarse con dos puntos, por ejemplo *0..8* o *0,2,4,8,16..64*, separados por coma. Los códigos de retorno negativos no están definidos.
  - **On Success** especifica los códigos de retorno exitosos.
  - **On Failure** especifica los códigos de retorno no exitosos que indican fallo.
  - **Ignore** no considerará los códigos de retorno como indicador del éxito o fallo de un Job.
- **Return Code on Warning** es un subconjunto de los códigos de retorno exitosos. Si un código de retorno exitoso se especifica como advertencia, se creará una notificación; sin embargo, el flujo de la Orden en el Workflow no se verá afectado por las advertencias.

### Clases de Job

- **Job Class** especifica el tipo de Job que se ejecuta. Para más detalles, consulte [JS7 - Job Classes](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Classes).
  - **Shell Jobs** se ejecutan con el shell del sistema operativo, por ejemplo el Shell de Windows o el Shell de Unix disponible en /bin/sh. Los Jobs de Shell pueden incluir cualquier comando de shell, llamadas a scripts y archivos ejecutables. Los Jobs de Shell permiten el uso de lenguajes de scripting como Node.js, Perl, Python, PowerShell, etc. Requieren que un intérprete esté instalado en el sistema operativo y pueda ejecutarse desde la línea de comandos.
  - **JVM Jobs** están implementados en varios lenguajes que operan en una Máquina Virtual Java para la cual el Agente JS7 ofrece la [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API). Los lenguajes soportados incluyen:
    - *Plantillas de Job*
      - **JITL Jobs** son Jobs Java que se distribuyen con JS7 y que se usan a través de [JS7 - Integration Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Integration+Job+Templates); por ejemplo, para acceder a bases de datos o a hosts remotos mediante SSH.
    - *Jobs Definidos por el Usuario*
      - **Java Jobs** se ejecutan en la JVM usada con el Agente JS7.
      - **JavaScript Jobs** y **Python Jobs** requieren el uso de bibliotecas Oracle® Graal Polyglot con el Agente JS7. Las bibliotecas proporcionan el compilador JIT.

### Variables de Entorno

Para los *Jobs de Shell*, la parametrización se pone a disposición a través de Variables de Entorno.

- **Name** puede elegirse libremente dentro de los límites del sistema operativo, excluyendo por ejemplo guiones y espacios. Una convención de nomenclatura frecuente incluye el uso de letras mayúsculas. En Unix los *Nombres* distinguen entre mayúsculas y minúsculas; en Windows se consideran insensibles a mayúsculas y minúsculas.
- **Value** puede ser una entrada directa de cadenas de texto o números. Además, se pueden especificar Variables de Workflow declaradas con el Workflow precedidas por el carácter $ como en *$variable*. La ortografía de las Variables de Workflow distingue entre mayúsculas y minúsculas.

## Propiedades de Job disponibles desde *More Options*

La vista *Configuración - Inventario* ofrece el control deslizante *More Options* en la parte superior de la ventana, que está inactivo por defecto. El uso del control deslizante hace disponibles opciones adicionales.

- **Documentation** contiene una referencia a [Recursos - Documentaciones](/resources-documentations) que puede usarse para explicar el Job. La referencia a la documentación es visible en la vista [Workflows](/workflows).

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Recursos de Job](/configuration-inventory-job-resources)
- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
  - [Configuración - Inventario - Workflows - Opciones de Job](/configuration-inventory-workflows-job-options)
  - [Configuración - Inventario - Workflows - Propiedades de Nodo de Job](/configuration-inventory-workflows-job-node-properties)
  - [Configuración - Inventario - Workflows - Notificaciones de Job](/configuration-inventory-workflows-job-notifications)
  - [Configuración - Inventario - Workflows - Etiquetas de Job](/configuration-inventory-workflows-job-tags)
- [Recursos - Documentaciones](/resources-documentations)

### Base de Conocimiento del Producto

- [JS7 - Integration Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Integration+Job+Templates)
- [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API)
- [JS7 - Job Classes](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Classes)
- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
