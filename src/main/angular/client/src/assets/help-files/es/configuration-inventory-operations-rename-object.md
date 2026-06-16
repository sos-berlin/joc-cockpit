# Configuración - Inventario - Operaciones - Renombrar Objeto

Los objetos del Inventario pueden renombrarse o reubicarse. Esto aplica a objetos, carpetas de usuario o ambos. Para renombrar carpetas de usuario ver [Configuración - Inventario - Operaciones - Renombrar Carpeta](/configuration-inventory-operations-rename-folder).

Al renombrar objetos, se aplican las [Reglas de Nomenclatura de Objetos](/object-naming-rules).

La operación *Renombrar* está disponible en el panel de *Navegación* y se ofrece para objetos y carpetas de usuario desde su menú de acción de tres puntos.

<img src="rename-object.png" alt="Rename Object" width="400" height="125" />

## Renombrar Objeto

Los usuarios pueden modificar la ubicación y el nombre de un objeto. A continuación se asume un objeto ubicado en la carpeta **/Test/Users** con el nombre **myWorkflow**:

- Si se cambia el nombre del objeto, este permanece en la carpeta dada y se establece en estado de borrador.
- Para el nuevo nombre, los usuarios pueden especificar una jerarquía de carpetas diferente y un nombre de objeto desde una ruta absoluta con barra inicial como **/Test/Workflows/yourWorkflow**:
  - si la carpeta **/Test/Workflows** no existe, será creada.
  - el Workflow se renombra de **myWorkflow** a **yourWorkflow**.
- Se puede especificar una ruta relativa como **Workflows/yourWorkflow**:
  - la carpeta **Workflows** será creada en la carpeta actual.
  - el objeto será renombrado y se ubicará en **/Test/Users/Workflows/yourWorkflow**.
- Si se cambia la carpeta del objeto pero no su nombre, el objeto permanece en estado desplegado/liberado.

## Dependencias

Los objetos del Inventario están relacionados por dependencias, ver [Matriz de Dependencias](/dependencies-matrix). Por ejemplo, un Workflow que referencia un Recurso de Job y un Recurso de Lock; una Planificación que referencia un Calendario y uno o más Workflows.

Al renombrar objetos, se considera la consistencia y los objetos que los referencian son actualizados y establecidos en estado de borrador, por ejemplo:

- Si se renombra un Recurso de Job que es referenciado por un Workflow, entonces
  - el Workflow será actualizado para reflejar el nombre cambiado,
  - el Workflow será establecido en estado de borrador,
  - una operación *Desplegar* posterior aplicará el despliegue conjunto de ambos objetos.
- Si se renombra un Workflow que es referenciado por una Planificación, entonces
  - la Planificación será actualizada para reflejar el nombre cambiado,
  - la Planificación será establecida en estado de borrador,
  - una operación *Desplegar* posterior sobre el Workflow incluirá una operación *Liberar* sobre la Planificación y viceversa.

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Operaciones - Renombrar Carpeta](/configuration-inventory-operations-rename-folder)
- [Matriz de Dependencias](/dependencies-matrix)
- [Reglas de Nomenclatura de Objetos](/object-naming-rules)

### Base de Conocimiento del Producto

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
