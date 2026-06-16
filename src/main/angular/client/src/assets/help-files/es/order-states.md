# Fuentes de Órdenes

Las Órdenes pueden agregarse desde las siguientes fuentes:

- Órdenes agregadas por el [Plan Diario](/daily-plan)
- Órdenes agregadas bajo demanda por los usuarios desde la vista [Workflows](/workflows)
- Órdenes agregadas desde Órdenes Disparadas por Archivo que monitorean directorios en busca de archivos entrantes

Los estados de las Órdenes actuales se muestran en la vista del *Panel de Control*:

<img src="dashboard-orders.png" alt="Órdenes" width="330" height="140" />

## Estados de Órdenes

Los siguientes *Estados de Órdenes* están disponibles:

- Las Órdenes **Pendientes** han sido agregadas a Workflows sin especificar una hora de inicio; pueden asignárseles una hora de inicio posteriormente.
- Las Órdenes **Planificadas** han sido agregadas a Workflows y están programadas para su ejecución en una fecha y hora posterior.
- Las Órdenes **En Progreso** están siendo procesadas por instrucciones de Workflow pero no están ejecutando un Job.
- Las Órdenes **Ejecutando** están en ejecución de un Job.
- Las Órdenes **Suspendidas** han sido detenidas por intervención del usuario y pueden reanudarse.
- Las Órdenes **Completadas** finalizaron un Workflow pero no han sido eliminadas; por ejemplo, si se usa una Orden Disparada por Archivo para monitoreo de archivos y el Workflow no mueve ni elimina los archivos entrantes. En esta situación, la Orden permanecerá en su lugar mientras el archivo exista en el directorio de entrada.
- Las Órdenes **A Confirmar** son puestas en espera por la *instrucción Prompt* en un Workflow y requieren la confirmación del usuario para continuar la ejecución del Workflow.
- Las Órdenes **Esperando** esperan un recurso como un *Recurso de Lock*, un *Aviso*, un intervalo de *Retry* o *Cycle*, o un proceso si el Agente en uso especifica un Límite de Procesos que se ha superado.
- Las Órdenes **Bloqueadas** no pueden iniciarse, por ejemplo, si el Agente no es accesible desde que se agregó la Orden.
- Las Órdenes **Fallidas** indican que un Job falló o que una *instrucción Fail* impide que la Orden continúe.

Hacer clic en el número indicado de Órdenes navega a la [Vista General de Órdenes](/orders-overview) que muestra las Órdenes en detalle.

## Referencias

- [Plan Diario](/daily-plan)
- [Vista General de Órdenes](/orders-overview)
- [Workflows](/workflows)
- [JS7 - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Orders)
- [JS7 - Order State Transitions](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+State+Transitions)
