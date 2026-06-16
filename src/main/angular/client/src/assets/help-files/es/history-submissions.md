# Historial de Envíos

El *Historial de Envíos* registra las Órdenes enviadas desde el [Plan Diario](/daily-plan).

Las Órdenes son creadas por el Plan Diario en dos pasos: primero son *planificadas*, luego son *enviadas* al Controlador y a los Agentes. El envío implica que las Órdenes se iniciarán de forma autónoma con los Agentes.

El *Historial de Envíos* está sujeto a la depuración de la base de datos realizada por el [Servicio de Limpieza](/service-cleanup).

## Panel de Historial

La visualización se agrupa en bloques por fecha del Plan Diario, por Envío y por las Órdenes incluidas.

La visualización está limitada a un máximo de 5000 entradas salvo que se especifique lo contrario desde [Perfil - Preferencias](/profile-preferences).

### Historial del Plan Diario

Se muestra la siguiente información por fecha del Plan Diario:

- **Fecha del Plan Diario** indica el día para el que están programadas las Órdenes.
- **Total** indica la cantidad de Órdenes sujetas a todos los Envíos para la fecha indicada.
- **Cantidad de Envíos** indica la cantidad de Órdenes enviadas exitosamente.
  - Si la cantidad corresponde al *Total*, entonces todas las Órdenes fueron enviadas exitosamente.
  - Si la cantidad es mayor que cero pero menor que el *Total*, entonces
    - la configuración para enviar Órdenes individualmente está vigente, consulte [Configuración - Plan Diario](/settings-daily-plan), y
    - un número de Órdenes no pudo ser enviado.
  - Si la cantidad es cero, esto indica
    - que la configuración para enviar Órdenes individualmente no está vigente, consulte [Configuración - Plan Diario](/settings-daily-plan), y/o
    - que falló el envío de todas las Órdenes.

### Historial de Envíos

Puede haber cualquier número de Envíos para una fecha determinada del Plan Diario. Cuando los usuarios despliegan cambios en los objetos del inventario, como Workflows y Planificaciones, y eligen la opción de actualizar el Plan Diario, se agrega un Envío para los objetos indicados.

Al hacer clic en el icono de flecha hacia abajo desde la *Fecha del Plan Diario*, se mostrarán los detalles por Envío:

- **Total del Envío** indica la cantidad de Órdenes sujetas al Envío indicado.
- **Cantidad de Envíos** indica la cantidad de Órdenes enviadas exitosamente en el ámbito del Envío indicado.
  - Si la cantidad corresponde al *Total del Envío*, entonces todas las Órdenes fueron enviadas exitosamente.
  - Si la cantidad es cero o mayor que cero, se aplican las explicaciones anteriores sobre los Envíos por fecha del Plan Diario.

### Historial de Envíos por Orden

Al hacer clic en el icono de flecha hacia abajo desde la *Fecha de Envío*, se mostrarán los detalles por Orden:

- **Mensaje** puede indicar un mensaje de error en caso de Envío fallido.
- **ID de Orden** es el identificador único asignado a una Orden.
- **Workflow** indica el Workflow por el que pasó la Orden.
  - Al hacer clic en el nombre del Workflow se navega a la vista [Workflows](/workflows).
  - Al hacer clic en el icono del lápiz se navega a la vista [Configuración - Inventario - Workflows](/configuration-inventory-workflows).
- **Programado Para** indica la fecha y hora para la que se espera que comience la Orden.
- **Estado** es uno de *Enviado* o *No Enviado*.
  - *Enviado* indica que la Orden está disponible con un Agente.
  - *No Enviado* indica un Envío fallido.

## Filtros

Los usuarios pueden aplicar los filtros disponibles en la parte superior de la ventana para limitar la visualización de fechas del Plan Diario y de Envíos.

- Los botones de filtro **Enviado**, **No Enviado** limitan la visualización a los Envíos con el estado correspondiente.
- Los botones de filtro **Rango de Fechas** ofrecen la posibilidad de elegir el rango de fechas para la visualización de Envíos.
- La casilla de verificación **Controlador Actual** limita los Envíos al Controlador seleccionado actualmente.

## Referencias

### Ayuda Contextual

- [Servicio de Limpieza](/service-cleanup)
- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
- [Plan Diario](/daily-plan)
- [Perfil - Preferencias](/profile-preferences)
- [Configuración - Plan Diario](/settings-daily-plan)
- [Workflows](/workflows)

### Base de Conocimiento del Producto

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
