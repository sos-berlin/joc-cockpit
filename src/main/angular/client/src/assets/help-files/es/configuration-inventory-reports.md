# Configuración - Inventario - Reportes

El *Panel de Reportes* permite especificar Reportes sobre la ejecución de Workflows y Jobs:

- Las configuraciones de Reportes se gestionan desde el inventario disponible en la vista *Configuración* de JOC Cockpit. Incluyen la especificación de:
  - **Plantilla de Reporte** que indica el tipo de reporte, por ejemplo los 10 workflows con más fallos, los 100 jobs con más fallos, etc. Para la lista completa ver [Plantillas de Reporte](/report-templates).
  - **Período del Reporte** es un rango de fechas para el cual se reportan los elementos. Los rangos de fechas pueden ser absolutos o relativos, por ejemplo los últimos 2 meses, el último trimestre, el último año.
  - **Frecuencia del Reporte** divide el *Período del Reporte* en unidades de tiempo iguales, por ejemplo por semana o por mes.
- La ejecución de Reportes y la visualización de Reportes están disponibles en la vista *Reportes* de JOC Cockpit.

Los Reportes se gestionan desde los siguientes paneles:

- El [Panel de Navegación - Configuración - Inventario](/configuration-inventory-navigation) en el lado izquierdo de la ventana ofrece navegación por carpetas que contienen Reportes. Además, el panel ofrece operaciones sobre Reportes.
- El *Panel de Reportes* en el lado derecho de la ventana contiene los detalles de configuración del Reporte.

## Panel de Reportes

Para un Reporte están disponibles los siguientes campos de entrada:

- **Nombre** es el identificador único de un Reporte, ver [Reglas de Nomenclatura de Objetos](/object-naming-rules).
- **Título** explica el propósito del Reporte.
- **Plantilla de Reporte** especifica la [Plantilla de Reporte](/report-templates) en uso.
- **Período del Reporte** especifica el rango de fechas, que puede ser uno de:
  - **desde .. hasta**
    - *Mes Desde*, *Mes Hasta* especifica el número de meses pasados desde el cual comenzará y terminará el *Período del Reporte*, por ejemplo desde *1m* hasta *1m* para el último mes.
  - **calculado**
    - *Unidad* es uno de *Año*, *Mes*, *Trimestre*
    - *Desde* especifica el número de unidades pasadas desde el cual comenzará el *Período del Reporte*, por ejemplo *3 Meses* atrás.
    - *Cantidad* especifica el número de unidades pasadas hasta el cual terminará el *Período del Reporte*.
  - **predefinido** ofrece la selección de un conjunto de rangos de fechas predefinidos como *Último Mes*, *Este Trimestre*, *Último Trimestre*, *Este Año*, *Último Año*
- **Ordenar**
  - **Mayor**: El Reporte devolverá los n valores más altos.
  - **Menor**: El Reporte devolverá los n valores más bajos.
- **Frecuencia del Reporte** especifica la división del *Período del Reporte* en unidades de tiempo iguales:
  - *semanal*
  - *cada 2 semanas*
  - *mensual*
  - *cada 3 meses*
  - *cada 6 meses*
  - *anual*

## Operaciones sobre Reportes

Para operaciones generales ver [Panel de Navegación - Configuración - Inventario](/configuration-inventory-navigation).

Las operaciones sobre Reportes están disponibles desde las siguientes vistas:

- Los Reportes se crean desde la vista [Reporte - Creación](/report-creation).
- Las ejecuciones de Reportes están disponibles desde la vista [Reporte - Historial de Ejecución](/report-run-history).
- Los Reportes se visualizan desde la vista [Reportes](/reports).

## Referencias

### Ayuda Contextual

- [Panel de Navegación - Configuración - Inventario](/configuration-inventory-navigation)
- [Reglas de Nomenclatura de Objetos](/object-naming-rules)
- [Reportes](/reports)
- [Reporte - Creación](/report-creation)
- [Reporte - Historial de Ejecución](/report-run-history)
- [Plantillas de Reporte](/report-templates)

### Base de Conocimiento del Producto

- [JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports)
- [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration)
- [JS7 - Reports - Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Templates)
