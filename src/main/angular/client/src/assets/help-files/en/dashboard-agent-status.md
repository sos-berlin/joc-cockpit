# Dashboard - Estado de Agentes

El panel *Estado de Agentes* resume el estado de conexión de los Agentes registrados.

<img src="dashboard-agent-status.png" alt="Estado de Agentes" width="332" height="135" />

## Arquitectura

### Agentes

- **Agentes Autónomos**: ejecutan Jobs en máquinas remotas on-premises y desde contenedores. Operan de forma individual y son gestionados por el Controlador.
- **Clúster de Agentes**
  - **Agentes Director**: orquestan los *Subagentes* en un Clúster de Agentes. Operan en dos instancias en modo activo-pasivo y son gestionados por el Controlador.
  - **Subagentes**: ejecutan Jobs en máquinas remotas on-premises y desde contenedores. Pueden considerarse nodos de trabajo en un Clúster de Agentes y son gestionados por los *Agentes Director*.

### Conexiones

- Las conexiones de los **Agentes Autónomos** y los **Agentes Director** son establecidas por el Controlador.
- Las conexiones de los **Subagentes** en un Clúster de Agentes son establecidas por los *Agentes Director*.

## Estado de Conexión

El estado de los Agentes se indica mediante los siguientes colores:

- **Color Verde**: indica conexiones saludables de Agentes.
- **Color Amarillo**: indica Agentes que están reiniciando, es decir, están inicializando su journal y reiniciando.
- **Color Rojo**: indica conexiones fallidas a Agentes que no pueden ser alcanzados.
- **Color Gris**: indica un estado de conexión *desconocido*, por ejemplo, si un Agente Director no puede ser alcanzado, el estado de sus Subagentes será *desconocido*.

Los usuarios deben considerar las siguientes implicancias:

- Si una conexión a un Agente se considera fallida, eso no confirma que el Agente esté caído. Pueden existir problemas de red que impidan la conexión.
- El JOC Cockpit recibe información sobre el estado de conexión de los Agentes desde el Controlador. Si el Controlador no está disponible, esta información no estará presente. Esto no significa que los Agentes estén caídos, sino que serán indicados con estado *desconocido*.
- El Controlador reporta las conexiones hacia los *Agentes Autónomos* y los *Agentes Director*. Las conexiones fallidas a *Agentes Director* sugieren que el Controlador desconoce el estado de los *Subagentes* del Clúster de Agentes correspondiente, los cuales se muestran con estado *desconocido*.

## Referencias

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
