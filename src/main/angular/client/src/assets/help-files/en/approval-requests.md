# Solicitudes de Aprobación

El [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) se ofrece para situaciones en las que los usuarios tienen la intención de realizar operaciones tales como agregar o cancelar Órdenes que requieren la aprobación de un segundo usuario. Esto puede incluir cualquier operación que modifique un objeto de planificación.

El Proceso de Aprobación involucra los siguientes roles:

- Un *Solicitante* solicita realizar una intervención que requiere aprobación.
- Un *Aprobador* confirma o rechaza la Solicitud de Aprobación.

La funcionalidad básica del Proceso de Aprobación incluye:

- implementar el principio de los 4 ojos: un *Aprobador* debe confirmar la intervención de un *Solicitante* antes de que la intervención pueda ejecutarse en el ámbito de la cuenta, roles y permisos del *Solicitante*.
- llevar un seguimiento de las Solicitudes de Aprobación pendientes.
- ofrecer alternativa a un grupo de *Aprobadores*.

## Lista de Solicitudes de Aprobación

Las Solicitudes de Aprobación son generadas por usuarios que solicitan confirmación para una intervención, véase [Solicitud de Aprobación](/approval-request).

La lista de Solicitudes de Aprobación se ofrece con las siguientes propiedades:

- **Fecha del Estado de la Solicitud** es el momento en que se agregó la [Solicitud de Aprobación](/approval-request).
- **Título** es especificado por el *Solicitante* al agregar la Solicitud de Aprobación.
- **Solicitante** indica la cuenta de usuario que generó la Solicitud de Aprobación.
- **Estado de la Solicitud** es uno de *solicitado*, *aprobado*, *retirado*, *ejecutado*.
- **Aprobador** es el *Nombre* y *Apellido* del *Aprobador* preferente.
- **Estado de Aprobación** es uno de *pendiente*, *aprobado*, *rechazado*.
- **Fecha del Estado de Aprobación** es el momento más reciente en que el *Aprobador* actuó sobre la Solicitud de Aprobación, por ejemplo al aprobarla o rechazarla.
- **URL de la Solicitud** es el endpoint de la [API de Servicios Web REST](/rest-api) que el *Solicitante* desea utilizar.
- **Categoría** indica el ámbito de la solicitud, por ejemplo si está dirigida a un Controlador, al Plan Diario, etc.
- **Motivo** indica la explicación proporcionada por el *Solicitante* sobre el propósito de la Solicitud de Aprobación.

## Referencias

### Ayuda Contextual

- [Configuración de Notificaciones de Aprobación](/approval-notification-settings)
- [Perfiles de Aprobadores](/approval-profiles)
- [Solicitud de Aprobación](/approval-request)
- [API de Servicios Web REST](/rest-api)

### Base de Conocimiento del Producto

- [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)
