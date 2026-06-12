# Servicio de Plan Diario

El [JS7 - Daily Plan Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan+Service) se utiliza para crear y enviar Órdenes del [Plan Diario](/daily-plan) a los Controladores. El servicio opera en segundo plano y actúa diariamente para planificar y enviar Órdenes con varios días de anticipación.

El Servicio de Plan Diario ejecuta las [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules) existentes y genera Órdenes para los tiempos de inicio indicados. Esto aplica tanto a las Planificaciones que especifican un único tiempo de inicio para una Orden como a las Planificaciones que especifican tiempos de inicio cíclicos. Se crea una Orden individual para cada tiempo de inicio dentro de un ciclo. En un paso posterior, estas Órdenes se envían a los Controladores correspondientes.

Una funcionalidad similar está disponible en la vista del Plan Diario para operación por parte de los usuarios. Sin embargo, el Servicio de Plan Diario realiza esta tarea de forma automática.

El Servicio de Plan Diario se inicia según su configuración y puede iniciarse en la vista del Panel de Control desde el recuadro de la instancia activa del JOC Cockpit que ofrece la operación *Ejecutar Servicio - Servicio de Plan Diario*. No hay inconveniente en iniciar el Servicio de Plan Diario varias veces al día.

<img src="dashboard-run-daily-plan-service.png" alt="Ejecutar Servicio de Plan Diario" width="750" height="280" />

## Configuración del Servicio de Plan Diario

Para la configuración del Servicio de Plan Diario, véase [Configuración - Plan Diario](/settings-daily-plan).

## Referencias

### Ayuda Contextual

- [Plan Diario](/daily-plan)
- [Configuración - Plan Diario](/settings-daily-plan)

### Base de Conocimiento del Producto

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - Daily Plan Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan+Service)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
