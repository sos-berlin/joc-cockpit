# Plantillas de Reportes

## Plantilla de Reporte: Los n Workflows con mayor/menor número de ejecuciones fallidas

La Plantilla de Reporte cuenta las ejecuciones fallidas de Workflows:

- Una ejecución de Workflow se considera fallida si la Orden abandona el Workflow con un resultado no exitoso, por ejemplo si una Orden es cancelada o si se usa una [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction) indicando un resultado no exitoso.
- Una ejecución de Workflow no se considera fallida solo porque algún Job haya fallado, por ejemplo si se usa una [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction) y un reintento posterior del Job tiene éxito. En cambio, se considera el estado del historial resultante de una Orden.

## Plantilla de Reporte: Los n Jobs con mayor/menor número de ejecuciones fallidas

La Plantilla de Reporte cuenta las ejecuciones fallidas de Jobs.

- La ejecución de un Job de Shell se considera fallida basándose en el código de salida del Job y opcionalmente en la salida al canal stderr.
- La ejecución de un Job de JVM se considera fallida basándose en el resultado del Job, que puede contener excepciones.

## Plantilla de Reporte: Los n Agentes con mayor/menor número de ejecuciones paralelas de Jobs

La Plantilla de Reporte cuenta las ejecuciones paralelas de Jobs con Agentes. Un Job1 se considera paralelo al Job2 si

- Job1 inicia después de que Job2 ha iniciado y antes de que Job2 finalice, o
- Job1 finaliza después de que Job2 ha iniciado y antes de que Job2 finalice.

## Plantilla de Reporte: Los n Jobs de alta criticidad con mayor/menor número de ejecuciones fallidas

La Plantilla de Reporte cuenta las ejecuciones fallidas de Jobs con criticidad crítica. La criticidad es un atributo del Job, véase JS7 - Job Instruction.

El conteo se realiza de manera similar a la Plantilla de Reporte: Los n Jobs con mayor/menor número de ejecuciones fallidas.

## Plantilla de Reporte: Los n Workflows con mayor/menor número de ejecuciones fallidas por Órdenes canceladas

La Plantilla de Reporte cuenta las ejecuciones fallidas de Workflows debidas a Órdenes que han sido canceladas.

La operación *cancelar* es aplicada a una Orden por intervención del usuario.

## Plantilla de Reporte: Los n Workflows con mayor/menor necesidad de tiempo de ejecución

La Plantilla de Reporte considera la duración de las ejecuciones exitosas de Workflows. Las ejecuciones fallidas de Workflows no se consideran.

## Plantilla de Reporte: Los n Jobs con mayor/menor necesidad de tiempo de ejecución

La Plantilla de Reporte considera la duración de las ejecuciones exitosas de Jobs. Las ejecuciones fallidas de Jobs no se consideran.

## Plantilla de Reporte: Los n períodos con mayor/menor número de ejecuciones de Jobs

La Plantilla de Reporte divide el Período de Reporte en pasos. La duración de un paso está determinada por la configuración *Duración del Paso* en la [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration). El inicio del siguiente paso está determinado por la configuración "Superposición del Paso" en la Configuración de Reporte.

Ejemplo:

- Duración del Paso: 5m
- Superposición del Paso: 2m
  - 00:00-00:05
  - 00:02-00:07
  - 00:04-00:09

El número de Jobs en ejecución se cuenta por paso.

## Plantilla de Reporte: Los n períodos con mayor/menor número de ejecuciones de Workflows

La Plantilla de Reporte divide el *Período de Reporte* en pasos. La duración de un paso está determinada por la configuración *Duración del Paso* en la [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration). El inicio del siguiente paso está determinado por la configuración *Superposición del Paso* en la Configuración de Reporte.

El número de Órdenes en ejecución se cuenta por paso.

## Plantilla de Reporte: Los n Jobs con mayor/menor número de ejecuciones exitosas

La Plantilla de Reporte cuenta los Jobs que se completaron exitosamente. Los Jobs fallidos no se consideran.

Para posibles causas de falla de Jobs, véase Plantilla de Reporte: Los n Jobs con mayor/menor número de ejecuciones fallidas.

## Plantilla de Reporte: Los n Workflows con mayor/menor número de ejecuciones exitosas

La Plantilla de Reporte cuenta los Workflows que se completaron exitosamente. Las ejecuciones fallidas de Workflows no se consideran.

Para causas de falla de Workflows, véase *Plantilla de Reporte: Los n Workflows con mayor/menor número de ejecuciones fallidas*.

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Reportes](/configuration-inventory-reports)
- [Reportes](/reports)
- [Reporte - Creación](/report-creation)
- [Reporte - Historial de Ejecución](/report-run-history)

### Base de Conocimiento del Producto

- Reportes
  - [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration)
  - [JS7 - Reports - Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Templates)
- Instrucciones de Workflow
  - [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction)
  - [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction)
