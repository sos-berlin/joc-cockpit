# Servicio de Notificación de Logs

La [JS7 - Log Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Management) se ofrece con el JOC Cockpit para el monitoreo de la salida de logs y el envío de notificaciones creadas por instancias de Controlador, Agente y JOC Cockpit.

El [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service) está disponible desde la instancia activa del JOC Cockpit:

## Servicio

El servicio se utiliza para recopilar advertencias y errores de la salida de logs de instancias de Controlador y Agente, y para crear [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications).

- Las notificaciones del JOC Cockpit se crean directamente y sin uso del servicio.
- El servicio es compatible con RFC5424, también conocido como protocolo syslog.
- El servicio ofrece capacidades de reinicio: en caso de Conmutación por error o Conmutación del JOC Cockpit, el Servicio de Notificación de Logs estará disponible desde la instancia activa del JOC Cockpit.

## Clientes

Las instancias de Controlador y Agente de JS7 actúan como clientes del Servicio de Notificación de Logs. Los productos pueden configurarse para reportar advertencias y errores de la salida de logs al Servicio de Notificación de Logs; para más detalles, véase [JS7 - Log Configuration for use with System Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Configuration+for+use+with+System+Notifications).

Los usuarios tienen la opción de habilitar el reenvío de la salida de logs por instancia de Controlador y Agente durante la instalación o posteriormente ajustando la configuración de Log4j2.

## Interfaz de Usuario

El JOC Cockpit ofrece Notificaciones del Sistema desde la vista [Monitor - Notificaciones del Sistema](/monitor-notifications-system).

El JOC Cockpit ofrece [Configuración de Notificaciones](/configuration-notification) para el reenvío de notificaciones por correo electrónico, desde herramientas de línea de comandos, etc.

## Configuración del Servicio de Notificación de Logs

Para la configuración del Servicio de Notificación de Logs, véase [Configuración - Notificación de Logs](/settings-log-notification).

## Referencias

### Ayuda Contextual

- [Monitor - Notificaciones del Sistema](/monitor-notifications-system)
- [Configuración de Notificaciones](/configuration-notification)
- [Configuración - Notificación de Logs](/settings-log-notification)

### Base de Conocimiento del Producto

- [JS7 - Log Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Management)
  - [JS7 - Log Configuration for use with System Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Configuration+for+use+with+System+Notifications)
  - [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
