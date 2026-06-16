# Configuración - Inventario - Recursos de Job

El *Panel de Recursos de Job* ofrece la especificación de Recursos de Job para su uso con Workflows y Jobs.

Los Recursos de Job contienen variables en pares clave/valor que se utilizan para los siguientes propósitos:

- Para Jobs JVM que se ejecutan en la Máquina Virtual Java del Agente, las variables se especifican mediante *Argumentos*. Cuando un Recurso de Job se asigna a un Job, los argumentos del Job coincidentes serán completados automáticamente.
- Para Jobs de Shell, las variables se especifican mediante *Variables de Entorno*. Cuando un Recurso de Job se asigna a un Job, las Variables de Entorno se crearán automáticamente.

Los Recursos de Job se asignan a un Workflow o a un Job desde la propiedad del objeto relacionado, véase [Configuración - Inventario - Workflow - Opciones de Job](/configuration-inventory-workflow-job-options). Cuando se asignan a nivel de Workflow, las variables del Recurso de Job estarán disponibles para todos los Jobs del Workflow.

Los Recursos de Job se gestionan desde los siguientes paneles:

- El [Panel de Navegación - Configuración - Inventario](/configuration-inventory-navigation) en el lado izquierdo de la ventana ofrece navegación por carpetas que contienen Recursos de Job. Además, el panel ofrece operaciones sobre los Recursos de Job.
- El *Panel de Recursos de Job* en el lado derecho de la ventana contiene los detalles de configuración del Recurso de Job.

## Panel de Recursos de Job

Para un Recurso de Job están disponibles los siguientes campos de entrada:

- **Nombre** es el identificador único de un Recurso de Job, véase [Reglas de Nomenclatura de Objetos](/object-naming-rules).
- **Título** contiene una explicación opcional del propósito del Recurso de Job.

El panel ofrece la configuración de variables del Recurso de Job desde las siguientes pestañas:

- **Argumentos** son utilizados por Jobs JVM creados en Java, JavaScript, etc.
- **Variables de Entorno** son utilizadas por Jobs de Shell.

Las variables del Recurso de Job se configuran en cada pestaña mediante los siguientes campos de entrada:

- **Nombre** puede elegirse libremente dentro de las [Reglas de Nomenclatura de Objetos](/object-naming-rules).
  - Para *Argumentos* se aplican las limitaciones de Java. La escritura de los nombres de *Argumento* distingue entre mayúsculas y minúsculas.
  - Para *Variables de Entorno* se aplican las limitaciones del sistema operativo, por ejemplo, se excluyen guiones y espacios. Una convención de nomenclatura frecuente incluye el uso de mayúsculas. En Unix los nombres de Variables de Entorno distinguen entre mayúsculas y minúsculas; en Windows se consideran sin distinción de mayúsculas y minúsculas.
- **Valor** puede ser una entrada directa de cadenas de texto, números o expresiones, véase [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables).

Si la misma variable debe estar disponible tanto para *Argumentos* como para *Variables de Entorno*, el valor de la Variable de Entorno puede referenciar el nombre del *Argumento* de la siguiente manera: *$argument*

### Operaciones sobre Recursos de Job

Para las operaciones disponibles véase [Configuración - Inventario - Panel de Navegación](/configuration-inventory-navigation).

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Workflow - Opciones de Job](/configuration-inventory-workflow-job-options)
- [Configuración - Inventario - Panel de Navegación](/configuration-inventory-navigation)
- [Reglas de Nomenclatura de Objetos](/object-naming-rules)

### Base de Conocimiento del Producto

- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
