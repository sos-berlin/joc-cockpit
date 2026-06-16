# Historial de Despliegues

La vista *Historial de Despliegues* resume los despliegues de objetos del inventario.

JS7 implementa una arquitectura distribuida que permite ejecutar Jobs del mismo Workflow en diferentes Agentes y plataformas. Un despliegue exitoso incluye la confirmación de cada Agente sobre los objetos nuevos y actualizados, que llega de forma asíncrona.

Al usar la operación *desplegar* en la vista *Configuración*, la confirmación llegará dependiendo de la disponibilidad del Agente. Por ejemplo, un Agente apagado confirmará el despliegue cuando se reinicie, lo que podría ocurrir algún tiempo después.

El *Historial de Despliegues* se actualiza de forma asíncrona para reflejar el estado de despliegue de los objetos del inventario.

## Panel de Historial

### Historial de Despliegues

La visualización se agrupa en un bloque por despliegue y en bloques por objeto del inventario.

- **Fecha de Despliegue** indica el momento en que se realizó el despliegue.
- **Cuenta** indica la cuenta de usuario de JOC Cockpit que realizó la operación de despliegue.
- **Estado** indica si el despliegue fue exitoso o fallido.
  - *Desplegado* indica que todos los objetos del inventario fueron desplegados exitosamente.
  - *No Desplegado* indica que uno o más objetos del inventario no pudieron ser desplegados.
- **Número de Elementos** indica la cantidad de objetos del inventario como Workflows, Recursos de Job, etc. incluidos en el despliegue.

### Historial de Despliegues por Objeto del Inventario

Al hacer clic en el icono de flecha hacia abajo desde la *Fecha de Despliegue*, se mostrarán los detalles por objeto del inventario:

- **Mensaje** indica un mensaje de error en caso de despliegue fallido.
- **Tipo de Objeto** indica el tipo de objeto del inventario, como *Workflow*, *Recurso de Job*, etc.
- **Ruta** indica la carpeta del inventario y el nombre del objeto. Para los objetos Workflow:
  - al hacer clic en el nombre del Workflow se navega a la vista [Workflows](/workflows),
  - al hacer clic en el icono del lápiz se navega a la vista [Configuración - Inventario - Workflows](/configuration-inventory-workflows).
- **Operación** es una de *store* o *delete*. Los objetos actualizados aparecen con ambas operaciones.
- **Fecha** indica el momento en que se realizó la operación de despliegue.

## Referencias

- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
- [Workflows](/workflows)
- [JS7 - Deployment of Scheduling Objects](https://kb.sos-berlin.com/display/JS7/JS7+-+Deployment+of+Scheduling+Objects)
