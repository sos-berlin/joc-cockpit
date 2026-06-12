# Configuración - Inventario - Calendarios

El *Panel de Calendarios* ofrece la especificación de Calendarios basados en reglas que son utilizados por las [Configuración - Inventario - Planificaciones](/configuration-inventory-schedules) para crear Órdenes desde el [Plan Diario](/daily-plan). Para más detalles véase [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars).

- Los Calendarios especifican los días para los cuales se ejecutarán los Workflows.
  - Los **Calendarios de Días Laborables** especifican los días para la ejecución del Workflow.
  - Los **Calendarios de Días No Laborables** especifican los días en que los Workflows no se ejecutarán.
- Las Planificaciones
  - contienen referencias a cualquier número de Calendarios de Días Laborables y Calendarios de Días No Laborables que se combinan para obtener la lista de días resultantes.
  - determinan el momento en que comenzarán las Órdenes para la ejecución del Workflow.

Los Calendarios se gestionan desde los siguientes paneles:

- El [Panel de Navegación - Configuración - Inventario](/configuration-inventory-navigation) en el lado izquierdo de la ventana ofrece navegación por carpetas que contienen Calendarios. Además, el panel ofrece operaciones sobre los Calendarios.
- El *Panel de Calendarios* en el lado derecho de la ventana contiene los detalles de configuración del Calendario.

## Panel de Calendarios

Para un Calendario están disponibles los siguientes campos de entrada:

- **Nombre** es el identificador único de un Calendario, véase [Reglas de Nomenclatura de Objetos](/object-naming-rules).
- **Título** contiene una explicación opcional del propósito del Calendario.
- **Tipo** es uno de Calendario de Días Laborables o Calendario de Días No Laborables.
- **Válido desde**, **Válido hasta** especifican opcionalmente el período de validez de un Calendario. Antes y después de la vigencia, un Calendario no devolverá días resultantes. Si no se especifica ningún período de validez, el Calendario será válido por tiempo indefinido.

### Frecuencias

Las Frecuencias vienen en dos variantes que pueden combinarse:

- Las **Frecuencias Incluidas** especifican días positivos.
- Las **Frecuencias Excluidas** especifican días que serán eliminados de la lista de días resultantes.

La implicación de las *Frecuencias Excluidas* es que deniegan el uso de las fechas especificadas y prevalecen sobre las *Frecuencias Incluidas* en los días coincidentes.

Considere el siguiente ejemplo de un Calendario de Días Laborables:

- Suponga una *Frecuencia Incluida* de Lun-Vie.
- Suponga una *Frecuencia Excluida* para Feriados Nacionales como el 1 de enero y el 1 de mayo.
- Cuando se usa con Planificaciones que especifican la propiedad **En Día No Laborable** con el valor:
  - **antes del día no laborable**
    - si el 1 de enero es lunes, la Orden se creará para el domingo anterior, que no forma parte de las *Frecuencias Incluidas* ni de las *Frecuencias Excluidas*.
    - si el 1 de enero es sábado, no se creará ninguna Orden ya que el día no laborable anterior es el viernes, para el cual se crea una Orden desde las *Frecuencias Incluidas*.
  - **después del día no laborable**
    - si el 1 de enero es sábado, la Orden se creará para el domingo siguiente, que no forma parte de las *Frecuencias Incluidas* ni de las *Frecuencias Excluidas*.
    - si el 1 de enero es domingo, no se creará ninguna Orden ya que el siguiente día no laborable es el lunes, para el cual se crea una Orden desde las *Frecuencias Incluidas*.

Para uso con Calendarios de Días No Laborables se aplican reglas correspondientes: las *Frecuencias Incluidas* especifican días no laborables y las *Frecuencias Excluidas* especifican días laborables.

Un Calendario puede contener cualquier número de *Frecuencias* que serán combinadas. El botón *Agregar Frecuencia* se ofrece tanto para *Frecuencias Incluidas* como para *Frecuencias Excluidas*.

#### Tipos de Frecuencia

Al agregar *Frecuencias*, se pueden seleccionar varios tipos:

  - **Días de la Semana** especifican el día de la semana.
  - **Días de la Semana Específicos** especifican días de la semana relativos, como el primer o último lunes de un mes.
  - **Días Específicos** especifican días del año.
  - **Días del Mes** especifican días relativos dentro de un mes, por ejemplo el primero o el último día del mes.
  - **Cada** especifica períodos recurrentes, por ejemplo cada 2do día, cada 1ra semana, cada 3er mes. Esto requiere especificar la fecha de *Válido Desde* a partir de la cual se contarán los días.
  - **Feriados Nacionales** especifican feriados públicos conocidos. Los días resultantes no son definitivos y pueden diferir de la legislación local.
  - **Calendarios de Días No Laborables** excluyen los días relacionados de los Calendarios de Días No Laborables para el Calendario actual.

Los *Tipos de Frecuencia* pueden combinarse aplicando repetidamente el mismo o diferentes *Tipos de Frecuencia*.

#### Ejemplo

Suponga el ejemplo de un Calendario que debe devolver cada 2do día hábil:

- Suponga que Lun-Vie son días hábiles y Sáb-Dom son días no laborables.
- Suponga Feriados Nacionales para el 1 de enero y el 1 de mayo.

El conteo de cada 2do día hábil debe excluir los fines de semana y los Feriados Nacionales:

- Cree un Calendario de Días Laborables usando:
  - *Frecuencias Incluidas*: Agregue el *Tipo de Frecuencia* **Días de la Semana** y seleccione *Todos los Días*. El resultado contendrá todos los días del año.
  - *Frecuencias Excluidas*: Agregue el *Tipo de Frecuencia* **Cada** y seleccione *2* para el intervalo y *Días* para la unidad. Especifique la fecha *Válido Desde*. Esto reduce a la mitad los días resultantes.
  - *Frecuencias Excluidas*: Agregue el *Tipo de Frecuencia* **Feriados Nacionales** y seleccione su *País* y *Año*. Esto limita aún más los días resultantes.

Verifique los resultados con el botón *Mostrar Vista Previa*, que debería mostrar cada 2do día hábil excluyendo fines de semana y Feriados Nacionales.

Una solución alternativa incluye especificar el *Tipo de Frecuencia* **Cada** desde la *Restricción* de una Planificación.

## Operaciones sobre Calendarios

Para las operaciones disponibles véase [Configuración - Inventario - Panel de Navegación](/configuration-inventory-navigation).

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Panel de Navegación](/configuration-inventory-navigation)
- [Configuración - Inventario - Planificaciones - Tiempo de Ejecución](/configuration-inventory-schedules-run-time)
- [Plan Diario](/daily-plan)
- [Reglas de Nomenclatura de Objetos](/object-naming-rules)

### Base de Conocimiento del Producto

- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
