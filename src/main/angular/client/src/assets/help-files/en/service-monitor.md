# Servicio de Monitor

El Servicio de Monitor se utiliza para reportar el estado de salud de los productos JS7 y para reportar problemas en la ejecución de Workflows. El Servicio de Monitor puebla las sub-vistas de *Monitor* en el JOC Cockpit:

- verificando la disponibilidad de los productos JS7 y reportando en las sub-vistas [Monitor - Disponibilidad del Controlador](/monitor-availability-controller) y [Monitor - Disponibilidad del Agente](/monitor-availability-agent).
- verificando los Controladores y Agentes conectados en busca de advertencias y errores generados durante la operación de los productos. Los resultados se agregan a la sub-vista [Monitor - Notificaciones del Sistema](/monitor-notifications-system).
- verificando los resultados de la ejecución de Workflows y Jobs desde cualquier Controlador conectado y agregando notificaciones a la vista [Monitor - Notificaciones de Órdenes](/monitor-notifications-order).

Como resultado, los errores y advertencias que ocurren durante la ejecución del Workflow se harán visibles en las sub-vistas de *Monitor* de la interfaz gráfica y pueden ser reenviados por [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications). Debido a la naturaleza asíncrona de los productos JS7, esta tarea es realizada por un servicio en segundo plano.

El Servicio de Monitor se inicia automáticamente al arrancar el JOC Cockpit. Puede reiniciarse en la vista del Panel de Control desde el recuadro de la instancia activa del JOC Cockpit que ofrece la operación *Reiniciar Servicio - Servicio de Monitor*.

<img src="dashboard-restart-monitor-service.png" alt="Reiniciar Servicio de Monitor" width="750" height="280" />

## Referencias

### Ayuda Contextual

- [Monitor - Disponibilidad del Agente](/monitor-availability-agent)
- [Monitor - Disponibilidad del Controlador](/monitor-availability-controller)
- [Monitor - Notificaciones de Órdenes](/monitor-notifications-order)
- [Monitor - Notificaciones del Sistema](/monitor-notifications-system)

### Base de Conocimiento del Producto

- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Monitor Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor+Service)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
