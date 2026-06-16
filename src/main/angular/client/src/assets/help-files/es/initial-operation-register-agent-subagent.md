# Operación Inicial - Registrar Subagente

La Operación Inicial se realiza tras la instalación del JS7 Controller, Agent y JOC Cockpit. El registro del Subagente ocurre después de completar la [Operación Inicial - Registrar Clúster de Agentes](/initial-operation-register-agent-cluster).

## Arquitectura

### Agentes

- Los **Agentes Autónomos** ejecutan Jobs en máquinas remotas on-premises y desde contenedores. Se operan individualmente y son gestionados por el Controlador.
- **Clúster de Agentes**
  - Los **Agentes Directores** orquestan los *Subagentes* en un Clúster de Agentes. Se operan desde dos instancias en clúster activo-pasivo y son gestionados por el Controlador.
  - Los **Subagentes** ejecutan Jobs en máquinas remotas on-premises y desde contenedores. Pueden considerarse nodos trabajadores en un Clúster de Agentes y son gestionados por los *Agentes Directores*.

### Conexiones

- Las conexiones del **Agente Autónomo** y del **Agente Director** son establecidas por el Controlador.
- Las conexiones de **Subagente** en un Clúster de Agentes son establecidas por los *Agentes Directores*.

## Registrar Subagente

Los usuarios deben verificar que las conexiones de red desde los servidores de los Agentes Directores al servidor del Subagente estén disponibles y que las reglas de firewall permitan conexiones al puerto del Subagente.

La página *Gestionar Controladores/Agentes* está disponible desde el icono de rueda dentada en la barra de menú principal y ofrece la operación *Agregar Subagente* desde el menú de acción del Clúster de Agentes. Esto abre la ventana emergente para el registro de un Subagente.

Los usuarios proporcionan los siguientes datos:

- **Subagent ID** es el identificador único de un Subagente que no puede modificarse durante la vida útil del Subagente. El *Subagent ID* no es visible en Jobs y Workflows.
  - Sugerencia: Use un nombre único como el FQDN del host y el puerto del Subagente.
- **Título** es una descripción que puede agregarse para un Subagente.
- **URL** espera la URL compuesta por protocolo, host y puerto que usan los Agentes Directores para conectarse al Subagente, por ejemplo http://localhost:4445.
  - La URL comienza con el protocolo *http* si el Subagente usa HTTP simple. Se usa el protocolo *https* si el Subagente está configurado para HTTPS.
  - El nombre de host puede ser *localhost* si el Subagente está instalado en la misma máquina que los Agentes Directores. De lo contrario, se debe especificar el FQDN del host del Subagente.
  - El *puerto* del Subagente se determina durante la instalación.
  - **Como Clúster de Subagentes propio** crea opcionalmente un Clúster de Subagentes para el Subagente; consulte [Operación Inicial - Registrar Clúster de Subagentes](/initial-operation-register-agent-subagent-cluster).

Tras el registro exitoso, el Subagente se mostrará en la vista [Recursos - Agentes](/resources-agents).

## Referencias

### Ayuda de Contexto

- [Operación Inicial - Registrar Clúster de Agentes](/initial-operation-register-agent-cluster)
- [Operación Inicial - Registrar Controlador](/initial-operation-register-controller)
- [Operación Inicial - Registrar Clúster de Subagentes](/initial-operation-register-agent-subagent-cluster)

### Base de Conocimiento del Producto

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
- [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)
