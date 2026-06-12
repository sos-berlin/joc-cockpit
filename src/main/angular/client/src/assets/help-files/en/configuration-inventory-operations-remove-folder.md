# Configuración - Inventario - Operaciones - Eliminar Carpeta

Eliminar objetos incluye borrarlos de los Controladores y del inventario. Esto aplica a objetos como Workflows y Planificaciones disponibles en las carpetas del sistema *Controlador* y *Automatización*.

Eliminar una carpeta incluye eliminar las subcarpetas de forma recursiva. Los objetos eliminados permanecen disponibles en la papelera del Inventario.

La vista *Configuración->Inventario* permite eliminar un objeto individual, ver [Configuración - Inventario - Operaciones - Eliminar Objeto](/configuration-inventory-operations-remove-object), y eliminar objetos desde carpetas.

Al eliminar una carpeta utilizando la operación *Eliminar* disponible en el menú de acción de tres puntos de la carpeta en el panel de navegación, se mostrará una ventana emergente como la siguiente:

<img src="remove-folder.png" alt="Remove Folder" width="600" height="560" />

## Eliminación de Objetos de los Controladores

Al eliminar objetos, serán eliminados de todos los Controladores en los que hayan sido desplegados.

## Actualización del Plan Diario

La eliminación de objetos como Workflows y Planificaciones impacta el [Plan Diario](/daily-plan).

Las Órdenes existentes para Workflows relacionados serán canceladas en los Controladores y eliminadas del Plan Diario.

## Inclusión de Dependencias

Los objetos del Inventario están relacionados por dependencias, ver [Matriz de Dependencias](/dependencies-matrix). Por ejemplo, un Workflow que referencia un Recurso de Job y un Recurso de Lock; una Planificación que referencia un Calendario y uno o más Workflows.

Al eliminar objetos se considera la consistencia, por ejemplo:

- Si un Recurso de Job es referenciado por un Workflow, entonces la eliminación del Recurso de Job incluye revocar el Workflow.
- Si se elimina un Workflow, entonces una Planificación que lo referencia será recuperada y las Órdenes relacionadas serán canceladas y eliminadas del Plan Diario.

Los usuarios controlan la eliminación consistente de objetos desde las siguientes opciones:

- **Incluir Dependencias**
  - cuando está marcado, incluirá tanto objetos que referencian como objetos referenciados.
    - Si los objetos relacionados han sido desplegados o liberados previamente, se ofrecerá la eliminación/revocación conjunta: el objeto para el cual se realiza la operación *Eliminar* será eliminado; para los objetos relacionados se ofrecerá la revocación/recuperación. La revocación se aplicará de forma obligatoria si es requerida por las relaciones entre objetos.
    - Lo mismo aplica a los objetos en estado de borrador que hayan sido desplegados o liberados previamente.
  - cuando no está marcado, no se considerarán las dependencias. Los usuarios deben verificar que los objetos relacionados sean válidos y estén desplegados/liberados. El Controlador generará mensajes de error en caso de objetos faltantes debido a una revocación inconsistente.

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Operaciones - Eliminar Objeto](/configuration-inventory-operations-remove-object)
- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
- [Plan Diario](/daily-plan)
- [Matriz de Dependencias](/dependencies-matrix)

### Base de Conocimiento del Producto

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
