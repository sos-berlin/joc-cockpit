# Dashboard - Plan Diario

El panel *Plan Diario* proporciona información sobre la ejecución de Órdenes creadas por el Plan Diario. Esto excluye las Órdenes creadas a demanda por intervención del usuario y las Órdenes creadas por monitoreo de archivos mediante *Órdenes Disparadas por Archivo*.

<img src="dashboard-daily-plan.png" alt="Plan Diario" width="330" height="80" />

## Estado del Plan Diario

El estado del Plan Diario es el estado inicial cuando el Servicio de Plan Diario crea una Orden.

- Las Órdenes **Planificadas** no han sido enviadas al Controlador ni a los Agentes. Cualquier cantidad de Órdenes *Planificadas* indica un problema si el rango de fechas está dentro del alcance del número de días para los cuales deben enviarse Órdenes.
- Las Órdenes **Enviadas** están programadas para ejecución posterior durante el día o se encuentran en ejecución. El estado no refleja el estado actual de las Órdenes que ya han comenzado, sino que resume las Órdenes que deben ejecutarse durante el día.
- Las Órdenes **Finalizadas** están completadas. Esto es independiente del resultado, ya sea que las Órdenes se hayan completado con éxito o con error, lo cual se indica en la vista *Historial de Órdenes*.

Al hacer clic en la cantidad indicada de Órdenes, se navega a la vista *Plan Diario* que muestra las Órdenes en detalle.

## Filtros

El botón desplegable en la esquina superior derecha del panel permite seleccionar Órdenes de un rango de fechas:

- **Hoy**: las Órdenes corresponden al día actual, calculado a partir de la zona horaria del perfil del usuario.
- **Día Siguiente**: las Órdenes están destinadas para ejecución el día siguiente. Excluye las Órdenes de *Hoy*.
- **2do Día Siguiente**: las Órdenes están destinadas para ejecución en el segundo día siguiente.
- **3er Día Siguiente**: las Órdenes están destinadas para ejecución en el tercer día siguiente.
- **4to Día Siguiente**: las Órdenes están destinadas para ejecución en el cuarto día siguiente.
- **5to Día Siguiente**: las Órdenes están destinadas para ejecución en el quinto día siguiente.
- **6to Día Siguiente**: las Órdenes están destinadas para ejecución en el sexto día siguiente.
- **7mo Día Siguiente**: las Órdenes están destinadas para ejecución en el séptimo día siguiente.

## Referencias

- [Plan Diario](/daily-plan)
- [Dashboard - Órdenes](/dashboard-orders)
- [Historial de Órdenes](/history-orders)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
