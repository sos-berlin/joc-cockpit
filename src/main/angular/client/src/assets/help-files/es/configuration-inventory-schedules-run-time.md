# Configuración - Inventario - Planificaciones - Tiempo de Ejecución

El *Panel de Planificaciones* permite especificar reglas para crear Órdenes desde el [Plan Diario](/daily-plan).

El botón *Tiempo de Ejecución* permite especificar los horarios de inicio de las Órdenes desde una ventana emergente: primero se asigna un Calendario, luego se especifican los períodos y opcionalmente se aplican restricciones.

## Zona Horaria

Los tiempos de ejecución se especifican desde una **Zona Horaria** que se toma del [Perfil - Preferencias](/profile-preferences) del usuario. Para la entrada se aceptan identificadores de zona horaria como *UTC*, *Europe/London*, etc. Para una lista completa de identificadores de zona horaria ver [List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

- Los horarios de inicio de las Órdenes se consideran en la zona horaria especificada.
- Es posible usar una zona horaria diferente a la de [Configuración - Plan Diario](/settings-daily-plan) para los tiempos de ejecución de las Órdenes. Los usuarios deben tener en cuenta que:
  - Las Órdenes se asignan a una fecha del Plan Diario.
  - Los horarios de inicio se calculan desde la zona horaria de la Planificación.
- Como resultado, el Plan Diario puede contener Órdenes para una fecha determinada que se superponen con el día anterior o posterior. Por ejemplo:
  - asuma que la zona horaria del Plan Diario es UTC,
  - asuma que la zona horaria de la Planificación es Asia/Calcutta (UTC+05:30) y el horario de inicio es *23:00*,
  - si se crea una Orden para el Plan Diario del martes, indicará un horario de inicio para el miércoles a las *04:30* UTC. El resultado es correcto pero puede resultar confuso para usuarios que no están familiarizados con las zonas horarias.

Para algunos usuarios puede resultar sorprendente que un día no tiene 24 horas, sino que puede abarcar hasta 50 horas. El período de un día siempre es de 24 horas, ya que depende de la rotación de la Tierra. Sin embargo, para cualquier zona horaria dada existe una cobertura de 50 horas para incluir todos los horarios posibles alrededor del planeta.

## Asignación de Calendario

Primero se debe asignar un Calendario:

- **Calendario de Días Laborables** está disponible desde un botón con el mismo nombre y especifica los días para los cuales se deben crear Órdenes. Cuando se usa repetidamente, agregará entradas de tiempo de ejecución con períodos por Calendario de Días Laborables.
- **Calendario de Días No Laborables** está disponible desde un botón con el mismo nombre y permite especificar los días para los cuales no se deben crear Órdenes. Se puede agregar cualquier número de Calendarios de Días No Laborables que se fusionarán.

## Períodos

A continuación, se deben especificar uno o más períodos para los horarios de inicio. El campo de entrada *Intervalo de Repetición* ofrece las siguientes opciones:

- **Inicio Único** es un único punto en el tiempo.
  - **Horario de Inicio** se especifica usando la sintaxis *HH:MM:SS*.
  - **En Día No Laborable** especifica qué debe ocurrir si un período coincide con un día indicado por un Calendario de Días No Laborables.
    - **suprimir ejecución** es el comportamiento predeterminado para no crear una Orden.
    - **ignorar día no laborable** anula el Calendario de Días No Laborables y crea una Orden.
    - **antes del día no laborable** agrega una Orden al siguiente día laborable anterior al día no laborable. Por ejemplo:
      - Un Calendario de Días Laborables especifica lun-jue como días laborables.
      - Un Calendario de Días No Laborables indica un lunes específico del año como día no laborable.
      - El siguiente día anterior al día no laborable será el domingo anterior. Si los fines de semana están excluidos y se agregan al Calendario de Días No Laborables, el día resultante será el viernes anterior.
    - **después del día no laborable** agrega una Orden al siguiente día laborable posterior al día no laborable. Por ejemplo:
      - Un Calendario de Días Laborables especifica mar-vie como días laborables.
      - Un Calendario de Días No Laborables indica un viernes específico del año como día no laborable.
      - El siguiente día posterior al día no laborable será el sábado siguiente. Si los fines de semana están excluidos y se agregan al Calendario de Días No Laborables, el día resultante será el lunes siguiente.
- **Repetición** especifica un período repetido para Órdenes Cíclicas. Para la entrada se usa la siguiente sintaxis: *HH:MM:SS*.
  - **Tiempo de Repetición** es el intervalo entre ciclos, por ejemplo *02:00* para ciclos de 2 horas.
  - **Inicio** es el horario de inicio del primer ciclo, por ejemplo *06:00* para las 6am.
  - **Fin** es el horario de finalización del último ciclo, por ejemplo *22:00* para las 10pm.
  - **En Día No Laborable** especifica qué debe ocurrir si un período coincide con un día indicado por un Calendario de Días No Laborables. La configuración es la misma que para los períodos de *Inicio Único*.

## Restricciones

Las *Restricciones* se usan para limitar los días para los cuales se crearán Órdenes:

- Los Calendarios de Días Laborables y No Laborables asignados se fusionan para obtener los días resultantes para la ejecución de Workflows por Órdenes.
- Las Restricciones se aplican adicionalmente y contienen reglas similares a las de [Configuración - Inventario - Calendarios](/configuration-inventory-calendars):
  - **Días de la Semana** especifica el día de la semana.
  - **Días de la Semana Específicos** especifica días de la semana relativos como el primer o último lunes del mes.
  - **Días Específicos** especifica días del año.
  - **Días del Mes** especifica días relativos en un mes, por ejemplo el primer o último día del mes.
  - **Cada** especifica períodos recurrentes, por ejemplo cada 2 días, cada 1 semana, cada 3 meses. Esto requiere especificar la fecha *Válido Desde* a partir de la cual se contarán los días.
  - **Feriados Nacionales** especifica feriados públicos conocidos. Los días resultantes no son vinculantes y pueden diferir de la legislación local.
  - **Calendarios de Días No Laborables** excluye los días relacionados de los Calendarios de Días No Laborables para el Calendario actual.

Las *Restricciones* permiten limitar el número de Calendarios en uso. En lugar de crear Calendarios individuales para reglas específicas como el primer día del mes, los usuarios pueden aplicar un Calendario estándar que cubra todos los días del año y aplicar la *Restricción* deseada.

El uso de Calendarios de Días No Laborables es diferente cuando se asignan al *Tiempo de Ejecución* y cuando se asignan a la *Restricción*:

- Ejemplo:
  - Asuma un Calendario de Días Laborables lun-vie.
  - Asuma una *Restricción* de Planificación para el *4to del mes*.
  - Los días resultantes se calculan a partir del Calendario de Días Laborables y el 4to día de la lista resultante de días.
- Las Planificaciones también pueden contener referencias a Calendarios de Días No Laborables.
  - Los Calendarios de Días No Laborables se aplican *después* del cálculo de cada *Restricción* de la Planificación.
  - Si los usuarios desean excluir ciertos días no laborables del Calendario *antes* de que se aplique la *Restricción* del *4to del mes*, tienen la opción de:
    - especificar días no laborables desde las *Frecuencias Excluidas* del Calendario de Días Laborables.
    - especificar días desde Calendarios de Días No Laborables que se agregan a la *Restricción*.

## Órdenes Cíclicas vs. Workflows Cíclicos

Los usuarios deben considerar las implicaciones de las Órdenes Cíclicas: crean instancias de Orden individuales por ciclo. Como alternativa a las Órdenes Cíclicas creadas por Planificaciones usando intervalos de repetición, la [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction) está disponible para Workflows Cíclicos.

- Ejecución
  - Una *Instrucción Cycle* que abarca un Workflow completo es equivalente al uso de Órdenes Cíclicas desde una Planificación.
  - Una *Instrucción Cycle* puede usarse para ejecutar partes de un Workflow en ciclos.
- Eficiencia
  - Las Planificaciones crean varias instancias de Orden por cada período de una Orden Cíclica. Ejecutar un único Workflow cada 30s genera hasta 2880 Órdenes por día.
  - Las *Instrucciones Cycle* causan la ejecución cíclica de un Workflow desde una única Orden.
  - El procesamiento de Workflows Cíclicos es considerablemente más eficiente que el procesamiento de Órdenes Cíclicas.
- Manejo de Errores
  - Fallos
    - Si un Job en un Workflow falla, esto ocurrirá individualmente para cada instancia de Orden de una Orden Cíclica.
    - Si un Job dentro de una *Instrucción Cycle* falla, entonces, dependiendo del manejo de errores implementado, cualquier ciclo que deba ocurrir mientras una Orden está en estado *fallido* será omitido.
  - Notificación
    - Para cada instancia de Orden fallida de una Orden Cíclica se crea una Notificación.
    - Para la única Orden de un Workflow Cíclico se crea una única Notificación.
  - Intervención
    - Cualquier operación sobre Órdenes Cíclicas se aplica a todas las instancias de Orden incluidas, por ejemplo, reanudar la ejecución después de un fallo. Esto resulta en la ejecución paralela de Órdenes previamente programadas para ejecución en intervalos.
    - Para Workflows Cíclicos existe una única Orden que espera la intervención del usuario.
- Registro
  - Para cada instancia de Orden de una Orden Cíclica se crea una entrada separada en el [Historial de Órdenes](/history-orders) y en el [Historial de Tareas](/history-tasks).
  - Para un Workflow Cíclico existe una única entrada en el Historial de Órdenes a la que se añade la salida del Log de cada ciclo. Se agregan entradas individuales por ejecución de Job al Historial de Tareas.

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Calendarios](/configuration-inventory-calendars)
- [Configuración - Inventario - Planificaciones](/configuration-inventory-schedules)
- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
- [Plan Diario](/daily-plan)
- [Servicio de Plan Diario](/service-daily-plan)
- [Reglas de Nomenclatura de Objetos](/object-naming-rules)
- [Historial de Órdenes](/history-orders)
- [Perfil - Preferencias](/profile-preferences)
- [Configuración - Plan Diario](/settings-daily-plan)
- [Historial de Tareas](/history-tasks)

### Base de Conocimiento del Producto

- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
- [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
- [List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
