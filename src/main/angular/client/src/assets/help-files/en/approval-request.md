# Solicitud de Aprobación

El [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) se ofrece para situaciones en las que los usuarios tienen la intención de realizar operaciones tales como agregar o cancelar Órdenes que requieren la aprobación de un segundo usuario. Esto puede incluir cualquier operación que modifique un objeto de planificación.

El Proceso de Aprobación involucra los siguientes roles:

- Un *Solicitante* solicita realizar una intervención que requiere aprobación.
- Un *Aprobador* confirma o rechaza la Solicitud de Aprobación.

La funcionalidad básica del Proceso de Aprobación incluye:

- implementar el principio de los 4 ojos: un *Aprobador* debe confirmar la intervención de un *Solicitante* antes de que la intervención pueda ejecutarse en el ámbito de la cuenta, roles y permisos del *Solicitante*.
- llevar un seguimiento de las Solicitudes de Aprobación pendientes.
- ofrecer alternativa a un grupo de *Aprobadores*.

## Solicitud de Aprobación

Las Solicitudes de Aprobación se generan cuando un usuario intenta realizar una operación que está sujeta a aprobación. Los requisitos previos incluyen:

- El usuario tiene asignado el *Rol de Solicitante*. Para el nombre del rol véase [Configuración - JOC Cockpit](/settings-joc).
- La operación actual está indicada con los permisos del *Rol de Solicitante*.

Por ejemplo, si el *Rol de Solicitante* especifica permisos para Órdenes y el usuario intenta agregar una Orden a un Workflow, se mostrará una ventana emergente que solicitará especificar la siguiente información:

- **Título** es el identificador de la Solicitud de Aprobación. Los usuarios pueden especificar el *Título* libremente.
- **Aprobador** se selecciona de la lista de [Perfiles de Aprobadores](/approval-profiles). El *Aprobador* indicado será notificado de manera preferente. Sin embargo, cualquier *Aprobador* puede aprobar o rechazar la Solicitud de Aprobación.
- **Motivo** proporciona una explicación al *Aprobador* sobre la necesidad de la intervención.

Cuando la Solicitud de Aprobación es enviada, será visible en la vista de [Solicitudes de Aprobación](/approval-requests). El *Aprobador* indicado recibirá una notificación por correo electrónico.

## Referencias

### Ayuda Contextual

- [Configuración de Notificaciones de Aprobación](/approval-notification-settings)
- [Perfiles de Aprobadores](/approval-profiles)
- [Solicitudes de Aprobación](/approval-requests)

### Base de Conocimiento del Producto

- [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)
