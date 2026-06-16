# Configuración - Inventario - Operaciones - Desplegar Carpeta

El despliegue de objetos incluye su transferencia a uno o más Controladores. Esto aplica a objetos como Workflows y Recursos de Job disponibles en la carpeta del sistema *Controlador*.

La vista *Configuración->Inventario* permite desplegar un objeto individual, ver [Configuración - Inventario - Operaciones - Desplegar Objeto](/configuration-inventory-operations-deploy-object), y desplegar objetos desde carpetas.

Al desplegar objetos desde carpetas utilizando la operación *Desplegar* disponible en el menú de acción de tres puntos de la carpeta, se mostrará una ventana emergente como la siguiente:

<img src="deploy-folder.png" alt="Deploy Folder" width="600" height="460" />

## Despliegue en Controladores

El campo de entrada **Controlador** acepta uno o más Controladores a los cuales se desplegarán los objetos.

Por defecto se utilizará el Controlador actualmente seleccionado.

## Actualización del Plan Diario

El despliegue de objetos como Workflows, Planificaciones y Calendarios impacta el [Plan Diario](/daily-plan). Con frecuencia, la versión actualizada de un objeto debería utilizarse para las Órdenes del Plan Diario. Los usuarios controlan el comportamiento desde las siguientes opciones:

- **Actualizar Plan Diario**
  - **Ahora** especifica actualizar el Plan Diario para las Órdenes planificadas a partir del momento actual.
  - **Fecha de Inicio** cuando se selecciona, agrega un campo de entrada para la fecha de destino a partir de la cual se actualizará el Plan Diario.
  - **No** especifica que el Plan Diario no será actualizado. Las Órdenes existentes seguirán usando versiones previamente desplegadas de los objetos.
- **Incluir Órdenes tardías de hoy** cuando se marca, incluirá las Órdenes planificadas para un momento pasado del día actual pero que están retrasadas y no comenzaron.

## Despliegue de Objetos y Cambios

El **Tipo de Despliegue** permite seleccionar entre

- **Objetos Individuales** disponibles en la carpeta seleccionada.
- **Cambios** que incluyen objetos sujetos a un [Cambio](/changes). Los usuarios seleccionan el Cambio deseado desde la lista de Cambios disponible en un cuadro de lista.

## Filtrado de Objetos

Los objetos pueden filtrarse desde las siguientes opciones:

- **Borrador** especifica que los objetos en estado de borrador deben ser desplegados.
- **Desplegado** especifica que los objetos en estado desplegado deben incluirse en el despliegue.

## Inclusión de Subcarpetas

La opción **Incluir Subcarpetas** permite agregar objetos de subcarpetas de forma recursiva al despliegue."

## Inclusión de Dependencias

Los objetos del Inventario están relacionados por dependencias, ver [Matriz de Dependencias](/dependencies-matrix). Por ejemplo, un Workflow que referencia un Recurso de Job y un Recurso de Lock; una Planificación que referencia un Calendario y uno o más Workflows.

Al desplegar objetos se considera la consistencia, por ejemplo:

- Si se crea un Recurso de Job y es referenciado por un Workflow recién creado, entonces el despliegue del Workflow incluye el despliegue del Recurso de Job.
- Si un Recurso de Job es referenciado por un Workflow desplegado y debe ser revocado o eliminado, entonces el Workflow también debe ser revocado o eliminado.

Los usuarios controlan el despliegue consistente desde las siguientes opciones:

- **Incluir Dependencias**
  - cuando está marcado, incluirá tanto objetos que referencian como objetos referenciados.
    - Si los objetos relacionados están en estado de borrador, se ofrecerá el despliegue conjunto. Se aplicará de forma obligatoria si es requerido por cambios en las relaciones entre objetos.
    - Si los objetos relacionados están en estado desplegado/liberado, el despliegue conjunto es opcional. Los usuarios pueden seleccionar objetos relacionados para el despliegue conjunto.
  - cuando no está marcado, no se considerarán las dependencias. Los usuarios deben verificar que los objetos relacionados sean válidos y estén desplegados/liberados. El Controlador generará mensajes de error en caso de objetos faltantes debido a un despliegue inconsistente.

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Operaciones - Desplegar Objeto](/configuration-inventory-operations-deploy-object)
- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
- [Plan Diario](/daily-plan)
- [Matriz de Dependencias](/dependencies-matrix)

### Base de Conocimiento del Producto

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
