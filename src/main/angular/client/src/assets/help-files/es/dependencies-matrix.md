# Matriz de Dependencias

Los objetos del Inventario de JS7 están relacionados por dependencias. Por ejemplo, un Workflow referencia un Recurso de Job y un Recurso de Lock; una Planificación referencia un Calendario y uno o más Workflows.

Al desplegar objetos, se considera la consistencia; por ejemplo:

- Si se crea un Recurso de Job y es referenciado por un Workflow recién creado, el despliegue del Workflow incluye el despliegue del Recurso de Job.
- Si un Recurso de Job es referenciado por un Workflow desplegado y debe ser revocado o eliminado, el Workflow también debe ser revocado o eliminado.

Para más detalles, consulte [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies).

La Matriz de Dependencias de los objetos del Inventario es la siguiente:

| Área | Tipo de Objeto | Referencias Entrantes | | Referencias Salientes | | | | | |
| ----- | ----- | ----- | ----- |
| Controlador |
| | Workflow | Workflow | Planificación | Workflow | Recurso de Job | Tablero de Avisos | Recurso de Lock | Plantilla de Job | Script Incluido |
| | Orden Disparada por Archivo | | | Workflow |
| | Recurso de Job | Workflow |
| | Tablero de Avisos | Workflow |
| | Recurso de Lock | Workflow |
| Automatización |
| | Planificación | | | Workflow | Calendario |
| | Calendario | Planificación |
| | Plantilla de Job | Workflow |
| | Script Incluido | Workflow |

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Operaciones - Desplegar Carpeta](/configuration-inventory-operations-deploy-folder)
- [Configuración - Inventario - Operaciones - Desplegar Objeto](/configuration-inventory-operations-deploy-object)

### Base de Conocimiento del Producto

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
