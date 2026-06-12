# Configuración - Inventario - Operaciones - Revocar Carpeta

Revocar objetos incluye eliminarlos del Controlador y mantenerlos en estado de borrador en el inventario. Esto aplica a objetos como Workflows y Recursos de Job disponibles en la carpeta del sistema *Controlador*.

La vista *Configuración->Inventario* permite revocar un objeto individual, ver [Configuración - Inventario - Operaciones - Revocar Objeto](/configuration-inventory-operations-revoke-object), y revocar objetos desde carpetas.

Al revocar objetos desde una carpeta utilizando la operación *Revocar* disponible en el menú de acción de tres puntos de la carpeta en el panel de navegación, se mostrará una ventana emergente como la siguiente:

<img src="revoke-folder.png" alt="Revoke Folder" width="600" height="580" />

## Revocación de Objetos de los Controladores

El campo de entrada acepta uno o más Controladores de los cuales se revocarán los objetos.

Por defecto se indicará el Controlador actualmente seleccionado.

## Actualización del Plan Diario

La revocación de objetos como Workflows y Recursos de Job impacta el [Plan Diario](/daily-plan).

Las Órdenes existentes para Workflows relacionados serán recuperadas del Controlador y eliminadas del Plan Diario.

## Inclusión de Subcarpetas

La opción **Incluir Subcarpetas** permite revocar objetos de subcarpetas de forma recursiva.

## Inclusión de Dependencias

Los objetos del Inventario están relacionados por dependencias, ver [Matriz de Dependencias](/dependencies-matrix). Por ejemplo, un Workflow que referencia un Recurso de Job y un Recurso de Lock; una Planificación que referencia un Calendario y uno o más Workflows.

Al revocar objetos se considera la consistencia, por ejemplo:

- Si un Recurso de Job es referenciado por un Workflow, entonces la revocación del Recurso de Job incluye también revocar el Workflow.
- Si se revoca un Workflow, entonces una Planificación que lo referencia será recuperada y las Órdenes relacionadas serán recuperadas y eliminadas del Plan Diario.

Los usuarios controlan la revocación consistente de objetos desde las siguientes opciones:

- **Incluir Dependencias**
  - cuando está marcado, incluirá tanto objetos que referencian como objetos referenciados.
    - Si los objetos relacionados han sido desplegados o liberados previamente, se ofrecerá la revocación conjunta. Se aplicará de forma obligatoria si es requerida por las relaciones entre objetos.
    - Lo mismo aplica a los objetos en estado de borrador que hayan sido desplegados o liberados previamente.
  - cuando no está marcado, no se considerarán las dependencias. Los usuarios deben verificar que los objetos relacionados sean válidos y estén desplegados/liberados. El Controlador generará mensajes de error en caso de objetos faltantes debido a una revocación inconsistente.

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Operaciones - Revocar Objeto](/configuration-inventory-operations-revoke-object)
- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
- [Plan Diario](/daily-plan)
- [Matriz de Dependencias](/dependencies-matrix)

### Base de Conocimiento del Producto

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
