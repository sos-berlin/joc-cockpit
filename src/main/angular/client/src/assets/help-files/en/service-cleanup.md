# Servicio de Limpieza

El Servicio de Limpieza depurará la [JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database) de registros desactualizados.

Esto incluye datos de las siguientes fuentes:

- [Historial de Órdenes](/history-orders)
- [Historial de Tareas](/history-tasks)
- [Historial de Transferencia de Archivos](/history-file-transfers)
- [Plan Diario](/daily-plan)
- [Registro de Auditoría](/audit-log)

Por cada Job ejecutado durante el día se creará una entrada en el *Historial de Tareas*, de manera similar para el *Historial de Órdenes*. Dependiendo del número de Jobs diarios, esto puede acumularse en grandes cantidades.

- Los usuarios deben considerar las políticas de retención de logs aplicables, es decir, el período durante el cual el historial de ejecución de Jobs y los logs deben mantenerse por requisitos legales y de cumplimiento.
- Una base de datos no puede crecer indefinidamente. El uso de un DBMS de alto rendimiento puede permitir tener 100 millones de registros en una tabla de *Historial de Tareas*. Sin embargo, esto tiende a ser perjudicial para el rendimiento y puede no ser necesario. Depurar la base de datos es una medida razonable para un funcionamiento fluido. Las medidas adicionales para el mantenimiento de la base de datos, como la recreación de índices, son responsabilidad del usuario.

El Servicio de Limpieza se inicia según su configuración y puede iniciarse en la vista del Panel de Control desde el recuadro de la instancia activa del JOC Cockpit que ofrece la operación *Ejecutar Servicio - Servicio de Limpieza*.

<img src="dashboard-run-cleanup-service.png" alt="Ejecutar Servicio de Limpieza" width="750" height="280" />

## Configuración del Servicio de Limpieza

Para detalles de configuración del Servicio de Limpieza, véase [Configuración - Limpieza](/settings-cleanup).

## Referencias

### Ayuda Contextual

- [Registro de Auditoría](/audit-log)
- [Plan Diario](/daily-plan)
- [Historial de Transferencia de Archivos](/history-file-transfers)
- [Historial de Órdenes](/history-orders)
- [Historial de Tareas](/history-tasks)
- [Configuración - Limpieza](/settings-cleanup)

### Base de Conocimiento del Producto

- [JS7 - Cleanup Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Cleanup+Service)
- [JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database)
