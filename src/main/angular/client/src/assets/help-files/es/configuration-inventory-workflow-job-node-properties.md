# Configuración - Inventario - Workflow - Propiedades de Nodo de Job

El panel *Workflow* ofrece el diseño de Workflows a partir de una secuencia de instrucciones. Los usuarios pueden arrastrar y soltar la *Instrucción de Job* desde la *Barra de Herramientas* a una posición en el Workflow.

La interfaz gráfica ofrece una serie de pestañas para especificar los detalles del Job. La cuarta pestaña corresponde a las *Propiedades de Nodo*.

## Propiedades de Nodo

Un Nodo es la posición de un Job en el Workflow. Si el mismo Job aparece varias veces en el mismo Workflow, utilizará el mismo *Nombre de Job* pero diferentes *Etiquetas*. La *Etiqueta* identifica el Nodo en el Workflow.

Si el mismo Job se utiliza con diferentes conjuntos de parámetros por cada aparición en el Workflow, se pueden usar las *Propiedades de Nodo*. Estas ofrecen pares clave/valor que crean Variables de Nodo.

- **Name** especifica el nombre de la Variable de Nodo que puede usarse
  - en Jobs de Shell asignando una Variable de Entorno al *Nombre* de la Variable de Nodo mediante la sintaxis *$myNodeVariable*.
  - en Jobs JVM asignando una Variable de Job al *Nombre* de la Variable de Nodo mediante la sintaxis *$myNodeVariable*.
- **Value** acepta entrada de cadenas de texto, números y referencias a Variables de Workflow como en *$myWorkflowVariable*.

Los nombres de Variables de Nodo distinguen entre mayúsculas y minúsculas.

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
  - [Configuración - Inventario - Workflows - Opciones de Job](/configuration-inventory-workflows-job-options)
  - [Configuración - Inventario - Workflows - Propiedades de Job](/configuration-inventory-workflows-job-properties)
  - [Configuración - Inventario - Workflows - Notificaciones de Job](/configuration-inventory-workflows-job-notifications)
  - [Configuración - Inventario - Workflows - Etiquetas de Job](/configuration-inventory-workflows-job-tags)

### Base de Conocimiento del Producto

- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
