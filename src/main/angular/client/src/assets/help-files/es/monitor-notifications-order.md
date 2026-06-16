# Monitor - Notificaciones de Órdenes

La vista muestra Notificaciones generadas por los Workflows.

Las Notificaciones se configuran desde la página [Configuración - Notificación](/configuration-notification) y pueden generarse en caso de éxito, advertencias o errores en la ejecución de Órdenes o Jobs.

- El fragmento *notify_on_failure_gui* especifica si las Notificaciones serán visibles en esta vista.
- Además de mostrar las Notificaciones en esta vista, pueden ser reenviadas por correo electrónico y desde la línea de comandos, por ejemplo, a productos de Monitor de Sistema de terceros. Para más detalles, consulte [Configuración - Notificación](/configuration-notification).

Los usuarios deben tener en cuenta que las Notificaciones están sujetas a depuración por el [Servicio de Limpieza](/service-cleanup). Por defecto, las Notificaciones se depuran si tienen más de un día de antigüedad.

## Visualización de Notificaciones

Las Notificaciones se muestran con los siguientes elementos de información:

- **Workflow** especifica el nombre de un Workflow.
  - Hacer clic en el nombre del Workflow navega a la vista [Workflows](/workflows).
  - Hacer clic en el icono de lápiz a la izquierda del nombre del Workflow navega a la vista [Configuración - Inventario - Workflows](/configuration-inventory-workflows).
- **Order ID** especifica el identificador único de una Orden.
- **Job** se indica si la advertencia o el error fue causado por un Job.
- **Tipo** es uno de los siguientes:
  - **SUCCESS** que indica la ejecución exitosa de una Orden, siempre que las Notificaciones estén configuradas para reportar este estado.
  - **WARNING** que se genera desde Jobs de Shell para los cuales se configuran códigos de retorno específicos como *Advertencias* que no afectan el flujo de una Orden pero generarán la Notificación relacionada.
  - **ERROR** que puede ser generado por Jobs u otras instrucciones de Workflow. La Notificación se activa independientemente de si el Workflow aplica manejo de errores como desde la *instrucción Try/Catch* o *Retry* que permitirá que una Orden continúe en el Workflow.
  - **RECOVERED** que indica que una Orden previamente *fallida* se recuperó y continuó exitosamente en el Workflow.
- **Código de Retorno** indica el código de salida de Jobs de Shell o el código de retorno de Jobs JVM que generaron la Notificación.
- **Mensaje** contiene el mensaje de error o advertencia.
- **Creado** indica la fecha en que se generó la Notificación.

Una advertencia o error puede generar varias Notificaciones dependiendo de la configuración relacionada, por ejemplo, mostrando la Notificación en esta vista y reenviándola por correo electrónico.

Por cada canal configurado para la Notificación se muestra una entrada separada. Las entradas para Notificaciones por correo electrónico o desde la línea de comandos ofrecen un icono de *flecha hacia abajo* que muestra detalles sobre el uso exitoso/no exitoso del canal relacionado.

## Operaciones sobre Notificaciones

Para cada Notificación de advertencia y error se ofrece el menú de acción de 3 puntos con la siguiente operación:

- **Reconocer** especifica que el usuario conoce la Notificación y está tomando medidas. La operación abre una ventana emergente que permite especificar un comentario sobre el manejo de la Notificación. <br/><br/>Las Notificaciones reconocidas se excluyen de la visualización por defecto. Pueden hacerse visibles seleccionando el botón de filtro *Reconocidas*.

## Filtros

La parte superior de la página ofrece varios botones de filtro que pueden aplicarse individualmente o en combinación:

- **Exitoso** limita la visualización a Notificaciones sobre ejecución exitosa de Órdenes.
- **Fallido** limita la visualización de Notificaciones a Órdenes que *fallaron*.
- **Advertencia** limita la visualización de Notificaciones a Órdenes que causaron advertencias.
- **Recuperado** limita la visualización de Notificaciones a Órdenes que primero fallaron y luego se recuperaron continuando exitosamente en el Workflow.
- **Reconocidas** limita la visualización a Notificaciones que han sido reconocidas previamente desde la operación relacionada.

## Referencias

### Ayuda de Contexto

- [Servicio de Limpieza](/service-cleanup)
- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
- [Configuración - Notificación](/configuration-notification)
- [Monitor - Notificaciones del Sistema](/monitor-notifications-system)
- [Workflows](/workflows)

### Base de Conocimiento del Producto

- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
