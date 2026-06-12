# Operación Inicial - Registrar Clúster de Subagentes

La Operación Inicial se realiza tras la instalación del JS7 Controller, Agent y JOC Cockpit. El registro de un Clúster de Subagentes ocurre después de completar la [Operación Inicial - Registrar Clúster de Agentes](/initial-operation-register-agent-cluster).

## Arquitectura

### Agentes

- Los **Agentes Autónomos** ejecutan Jobs en máquinas remotas on-premises y desde contenedores. Se operan individualmente y son gestionados por el Controlador.
- **Clúster de Agentes**
  - Los **Agentes Directores** orquestan los *Subagentes* en un Clúster de Agentes. Se operan desde dos instancias en clúster activo-pasivo y son gestionados por el Controlador.
  - Los **Subagentes** ejecutan Jobs en máquinas remotas on-premises y desde contenedores. Pueden considerarse nodos trabajadores en un Clúster de Agentes y son gestionados por los *Agentes Directores*.

### Conexiones

- Las conexiones del **Agente Autónomo** y del **Agente Director** son establecidas por el Controlador.
- Las conexiones de **Subagente** en un Clúster de Agentes son establecidas por los *Agentes Directores*.

## Registrar Clúster de Subagentes

El registro de un Clúster de Subagentes incluye registrar

- la *Selección* de Agentes Directores y Subagentes en un Clúster de Agentes
- la *Secuencia* en la que operarán los Subagentes
  - *activo-activo*: cada Job siguiente se ejecutará con el siguiente Subagente. Esto significa que todos los Subagentes seleccionados están involucrados. Para más detalles, consulte [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster).
  - *activo-pasivo*: solo se utilizará el primer Subagente para la ejecución de Jobs. Si no está disponible, se utilizará el siguiente. Para más detalles, consulte [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster).
  - *basado en métricas*: basándose en reglas como el consumo de CPU y memoria, se seleccionará el siguiente Subagente para la ejecución de Jobs. Para más detalles, consulte [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster).

Para más detalles, consulte [Operación Inicial - Clúster de Subagentes](/initial-operation-agent-subagent-cluster)

## Referencias

### Ayuda de Contexto

- [Panel de Control - Estado del Producto](/dashboard-product-status)
- [Operación Inicial - Registrar Clúster de Agentes](/initial-operation-register-agent-cluster)
- [Operación Inicial - Registrar Controlador](/initial-operation-register-controller)
- [Operación Inicial - Registrar Subagente](/initial-operation-register-agent-subagent)
- [Operación Inicial - Clúster de Subagentes](/initial-operation-agent-subagent-cluster)

### Base de Conocimiento del Producto

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
  - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster)
  - [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster)
  - [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster)
