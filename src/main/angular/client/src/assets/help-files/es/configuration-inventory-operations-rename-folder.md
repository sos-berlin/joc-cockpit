# Configuración - Inventario - Operaciones - Renombrar Carpeta

Los objetos del Inventario pueden renombrarse o reubicarse. Esto aplica a objetos, carpetas o ambos. Para renombrar objetos ver [Configuración - Inventario - Operaciones - Renombrar Objeto](/configuration-inventory-operations-rename-object).

Al renombrar carpetas, se aplican las [Reglas de Nomenclatura de Objetos](/object-naming-rules).

La operación *Renombrar* está disponible en el panel de *Navegación* y se ofrece para objetos y carpetas desde su menú de acción de tres puntos.

Al renombrar una carpeta de usuario, se ofrecen opciones para modificar el nombre de la carpeta y para modificar los nombres de los objetos incluidos de forma recursiva.

## Renombrar Carpeta

<img src="rename-folder.png" alt="Rename Folder" width="400" height="150" />

Los usuarios pueden modificar la ubicación y el nombre de una carpeta. A continuación se asume la carpeta **myWorkflows** ubicada en la jerarquía de carpetas **/Test/Users**:

- Si se cambia el nombre de la carpeta, esta permanece en la jerarquía de carpetas dada.
- Para el nuevo nombre, los usuarios pueden especificar una jerarquía de carpetas diferente desde una ruta absoluta con barra inicial como **/Test/yourWorkflows**:
  - si la carpeta **/Test/yourWorkflows** no existe, será creada.
  - la carpeta se renombra de **myWorkflows** a **yourWorkflows**.
- Se puede especificar una ruta relativa como **Workflows/yourWorkflows**:
  - la carpeta **yourWorkflows** será creada en la carpeta actual.
  - la carpeta será renombrada y se ubicará en **/Test/Users/Workflows/yourWorkflows**.

Los cambios en el nombre o la ubicación de las carpetas dejan los objetos incluidos en estado desplegado/liberado.

## Renombrar Objetos de Forma Recursiva

<img src="rename-folder-object.png" alt="Rename Folder Objects Recursively" width="400" height="180" />

Los usuarios pueden modificar los nombres de los objetos incluidos en una carpeta y en subcarpetas de forma recursiva.

- **Buscar** espera una cadena de texto que se buscará en los nombres de los objetos.
- **Reemplazar** espera una cadena de texto que reemplazará la cadena buscada.

Los cambios en los nombres de los objetos establecen los objetos incluidos en estado de borrador.

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

- [Configuración - Inventario - Operaciones - Renombrar Objeto](/configuration-inventory-operations-rename-object)
- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
- [Plan Diario](/daily-plan)
- [Matriz de Dependencias](/dependencies-matrix)
- [Reglas de Nomenclatura de Objetos](/object-naming-rules)

### Base de Conocimiento del Producto

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
