# Configuración - JOC Cockpit

Las siguientes configuraciones se aplican al JOC Cockpit. Los cambios tienen efecto inmediato.

La página de *Configuración* es accesible desde el ícono ![ícono de rueda](assets/images/wheel.png) en la barra de menú.

## Configuración del Registro de Auditoría

### Configuración: *force\_comments\_for\_audit\_log*, Predeterminado: *false*

Especifica que se debe agregar un motivo al [Registro de Auditoría](/audit-log) para cualquier cambio aplicado a objetos, como agregar una Orden, cancelar una Orden, etc.

Esto aplica a operaciones desde la interfaz gráfica y a operaciones desde la [REST Web Service API](/rest-api).
Especificar el valor *true* para esta configuración obliga a cualquier solicitud de API que modifique objetos a proporcionar argumentos para el Registro de Auditoría.

Tenga en cuenta que las [Preferencias del Perfil](/profile-preferences) incluyen una configuración relacionada para Habilitar Motivos para el Registro de Auditoría que tiene el mismo efecto. Sin embargo, su uso es voluntario y está restringido a la cuenta del perfil. La configuración force\_comments\_for\_audit\_log impone este comportamiento para cualquier cuenta de usuario independientemente de la configuración del perfil de cada cuenta.

### Configuración: *comments\_for\_audit\_log*

Especifica una lista de posibles comentarios para que el usuario los seleccione al realizar una operación de interfaz gráfica que modifica un objeto. Además de usar las entradas de la lista, los usuarios son libres de usar comentarios individuales al realizar dichas operaciones.

La lista se rellena con algunos motivos bien conocidos para modificaciones de objetos. Los usuarios son libres de modificar las entradas de la lista y agregar sus propias entradas para posibles comentarios.

### Configuración: *default\_profile\_account*, Predeterminado: *root*

Cuando se agregan cuentas de usuario al JOC Cockpit mediante los [Servicios de Identidad](/identity-services), se crearán [Preferencias del Perfil](/profile-preferences) con configuraciones individuales para cada cuenta de usuario.

- Esta configuración especifica la cuenta que se usa como plantilla para el perfil cuando se crean cuentas de usuario.
- De forma predeterminada, se usa la cuenta *root*, lo que significa que el perfil de una nueva cuenta se rellena con configuraciones como idioma, tema, etc. de la cuenta de perfil predeterminada.

## Configuración de Inicio de Sesión

### Configuración: *enable\_remember\_me*, Predeterminado: *true*

Esta configuración habilita la casilla de verificación *Recordarme* disponible en la ventana de inicio de sesión, que almacena las credenciales del usuario, como cuenta y contraseña, en una cookie del sitio. Como resultado, la cuenta de usuario y la contraseña se rellenan automáticamente en el próximo inicio de sesión.

- Algunos usuarios pueden considerar un riesgo de seguridad almacenar credenciales en datos del navegador.
- Esta configuración puede deshabilitarse para no ofrecer el almacenamiento de credenciales de usuario.

## Configuración del Inventario

### Configuración: *copy\_paste\_suffix*, *copy\_paste\_prefix*, Predeterminado: *copy*

Especifica el prefijo/sufijo que se utilizará para los nombres de objetos al realizar operaciones de copiar y pegar en la interfaz gráfica del JOC Cockpit.

- En el inventario de JS7, los nombres de los objetos son únicos para cada tipo de objeto: por ejemplo, los Workflows usan nombres únicos; sin embargo, un Recurso de Job puede usar el mismo nombre que un Workflow.
- Por lo tanto, se debe crear un nuevo nombre de objeto al realizar operaciones de copiar y pegar. Esto se logra agregando un prefijo o sufijo que los usuarios pueden elegir.

### Configuración: *restore\_suffix*, *restore\_prefix*, Predeterminado: *restored*

Cuando los objetos del inventario se eliminan, se agregan a la papelera del inventario.

- Cuando se restauran objetos eliminados desde la papelera del inventario, el nombre del objeto original podría estar siendo usado por algún objeto más nuevo.
- Esta configuración permite al usuario especificar los valores de prefijo y sufijo que se usarán al restaurar objetos desde la papelera.

### Configuración: *import\_suffix*, *import\_prefix*, Predeterminado: *imported*

Las operaciones de exportación e importación del inventario de JS7 permiten importar objetos desde un archivo de archivo.

- Cuando se importan objetos, sus nombres podrían entrar en conflicto con nombres de objetos existentes.
- Esta configuración permite al usuario especificar los valores de prefijo y sufijo que se usarán al importar objetos.

## Configuración de Vistas

### Configuración: *show\_view\_\**

Estas configuraciones pueden usarse para deshabilitar vistas individuales disponibles en la interfaz gráfica del JOC Cockpit mediante elementos del menú principal como Plan Diario, Monitor, Workflows, etc.

- Esta configuración funciona independientemente de los roles y permisos predeterminados.
- Como resultado, una cuenta de usuario puede tener permisos para ver datos desde la vista del Monitor, aunque la vista no se ofrezca desde la interfaz gráfica. Al mismo tiempo, los datos de la vista del Monitor estarán disponibles para esta cuenta al usar la [REST Web Service API](/rest-api).

### Configuración: *display\_folders\_in\_views*, Predeterminado: *true*

Especifica que en vistas como *Workflows*, *Plan Diario*, *Recursos - Calendarios*, *Recursos - Recursos de Lock*, *Recursos - Tableros de Avisos* se muestran los nombres y rutas de los objetos de planificación. Si se usa el valor *false* para esta configuración, la ruta se omite de la visualización de objetos. En JS7, cualquier nombre de objeto es único.

## Configuración del Controlador

### Configuración: *controller\_connection\_joc\_password*, *controller\_connection\_history\_password*

JS7 ofrece una configuración consistente sin uso de contraseñas. Esto incluye la conexión del JOC Cockpit a los Controladores, que puede asegurarse mediante autenticación mutua HTTPS de servidor y cliente. Si los usuarios no desean configurar autenticación mutua para las conexiones del Controlador, se debe usar una contraseña para identificar el JOC Cockpit con el Controlador.

Esto aplica a dos conexiones establecidas desde el JOC Cockpit a los Controladores, reflejadas por configuraciones separadas para *controller\_connection\_joc\_password* y *controller\_connection\_history\_password*:

- La interfaz gráfica del JOC Cockpit usa una conexión para recibir eventos, por ejemplo sobre transiciones de estado de Órdenes.
- El Servicio de Historial está conectado a un Controlador para recibir información de historial, como el estado de ejecución de Jobs y cualquier salida de log de Jobs.

La contraseña se especifica como texto plano en la página de Configuración y como valor hasheado en el archivo private.conf del Controlador.

El enlace **Mostrar Valor Hasheado** está disponible en la página de Configuración y permite mostrar el valor hasheado de la contraseña.

Si se modifica una contraseña en la página de Configuración, también debe modificarse en el archivo private.conf del Controlador para que las contraseñas coincidan.

Se recomienda modificar primero la contraseña en el archivo private.conf de la instancia activa del Controlador y luego en la página de Configuración. Luego se debe reiniciar la instancia del Controlador. El JOC Cockpit se reconectará entonces a la instancia activa del Controlador. Si se usa un Clúster de Controladores, el mismo cambio debe aplicarse al archivo private.conf de la instancia pasiva del Controlador.

## Configuración de Unicode

### Configuración: *encoding*

La codificación se aplica si el JOC Cockpit opera para entornos Windows. Windows no admite Unicode sino que utiliza páginas de código. En caso de que la página de código de Windows no pueda detectarse automáticamente, los usuarios pueden especificar la página de código. Un valor frecuentemente utilizado es *UTF-8*.

## Configuración de Licencia

### Configuración: *disable\_warning\_on\_license\_expiration*, Predeterminado: *false*

JS7 ofrece mostrar advertencias en caso de próxima expiración de la licencia. La función de mostrar advertencias de expiración de licencia puede deshabilitarse asignando a esta configuración el valor *true*.

## Configuración de Logs

### Configuración: *log\_ext\_directory*

Especifica un directorio accesible para el JOC Cockpit al cual se escribirán copias de los archivos de log de Órdenes y archivos de log de tareas.

### Configuración: *log\_ext\_order\_history*

Especifica que se crea un archivo JSON con información sobre el Historial de Órdenes en caso de Órdenes exitosas, Órdenes fallidas o ambas. Los valores posibles incluyen:

- **all**: crear archivo de historial para todas las Órdenes exitosas y fallidas.
- **failed**: crear archivo de historial para Órdenes fallidas.
- **successful**: crear archivo de historial para Órdenes exitosas.

### Configuración: *log\_ext\_order*

Especifica que se crea un archivo de log de Orden en caso de Órdenes exitosas, Órdenes fallidas o ambas. Los valores posibles incluyen:

- **all**: crear archivo de log de Orden para todas las Órdenes exitosas y fallidas.
- **failed**: crear archivo de log de Orden para Órdenes fallidas.
- **successful**: crear archivo de log de Orden para Órdenes exitosas.

### Configuración: *log\_ext\_task*

Especifica que se crea un archivo de log de tarea en caso de tareas exitosas, tareas fallidas o ambas. Los valores posibles incluyen:

- **all**: crear archivo de log de tarea para todas las tareas exitosas y fallidas.
- **failed**: crear archivo de log de tarea para tareas fallidas.
- **successful**: crear archivo de log de tarea para tareas exitosas.

### Configuración: *log\_maximum\_display\_size*, Predeterminado: *10* MB

El JOC Cockpit ofrece salida de log para visualización en la ventana de Vista de Log si el tamaño de la salida de log sin comprimir no supera este valor. De lo contrario, el log se ofrece solo para descarga. El tamaño se especifica en MB.

### Configuración: *log\_applicable\_size*, Predeterminado: *500* MB

Si se supera el valor para el tamaño de la salida de log de un Job, el Servicio de Historial truncará la salida de log y usará los primeros y últimos 100 KB para el log de tarea. El archivo de log original será eliminado. El tamaño se especifica en MB.

### Configuración: *log\_maximum\_size*, Predeterminado: *1000* MB

Si se supera este valor para el tamaño de la salida de log de un Job, el Servicio de Historial truncará la salida de log y usará los primeros 100 KB para el log de tarea. El archivo de log original será eliminado. El tamaño se especifica en MB.

## Configuración de Enlaces

### Configuración: *joc\_reverse\_proxy\_url*

Si el JOC Cockpit no es accesible desde su URL original sino solo desde un servicio proxy inverso, este valor especifica la URL a utilizar, por ejemplo con notificaciones por correo electrónico.

## Configuración de Jobs

### Configuración: *allow\_empty\_arguments*, Predeterminado: *false*

De forma predeterminada, los argumentos especificados para Jobs deben tener valores, de lo contrario el Workflow se considera no válido. Esta configuración anula el comportamiento predeterminado y permite especificar valores vacíos.

## Configuración de Órdenes

### Configuración: *allow\_undeclared\_variables*, Predeterminado: *false*

De forma predeterminada, cualquier variable de Orden debe estar declarada con el Workflow. Esta configuración cambia el comportamiento predeterminado y permite que las Órdenes especifiquen variables arbitrarias. Los usuarios deben tener en cuenta que los Jobs e instrucciones relacionadas fallarán si hacen referencia a variables que no son especificadas por las Órdenes entrantes.

## Configuración de Etiquetas

### Configuración: *num\_of\_tags\_displayed\_as\_order\_id*, Predeterminado: *0*

Especifica el número de Etiquetas mostradas con cada Orden. Un valor 0 suprimirá la visualización de Etiquetas. Tenga en cuenta que mostrar un mayor número de Etiquetas por Orden puede causar penalizaciones de rendimiento.

### Configuración: *num\_of\_workflow\_tags\_displayed*, Predeterminado: *0*

Especifica el número de Etiquetas mostradas con cada Workflow. Un valor 0 suprimirá la visualización de Etiquetas.

## Configuración de Aprobaciones

### Configuración: *approval\_requestor\_role*

Especifica el nombre del Rol del Solicitante que se asigna a las cuentas sujetas al Proceso de Aprobación.

## Configuración de Reportes

### Configuración: *report\_java\_options*, Predeterminado: *-Xmx54M*

Especifica las opciones de Java utilizadas al crear Reportes. El valor predeterminado considera el espacio mínimo de heap de Java requerido para crear Reportes. Los usuarios que encuentren un mayor número de ejecuciones de Jobs por día pueden necesitar aumentar este valor para satisfacer las necesidades de memoria.

## Referencias

### Ayuda Contextual

- [Registro de Auditoría](/audit-log)
- [Servicios de Identidad](/identity-services)
- [Preferencias del Perfil](/profile-preferences)
- [REST Web Service API](/rest-api)
- [Configuración](/settings)

### Base de Conocimiento del Producto

- [JS7 - Audit Log](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Log)
- [JS7 - Audit Trail](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Trail)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
