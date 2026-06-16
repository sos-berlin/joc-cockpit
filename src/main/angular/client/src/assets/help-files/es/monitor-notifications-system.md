# Monitor - Notificaciones del Sistema

La vista muestra Notificaciones generadas por los productos JS7.

- Las Notificaciones del Sistema requieren configurar el *Servicio de Notificación de Logs* desde la sección [Configuración](/settings) de la página [Configuración - Notificación de Log](/settings-log-notification). Si se configura, el JOC Cockpit actúa como servicio syslog que recibe advertencias y errores de Controladores y Agentes registrados con JOC Cockpit.
- Además de mostrar las Notificaciones en esta vista, pueden ser reenviadas por correo electrónico y desde la línea de comandos, por ejemplo, a productos de Monitor de Sistema de terceros. Para más detalles, consulte [Configuración - Notificación](/configuration-notification).

Los usuarios deben tener en cuenta que las Notificaciones están sujetas a depuración por el [Servicio de Limpieza](/service-cleanup). Por defecto, las Notificaciones se depuran si tienen más de un día de antigüedad.

## Visualización de Notificaciones

Las Notificaciones se muestran con los siguientes elementos de información:

- **JOC Cockpit ID** especifica el identificador único de la instancia de JOC Cockpit.
  - **Prefijo** típicamente es *joc* para una instancia de JOC Cockpit que ofrece acceso a la GUI.
  - **Número de Serie** el número asignado a la instancia de JOC Cockpit durante la instalación.
- **Categoría** indica el producto JS7 que generó la Notificación, que es uno de *JOC*, *CONTROLLER*, *AGENT*.
- **Fuente** especifica:
  - **LogNotification** indica que el mensaje fue recibido desde la interfaz syslog.
  - **Deployment** indica una operación de despliegue en la instancia actual de JOC Cockpit.
- **Notificador** es uno de los siguientes:
  - **<*Controller-ID*>** indica el identificador único de un Controlador si se especifica la *Categoría* CONTROLLER.
  - **<*Agent-Name*>(<*Director-Agent*>)** indica el nombre del Agente si se especifica la *Categoría* AGENT.
  - **<*Java-class*>** indica el nombre de la clase Java que generó la notificación.
- **Tipo** es uno de los siguientes:
  - **WARNING** que indica una advertencia en el log del producto JS7.
  - **ERROR** que indica un error en el log del producto JS7.
- **Mensaje** contiene el mensaje de error o advertencia.
- **Excepción** indica la excepción que generó la Notificación.
- **Creado** indica la fecha en que se generó la Notificación.

Una advertencia o error puede generar varias Notificaciones dependiendo de la configuración relacionada, por ejemplo, mostrando la Notificación en esta vista y reenviándola por correo electrónico.

Por cada canal configurado para la Notificación se muestra una entrada separada. Las entradas para Notificaciones por correo electrónico o desde la línea de comandos ofrecen un icono de *flecha hacia abajo* que muestra detalles sobre el uso exitoso/no exitoso del canal relacionado.

## Operaciones sobre Notificaciones

Para cada Notificación de error se ofrece el menú de acción de 3 puntos con la siguiente operación:

- **Reconocer** especifica que el usuario conoce la Notificación y está tomando medidas. La operación abre una ventana emergente que permite especificar un comentario sobre el manejo de la Notificación. <br/><br/>Las Notificaciones reconocidas se excluyen de la visualización por defecto. Pueden hacerse visibles seleccionando el botón de filtro *Reconocidas*.

## Filtros

La parte superior de la página ofrece varios botones de filtro que pueden aplicarse individualmente o en combinación.

Los siguientes botones filtran la fuente de las Notificaciones:

- **Todas** muestra Notificaciones de todos los productos JS7.
- **Sistema** filtra las Notificaciones relacionadas con problemas del sistema operativo.
- **JOC** limita la visualización de Notificaciones a problemas identificados por JOC Cockpit.
- **Controlador** limita la visualización de Notificaciones a problemas generados con el Controlador.
- **Agente** limita la visualización de Notificaciones a problemas generados con los Agentes.

Los siguientes botones filtran el tipo de Notificaciones:

- **Error** especifica que se deben mostrar las Notificaciones de *Tipo* ERROR.
- **Advertencia** especifica que se deben mostrar las Notificaciones de *Tipo* WARNING.
- **Reconocidas** limita la visualización a Notificaciones que han sido reconocidas previamente desde la operación relacionada.

## Referencias

### Ayuda de Contexto

- [Servicio de Limpieza](/service-cleanup)
- [Configuración - Notificación](/configuration-notification)
- [Monitor - Notificaciones de Órdenes](/monitor-notifications-order)
- [Configuración](/settings)
- [Configuración - Notificación de Log](/settings-log-notification)
- [Workflows](/workflows)

### Base de Conocimiento del Producto

- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
