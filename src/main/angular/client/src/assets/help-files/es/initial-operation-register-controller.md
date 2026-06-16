# Operación Inicial - Registrar Controlador

La Operación Inicial se realiza tras la instalación del JS7 Controller, Agent y JOC Cockpit.

El uso de un Clúster de Controladores está sujeto a los acuerdos de la [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License).

- Uso del Controlador Autónomo:
  - disponible para titulares de licencia Open Source y para titulares de licencia comercial.
- Uso del Clúster de Controladores:
  - disponible para titulares de licencia comercial,
  - para más detalles, consulte [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)

Para un Controlador Autónomo, la Operación Inicial incluye

- registrar un Controlador Autónomo,
- registrar Agentes; consulte [Operación Inicial - Registrar Agente Autónomo](/initial-operation-register-agent-standalone) y [Operación Inicial - Registrar Clúster de Agentes](/initial-operation-register-agent-cluster).

Para un Clúster de Controladores, la Operación Inicial incluye

- registrar un Clúster de Controladores,
- registrar Agentes Autónomos o Clústeres de Agentes.

## Registrar Controlador

Tras el primer inicio de sesión, se muestra una ventana emergente que ofrece registrar un Controlador. La ventana emergente también está disponible desde el icono de rueda dentada en la barra de menú principal seleccionando la página *Gestionar Controladores/Agentes*.

La ventana emergente ofrece el registro de un Controlador Autónomo. El registro de un Clúster de Controladores se ofrece si hay una clave de licencia JS7 vigente para JOC Cockpit. Haciendo clic en el logo de JS7 en la esquina superior izquierda de la GUI del JOC Cockpit se mostrará el tipo de licencia en uso.

Los usuarios deben verificar que las conexiones de red desde el servidor del JOC Cockpit al servidor del Controlador estén disponibles y que las reglas de firewall permitan las conexiones.

Tras el registro exitoso, las instancias del Controlador se mostrarán en la vista del *Panel de Control*.

### Registrar Controlador Autónomo

Los usuarios proporcionan los siguientes datos:

- **Título** es el título del Controlador que se mostrará en el recuadro del Controlador en el panel [Panel de Control - Estado del Producto](/dashboard-product-status).
- **Conexión de JOC Cockpit al Controlador** espera la URL compuesta por protocolo, host y puerto que usa JOC Cockpit para conectarse al Controlador, por ejemplo http://localhost:4444.
  - La URL comienza con el protocolo *http* si el Controlador usa HTTP simple. Se usa el protocolo *https* si el Controlador está configurado para HTTPS.
  - El nombre de host puede ser *localhost* si el Controlador está instalado en la misma máquina que JOC Cockpit. De lo contrario, se debe especificar el FQDN del host del Controlador.
  - El *puerto* del Controlador se determina durante la instalación.

Cuando se envía la información de registro, JOC Cockpit establecerá una conexión con el Controlador Autónomo.

### Registrar Clúster de Controladores

Los prerequisitos antes de la instalación incluyen:

- JOC Cockpit y todas las instancias del Controlador deben estar equipados con una clave de licencia JS7 válida.
- El Controlador Secundario debe tener en su archivo ./config/controller.conf la configuración: *js7.journal.cluster.node.is-backup = yes*
- Ambas instancias del Controlador Primario y Secundario deben estar activas y en funcionamiento.

Los usuarios proporcionan los siguientes datos:

- **Controlador Primario** es la instancia del Controlador que inicialmente tendrá asignado el rol activo. El rol activo puede cambiarse posteriormente.
  - **Título** es el título del Controlador que se mostrará en el recuadro del Controlador en el panel [Panel de Control - Estado del Producto](/dashboard-product-status).
  - **Conexión de JOC Cockpit al Controlador Primario** espera la URL compuesta por protocolo, host y puerto que usa JOC Cockpit para conectarse al Controlador Primario, por ejemplo http://primary-server:4444.
  - **Conexión del Controlador Secundario al Controlador Primario** en la mayoría de las situaciones es la misma que la *Conexión de JOC Cockpit al Controlador Primario*. Se aplica una URL diferente si se opera un Servidor Proxy entre el Controlador Primario y el Secundario. Esta URL es usada por el Controlador Secundario para conectarse al Controlador Primario.
- **Controlador Secundario** es la instancia del Controlador que inicialmente tendrá asignado el rol En espera.
  - **Título** es el título del Controlador que se mostrará en el recuadro del Controlador en el panel [Panel de Control - Estado del Producto](/dashboard-product-status).
  - **Conexión de JOC Cockpit al Controlador Secundario** espera la URL compuesta por protocolo, host y puerto que usa JOC Cockpit para conectarse al Controlador Secundario, por ejemplo http://secondary-server:4444.
  - **Conexión del Controlador Primario al Controlador Secundario** en la mayoría de las situaciones es la misma que la *Conexión de JOC Cockpit al Controlador Secundario*. Se aplica una URL diferente si se opera un Servidor Proxy entre el Controlador Primario y el Secundario. Esta URL es usada por el Controlador Primario para conectarse al Controlador Secundario.

Cuando se envía la información de registro, JOC Cockpit establecerá una conexión con ambas instancias, la del Controlador Primario y la del Controlador Secundario.

## Referencias

### Ayuda de Contexto

- [Panel de Control - Estado del Producto](/dashboard-product-status)
- [Operación Inicial - Registrar Clúster de Agentes](/initial-operation-register-agent-cluster)
- [Operación Inicial - Registrar Agente Autónomo](/initial-operation-register-agent-standalone)

### Base de Conocimiento del Producto

- [JS7 - How to troubleshoot Controller Cluster Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Controller+Cluster+Initial+Operation)
- [JS7 - Initial Operation for Controller Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Controller+Cluster)
- [JS7 - Initial Operation for Standalone Controller](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Standalone+Controller)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)
