# Registro de Auditoría

El *Registro de Auditoría* lleva un seguimiento de los cambios realizados a los objetos de planificación.

## Solicitud

En JOC Cockpit todas las operaciones de usuario se realizan a través de solicitudes a la API REST.

La solicitud identifica el endpoint utilizado y ofrece la visualización del cuerpo de la solicitud al hacer clic en el ícono de flecha hacia abajo.

## Categorías

- **CONTROLLER** indica operaciones del Controlador, como la adición de Órdenes a demanda.
- **DAILYPLAN** indica cambios en el Plan Diario.
- **IDENTITY** indica cambios en los Servicios de Identidad.
- **INVENTORY** indica cambios en el inventario, como el almacenamiento de Workflows.

# Registro de Auditoría Detallado

JOC Cockpit puede configurarse para escribir un *Registro de Auditoría Detallado* que lleva un seguimiento de todas las solicitudes a la API REST. El *Registro de Auditoría Detallado* incluye información sobre las sesiones de usuario y no está disponible desde la interfaz gráfica de JOC Cockpit.

El *Registro de Auditoría Detallado* puede ser activado por los administradores y está disponible en los archivos de log en disco.

## Referencias

- [JS7 - Audit Log](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Log)
- [JS7 - Audit Trail](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Trail)
