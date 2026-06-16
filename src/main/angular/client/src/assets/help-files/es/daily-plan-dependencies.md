# Plan Diario - Dependencias

Las dependencias de Workflow pueden aplicarse para todos los días y para fechas específicas del Plan Diario; por ejemplo:

- El Workflow 1 se ejecuta de lunes a viernes.
- El Workflow 2 se ejecuta de lunes a domingo y depende de la ejecución previa del Workflow 1.
- Durante los fines de semana el Workflow 1 no se iniciará. Para permitir que el Workflow 2 se inicie los fines de semana, la dependencia se mapea al Plan Diario mediante el uso de *Tableros de Avisos Planificables*: si no se ha anunciado ninguna Orden para el Workflow 1, la dependencia se ignorará.

## Calendario

El widget de calendario ofrece la selección de una fecha del Plan Diario para la que se mostrarán las dependencias.

- **Color Rojo Claro**: Fechas de plan pasadas que están cerradas y que no permitirán agregar Órdenes.
- **Color Verde**: Fechas de plan pasadas y futuras que están abiertas y que permitirán agregar Órdenes.

Las operaciones sobre fechas de plan incluyen:

- **Open Plan**: Esto ocurre automáticamente si se agregan nuevas Órdenes para una fecha de plan. Los usuarios pueden reabrir un plan cerrado.
- **Close Plan**: Un plan abierto se cierra y no permitirá agregar Órdenes. Esto ocurre automáticamente para las fechas de plan pasadas con un retraso de un día. Los usuarios pueden ajustar la configuración relacionada desde la página [Configuración - Plan Diario](/settings-daily-plan). Los usuarios pueden cerrar un plan abierto antes de tiempo para evitar que se agreguen más Órdenes.

## Visualización de Dependencias

Se muestran los siguientes objetos:

- **Posting Workflow**: En el lado izquierdo se muestra el Workflow que publica Avisos.
- **Notice**: En la sección central se muestra el nombre del Tablero de Avisos que crea el Aviso.
- **Receiving Workflow**: En el lado derecho se muestra el Workflow que espera o consume el Aviso.

Se indican las siguientes relaciones:

- **Posting Workflow**: Crea uno o más Avisos que son esperados/consumidos por uno o más *Receiving Workflows*.
- **Receiving Workflow**: Espera/consume uno o más Avisos del mismo o de diferentes *Posting Workflows*.

El estado de cumplimiento de las dependencias se indica mediante líneas:

- **Línea en Color Azul**: Se ha anunciado un Aviso para un momento futuro en que la Orden del *Posting Workflow* se iniciará y creará el Aviso.
- **Línea en Color Verdoso**: La dependencia no está resuelta; se ha publicado un Aviso pero no ha sido procesado aún por todos los *Receiving Workflows*.
  - **Receiving Workflow en Color Verdoso**: La Orden del *Receiving Workflow* se ha iniciado pero no ha llegado a la instrucción del Workflow que verifica los Avisos.
  - **Receiving Workflow en Color Azul**: La Orden del *Receiving Workflow* está programada para iniciarse en un momento posterior durante el día.
- **Línea en Color Gris**: La dependencia está resuelta; el Aviso ha sido publicado y consumido por un *Receiving Workflow*.

## Filtros

Los filtros permiten limitar la visualización de Workflows y dependencias:

- **Notices Announced**: Muestra los Workflows para los que se han anunciado Avisos, es decir, las Órdenes están planificadas pero aún no se han iniciado y aún no han publicado el Aviso. Cuando se publica un Aviso, su anuncio se elimina.
- **Notices Present**: Muestra los Workflows para los que se han publicado Avisos y pueden ser procesados. Si un Aviso es consumido por un Workflow, se eliminará y ya no estará presente.

Si ambos botones de filtro están activos, esto incluye los Avisos anunciados y publicados, pero excluye las dependencias que han sido resueltas y cuyos Avisos han sido consumidos y ya no están presentes.

Si ambos botones de filtro están inactivos, se mostrarán todos los Workflows y dependencias, incluyendo los Avisos que han sido anunciados, que están presentes o que han sido consumidos.

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Tableros de Avisos](/configuration-inventory-notice-boards)
- [Plan Diario](/daily-plan)
- [Recursos - Tableros de Avisos](/resources-notice-boards)
- [Configuración - Plan Diario](/settings-daily-plan)

### Base de Conocimiento del Producto

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  - [JS7 - Schedulable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedulable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)
