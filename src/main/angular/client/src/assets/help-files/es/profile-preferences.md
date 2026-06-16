# Perfil - Preferencias

La página *Perfil - Preferencias* contiene la configuración de una cuenta de usuario.

Cuando un usuario se conecta a JOC Cockpit por primera vez, las preferencias de la *Cuenta de Usuario Predeterminada* se copian a las preferencias del usuario. La *Cuenta de Usuario Predeterminada* se especifica desde la página [Configuración - JOC Cockpit](/settings-joc).

## Roles

Se muestran los roles asignados a la cuenta de usuario. Los permisos resultantes se combinan desde las asignaciones de roles y están disponibles desde la pestaña [Perfil - Permisos del Perfil](/profile-permissions).

## Preferencias

Los usuarios pueden modificar las Preferencias a su criterio.

### Preferencias relacionadas con el Navegador

Las preferencias en esta sección utilizan los valores predeterminados del navegador en uso:

- **Idioma** es el idioma de la interfaz del JOC Cockpit, disponible en inglés, francés, alemán y japonés.
- **Zona Horaria** especifica la zona horaria a la que se convertirán todas las fechas mostradas en JOC Cockpit.
- **Formato de Fecha y Hora** ofrece la selección de una lista de formatos disponibles.

### Preferencias relacionadas con Listas

Las preferencias aplican a la visualización de listas en JOC Cockpit. Se deben considerar las siguientes implicaciones al aumentar los valores:

- Leer más datos desde JOC Cockpit no mejorará la capacidad de respuesta de la GUI.
- Las listas más largas aumentarán el consumo de memoria y CPU del navegador para la representación.

Encuentre los siguientes ajustes que pueden gestionarse con valores comunes desde el enlace *Límite de Grupo*:

- **Núm. máx. de entradas del Historial** aplica a la vista [Historial - Órdenes](/history-orders).
- **Núm. máx. de entradas del Registro de Auditoría** aplica a la vista [Registro de Auditoría](/audit-log).
- **Núm. máx. de entradas de Notificación** aplica a las vistas [Monitor - Notificaciones de Órdenes](/monitor-notifications-order) y [Monitor - Notificaciones del Sistema](/monitor-notifications-system).
- **Núm. máx. de entradas de Vista General de Órdenes** aplica a la vista [Vista General de Órdenes](/orders-overview).
- **Núm. máx. de entradas del Plan Diario** aplica a la vista [Plan Diario](/daily-plan).
- **Núm. máx. de Órdenes por Workflow** limita el número de Órdenes disponibles en la vista [Workflows](/workflows).
- **Núm. máx. de entradas de Transferencia de Archivos** aplica a la vista [Historial - Transferencias de Archivos](/history-file-transfers).
- **Núm. máx. de Órdenes por Recurso de Lock** limita el número de Órdenes mostradas en la vista [Recursos - Recursos de Lock](/resources-resource-locks).
- **Núm. máx. de Órdenes por Tablero de Avisos** limita el número de Órdenes mostradas en la vista [Recursos - Tableros de Avisos](/resources-notice-boards).

### Preferencias de la Vista de Workflows

Las preferencias aplican a la vista [Workflows](/workflows):

- **Núm. máx. de entradas del Historial de Órdenes por Workflow** limita el número de entradas en el panel *Historial de Órdenes*.
- **Núm. máx. de entradas del Historial de Jobs por Workflow** limita el número de entradas en el panel *Historial de Tareas*.
- **Núm. máx. de entradas del Registro de Auditoría por objeto** limita el número de entradas en el panel *Registro de Auditoría*.

### Preferencias de la Vista de Configuración - Inventario

- **Núm. máx. de entradas de Favoritos** limita la visualización de favoritos, por ejemplo, al asignar un Agente a un Job.

### Preferencias de Paginación

Las preferencias aplican a la paginación en cualquier página:

- **Núm. máx. de entradas por página** limita el número de entradas visibles en una sola página.
- **Núm. predeterminado de entradas por página** especifica el valor predeterminado que puede ser uno de 10, 25, 50, 100, 1000.

### Preferencias de Tema

- **Cambiar Tema** ofrece cambiar entre temas. Algunos temas se proporcionan para mayor contraste, lo que puede ser más adecuado para usuarios con discapacidades visuales.
  - **Cambiar Color de estados de Órdenes** está disponible desde un icono a la derecha de *Cambiar Tema* y ofrece cambiar los colores predeterminados para los [Estados de Órdenes](/order-states). Puede resultar confuso cambiar colores que se representan de forma diferente en la documentación de JS7. Sin embargo, los usuarios con discapacidades visuales pueden considerar esto útil: los usuarios pueden especificar valores RGB para cada color utilizado para un estado de Orden.
- **Color de la Barra de Menú** está disponible si se usa el tema *Claro*. Esto permite cambiar el color de fondo de la barra de menú. El ajuste puede aplicarse, por ejemplo, si los usuarios trabajan con entornos JS7 separados para dev, test, prod: usar diferentes colores de fondo ayuda a identificar el entorno JS7 relacionado.
- **Título del Tema** se muestra justo debajo de la barra de menú. De manera similar al *Color de la Barra de Menú*, esto puede usarse para identificar el entorno JS7 relacionado.

### Preferencias del Editor

- **Tamaño de Tabulación** se usa en la pestaña [Configuración - Inventario - Workflow - Propiedades del Job](/configuration-inventory-workflow-job-properties) al editar el *Script del Job*. El ajuste especifica el número de espacios que corresponden al tamaño al presionar la tecla TAB.

### Preferencias de Vista

- **Mostrar Logs** especifica la visualización de la [Vista del Log de Orden](/order-log) y la [Vista del Log de Tarea](/task-log). Ambas vistas de log ofrecen visualización y descarga de logs.
- **Mostrar Documentaciones** especifica la visualización de documentación de usuario para Workflows y Jobs.

### Preferencias de Vista de Configuración

- **Mostrar subcarpetas y contenido de carpetas** rige el comportamiento al hacer clic en una carpeta en el *Panel de Navegación* de la vista *Configuración->Inventario* para mostrar solo los objetos disponibles o para mostrar los objetos disponibles y las subcarpetas.

### Preferencias Mixtas

- **Mostrar Archivos inmediatamente en la vista de Transferencia de Archivos** es útil si cada transferencia de archivos incluye un número previsible de archivos. Para transferencias individuales que pueden incluir miles de archivos, podría ser preferible deshabilitar el ajuste.
- **Habilitar Motivos para el Registro de Auditoría** obligará al usuario a especificar un motivo al modificar objetos como agregar o cancelar Órdenes, suspender Workflows, etc. El ajuste del usuario puede ser anulado por la [Configuración - JOC Cockpit](/settings-joc) relacionada.
- **Usar zona horaria para marcas de tiempo del log** es aplicable cuando los Agentes se ejecutan en servidores en diferentes zonas horarias o diferentes a la zona horaria del servidor del Controlador. En esta situación, un log de Orden que contiene salida de log de varios Jobs ejecutados posiblemente con diferentes Agentes puede resultar confuso. El ajuste convierte las marcas de tiempo del log a la *Zona Horaria* especificada en el perfil del usuario.
- **Controlador Actual** aplica cuando más de un Controlador está conectado a JOC Cockpit. La opción se ofrece en varias vistas, por ejemplo, la vista [Historial - Órdenes](/history-orders). Cuando está marcado, limita la visualización a Órdenes enviadas al Controlador seleccionado actualmente; de lo contrario, mostrará Órdenes de cualquier Controlador conectado. El ajuste determina el valor predeterminado para las opciones *Controlador Actual* relacionadas en las vistas de JOC Cockpit.
- **Suprimir tooltips para objetos del Inventario** se relaciona con la vista *Configuración->Inventario* que ofrece tooltips, por ejemplo, para [Configuración - Inventario - Workflow - Propiedades del Job](/configuration-inventory-workflow-job-properties). Los tooltips aparecerán si el ratón se mueve a la etiqueta de un campo de entrada para asistir a los usuarios explicando la entrada posible. Si bien esto es útil para usuarios que no están muy familiarizados con JS7, los tooltips pueden no ser necesarios para usuarios con experiencia.
- **Advertencia de Licencia reconocida** se refiere al uso de licencias de suscripción que típicamente están limitadas a un año. Antes del vencimiento de la licencia, el JOC Cockpit mostrará advertencias relacionadas. Los usuarios pueden optar por suprimir las advertencias de vencimiento de licencia relacionadas. Para más detalles, consulte [JS7 - How to manage License Expiration Warnings](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+manage+License+Expiration+Warnings).
- **Mostrar más opciones** activa el botón deslizante relacionado en la vista *Configuración->Inventario*. Ofrece opciones más detalladas para la configuración de Jobs, por ejemplo, en la pestaña [Configuración - Inventario - Workflow - Opciones del Job](/configuration-inventory-workflow-job-options).
- **Contraer variable de lista** aplica a la vista [Configuración - Inventario - Workflows](/configuration-inventory-workflows) que ofrece la especificación de Variables de Workflow desde varios tipos de datos. Si se usa el tipo de datos *Lista* (array), puede contener una mayor cantidad de entradas. Es posible que los usuarios no quieran ver las variables de lista expandidas de inmediato al editar un Workflow.

### Preferencias de Tipo de Vista

- **Mostrar Vista** aplica a varias vistas que ofrecen el indicador relacionado desde la esquina superior derecha de la ventana. El ajuste especifica el tipo de vista que se usará por defecto. Los usuarios pueden cambiar el tipo de vista bajo demanda en cualquier vista. El tipo de vista *Tarjeta* requiere más espacio en la pantalla que el tipo de vista *Lista*. Sin embargo, algunos usuarios pueden preferir la visibilidad de las tarjetas.
- **Mostrar Vista General de Órdenes** es similar al ajuste *Mostrar Vista* pero aplica a la vista [Vista General de Órdenes](/orders-overview). Además, la vista ofrece el tipo de vista *Bloque* que permite hacer transiciones de Órdenes desde operaciones en bloque.

### Preferencias de Diseño de Workflow

Las preferencias aplican a la visualización de instrucciones de Workflow en la vista [Configuración - Inventario - Workflows](/configuration-inventory-workflows):

- **Orientación** ofrece cambiar la visualización de Workflows a presentación vertical u horizontal. Trabajar con una pantalla ancha usando *Orientación* horizontal aporta beneficios al diseñar Workflows con un mayor número de Jobs y otras instrucciones de Workflow.
- **Espaciado entre Instrucciones en capas adyacentes** ofrece modificar el espaciado entre instrucciones de Workflow verticales.
- **Espaciado entre Instrucciones en la misma capa** ofrece modificar el espaciado entre instrucciones de Workflow horizontales.
- **Bordes Redondeados para Conexiones** aplanará los bordes en la visualización de instrucciones de Workflow, por ejemplo, de Jobs.

## Referencias

### Ayuda de Contexto

- [Registro de Auditoría](/audit-log)
- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
  - [Configuración - Inventario - Workflow - Opciones del Job](/configuration-inventory-workflow-job-options)
  - [Configuración - Inventario - Workflow - Propiedades del Job](/configuration-inventory-workflow-job-properties)
- [Plan Diario](/daily-plan)
- [Historial - Transferencias de Archivos](/history-file-transfers)
- [Historial - Órdenes](/history-orders)
- [Vista del Log de Orden](/order-log)
- [Estados de Órdenes](/order-states)
- [Vista General de Órdenes](/orders-overview)
- [Perfil](/profile)
   - [Perfil - Permisos del Perfil](/profile-permissions)
- [Recursos - Tableros de Avisos](/resources-notice-boards)
- [Recursos - Recursos de Lock](/resources-resource-locks)
- [Configuración - Plan Diario](/settings-daily-plan)
- [Configuración - JOC Cockpit](/settings-joc)
- [Vista del Log de Tarea](/task-log)
- [Workflows](/workflows)

### Base de Conocimiento del Producto

- [JS7 - Audit Log](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Log)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - File Transfer History](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Transfer+History)
- [JS7 - How to manage License Expiration Warnings](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+manage+License+Expiration+Warnings)
- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Order State Transitions](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+State+Transitions)
- [JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
