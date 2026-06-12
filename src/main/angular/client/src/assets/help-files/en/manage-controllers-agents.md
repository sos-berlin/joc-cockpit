# Gestionar Controladores y Agentes

La página *Gestionar Controladores/Agentes* se utiliza

- para registrar Controladores Autónomos y Clústeres de Controladores,
- para registrar Agentes Autónomos con Controladores,
- para registrar Clústeres de Agentes con Controladores,
  - especificando un Clúster de *Agentes Directores*
  - especificando cualquier número de *Subagentes* que actúan como nodos trabajadores.
  - especificando cualquier número de *Clústeres de Subagentes* que gobiernan el uso de Agentes y que pueden asignarse a Jobs en Workflows.

El uso de un Clúster de Controladores o Clúster de Agentes está sujeto a los acuerdos de la [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License).

## Registrar Controlador

La operación para registrar un Controlador está disponible desde el botón *Nuevo Controlador*. Durante la Operación Inicial, cuando JOC Cockpit se usa por primera vez, la ventana emergente para registrar un Controlador se muestra automáticamente.

Para más explicaciones, consulte [Operación Inicial - Registrar Controlador](/initial-operation-register-controller).

## Operaciones sobre Controladores

Para un Controlador existente, las siguientes operaciones se ofrecen desde su menú de acción de 3 puntos:

- **Editar** permite modificar las propiedades de un Controlador, incluidas las URLs de las instancias del Controlador.
- **Agregar Agente Autónomo** ofrece registrar un Agente autónomo.
  - Para más explicaciones, consulte [Operación Inicial - Registrar Agente Autónomo](/initial-operation-register-agent-standalone).
- **Agregar Clúster de Agentes** ofrece registrar un Clúster de Agentes.
  - La operación incluye especificar *Agentes Directores* y *Subagentes*.
  - Para más explicaciones, consulte [Operación Inicial - Registrar Clúster de Agentes](/initial-operation-register-agent-cluster).
- **Crear Token de un solo uso**
- **Exportar Configuración de Agentes** ofrece para descarga un archivo de exportación en formato JSON con las configuraciones de Agentes del Controlador seleccionado.
- **Importar Configuración de Agentes** ofrece cargar un archivo de exportación en formato JSON con configuraciones de Agentes previamente exportadas. Los Agentes relacionados serán registrados con el Controlador.
- **Eliminar** permite eliminar la configuración del Controlador, incluidas todas las configuraciones de Agentes. Esto no eliminará el Controlador y los Agentes del disco, sino que descarta la configuración en JOC Cockpit.

## Filtros

Los siguientes botones de filtro para Agentes están disponibles en la parte superior de la pantalla:

- **Todos los Agentes** muestra todas las configuraciones de Agentes independientemente de su estado de despliegue.
- **Sincronizados** muestra las configuraciones de Agentes que han sido desplegadas a un Controlador.
- **No Sincronizados** muestra las configuraciones de Agentes cuyos cambios no han sido desplegados a un Controlador.
- **No Desplegados** muestra las configuraciones de Agentes que no han sido inicialmente desplegadas a un Controlador.
- **Desconocido** muestra las configuraciones de Agentes en estado desconocido, por ejemplo, después de que un Controlador es reinicializado. Los usuarios deben desplegar la configuración del Agente.

## Referencias

### Ayuda de Contexto

- [Operación Inicial - Registrar Clúster de Agentes](/initial-operation-register-agent-cluster)
- [Operación Inicial - Registrar Agente Autónomo](/initial-operation-register-agent-standalone)
- [Operación Inicial - Registrar Controlador](/initial-operation-register-controller)

### Base de Conocimiento del Producto

- [JS7 - How to troubleshoot Controller Cluster Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Controller+Cluster+Initial+Operation)
- [JS7 - Initial Operation for Controller Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Controller+Cluster)
- [JS7 - Initial Operation for Standalone Controller](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Standalone+Controller)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)
