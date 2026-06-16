# Operación Inicial - Clúster de Subagentes

La Operación Inicial se realiza tras la instalación del JS7 Controller, Agent y JOC Cockpit. El registro de un Clúster de Subagentes ocurre después de completar la [Operación Inicial - Registrar Clúster de Agentes](/initial-operation-register-agent-cluster).

## Clúster de Subagentes

La configuración de un Clúster de Subagentes incluye

- la *Selección* de Agentes Directores y Subagentes en un Clúster de Agentes
- la *Secuencia* en la que operarán los Subagentes
  - *activo-pasivo*: solo se utilizará el primer Subagente para la ejecución de Jobs. Si el Subagente no está disponible, se utilizará el siguiente. Para más detalles, consulte [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster).
  - *activo-activo*: cada Job siguiente se ejecutará con el siguiente Subagente. Esto significa que todos los Subagentes seleccionados están involucrados. Para más detalles, consulte [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster).
  - *basado en métricas*: basándose en reglas como el consumo de CPU y memoria, se seleccionará el siguiente Subagente para la ejecución de Jobs. Para más detalles, consulte [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster).

### Selección de Agentes

En el panel izquierdo, los usuarios encuentran la lista de Subagentes, incluidos los Agentes Directores, disponibles para selección.

Los Subagentes pueden arrastrarse y soltarse al panel derecho en el área de arrastre correspondiente. Para deseleccionar un Subagente, puede arrastrarse y soltarse en el panel derecho al área de arrastre indicada como *Soltar aquí para eliminar Subagente*.

### Secuencia de Agentes

La secuencia de Subagentes determina el tipo de clúster:

#### Clúster de Subagentes Activo-Pasivo

Los Subagentes se arrastran y sueltan en la *misma columna*:

- Los Subagentes en la misma columna especifican un clúster activo-pasivo (prioridad fija) en el que el primer Subagente se utilizará para cualquier Job mientras esté disponible. Solo cuando el primer Subagente no esté disponible, se utilizará el siguiente.
- Para más detalles, consulte [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster).

#### Clúster de Subagentes Activo-Activo

Los Subagentes se arrastran y sueltan en la *misma fila*:

- Los Subagentes en la misma fila especifican un clúster activo-activo (Round-robin) en el que cada Job siguiente se ejecutará con el siguiente Subagente.
- Para más detalles, consulte [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster).

#### Clúster de Subagentes Basado en Métricas

Los Subagentes se arrastran y sueltan en la *misma fila* y se les asigna una *Prioridad Basada en Métricas*:

- Los Subagentes en la misma fila especifican una prioridad basada en métricas:
    - Al pasar el ratón sobre el recuadro del Subagente, se muestra su menú de acción de 3 puntos: la acción *Prioridad Basada en Métricas* permite especificar la prioridad mediante una expresión.
- Para más detalles, consulte [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster).

Expresiones para prioridades basadas en métricas:

| Variable Indicadora | Métrica |
| ----- | ----- |
| $js7SubagentProcessCount | Número de procesos ejecutándose con el Subagente. |
| $js7ClusterSubagentProcessCount | Número de procesos para el Clúster de Subagentes dado que se ejecutan con el Subagente. |
|      | Los siguientes indicadores están disponibles según se explica en https://docs.oracle.com/en/java/javase/17/docs/api/jdk.management/com/sun/management/OperatingSystemMXBean.html |
| $js7CpuLoad | Devuelve el "uso reciente de CPU" para el entorno operativo. Este valor es un double en el intervalo [0.0,1.0]. Un valor de 0.0 significa que todas las CPUs estuvieron inactivas durante el período reciente observado, mientras que un valor de 1.0 significa que todas las CPUs estuvieron activamente al 100% del tiempo durante el período reciente observado. Todos los valores entre 0.0 y 1.0 son posibles dependiendo de las actividades en curso. Si el uso reciente de CPU no está disponible, el método devuelve un valor negativo. Un valor negativo se reporta como faltante. La carga de CPU no está disponible para MacOS y se reporta como faltante. |
| $js7CommittedVirtualMemorySize | Devuelve la cantidad de memoria virtual que se garantiza estar disponible para el proceso en ejecución en bytes, o -1 si esta operación no es compatible. Un valor negativo se reporta como faltante. |
| $js7FreeMemorySize | Devuelve la cantidad de memoria libre en bytes. |
| $js7TotalMemorySize | Devuelve la cantidad total de memoria en bytes. |

## Referencias

### Ayuda de Contexto

- [Operación Inicial - Registrar Clúster de Agentes](/initial-operation-register-agent-cluster)
- [Operación Inicial - Registrar Clúster de Subagentes](/initial-operation-register-agent-subagent-cluster)

### Base de Conocimiento del Producto

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
  - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster)
  - [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster)
  - [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster)
