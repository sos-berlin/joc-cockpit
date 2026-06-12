# Recursos - Agentes

La vista *Agentes* resume el estado de conexión de los Agentes registrados.

## Arquitectura

### Agentes

- **Agentes Autónomos** ejecutan Jobs en máquinas remotas on-premises y desde contenedores. Se operan de forma individual y son gestionados por el Controlador.
- **Clúster de Agentes**
  - **Agentes Directores** orquestan *Subagentes* en un Clúster de Agentes. Se operan desde dos instancias en clústering activo-pasivo y son gestionados por el Controlador.
  - **Subagentes** ejecutan Jobs en máquinas remotas on-premises y desde contenedores. Pueden considerarse nodos de trabajo en un Clúster de Agentes y son gestionados por *Agentes Directores*.

### Conexiones

- Las conexiones del **Agente Autónomo** y del **Agente Director** son establecidas por el Controlador.
- Las conexiones de **Subagentes** en un Clúster de Agentes son establecidas por los *Agentes Directores*.

## Estado de Conexión

La visualización del estado de los Agentes utiliza los siguientes indicadores de color:

- **Color Verde** indica conexiones de Agentes saludables.
- **Color Amarillo** indica Agentes que se están reiniciando actualmente, es decir, están inicializando su journal y reiniciando.
- **Color Rojo** indica conexiones fallidas con Agentes, por ejemplo si el Agente no puede ser alcanzado.
- **Color Gris** indica un estado de conexión *desconocido*, por ejemplo si un Agente Director no puede ser alcanzado, entonces para los Subagentes el estado es *desconocido*.

Los usuarios deben considerar las siguientes implicaciones:

- Si una conexión de Agente se considera fallida, esto no confirma que el Agente esté caído. Pueden existir problemas de red que impidan la conexión.
- El JOC Cockpit recibe información sobre el estado de conexión del Agente desde el Controlador. Si el Controlador no está disponible, esta información no estará presente. Esto no significa que los Agentes estén caídos, pero significa que los Agentes se indicarán con un estado *desconocido*.
- El Controlador reporta conexiones con *Agentes Autónomos* y con *Agentes Directores*. Las conexiones fallidas con *Agentes Directores* sugieren que el Controlador desconoce el estado de los *Subagentes* del Clúster de Agentes, que se indica como *desconocido*.

## Referencias

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
