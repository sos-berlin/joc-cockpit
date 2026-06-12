# Configuración - Limpieza

Las siguientes configuraciones se aplican al [Servicio de Limpieza](/service-cleanup). Los cambios tienen efecto inmediato.

La página de *Configuración* es accesible desde el ícono ![ícono de rueda](assets/images/wheel.png) en la barra de menú.

## Configuración de Hora de Inicio

### Configuración: *time\_zone*, Predeterminado: *UTC*

Especifica la zona horaria que se aplica a la hora de inicio y al período del Servicio de Limpieza.

### Configuración: *period*

Especifica los días de la semana en que se realiza el Servicio de Limpieza. Se asume que el primer día de la semana es el lunes. Al instalar JS7 inicialmente, los valores predeterminados especifican: 1,2,3,4,5,6,7 para limpieza diaria. Si no se especifican días de la semana, el Servicio de Limpieza no se iniciará.

En la mayoría de los casos se recomienda ejecutar el Servicio de Limpieza diariamente, ya que esto mantiene bajo el número de registros a depurar. Pueden existir excepciones si la ejecución de Jobs diaria es muy densa durante las 24 horas y si hay períodos de baja actividad disponibles, por ejemplo, los fines de semana.

### Configuración: *period\_begin*, Predeterminado: *01:00:00*

Especifica la hora de inicio del Servicio de Limpieza en la *Zona Horaria* correspondiente.

### Configuración: *period\_end*, Predeterminado: *04:00:00*

Especifica el fin del período durante el cual se permite ejecutar el Servicio de Limpieza en la *Zona Horaria* correspondiente. El Servicio de Limpieza muy probablemente completará la depuración de la base de datos antes del tiempo indicado. Sin embargo, si detecta actividad del *Servicio de Historial*, el Servicio de Limpieza se detendrá y reiniciará más tarde. El Servicio de Limpieza no continuará ejecutándose más allá del *Fin de Período* indicado.

### Configuración: *force\_cleanup*, Predeterminado: *false*

Si se establece en *true*, especifica que el Servicio de Limpieza se ejecutará forzosamente en el *Inicio de Período* indicado. De forma predeterminada, el Servicio de Limpieza se detendrá si detecta actividad del Servicio de Historial. Esta configuración permite al Servicio de Limpieza pausar el Servicio de Historial durante una duración configurable.

Si se establece en *true*, se consideran las siguientes configuraciones:

- **history\_pause\_duration**: período durante el cual se pausará el Servicio de Historial.
- **history\_pause\_delay**: retraso tras la reanudación del Servicio de Historial desde una pausa y durante el cual el Servicio de Limpieza esperará antes de reiniciarse.

Los usuarios que ejecutan Jobs 24/7 sin suficiente tiempo inactivo del Servicio de Historial que permita que el Servicio de Limpieza se active, deben activar esta configuración para forzar la ejecución del Servicio de Limpieza. La falta de depuración de la base de datos resultará en rendimiento reducido y creciente consumo de recursos de la base de datos.

### Configuración: *history\_pause\_duration*, Predeterminado: *60*s

Si la configuración *force\_cleanup* está establecida en *true*, el Servicio de Historial se pausará durante la duración indicada o hasta la finalización de la limpieza, lo que ocurra primero. Mientras el Servicio de Historial está pausado, no se pondrán a disposición en el JOC Cockpit nuevas entradas de historial referentes a la ejecución de Órdenes y tareas. Al completar la pausa del Servicio de Historial, cualquier entrada de historial pendiente será procesada.

### Configuración: *history\_pause\_delay*, Predeterminado: *30*s

Si la configuración *force\_cleanup* está establecida en *true* y la pausa del Servicio de Historial se ha completado, el Servicio de Limpieza esperará el retraso indicado y se reiniciará si se requiere más depuración de la base de datos.

## Configuración de Conexión de Base de Datos

### Configuración: *batch\_size*, Predeterminado: *1000*

Especifica el número de registros que se depuran dentro de una única transacción. Aumentar este valor puede mejorar el rendimiento; al mismo tiempo, aumentará el riesgo de conflictos con transacciones concurrentes si los Servicios operan sobre la base de datos en paralelo.

### Configuración: *max\_pool\_size*, Predeterminado: *8*

Especifica el número máximo de conexiones de base de datos paralelas utilizadas por el servicio.

## Configuración del Período de Retención

### Configuración: *order\_history\_age*, Predeterminado: *90*d

Especifica el período de retención para el [Historial de Órdenes](/history-orders) y el [Historial de Tareas](/history-tasks). Cualquier entrada de historial más antigua que el valor especificado será purgada.

### Configuración: *order\_history\_logs\_age*, Predeterminado: *90*d

Especifica el período de retención para los logs de Órdenes y tareas. Cualquier log más antiguo que el valor especificado será purgado. Tenga en cuenta que este valor no debe superar el valor de la configuración *cleanup\_order\_history\_age*, de lo contrario el JOC Cockpit no podrá proporcionar navegación hacia los logs.

### Configuración: *file\_transfer\_history\_age*, Predeterminado: *90*d

Especifica el período de retención para el [Historial de Transferencia de Archivos](/history-file-transfers). Cualquier entrada más antigua que el valor especificado será purgada.

### Configuración: *audit\_log\_age*, Predeterminado: *90*d

Especifica el período de retención para el [Registro de Auditoría](/audit-log). Cualquier entrada del Registro de Auditoría más antigua que el valor especificado será purgada.

### Configuración: *daily\_plan\_history\_age*, Predeterminado: *30*d

Especifica el período de retención para el historial de envíos con el [Plan Diario](/daily-plan). Cualquier entrada de historial más antigua que el valor especificado será purgada.

### Configuración: *monitoring\_history\_age*, Predeterminado: *1*d

Especifica el período de retención para las entradas en la vista *Monitor*. Como esto sugiere ser una vista táctica, no se recomiendan períodos de retención más largos.

### Configuración: *notification\_history\_age*, Predeterminado: *1*d

Especifica el período de retención para notificaciones, por ejemplo sobre errores y advertencias de Jobs. Como las notificaciones normalmente se gestionan el mismo día, no se recomiendan períodos de retención más largos.

### Configuración: *profile\_age*, Predeterminado: *365*d

Especifica el período de retención para [Perfiles](/profile) no utilizados, es decir, perfiles de cuentas de usuario que no iniciaron sesión durante el período dado.

### Configuración: *failed\_login\_history\_age*, Predeterminado: *90*d

Especifica el período de retención para el historial de inicios de sesión fallidos. Los inicios de sesión fallidos que ocurrieron antes del período dado serán purgados.

### Configuración: *reporting\_age*, Predeterminado: *365*d

Especifica el período de retención para [Reportes](/reports).

### Configuración: *approval\_requests\_age*, Predeterminado: *7*d

Especifica el período de retención para [Solicitudes de Aprobación](/approval-requests).

### Configuración: *deployment\_history\_versions*, Predeterminado: *10*

Especifica el número de versiones por objeto desplegado que deben conservarse. Las versiones pueden usarse para volver a desplegar un objeto desde un estado anterior. Cualquier versión desplegada anteriormente de los objetos desplegados es eliminada.

## Referencias

### Ayuda Contextual

- [Solicitudes de Aprobación](/approval-requests)
- [Registro de Auditoría](/audit-log)
- [Plan Diario](/daily-plan)
- [Plan Diario - Proyecciones](/daily-plan-projections)
- [Perfil](/profile)
- [Reportes](/reports)
- [Recursos - Tableros de Avisos](/resources-notice-boards)
- [Servicio de Limpieza](/service-cleanup)
- [Configuración](/settings)

### Base de Conocimiento del Producto

- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
