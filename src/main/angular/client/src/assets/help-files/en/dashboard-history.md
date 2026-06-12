# Dashboard - Historial

El panel *Historial* proporciona información sobre la ejecución pasada de Órdenes y Jobs.

<img src="dashboard-history.png" alt="Historial" width="330" height="80" />

## Estado del Historial

El estado del historial es el estado final cuando una Orden o un Job se completa. El estado del historial no considera Órdenes ni Jobs que estén en progreso. No hay operaciones disponibles sobre las Órdenes o Jobs indicados: son historial.

- **Órdenes Exitosas**: completadas con un resultado exitoso. Incluye Órdenes que pueden haber fallado durante su ciclo de vida pero que se recuperaron mediante manejo automático de errores o por intervención del usuario.
- **Órdenes Fallidas**: encontraron un problema como un Job fallido o una *Instrucción de Fallo*.
- **Jobs Exitosos**: completados con un resultado exitoso. Incluye Jobs en Workflows cuyas Órdenes relacionadas aún no están completadas.
- **Jobs Fallidos**: encontraron un problema al ejecutar el Job.

Al hacer clic en la cantidad indicada de Órdenes o Jobs, se navega a la vista [Historial de Órdenes](/history-orders) o [Historial de Tareas](/history-tasks) que muestra las Órdenes y Jobs en detalle.

## Filtros

El botón desplegable en la esquina superior derecha del panel permite seleccionar Órdenes y Jobs pasados de un rango de fechas:

- **Hoy**: las Órdenes y Jobs corresponden al día actual, calculado a partir de la zona horaria del perfil del usuario.
- **Última hora**: incluye Órdenes y Jobs completados durante la última hora.
- **Últimas 12 horas**: incluye Órdenes y Jobs completados durante las últimas 12 horas.
- **Últimas 24 horas**: incluye Órdenes y Jobs completados durante las últimas 24 horas.
- **Últimos 7 días**: incluye Órdenes y Jobs completados durante los últimos 7 días.

## Referencias

- [Historial de Órdenes](/history-orders)
- [Historial de Tareas](/history-tasks)
- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Task History](https://kb.sos-berlin.com/display/JS7/JS7+-+Task+History)
