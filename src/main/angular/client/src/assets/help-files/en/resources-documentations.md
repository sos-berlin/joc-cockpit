# Documentaciones

La vista *Documentaciones* muestra información sobre el uso de Documentaciones y permite su gestión.

Las Documentaciones son referenciadas por Workflows y Jobs, y se muestran en la vista [Workflows](/workflows).

## Panel de Navegación

El panel izquierdo muestra el árbol de carpetas del inventario que contienen Documentaciones.

- Hacer clic en la carpeta muestra las Documentaciones de esa carpeta.
- Hacer clic en el ícono chevron-down disponible al pasar el cursor sobre una carpeta muestra las Documentaciones de la carpeta y de cualquier subcarpeta.

El ícono de Búsqueda Rápida ofrece la posibilidad de buscar Documentaciones basándose en la entrada del usuario:

- Escribir **Test** mostrará Documentaciones con nombres como *test-documentation-1* y *TEST-documentation-2*.
- Escribir **\*Test** mostrará Documentaciones con nombres como *test-documentation-1* y *my-TEST-documentation-2*.

## Panel de Documentaciones

### Visualización de Documentaciones

Se muestra la siguiente información:

- **Nombre** es el nombre único de la Documentación.
- **Referencia** indica el nombre del archivo de documentación que fue cargado.
- **Tipo** es uno de los tipos soportados *Text*, *Markdown*, *HTML*, *XML*, *PDF*, etc.
- **Modificado** fecha de última modificación.

### Operaciones sobre Documentaciones

Las siguientes operaciones están disponibles desde el menú de acción de una Documentación:

- **Editar Documentación** ofrece la modificación del archivo referenciado.
- **Vista Previa de Documentación** abrirá la aplicación asignada al tipo mime relacionado para mostrar la Documentación.
- **Exportar** exportará la Documentación a un archivo .zip.
- **Eliminar** eliminará la Documentación.
- **Mostrar Uso** mostrará los Workflows que tienen referencias a la Documentación.

En la parte superior de la ventana se ofrece el botón *Agregar Documentación*:

- **Cargar Documentación** permite seleccionar un archivo que será cargado.
- **Ruta** especifica la carpeta y el nombre de la Documentación en el inventario.

## Referencias

- [Workflows](/workflows)
- [JS7 - User Documentation](https://kb.sos-berlin.com/display/JS7/JS7+-+User+Documentation)
