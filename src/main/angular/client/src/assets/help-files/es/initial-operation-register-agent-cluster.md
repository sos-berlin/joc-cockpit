# Operación Inicial - Registrar Clúster de Agentes

La Operación Inicial se realiza tras la instalación del JS7 Controller, Agent y JOC Cockpit. El registro de un Clúster de Agentes ocurre después de completar la [Operación Inicial - Registrar Controlador](/initial-operation-register-controller).

El uso de un Clúster de Agentes está sujeto a los acuerdos de la [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License).

- Uso del Agente Autónomo:
  - disponible para titulares de licencia Open Source y para titulares de licencia comercial.
- Uso del Clúster de Agentes:
  - disponible para titulares de licencia comercial,
  - para más detalles, consulte [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)

## Arquitectura

### Agentes

- Los **Agentes Autónomos** ejecutan Jobs en máquinas remotas on-premises y desde contenedores. Se operan individualmente y son gestionados por el Controlador.
- **Clúster de Agentes**
  - Los **Agentes Directores** orquestan los *Subagentes* en un Clúster de Agentes. Se operan desde dos instancias en clúster activo-pasivo y son gestionados por el Controlador.
  - Los **Subagentes** ejecutan Jobs en máquinas remotas on-premises y desde contenedores. Pueden considerarse nodos trabajadores en un Clúster de Agentes y son gestionados por los *Agentes Directores*.

### Conexiones

- Las conexiones del **Agente Autónomo** y del **Agente Director** son establecidas por el Controlador.
- Las conexiones de **Subagente** en un Clúster de Agentes son establecidas por los *Agentes Directores*.

## Registrar Clúster de Agentes

El registro de un Clúster de Agentes incluye registrar el Agente Director Primario y el Secundario. Para el registro posterior de Subagentes, consulte [Operación Inicial - Registrar Subagente](/initial-operation-register-agent-subagent).

Los prerequisitos antes de la instalación incluyen:

- JOC Cockpit, el Controlador y todas las instancias de Agente Director deben estar equipados con una clave de licencia JS7 válida.
- El Agente Director Secundario debe tener en su archivo ./config/agent.conf la configuración: *js7.journal.cluster.node.is-backup = yes*
- Ambas instancias del Agente Director Primario y Secundario deben estar activas y en funcionamiento.

Los usuarios deben verificar que las conexiones de red desde el servidor del Controlador a los servidores de ambos Agentes Directores estén disponibles y que las reglas de firewall permitan conexiones a los puertos de los Agentes Directores.

La página *Gestionar Controladores/Agentes* está disponible desde el icono de rueda dentada en la barra de menú principal y ofrece la operación *Agregar Clúster de Agentes* desde el menú de acción del Controlador. Esto abre la ventana emergente para el registro de un Clúster de Agentes.

Los usuarios proporcionan los siguientes datos:

- **Agent ID** es el identificador único del Clúster de Agentes que no puede modificarse durante la vida útil del Clúster. El *Agent ID* no es visible en Jobs y Workflows.
  - Sugerencia: Use un nombre único como *agent-cluster-001*.
- **Nombre del Clúster de Agentes** es el nombre único de un Clúster de Agentes. Al asignar un Agente a un Job, se utiliza el *Nombre del Clúster de Agentes*.
  - Sugerencia: Si usa entornos separados para producción y no producción, debería usar el mismo *Nombre del Clúster de Agentes* para ambos. Por eso, ingrese un nombre descriptivo, por ejemplo, para un departamento de negocio como *ventas*, *finanzas*, etc.
  - Sugerencia: Cambiar el *Nombre del Clúster de Agentes* posteriormente permite continuar usando el *Nombre del Clúster de Agentes* anterior como *Nombre Alternativo*.
- **Título** es una descripción que puede agregarse para un Clúster de Agentes.
- **Nombres Alternativos** son nombres alternativos para el mismo Clúster de Agentes. Al asignar un Agente a un Job, también se ofrecerán los *Nombres Alternativos del Clúster*. Los *Nombres Alternativos del Clúster* pueden usarse, por ejemplo, si un entorno de pruebas incluye menos Clústeres de Agentes que el entorno de producción: para mantener las asignaciones de Agentes sin cambios entre entornos, los Clústeres de Agentes faltantes se mapean desde los *Nombres Alternativos del Clúster* del mismo Clúster de Agentes.
- **Agente Director Primario**
  - **Subagent ID** es el identificador único del Agente Director Primario que no puede modificarse durante la vida útil del Agente Director. El *Subagent ID* no es visible en Jobs y Workflows.
    - Sugerencia: Use un nombre único como el FQDN del host y el puerto del Subagente.
  - **Título** es una descripción que puede agregarse para un Agente Director.
  - **URL** espera la URL compuesta por protocolo, host y puerto que usa el Controlador para conectarse al Agente Director Primario, por ejemplo http://localhost:4445.
    - La URL comienza con el protocolo *http* si el Agente Director usa HTTP simple. Se usa el protocolo *https* si el Agente Director está configurado para HTTPS.
    - El nombre de host puede ser *localhost* si el Agente Director está instalado en la misma máquina que el Controlador. De lo contrario, se debe especificar el FQDN del host del Agente Director.
    - El *puerto* del Agente Director se determina durante la instalación.
  - **Como Clúster de Subagentes propio** crea opcionalmente Clústeres de Subagentes para cada Agente Director Primario y Secundario; consulte [Operación Inicial - Registrar Clúster de Subagentes](/initial-operation-register-agent-subagent-cluster).
- **Agente Director Secundario**
  - **Subagent ID** es el identificador único del Agente Director Secundario que no puede modificarse durante la vida útil del Agente Director. El *Subagent ID* no es visible en Jobs y Workflows.
    - Sugerencia: Use un nombre único como el FQDN del host y el puerto del Subagente.
  - **Título** es una descripción que puede agregarse para un Agente Director.
  - **URL** espera la URL compuesta por protocolo, host y puerto que usa el Controlador para conectarse al Agente Director Secundario, de manera similar al *Agente Director Primario*.

Tras el registro exitoso, el Agente se mostrará en la vista [Recursos - Agentes](/resources-agents).

## Referencias

### Ayuda de Contexto

- [Operación Inicial - Registrar Agente Autónomo](/initial-operation-register-agent-standalone)
- [Operación Inicial - Registrar Subagente](/initial-operation-register-agent-subagent)
- [Operación Inicial - Registrar Clúster de Subagentes](/initial-operation-register-agent-subagent-cluster)
- [Operación Inicial - Registrar Controlador](/initial-operation-register-controller)

### Base de Conocimiento del Producto

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - How to troubleshoot Agent Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Agent+Initial+Operation)
- [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)
