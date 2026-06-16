# Configuración - Servicio de Notificación de Logs

El [Servicio de Notificación de Logs](/service-log-notification) implementa un servidor syslog que recibe advertencias y errores de los productos JS7 como Controladores y Agentes. El servicio puede configurarse para enviar notificaciones, por ejemplo, por correo electrónico.

Las notificaciones se muestran desde la página [Monitor - Notificaciones del Sistema](/monitor-notifications-system).

La página de *Configuración* es accesible desde el ícono ![ícono de rueda](assets/images/wheel.png) en la barra de menú.

Las siguientes configuraciones se aplican al Servicio de Notificación de Logs. Los cambios tienen efecto inmediato.

## Configuración del Servicio de Notificación de Logs

### Configuración: *log\_server\_active*, Predeterminado: *false*

Especifica que el Servicio de Notificación de Logs se inicia con el JOC Cockpit.

### Configuración: *log\_server\_port*, Predeterminado: *4245*

Especifica el puerto UDP en el que escuchará el Servicio de Notificación de Logs.

### Configuración: *log\_server\_max\_messages\_per\_second*, Predeterminado: *1000*

Especifica el número máximo de mensajes por segundo que procesará el Servicio de Notificación de Logs.

## Referencias

### Ayuda Contextual

- [Servicio de Notificación de Logs](/service-log-notification)
- [Monitor - Notificaciones del Sistema](/monitor-notifications-system)
- [Configuración](/settings)

### Base de Conocimiento del Producto

- [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
