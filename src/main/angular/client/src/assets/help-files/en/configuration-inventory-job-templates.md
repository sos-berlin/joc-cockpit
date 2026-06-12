# Configuración - Inventario - Plantillas de Job

El panel *Plantillas de Job* ofrece la especificación de plantillas gestionadas de forma centralizada para los Jobs utilizados en Workflows. Se aplican cuando la misma implementación de Job se usa en varios Jobs.

- Los Jobs contienen una referencia a una Plantilla de Job que se aplica cuando el Job es creado.
- Los Jobs pueden actualizarse cuando las Plantillas de Job son modificadas.
- Las Plantillas de Job pueden crearse para cualquier clase de Job, como Jobs de Shell y Jobs JVM que se ejecutan en la Máquina Virtual Java del Agente.

Las Plantillas de Job se gestionan desde los siguientes paneles:

- El [Panel de Navegación - Configuración - Inventario](/configuration-inventory-navigation) en el lado izquierdo de la ventana ofrece navegación por carpetas que contienen Plantillas de Job. Además, el panel ofrece operaciones sobre las Plantillas de Job.
- El *Panel de Plantillas de Job* en el lado derecho de la ventana contiene los detalles de configuración de la Plantilla de Job.

## Panel de Plantillas de Job

Para una Plantilla de Job están disponibles los siguientes campos de entrada:

- **Nombre** es el identificador único de una Plantilla de Job, véase [Reglas de Nomenclatura de Objetos](/object-naming-rules).
- Los demás campos de entrada corresponden a los de un Job:
  - [Propiedades del Job](/configuration-inventory-workflow-job-properties)
  - [Opciones del Job](/configuration-inventory-workflow-job-options)
  - [Propiedades del Nodo del Job](/configuration-inventory-workflow-job-node-properties)
  - [Notificaciones del Job](/configuration-inventory-workflow-job-notifications)
  - [Etiquetas del Job](/configuration-inventory-workflow-job-tags)
- **Argumentos** se usan para Jobs JVM.
  - **Requerido** especifica si el argumento es obligatorio o puede omitirse al usarse en un Job.
  - **Descripción** agrega una explicación al argumento que puede incluir etiquetas HTML.

## Operaciones sobre Plantillas de Job

Para las operaciones generales véase [Configuración - Inventario - Panel de Navegación](/configuration-inventory-navigation).

Las Plantillas de Job ofrecen las siguientes operaciones para actualizar Jobs:

- El botón **Aplicar Plantilla a Jobs** está disponible cuando una Plantilla de Job está liberada.
  - Se muestra una ventana emergente que indica los Workflows y Jobs que utilizan la Plantilla de Job.
  - Los usuarios pueden seleccionar los Workflows y Jobs que deben actualizarse.
  - **Filtro** permite limitar las actualizaciones a Workflows en estado *Borrador* y/o en estado *Desplegado*.
  - **Actualizar Notificación** especifica que la configuración de Notificaciones del Job debe actualizarse desde la Plantilla de Job.
  - **Actualizar Tiempos de Admisión** especifica que los Tiempos de Admisión del Job deben actualizarse desde la Plantilla de Job.
  - **Actualizar desde argumentos requeridos** especifica que los argumentos de la Plantilla de Job calificados como requeridos deben actualizarse en los Jobs seleccionados.
  - **Actualizar desde argumentos opcionales** especifica que los argumentos de la Plantilla de Job calificados como opcionales deben actualizarse en los Jobs seleccionados.
- **Actualizar Jobs desde Plantillas** está disponible desde el *Panel de Navegación* y actualizará los Jobs de los Workflows ubicados en la *Carpeta de Inventario* seleccionada a partir de las Plantillas de Job ubicadas en cualquier carpeta.
- **Aplicar Plantilla a Jobs** está disponible desde el *Panel de Navegación* y actualizará los Jobs de los Workflows ubicados en cualquier carpeta que tengan referencias a las Plantillas de Job incluidas en la *Carpeta de Inventario* seleccionada o en cualquier subcarpeta.

Después de actualizar los Jobs desde las Plantillas de Job, los Workflows relacionados se establecerán en estado *Borrador* y deben ser desplegados para que los cambios tengan efecto.

## Uso con Jobs

Las Plantillas de Job pueden crearse a partir de Jobs existentes. En la vista *Configuración->Inventario*, para un Workflow dado, los usuarios pueden hacer clic en el Job relacionado para encontrar en su menú de acciones la operación *Crear Plantilla de Job*.

Para asignar una Plantilla de Job a un Job, los usuarios pueden proceder de la siguiente manera:

- En la esquina superior derecha de la ventana, invocar el Asistente.
- Esto abrirá una ventana emergente que permite seleccionar la pestaña *Plantillas de Job del Usuario*.
  - Navegar hasta la Plantilla de Job deseada o escribir parte de su nombre.
  - Seleccionar la Plantilla de Job y opcionalmente agregar argumentos si la Plantilla de Job los proporciona.

Cuando se asigna una Plantilla de Job a un Job, esto se indica en la esquina superior derecha de la ventana:

- Los usuarios encontrarán la *Referencia de Plantilla de Job*,
- seguida de un ícono para el *Indicador de Estado de Sincronía*:
  - el color verde indica que el Job y la Plantilla de Job están sincronizados.
  - el color naranja indica que la Plantilla de Job fue modificada y que el Job no está sincronizado.
- Al hacer clic en el *Indicador de Estado de Sincronía* naranja se actualizará el Job desde su Plantilla de Job.

Para eliminar la referencia a una Plantilla de Job de un Job, los usuarios pueden hacer clic en el ícono de papelera ubicado en la esquina superior derecha junto al nombre de la Plantilla de Job. La operación dejará las propiedades del Job intactas y liberará el vínculo con la Plantilla de Job.

Los Jobs que referencian Plantillas de Job no permiten modificar la mayor parte del Job. En su lugar, los cambios deben aplicarse a la Plantilla de Job. Esto no aplica a los siguientes campos de entrada que pueden elegirse libremente:

- **Nombre del Job**
- **Etiqueta**
- **Agente**
- **Tiempos de Admisión del Job**
- **Notificación del Job**

Para asignar valores dinámicamente a los **Argumentos para Jobs JVM** o a las **Variables de Entorno para Jobs de Shell**, los usuarios pueden proceder de la siguiente manera:

- La Plantilla de Job hace uso de una Variable de Workflow para el valor asignado al *Argumento* o a la *Variable de Entorno*.
- El Workflow que contiene el Job que referencia la Plantilla de Job declara la Variable de Workflow que puede completarse desde un valor predeterminado y desde Órdenes entrantes.

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Panel de Navegación](/configuration-inventory-navigation)
- [Propiedades del Nodo del Job](/configuration-inventory-workflow-job-node-properties)
- [Notificaciones del Job](/configuration-inventory-workflow-job-notifications)
- [Opciones del Job](/configuration-inventory-workflow-job-options)
- [Propiedades del Job](/configuration-inventory-workflow-job-properties)
- [Etiquetas del Job](/configuration-inventory-workflow-job-tags)
- [Reglas de Nomenclatura de Objetos](/object-naming-rules)

### Base de Conocimiento del Producto

- [JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates)
  - [JS7 - JITL Integration Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+JITL+Integration+Job+Templates)
  - [JS7 - User Defined Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+User+Defined+Job+Templates)
