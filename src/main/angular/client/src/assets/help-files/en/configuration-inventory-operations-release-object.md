# Configuración - Inventario - Operaciones - Liberar Objeto

Liberar objetos los activa, por ejemplo, para su uso con el [Plan Diario](/daily-plan). Esto aplica a objetos como Planificaciones y Calendarios disponibles en la carpeta del sistema *Automatización*.

La vista *Configuración->Inventario* permite liberar un objeto individual y liberar objetos desde carpetas, ver [Configuración - Inventario - Operaciones - Liberar Carpeta](/configuration-inventory-operations-release-folder).

Al liberar un objeto individual desde el botón *Liberar* correspondiente, se mostrará una ventana emergente como la siguiente:

<img src="release-schedule.png" alt="Release Schedule" width="600" height="330" />

## Actualización del Plan Diario

Liberar objetos como Planificaciones y Calendarios impacta el [Plan Diario](/daily-plan). Con frecuencia, la versión actualizada de un objeto debería utilizarse para las Órdenes del Plan Diario. Los usuarios controlan el comportamiento desde las siguientes opciones:

- **Actualizar Plan Diario**
  - **Ahora** especifica actualizar el Plan Diario para las Órdenes planificadas a partir del momento actual.
  - **Fecha de Inicio** cuando se selecciona, agrega un campo de entrada para la fecha de destino a partir de la cual se actualizará el Plan Diario.
  - **No** especifica que el Plan Diario no será actualizado. Las Órdenes existentes seguirán usando versiones previamente desplegadas de los objetos.
- **Incluir Órdenes tardías de hoy** cuando se marca, incluirá las Órdenes planificadas para un momento pasado del día actual pero que están retrasadas y no comenzaron.

## Inclusión de Dependencias

Los objetos del Inventario están relacionados por dependencias, ver [Matriz de Dependencias](/dependencies-matrix). Por ejemplo, un Workflow que referencia un Recurso de Job y un Recurso de Lock; una Planificación que referencia un Calendario y uno o más Workflows.

Al liberar objetos se considera la consistencia, por ejemplo:

- Si se crea una Planificación y referencia un Calendario recién creado, entonces liberar la Planificación incluye liberar el Calendario también. Esto además incluye el despliegue de un Workflow en borrador referenciado por la Planificación.
- Si un Calendario es referenciado por una Planificación liberada y debe ser recuperado o eliminado, entonces la Planificación también debe ser recuperada o eliminada. Esto incluye revocar o eliminar el Workflow referenciado por la Planificación.

Los usuarios controlan el despliegue consistente desde las siguientes opciones:

- **Incluir Dependencias**
  - cuando está marcado, incluirá tanto objetos que referencian como objetos referenciados.
    - Si los objetos relacionados están en estado de borrador, se ofrecerá el despliegue conjunto. Se aplicará de forma obligatoria si es requerido por cambios en las relaciones entre objetos.
    - Si los objetos relacionados están en estado desplegado/liberado, el despliegue conjunto es opcional. Los usuarios pueden seleccionar objetos relacionados para el despliegue conjunto.
  - cuando no está marcado, no se considerarán las dependencias. Los usuarios deben verificar que los objetos relacionados sean válidos y estén desplegados/liberados. El Controlador generará mensajes de error en caso de objetos faltantes debido a un despliegue inconsistente.

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Operaciones - Liberar Carpeta](/configuration-inventory-operations-release-folder)
- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
- [Plan Diario](/daily-plan)
- [Matriz de Dependencias](/dependencies-matrix)

### Base de Conocimiento del Producto

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
