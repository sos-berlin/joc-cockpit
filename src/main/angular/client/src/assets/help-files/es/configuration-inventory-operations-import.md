# Configuración - Inventario - Operaciones - Importar

La importación de objetos incluye agregarlos al inventario desde un archivo comprimido .zip o .tar.gz.

Esto aplica a objetos de las carpetas del sistema *Controlador* y *Automatización*, así como a objetos de carpetas de usuario. Los objetos pueden importarse desde la misma instancia de JOC Cockpit o desde una diferente.

Al usar versiones diferentes de JOC Cockpit para la exportación e importación, la importación a una versión más reciente será compatible; la importación a versiones más antiguas no lo será.

Al importar objetos utilizando la operación *Importar* disponible desde un botón con el mismo nombre en la esquina superior derecha de la ventana, se mostrará una ventana emergente:

- **Carpeta** especifica la carpeta del inventario a la cual se importarán los objetos.
  - Si la carpeta no existe, será creada. Se puede especificar más de una carpeta usando barras (/) como en */a/b/c*.
  - La jerarquía de carpetas disponible en el archivo comprimido se agregará a la **Carpeta** especificada.
- **Formato de Archivo** especifica .zip o .tar.gz como tipo de compresión.
- **Sobrescribir** especifica que los objetos existentes con el mismo nombre serán sobrescritos.
  - En el inventario de JOC Cockpit, los nombres de objetos son únicos por tipo de objeto, como Workflows, Planificaciones, etc.
- **Sobrescribir Etiquetas** especifica que las etiquetas de objetos existentes como Workflows serán sobrescritas por las etiquetas de los objetos importados con el mismo nombre.
- **Nombre del Objeto** ofrece opciones disponibles si la opción *Sobrescribir* no está seleccionada:
  - **Ignorar si existe**: El objeto no será importado. Un objeto existente del mismo tipo con el mismo nombre permanecerá en su lugar.
  - **Agregar Prefijo**: Se especifica un prefijo que se antepondrá a cualquier objeto importado, separado por un guion adicional.
  - **Agregar Sufijo**: Se especifica un sufijo que se añadirá a cualquier objeto importado, separado por un guion adicional.
- **Nombre de Archivo**: Los usuarios pueden arrastrar y soltar un archivo o usar la opción *seleccionar archivos para cargar* para elegir un archivo para importar.

## Referencias

### Ayuda Contextual

- [Matriz de Dependencias](/dependencies-matrix)

### Base de Conocimiento del Producto

- [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import)
- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
