# Calendarios

La vista *Calendarios* muestra información sobre el uso de Calendarios.

- Los **Calendarios de Días Laborables** especifican los días para los cuales se deben crear Órdenes desde el *Plan Diario*.
- Los **Calendarios de Días No Laborables** especifican los días para los cuales no se deben crear Órdenes. La dependencia puede ignorarse.

Los Calendarios son referenciados por Planificaciones que son utilizadas por el Plan Diario para crear Órdenes.

## Panel de Navegación

El panel izquierdo muestra el árbol de carpetas del inventario que contienen Calendarios.

- Hacer clic en la carpeta muestra los Calendarios de esa carpeta.
- Hacer clic en el ícono chevron-down disponible al pasar el cursor sobre una carpeta muestra los Calendarios de la carpeta y de cualquier subcarpeta.

El ícono de Búsqueda Rápida ofrece la posibilidad de buscar Calendarios basándose en la entrada del usuario:

- Escribir **Test** mostrará Calendarios con nombres como *test-calendar-1* y *TEST-calendar-2*.
- Escribir **\*Test** mostrará Calendarios con nombres como *test-calendar-1* y *my-TEST-calendar-2*.

## Panel de Calendarios

### Visualización de Calendarios

Se muestra la siguiente información:

- **Nombre** es el nombre único del Calendario.
- **Tipo** es uno de *Calendario de día laborable* o *Calendario de día no laborable*.
- **Válido Desde**, **Válido Hasta** indica opcionalmente el período de validez. Los Calendarios sin período de validez son válidos por un período ilimitado.

### Operaciones sobre Calendarios

Las siguientes operaciones están disponibles:

- **Mostrar Vista Previa** mostrará las fechas devueltas por el Calendario.

## Búsqueda

La [Búsqueda de Calendarios](/resources-calendars-search) ofrece criterios para buscar Calendarios por dependencias, por ejemplo buscando Workflows que incluyan un nombre de Job específico; se devolverán los Calendarios utilizados por las Planificaciones para el Workflow.

## Referencias

- [Búsqueda de Calendarios](/resources-calendars-search)
- [Plan Diario](/daily-plan)
- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
