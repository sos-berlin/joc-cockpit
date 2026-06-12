# Configuración - Inventario - Workflow - Notificaciones de Job

El panel *Workflow* ofrece el diseño de Workflows a partir de una secuencia de instrucciones. Los usuarios pueden arrastrar y soltar la *Instrucción de Job* desde la *Barra de Herramientas* a una posición en el Workflow.

La interfaz gráfica ofrece una serie de pestañas para especificar los detalles del Job. La quinta pestaña corresponde a las *Notificaciones*.

## Notificaciones

### Notificaciones Globales

Las Notificaciones Globales se configuran desde [Notificaciones](/notifications) y se aplican a todos los Workflows y Jobs especificados en su configuración.

Las Notificaciones permiten el uso de diferentes canales:

- Hacer que la Notificación esté disponible en la vista [Monitor - Notificaciones de Órdenes](/monitor-notifications-order) y en la vista [Monitor - Notificaciones del Sistema](/monitor-notifications-system).
- Enviar Notificaciones por correo electrónico.
- Ejecutar un comando de Shell. Por ejemplo, las herramientas de Monitor de Sistema de terceros frecuentemente ofrecen una Interfaz de Línea de Comandos que puede parametrizarse para alimentar al Monitor de Sistema con eventos sobre la ejecución exitosa o fallida de un Job.

### Notificaciones por Job

Las Notificaciones específicas por Job reemplazan las Notificaciones Globales a partir de las siguientes configuraciones:

- **Mail on** especifica uno o más eventos en los que se debe enviar un correo electrónico:
  - *ERROR* activa la Notificación en caso de fallo del Job.
  - *WARNING* activa la Notificación en caso de Jobs exitosos que indiquen un código de retorno de advertencia.
  - *SUCCESS* activa la Notificación en caso de Jobs exitosos, con o sin advertencias.
- **Mail To** especifica la lista de destinatarios del correo electrónico. Se puede especificar más de un destinatario usando coma o punto y coma. Si no se especifica ningún destinatario, no se enviará ninguna Notificación por correo electrónico, reemplazando la configuración de Notificación Global.
- **Mail Cc** especifica la lista de destinatarios de correo electrónico que recibirán copias. Se puede especificar más de un destinatario usando coma o punto y coma.
- **Mail Bcc** especifica la lista de destinatarios de correo electrónico que recibirán copias ocultas. Se puede especificar más de un destinatario usando coma o punto y coma.

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
  - [Configuración - Inventario - Workflows - Opciones de Job](/configuration-inventory-workflows-job-options)
  - [Configuración - Inventario - Workflows - Propiedades de Job](/configuration-inventory-workflows-job-properties)
  - [Configuración - Inventario - Workflows - Propiedades de Nodo de Job](/configuration-inventory-workflows-job-node-properties)
  - [Configuración - Inventario - Workflows - Etiquetas de Job](/configuration-inventory-workflows-job-tags)
- [Monitor - Notificaciones de Órdenes](/monitor-notifications-order)
- [Monitor - Notificaciones del Sistema](/monitor-notifications-system)
- [Notificaciones](/notifications)

### Base de Conocimiento del Producto

- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
