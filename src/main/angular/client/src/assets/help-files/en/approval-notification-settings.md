# Configuración de Notificaciones de Aprobación

El [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) se ofrece para situaciones en las que los usuarios tienen la intención de realizar operaciones tales como agregar o cancelar Órdenes que requieren la aprobación de un segundo usuario. Esto puede incluir cualquier operación que modifique un objeto de planificación.

El Proceso de Aprobación involucra los siguientes roles:

- Un *Solicitante* solicita realizar una intervención que requiere aprobación.
- Un *Aprobador* confirma o rechaza la Solicitud de Aprobación.

La funcionalidad básica del Proceso de Aprobación incluye:

- implementar el principio de los 4 ojos: un *Aprobador* debe confirmar la intervención de un *Solicitante* antes de que la intervención pueda ejecutarse en el ámbito de la cuenta, roles y permisos del *Solicitante*.
- llevar un seguimiento de las Solicitudes de Aprobación pendientes.
- ofrecer alternativa a un grupo de *Aprobadores*.

## Configuración de Notificaciones de Aprobación

La Configuración de Notificaciones incluye propiedades para el envío de correos electrónicos a los *Aprobadores* en caso de recibir [Solicitudes de Aprobación](/approval-requests):

- **Recurso de Job** contiene la configuración para la conexión al servidor de correo. Para más detalles véase [JS7 - eMailDefault Job Resource](https://kb.sos-berlin.com/display/JS7/JS7+-+eMailDefault+Job+Resource).
- **Tipo de Contenido**, **Conjunto de Caracteres**, **Codificación** son comunes a cualquier sistema de envío de correo.
- **Correo de Solicitud de Aprobación**
  - **Cc**, **Bcc** indican opcionalmente los destinatarios de copias y copias carbón de la notificación.
  - El **Asunto** y el **Cuerpo** del correo pueden incluir marcadores de posición que serán sustituidos al momento del envío. Los marcadores de posición se especifican con el formato $\{placeholder\}.
    - Los siguientes marcadores de posición están disponibles:
      - $\{RequestStatusDate\}: Fecha del Estado de la Solicitud
      - $\{ApprovalStatusDate\}: Fecha del Estado de Aprobación
      - $\{Title\}: Título de la Solicitud
      - $\{Requestor\}: Cuenta del Solicitante
      - $\{RequestStatus\}: Estado de la Solicitud, uno de REQUESTED (solicitado), EXECUTED (ejecutado), WITHDRAWN (retirado)
      - $\{Approver\}: Cuenta del Aprobador
      - $\{ApprovalStatus\}: Estado de Aprobación, uno de APPROVED (aprobado), REJECTED (rechazado)
      - $\{RequestURI\}: URI de la Solicitud
      - $\{RequestBody\}: Cuerpo de la solicitud con los detalles de la petición a la API REST
      - $\{Category\}: Categoría
      - $\{Reason\}: Motivo
    - Adicionalmente, los siguientes marcadores de posición pueden usarse si se especifican desde un Recurso de Job como *eMailDefault*.
      - $\{jocURL\}: URL desde la cual JOC Cockpit es accesible.
      - $\{jocURLReverseProxy\}: misma funcionalidad que *jocURL*, pero especifica la URL disponible desde un Proxy Inverso.

## Referencias

### Ayuda Contextual

- [Configuración de Notificaciones de Aprobación](/approval-notification-settings)
- [Solicitud de Aprobación](/approval-request)
- [Solicitudes de Aprobación](/approval-requests)
- [Perfiles de Aprobadores](/approval-profiles)

### Base de Conocimiento del Producto

- [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)
- [JS7 - eMailDefault Job Resource](https://kb.sos-berlin.com/display/JS7/JS7+-+eMailDefault+Job+Resource)
