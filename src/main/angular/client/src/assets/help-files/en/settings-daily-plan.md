# Configuración - Plan Diario

Las siguientes configuraciones se aplican al [Plan Diario](/daily-plan). Los cambios tienen efecto inmediato.

La página de *Configuración* es accesible desde el ícono ![ícono de rueda](assets/images/wheel.png) en la barra de menú.

## Configuración del Plan Diario

### Configuración: *time\_zone*, Predeterminado: *UTC*

Especifica la zona horaria que se aplica a la hora de inicio del [Servicio de Plan Diario](/service-daily-plan) y al período del Plan Diario.

### Configuración: *period\_begin*, Predeterminado: *00:00*

Especifica el inicio del período de 24 horas del Plan Diario en la zona horaria indicada.

### Configuración: *start\_time*, Predeterminado: *30 minutos antes de period\_begin*

Especifica la hora de inicio para ejecutar el Plan Diario diariamente con la zona horaria indicada. Sin esta configuración, el Plan Diario se ejecutará 30 minutos antes del momento especificado por la configuración *period\_begin*. Esta configuración acepta un valor de hora, por ejemplo 23:00:00.

### Configuración: *days\_ahead\_plan*, Predeterminado: *7*

Especifica el número de días de anticipación para los cuales se generan Órdenes y se ponen a disposición con el estado *planificado*. Un valor *0* indica que no se deben generar Órdenes y deshabilita la funcionalidad.

### Configuración: *days\_ahead\_submit*, Predeterminado: *3*

Especifica el número de días de anticipación para los cuales las Órdenes *planificadas* se envían a los Controladores y se ponen a disposición con el estado *enviado*. Un valor *0* indica que no se deben enviar Órdenes y deshabilita la funcionalidad.

### Configuración: *submit\_orders\_individually*, Predeterminado: *false*

El Servicio de Plan Diario envía Órdenes de forma predeterminada desde una única transacción que se revierte si el envío de una Orden falla. Con esta configuración habilitada, las Órdenes se envían individualmente e independientemente de cualquier fallo al enviar otras Órdenes. El Servicio de Plan Diario requerirá más tiempo para enviar Órdenes individualmente.

### Configuración: *age\_of\_plans\_to\_be\_closed\_automatically*, Predeterminado: *1*

Especifica el número de días después de los cuales el Plan Diario se cerrará y no permitirá agregar Órdenes que resuelvan dependencias para [Recursos - Tableros de Avisos](/resources-notice-boards) de la fecha original.

### Configuración: *projections\_month\_before*, Predeterminado: *2*

Especifica el número de meses anteriores a la fecha actual para los cuales se calculan las [Proyecciones del Plan Diario](/daily-plan-projections) que indican la ejecución de Órdenes. Esto permite a los usuarios comparar fechas pasadas del Plan Diario con proyecciones basadas en cambios actuales a las Planificaciones.

### Configuración: *projections\_month\_ahead*, Predeterminado: *6*

Especifica el número de meses de anticipación para los cuales se calculan las [Proyecciones del Plan Diario](/daily-plan-projections) que indican la futura ejecución de Órdenes.

## Referencias

### Ayuda Contextual

- [Plan Diario](/daily-plan)
- [Proyecciones del Plan Diario](/daily-plan-projections)
- [Servicio de Plan Diario](/service-daily-plan)
- [Recursos - Tableros de Avisos](/resources-notice-boards)
- [Configuración](/settings)

### Base de Conocimiento del Producto

- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
