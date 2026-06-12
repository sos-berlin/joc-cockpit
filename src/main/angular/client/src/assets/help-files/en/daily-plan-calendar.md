# Plan Diario - Calendario

Desde el Calendario del Plan Diario están disponibles varias operaciones.

Para las operaciones generales disponibles desde el Plan Diario, consulte [Plan Diario](/daily-plan).

## Selección de Fecha Individual

Al hacer clic en una fecha del calendario se mostrarán las Órdenes disponibles para la fecha seleccionada.

## Selección de Múltiples Fechas

Para seleccionar varias fechas:

- mantenga el ratón presionado y arrastre para seleccionar el rango de fechas,
- o presione la tecla Ctrl y seleccione la fecha de inicio y la fecha de fin con clic del ratón,
- o haga clic en el icono del calendario y seleccione la fecha de inicio y la fecha de fin con clic del ratón.

Las fechas seleccionadas se resaltarán y los botones *Remove Order* y *Cancel Order* estarán disponibles debajo del menú principal.

Los siguientes botones de filtro limitan el alcance de las operaciones:

- **All**: La operación puede aplicarse a Órdenes con cualquier estado.
- **Planned**: Las operaciones *submit* y *remove* pueden aplicarse a Órdenes *planificadas* que no han sido *enviadas* al Controlador.
- **Submitted**: La operación *cancel* puede aplicarse a Órdenes *enviadas* al Controlador y a los Agentes.
- **Finished**: La operación *cancel* puede aplicarse a Órdenes que hayan finalizado.
- **Late** es un filtro adicional sobre los estados de las Órdenes que indica que las Órdenes se iniciaron más tarde de lo esperado.

### Cancelar Órdenes

- Cuando se aplica a Órdenes *enviadas* en el rango de fechas seleccionado, las Órdenes serán recuperadas del Controlador y los Agentes.
- Cuando se aplica a Órdenes *enviadas* o *finalizadas*, las Órdenes se establecerán al estado *planificado*.
- La operación se ignora para Órdenes *planificadas*.

### Eliminar Órdenes

- Cuando se aplica a Órdenes *planificadas*, las Órdenes se eliminarán del Plan Diario.
  - Cuando se eliminan Órdenes de una fecha del Plan Diario, no se ejecutarán y el Servicio del Plan Diario no intentará agregar Órdenes para esa fecha.
  - La operación *Delete Daily Plan* implícitamente eliminará Órdenes. Además, se eliminarán los envíos para la fecha del Plan Diario indicada y la próxima ejecución del Servicio del Plan Diario planificará Órdenes para esa fecha; consulte [Eliminar Plan Diario](#delete-daily-plan).
- La operación se ignora para Órdenes *enviadas* y *finalizadas*.

### Crear Plan Diario

La operación está disponible desde un botón debajo del widget de calendario para una fecha individual y para un rango de fechas.

- Para los días seleccionados se creará el Plan Diario.
  - Los usuarios tienen la opción de crear todas las Órdenes o Órdenes de Planificaciones y Workflows seleccionados, opcionalmente limitados por carpetas.
  - Los usuarios pueden especificar reemplazar las Órdenes existentes de las mismas Planificaciones y enviar las Órdenes inmediatamente al Controlador.
  - Los usuarios pueden incluir Órdenes de Planificaciones que no están configuradas para ser consideradas por el Servicio del Plan Diario.
- Si se crea el Plan Diario para una fecha determinada, la próxima ejecución del Servicio del Plan Diario no planificará Órdenes adicionales para esa misma fecha. Sin embargo, el servicio enviará las Órdenes *planificadas* en el ámbito de los días adelantados para los que deben enviarse Órdenes; consulte la página [Configuración - Plan Diario](/settings-daily-plan).

### Eliminar Plan Diario

La operación está disponible desde un botón debajo del widget de calendario para una fecha individual y para un rango de fechas.

- Para los días seleccionados se eliminará el Plan Diario, siempre que no haya Órdenes *enviadas* o *finalizadas* disponibles. Si hay Órdenes *planificadas* disponibles, se descartarán junto con el Plan Diario.
- Si se elimina el Plan Diario para una fecha determinada, la próxima ejecución del Servicio del Plan Diario planificará Órdenes para esa fecha, siempre que la fecha esté dentro del ámbito de los días adelantados para los que se planifican Órdenes; consulte [Configuración - Plan Diario](/settings-daily-plan).

## Referencias

- [Plan Diario](/daily-plan)
- [Configuración - Plan Diario](/settings-daily-plan)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
