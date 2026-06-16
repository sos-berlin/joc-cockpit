# Configuración - Inventario - Operaciones - Exportar Carpeta

La exportación de objetos incluye agregarlos a un archivo comprimido .zip o .tar.gz que se ofrece para descargar. Esto aplica a objetos de las carpetas del sistema *Controlador* y *Automatización*, así como a objetos en carpetas de usuario. Los archivos comprimidos pueden usarse para su posterior importación en la misma instancia de JOC Cockpit o en una diferente.

Al exportar objetos desde carpetas utilizando la operación *Exportar* disponible en el menú de acción de tres puntos de la carpeta, se mostrará una ventana emergente que ofrece:

- **Nombre de Archivo** especifica el nombre del archivo comprimido.
- **Formato de Archivo** especifica .zip o .tar.gz como tipo de compresión.
- **Tipo de Exportación** es uno de:
  - exportación de *Objetos Individuales*
  - exportación de *Carpetas*
  - exportación de *Cambios*
- **Tipo de Filtro**
  - **Controlador** considera objetos como Workflows y Recursos de Job almacenados en carpetas del sistema *Controlador*.
  - **Automatización** considera objetos como Planificaciones y Calendarios almacenados en carpetas del sistema *Automatización*.
- **Filtro**
  - **solo válidos** limita la exportación a objetos válidos.
  - **Borrador** incluye objetos en estado de borrador.
  - **Desplegado** incluye objetos como Workflows y Recursos de Job en estado desplegado.
  - **Liberado** incluye objetos como Planificaciones y Calendarios en estado liberado.
  - **Usar Ruta Relativa** especifica si el archivo de exportación incluirá la jerarquía de carpetas desde una ruta absoluta o desde una ruta relativa indicada por la última carpeta en la jerarquía para la cual se realiza la exportación.
- **Incluir Subcarpetas** permite agregar objetos de subcarpetas de forma recursiva al archivo de exportación.

## Tipos de Exportación

El **Tipo de Exportación** permite seleccionar objetos individuales, objetos de carpetas y objetos de cambios.

### Exportación de Objetos Individuales

El *Tipo de Exportación* permite seleccionar objetos individuales de la lista de objetos mostrada.

<img src="export-object.png" alt="Export Object" width="600" height="580" />

### Exportación de Objetos desde Carpetas

El *Tipo de Exportación* permite limitar la exportación a ciertos tipos de objetos de planificación, como Workflows o Planificaciones. Los usuarios pueden seleccionar los tipos de objetos deseados que se agregarán al archivo de exportación.

<img src="export-folder.png" alt="Export Folder" width="600" height="580" />

### Exportación de Objetos desde Cambios

El *Tipo de Exportación* permite seleccionar un Cambio de la lista de [Cambios](/changes). La exportación se limitará a los objetos relacionados con el Cambio.

<img src="export-change.png" alt="Export Change" width="600" height="320" />

## Inclusión de Dependencias

Los objetos del Inventario están relacionados por dependencias, ver [Matriz de Dependencias](/dependencies-matrix). Por ejemplo, un Workflow que referencia un Recurso de Job y un Recurso de Lock; una Planificación que referencia un Calendario y uno o más Workflows.

Al exportar objetos se considera la consistencia, por ejemplo:

- Si un Workflow referencia un Recurso de Job, entonces tanto el Workflow como el Recurso de Job pueden exportarse, incluso si están almacenados en carpetas no relacionadas con la carpeta seleccionada.
- Si una Planificación referencia un Calendario y debe exportarse, entonces tanto la Planificación como el Calendario pueden exportarse.

Los usuarios controlan la exportación consistente desde las siguientes opciones:

- **Incluir Dependencias**
  - cuando está marcado, incluirá tanto objetos que referencian como objetos referenciados ubicados en cualquier carpeta.
  - cuando no está marcado, no se considerarán las dependencias. Los usuarios deben verificar que los objetos relacionados sean válidos y estén desplegados/liberados. El Controlador generará mensajes de error en caso de objetos faltantes debido a un despliegue inconsistente.

## Referencias

### Ayuda Contextual

- [Cambios](/changes)
- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
- [Matriz de Dependencias](/dependencies-matrix)

### Base de Conocimiento del Producto

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
