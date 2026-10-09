# Proyecciones del Plan Diario

El Plan Diario contiene Órdenes que se envían al Controlador y a los Agentes con varios días de anticipación por motivos de resiliencia. Además, ofrece proyecciones de las horas de inicio futuras de las Órdenes que se calculan para los próximos seis meses.

Los usuarios que deseen un período de proyección más largo pueden modificar la configuración relacionada en la página [Configuración - Plan Diario](/settings-daily-plan).

### Fechas, Períodos y Zonas Horarias

Las proyecciones están relacionadas con las fechas del Plan Diario, no con las fechas del calendario.

- Períodos
  - Si el período de 24 horas del Plan Diario comienza a medianoche, coincidirá con el día del calendario.
  - Para los períodos del Plan Diario que comienzan durante el día, el período de 24 horas se superpondrá con dos días del calendario.
- Zonas Horarias
  - Si las Planificaciones usan zonas horarias diferentes a las del Plan Diario, las horas de inicio de las Órdenes pueden superponerse con el día anterior o posterior. Tales Órdenes se muestran con la fecha del Plan Diario correspondiente, pero indican horas de inicio para una fecha diferente.
  - El uso de zonas horarias puede resultar en horas de inicio de -14 horas y +12 horas adicionales al período de 24 horas del Plan Diario. Sorprendentemente para algunos usuarios, un día no dura 24 horas, sino que puede abarcar hasta 50 horas. El período de un día siempre es de 24 horas, ya que depende de la rotación de la Tierra. Sin embargo, para una zona horaria determinada existe una cobertura de 50 horas para incluir todos los tiempos posibles alrededor del planeta.

Todas las fechas y horas se muestran en la zona horaria especificada en el perfil del usuario.

### Opciones de Visualización

Los usuarios pueden alternar entre las vistas *Mensual* y *Anual* de las Órdenes proyectadas usando los enlaces correspondientes en la esquina superior izquierda de la ventana.

Para cada día se muestran el número del día en el mes y el número de Órdenes proyectadas:

- **Órdenes en Verde**: Representan Órdenes que han sido enviadas al Controlador y a los Agentes.
- **Órdenes en Naranja**: Indican Órdenes proyectadas que se calculan en base a reglas de hora de inicio.
- **Proyección Invertida**:
  - *Sin marcar*: La proyección indica los días para los que se calculan Órdenes y el número de Órdenes. Los usuarios pueden hacer clic en un día individual para identificar las horas de inicio de las Órdenes.
  - *Marcado*: Al invertir la proyección, se resaltan los días para los que existen Planificaciones que no crearán Órdenes. Al hacer clic en el día correspondiente, se mostrarán las Planificaciones sin Órdenes.

### Filtro Avanzado

El filtro permite limitar la visualización de Órdenes a ciertas carpetas que contienen Workflows o Planificaciones.

## Operaciones en Proyecciones

### Crear Proyecciones

- Las proyecciones son calculadas por el Servicio de Plan Diario durante su ejecución diaria. Los cambios posteriores al Plan Diario durante el día no se reflejan.
- Los usuarios pueden recrear las proyecciones bajo demanda desde el botón correspondiente.
- La *Fecha de Relevamiento* indica la fecha de creación de la proyección actual del Plan Diario.

### Exportar Proyecciones

Las proyecciones pueden exportarse a un archivo .xlsx con la fecha del Plan Diario en el eje X y el Workflow y la Planificación en el eje Y.

- El acceso directo *Exportar* exportará las Órdenes visibles en la ventana.
- El botón *Exportar* ofrece seleccionar las Órdenes para exportar:
  - **Fecha Inicio**, **Fecha Fin**: Primera y última fecha del Plan Diario para las que se exportarán las Órdenes.
  - **Workflows**, **Planificaciones**: Los usuarios pueden limitar la exportación a ciertas Planificaciones y Workflows, opcionalmente limitados por carpetas.
  - **Proyección Invertida**:
    - *Sin marcar*: Exporta las fechas para las que se calculan Órdenes.
    - *Marcado*: Exporta las fechas para las que no se calculan Órdenes. Esto puede usarse para verificar si se consideran los días no laborables.

## Referencias

- [Plan Diario](/daily-plan)
- [Configuración - Plan Diario](/settings-daily-plan)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
