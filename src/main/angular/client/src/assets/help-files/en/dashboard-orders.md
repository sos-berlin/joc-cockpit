# Dashboard - Órdenes

El panel *Órdenes* proporciona información sobre las Órdenes de las siguientes fuentes:

- Órdenes agregadas por el [Plan Diario](/daily-plan)
- Órdenes agregadas a demanda por usuarios desde la vista [Workflows](/workflows)
- Órdenes agregadas desde [Órdenes Disparadas por Archivo](/configuration-inventory-file-order-sources) que monitorean directorios en busca de archivos entrantes

<img src="dashboard-orders.png" alt="Órdenes" width="330" height="140" />

## Estados de las Órdenes

El panel *Órdenes* proporciona información sobre el estado actual de las Órdenes. El panel se actualiza cuando cambia el estado de las Órdenes.

- Las Órdenes **Pendientes** han sido agregadas a Workflows sin especificar una hora de inicio; posteriormente pueden asignárseles una hora de inicio.
- Las Órdenes **Planificadas** han sido agregadas a Workflows y están programadas para ejecutarse en una fecha y hora posterior.
- Las Órdenes **En Progreso** están siendo procesadas por Instrucciones del Workflow pero no están ejecutando un Job.
- Las Órdenes **Ejecutando** están en ejecución de un Job.
- Las Órdenes **Suspendidas** han sido detenidas por intervención del usuario y pueden ser reanudadas.
- Las Órdenes **Completadas** han finalizado un Workflow pero no han sido eliminadas, por ejemplo, si se utiliza una Orden Disparada por Archivo para monitoreo de archivos y el Workflow no mueve ni elimina los archivos entrantes. En esta situación la Orden permanecerá en su lugar mientras el archivo exista en el directorio de entrada.
- Las Órdenes **A Confirmar** han sido puestas en espera por la *Instrucción Prompt* en un Workflow y requieren confirmación del usuario para continuar la ejecución del Workflow.
- Las Órdenes **Esperando** aguardan un recurso como un *Recurso de Lock*, un *Aviso*, un intervalo de  *Reintento* o *Ciclo*, o un proceso cuando el Agente en uso especifica un límite de procesos que ha sido superado.
- Las Órdenes **Bloqueadas** no pueden iniciarse, por ejemplo, si el Agente no es alcanzable desde que se agregó la Orden.
- Las Órdenes **Fallidas** indican que un Job falló o que una *Instrucción Fail* impide que la Orden continúe.

Al hacer clic en la cantidad indicada de Órdenes, se navega a la [Vista General de Órdenes](/orders-overview) que muestra las Órdenes en detalle.

## Filtros

El botón desplegable en la esquina superior derecha del panel permite seleccionar Órdenes de un rango de fechas:

- **Todas**: muestra todas las Órdenes disponibles en el Controlador y los Agentes.
- **Hoy**: las Órdenes corresponden al día actual, calculado a partir de la zona horaria del [Perfil - Preferencias](/profile-preferences) del usuario.
  - Órdenes **Pendientes** sin hora de inicio,
  - Órdenes **Planificadas** con hora de inicio para el día actual,
  - Órdenes **En Progreso** de cualquier fecha anterior,
  - Órdenes **Ejecutando** de cualquier fecha anterior,
  - Órdenes **Suspendidas** de cualquier fecha anterior,
  - Órdenes **Completadas** de cualquier fecha anterior,
  - Órdenes **A Confirmar** de cualquier fecha anterior,
  - Órdenes **Esperando** de cualquier fecha anterior,
  - Órdenes **Bloqueadas** de cualquier fecha anterior,
  - Órdenes **Fallidas** de cualquier fecha anterior.
- **Próxima Hora**: incluye Órdenes *Planificadas* para la próxima hora.
- **Próximas 12 Horas**: incluye Órdenes *Planificadas* para las próximas 12 horas.
- **Próximas 24 Horas**: incluye Órdenes *Planificadas* para las próximas 24 horas.
- **Día Siguiente**: incluye Órdenes *Planificadas* hasta el final del día siguiente.
- **Próximos 7 Días**: incluye Órdenes *Planificadas* hasta el final de los próximos 7 días.

## Referencias

### Ayuda Contextual

- [Plan Diario](/daily-plan)
- [Órdenes Disparadas por Archivo](/configuration-inventory-file-order-sources)
- [Vista General de Órdenes](/orders-overview)
- [Perfil - Preferencias](/profile-preferences)
- [Workflows](/workflows)

### Base de Conocimiento del Producto

- [JS7 - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Orders)
- [JS7 - Order State Transitions](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+State+Transitions)
