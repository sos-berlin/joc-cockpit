# Configuración - Inventario - Operaciones - Recuperar Objeto

La recuperación de objetos los desactiva, por ejemplo, para su uso con el [Plan Diario](/daily-plan). Esto aplica a objetos como Planificaciones y Calendarios disponibles en la carpeta del sistema *Automatización*.

La vista *Configuración->Inventario* permite recuperar un objeto individual y recuperar objetos desde carpetas, ver [Configuración - Inventario - Operaciones - Recuperar Carpeta](/configuration-inventory-operations-recall-folder).

Al recuperar un objeto individual desde la operación *Recuperar* disponible en el menú de acción de tres puntos del objeto en el panel de navegación, se mostrará una ventana emergente como la siguiente:

<img src="recall-schedule.png" alt="Recall Schedule" width="600" height="300" />

## Actualización del Plan Diario

La recuperación de objetos como Planificaciones y Calendarios impacta el [Plan Diario](/daily-plan).

Las Órdenes existentes para Workflows referenciados por Planificaciones relacionadas serán recuperadas del Controlador y eliminadas del Plan Diario.

## Inclusión de Dependencias

Los objetos del Inventario están relacionados por dependencias, ver [Matriz de Dependencias](/dependencies-matrix). Por ejemplo, un Workflow que referencia un Recurso de Job y un Recurso de Lock; una Planificación que referencia un Calendario y uno o más Workflows.

Al recuperar objetos se considera la consistencia, por ejemplo:

- Si se crea una Planificación y referencia un Calendario recién creado, entonces liberar la Planificación incluye liberar el Calendario también. Esto además incluye el despliegue de un Workflow en borrador referenciado por la Planificación.
- Si un Calendario es referenciado por una Planificación liberada y debe ser recuperado o eliminado, entonces la Planificación también debe ser recuperada o eliminada. Esto incluye revocar o eliminar el Workflow referenciado por la Planificación.

Los usuarios controlan el despliegue consistente desde las siguientes opciones:

- **Incluir Dependencias**
  - cuando está marcado, incluirá tanto objetos que referencian como objetos referenciados.
    - Si los objetos relacionados están en estado desplegado/liberado, se ofrecerá la recuperación conjunta. Se aplicará de forma obligatoria si es requerida por las relaciones entre objetos.
    - Si los objetos relacionados están en estado de borrador, la recuperación conjunta es opcional. Los usuarios pueden seleccionar objetos relacionados para la recuperación conjunta.
  - cuando no está marcado, no se considerarán las dependencias. Los usuarios deben verificar que los objetos relacionados sean válidos y estén desplegados/liberados. El Controlador generará mensajes de error en caso de objetos faltantes debido a un despliegue inconsistente.

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Operaciones - Recuperar Carpeta](/configuration-inventory-operations-recall-folder)
- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
- [Plan Diario](/daily-plan)
- [Matriz de Dependencias](/dependencies-matrix)

### Base de Conocimiento del Producto

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
