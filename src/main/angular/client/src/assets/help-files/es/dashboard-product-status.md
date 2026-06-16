# Estado del Producto

El panel Estado del Producto proporciona información sobre los siguientes productos de JS7:

- **JOC Cockpit**: se utiliza para monitorear y controlar el entorno de planificación y para gestionar el inventario de Jobs.
- **Controlador**: orquesta los Agentes y gestiona el despliegue de Órdenes, Workflows y Jobs.
- **Agentes**: ejecutan Jobs.

Los productos JS7 pueden operarse de forma autónoma y en modo de clúster activo-pasivo.

## Estado del Componente y Estado de Conexión

### JOC Cockpit

El JOC Cockpit se conecta a la base de datos y a las instancias del Controlador.

- Estado del Componente
  - El Estado del Componente se indica mediante el color del mosaico en la esquina superior izquierda del recuadro del JOC Cockpit.
  - **Mosaico en Color Verde**: indica una instancia saludable de JOC Cockpit.
  - **Mosaico en Color Rojo**: indica un estado desconocido.
- Estado de Conexión a la Base de Datos
  - **Línea en Color Verde**: indica una conexión saludable.
  - **Línea en Color Amarillo**: indica problemas de conexión, por ejemplo si el JOC Cockpit pierde heartbeats con la base de datos.
- Estado de Conexión al Controlador
  - **Línea en Color Verde**: indica una conexión saludable al Controlador.
  - **Línea en Color Rojo**: indica una conexión fallida al Controlador.

### Controlador

El Controlador se conecta a las instancias de Agentes. En un Clúster de Controladores, sus miembros mantienen conexiones bidireccionales.

- Estado del Componente
  - El Estado del Componente se indica mediante el color del mosaico en la esquina superior izquierda del recuadro del Controlador.
  - **Mosaico en Color Verde**: indica una instancia saludable del Controlador.
  - **Mosaico en Color Amarillo**: indica una instancia del Controlador en ejecución pero no saludable, por ejemplo en caso de que el acoplamiento haya fallado en un clúster.
  - **Mosaico en Color Rojo**: indica un estado *desconocido*.
- Estado de Conexión del Clúster
  - **Línea en Color Verde**: indica un clúster saludable que está sincronizado activamente entre las instancias del Controlador.
  - **Línea en Color Amarillo**: indica conexión con la instancia emparejada del Controlador sin acoplamiento exitoso.. Por ejemplo en caso que el emparejamiento de un clúster falle
  - **Línea en Color Rojo**: indica una conexión fallida entre instancias del Controlador.

## Operaciones

### Operaciones del JOC Cockpit

Operaciones disponibles para todas las instancias visibles y saludables del JOC Cockpit:

- **Conmutación**: en un clúster transfiere el rol activo a la instancia en espera, lo que puede tardar entre 20 y 60 segundos  aproximadamente. La operación se ofrece para las instancias en espera.
- **Actualizar URL**: permite modificar la URL de visualización. El JOC Cockpit puede ser accesible desde múltiples URLs y la primera utilizada es la que se muestra. Si esto no es lo que los usuarios desean, pueden especificar la URL que debe mostrarse. La operación no modifica la URL del JOC Cockpit, solo su visualización.

Operaciones del JOC Cockpit disponibles para la instancia a la que el navegador está conectado:

- **Reiniciar Servicios**: reinicia todos los servicios, como el Servicio de Clúster, Servicio Proxy, Servicio de Historial, etc.
- **Reiniciar Servicio**: permite reiniciar un servicio específico:
  - **Servicio de Limpieza**: depura la base de datos de información desactualizada que superó su período de retención.
  - **Servicio de Plan Diario**: crea Órdenes para el Plan Diario. El servicio se ejecuta una vez por día para crear y enviar Órdenes al Controlador y los Agentes.
  - **Servicio de Historial**: recibe el historial de Jobs y la salida de logs de Jobs desde el Controlador a través del *Servicio Proxy*.
  - **Servicio de Notificación de Logs**: es un servicio syslog que recibe errores y advertencias de las instancias registradas del Controlador y los Agentes.
  - **Servicio de Monitor**: crea notificaciones para la vista *Monitor* y opcionalmente envía alertas por correo.
  - **Servicio Proxy**: establece la conexión con la instancia activa del Controlador. Esto permite enviar comandos al Controlador y recibir el historial de Jobs y la salida de logs de Jobs.
- **Ejecutar Servicio**: fuerza la ejecución inmediata de un servicio:
  - **Servicio de Limpieza**: depura la base de datos.
  - **Servicio de Plan Diario**: crea Órdenes para el Plan Diario. El servicio puede ejecutarse cualquier cantidad de veces por día. Una ejecución individual no impide que el servicio se ejecute en el momento especificado por su configuración.
- **Descargar Log**: ofrece el archivo *joc.log* del JOC Cockpit para descarga.

### Operaciones del Controlador

Las instancias del Controlador ofrecen las siguientes operaciones desde el menú de acción de los tres puntos en el recuadro de cada instancia:

- **Terminar**, **Terminar y Reiniciar**: apagan la instancia. Para la instancia activa en un clúster, el menú se expande con:
  - **con conmutación**: para transferir el rol activo a la instancia en espera.
  - **sin conmutación**: para mantener el rol activo en la instancia activa. Los usuarios deben tener en cuenta que no se producirá conmutación por error y que ninguna instancia quedará activa.
- **Cancelar**, **Cancelar y Reiniciar**: terminan forzosamente la instancia. Si se aplica a la instancia activa en un clúster, se forzará la conmutación por error:
  - **con conmutación por error**: transferirá el rol activo a la instancia en espera.
- **Descargar Log**: ofrece el archivo controller.log del Controlador para descarga en formato comprimido .gz.

El recuadro *Estado del Clúster* ofrece las siguientes operaciones desde su menú de acción de tres puntos:

- **Conmutación**: transfiere el rol activo a la instancia en espera. La operación está disponible si el clúster está acoplado.
- **Confirmar pérdida de instancia del Controlador**: aplica cuando ninguna instancia del JOC Cockpit estaba disponible al momento en que una instancia del Controlador en un clúster se cayó. El JOC Cockpit es requerido como testigo en el clúster. En esta situación los usuarios deben verificar cuál instancia del Controlador estaba en espera en el momento de la caída y confirmar que la instancia en espera 