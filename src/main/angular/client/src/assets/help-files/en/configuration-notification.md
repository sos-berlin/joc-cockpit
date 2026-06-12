# Configuración - Notificación

JS7 proporciona Notificaciones en caso de advertencias y errores de los productos JS7, y ante fallos de Jobs y Workflows. Las Notificaciones también pueden enviarse en caso de ejecución exitosa de Jobs y Workflows.

- Las Notificaciones se basan en el monitoreo continuo realizado por JOC Cockpit a través del [Servicio de Monitor](/service-monitor) y se visualizan en la vista [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor). Esto incluye:
  - monitoreo de disponibilidad de Controladores y Agentes,
  - monitoreo de ejecución de Workflows y Jobs.
- Las Notificaciones se reenvían por uno de los siguientes medios:
  - por correo electrónico; para más detalles, consulte [JS7 - Notifications - Configuration Element MailFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+MailFragment) y [JS7 - How to set up e-mail notification for jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+set+up+e-mail+notification+for+jobs).
  - mediante el uso de una herramienta CLI como un Agente de Monitor de Sistema para [JS7 - Passive Checks with a System Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Passive+Checks+with+a+System+Monitor); para más detalles, consulte [JS7 - Notifications - Configuration Element CommandFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+CommandFragment).

Las Notificaciones se gestionan desde la subvista Configuración->Notificación en JOC Cockpit. La configuración se almacena en formato XML y se valida contra el *Esquema XSD Asignado* indicado en la parte superior de la página.

La página está dividida en el *Panel de Navegación* a la izquierda y el *Panel de Detalles* a la derecha.

- El *Panel de Detalles* ofrece campos de entrada y documentación relacionada por elemento.
- Al ingresar los detalles de configuración, estos se almacenarán automáticamente dentro de 30 segundos y al salir de la página.

El ciclo de vida típico al cambiar Notificaciones incluye:

- ingresar los detalles de configuración,
- hacer clic en el botón *Validate* para verificar que la configuración sea consistente,
- hacer clic en el botón *Release* para activar la configuración.

## Panel de Navegación

La configuración se ofrece desde la navegación por elementos. Al hacer clic en el nombre de un elemento, se abre el elemento y se muestran los sub-elementos disponibles. El indicador de flecha a la izquierda del nombre del elemento indica si hay sub-elementos disponibles.

El menú de acción de 3 puntos de un elemento ofrece las siguientes operaciones:

- **Add Child Node** ofrece agregar nodos al elemento actual. Se indican los tipos de nodos disponibles.
- **Show all Child Nodes of selected Node** abre una ventana emergente que muestra los nodos hijos posibles. Esto incluye recorrer los nodos hijos y buscar nodos hijos por nombre.
- **Copy/Paste** ofrece copiar un nodo incluyendo los nodos hijos. El pegado está disponible desde el menú de acción del nodo padre.
- **Remove** eliminará el nodo y cualquier nodo hijo.

### Fragmentos

#### MessageFragments

- **Message**
  - Un *Message* define el contenido que se envía, por ejemplo, por correo electrónico a un usuario o que se usa para parametrizar una utilidad de línea de comandos, como el contenido que se reenvía a un Monitor de Sistema.
    - Los *Messages* para uso con Correo Electrónico representan el cuerpo del correo electrónico en texto plano o en HTML.
    - Los Messages para uso con la Línea de Comandos representan una cadena de texto que puede usarse con el elemento *CommandFragmentRef*, véase más adelante.
    - Los elementos *Message* pueden incluir Variables de Monitor que son marcadores de posición para valores, por ejemplo, la Ruta del Workflow, el ID de la Orden, etc.
    - Se puede agregar cualquier número de elementos *Message*.

#### MonitorFragments

Los fragmentos se presentan en varias variantes para los siguientes tipos de Notificación.

- **MailFragment**
  - Los siguientes elementos son obligatorios para enviar correo:
    - **MessageRef**: Especifica la referencia a un elemento Message que proporciona el cuerpo del correo electrónico.
    - **Subject**: Especifica el asunto del correo electrónico y puede incluir Variables de Monitor.
    - **To**: Especifica la dirección de correo electrónico del destinatario. Varios destinatarios pueden separarse por coma.
  - Los siguientes elementos son opcionales para enviar correo:
    - **CC**: El destinatario de copias. Varios destinatarios pueden separarse por coma.
    - **BCC**: El destinatario de copias ocultas. Varios destinatarios pueden separarse por coma.
    - **From**: La dirección de correo electrónico de la cuenta que se usa para enviar el correo. Tenga en cuenta que la configuración de su servidor de correo determina si se puede usar una cuenta específica o arbitraria.
- **CommandFragment**
  - **MessageRef**: Especifica la referencia a un elemento *Message* que proporciona el contenido que se reenviará con el elemento Command. El contenido del mensaje está disponible desde la Variable de Monitor *$\{MESSAGE\}* para uso con elementos posteriores.
  - **Command**: Especifica el comando de shell para Linux/Windows que se usa para reenviar Notificaciones, por ejemplo, a una utilidad de Monitor de Sistema.
    - Por ejemplo, se puede usar el siguiente comando de shell:
      - *echo "$\{MESSAGE\}" >> /tmp/notification.log*
      - El comando de shell *echo* añade el contenido de la Variable de Monitor *$\{MESSAGE\}* a un archivo en el directorio */tmp*.
- **JMSFragment**
  - El tipo de fragmento se usa para integrar un producto de Cola de Mensajes Java que implementa la API JMS. Los valores de los atributos son específicos del producto JMS que se usa.

#### ObjectFragments

- **Workflows**: Se puede agregar cualquier número de configuraciones de Workflow, distinguidas por un nombre único asignado al elemento.
  - **Workflow**: Un Workflow puede especificarse por su nombre. El atributo *Path* permite una expresión regular que especifica una parte de la ruta del Workflow.
    - **WorkflowJob**: El elemento puede usarse para limitar las Notificaciones a Jobs específicos en un Workflow.
      - Esto incluye la opción de especificar el atributo *Job Name* y/o su atributo *Label*. Para ambos atributos se pueden usar valores constantes y expresiones regulares, por ejemplo *.\** para especificar que se envíe correo electrónico para cualquier Job.
      - Para versiones anteriores a 2.7.1:
        - Es obligatorio especificar la criticidad, que puede ser *ALL*, *NORMAL* o *CRITICAL*, cuando se usa el elemento.
      - Para versiones a partir de 2.7.1:
        - La criticidad puede ser uno o más de *MINOR*, *NORMAL*, *MAJOR*, *CRITICAL*.
        - La criticidad *ALL* está obsoleta.
      - Los atributos **return_code_from** y **return_code_to** pueden usarse opcionalmente para limitar aún más las Notificaciones a Jobs que finalizan con el código de retorno especificado. El código de retorno para Jobs de Shell corresponde al código de salida del sistema operativo.
    - Vacío: Si no se especifica ningún elemento *WorkflowJob*, la Notificación se aplica a cualquier [JS7 - Workflow Instructions](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions), incluyendo la [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction); de lo contrario, se aplicará a las apariciones de la [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction).

### Notificaciones

Activan las Notificaciones efectivas mediante referencias a los elementos *Fragment* descritos anteriormente.

#### SystemNotification

- **SystemNotification**: Selecciona uno o más de los *MonitorFragments* anteriores. Es posible seleccionar varios *Fragmentos* del mismo tipo de fragmento.
  - Las Notificaciones se crean a partir de errores y advertencias del sistema que se identifican en los archivos de Log de los productos JS7, consulte [Servicio de Notificación de Log](/service-log-notification).
  - El elemento se usa para poblar la subvista [Monitor - Notificaciones del Sistema](/monitor-notifications-system) de JOC Cockpit.

#### Notification

- **Notification**: Se puede agregar cualquier número de Notificaciones, distinguidas cada una por un nombre único. Una Notificación recibe un tipo que puede ser *SUCCESS*, *WARNING* o *ERROR*. Esto permite que se envíen Notificaciones, por ejemplo, ante errores y advertencias de Jobs. De forma similar, se pueden especificar Notificaciones para la ejecución exitosa de Workflows. Tenga en cuenta que la ejecución exitosa incluye tanto la ausencia de errores de Jobs como opcionalmente la presencia de advertencias de Jobs.
  - **NotificationMonitors**: Selecciona uno o más de los *MonitorFragments* anteriores. Es posible seleccionar varios fragmentos del mismo tipo de fragmento.
    - **CommandFragmentRef**: Selecciona el *CommandFragment* utilizado.
      - **MessageRef**: Selecciona el elemento *Message* usado con el *Command*.
    - **MailFragmentRef**: Selecciona el *MailFragment* usado para enviar Notificaciones por correo electrónico. Si se referencian varios elementos *MailFragment*, se pueden usar diferentes tipos de correo electrónico, por ejemplo para diferentes destinatarios o con diferente contenido y diseño del cuerpo del correo.
    - **JMSFragmentRef**: Selecciona el *JMSFragment* usado para enviar Notificaciones a un producto compatible con Cola de Mensajes Java.
  - **NotificationObjects**: Selecciona los Workflows para los que se crean Notificaciones.
    - **WorkflowRef**: Selecciona un elemento *Workflows* que limita las Notificaciones a los Workflows relacionados. Se puede agregar cualquier número de referencias de Workflow.

## Operaciones en Notificaciones

La página de Notificación ofrece las siguientes operaciones desde los botones relacionados en la parte superior de la página:

- **New**: comienza desde una configuración vacía.
- **Remove**: elimina la configuración actual.
- **Revert Draft**: crea un nuevo Borrador a partir de la versión liberada más recientemente. Los cambios actuales se perderán.
- **Upload**: permite cargar un archivo XML que contiene la configuración.
- **Download**: ofrece descargar la configuración a un archivo XML.
- **Edit XML**: ofrece la edición directa de la configuración en formato XML.
- **Validate**: valida la configuración contra un Esquema XSD. Esto garantiza que la configuración XML esté bien formada y sea formalmente correcta.
- **Release**: publica la configuración en JOC Cockpit. Los cambios surten efecto inmediatamente.

## Referencias

### Ayuda Contextual

- [Servicio de Notificación de Log](/service-log-notification)
- [Monitor - Disponibilidad de Agente](/monitor-availability-agent)
- [Monitor - Disponibilidad de Controlador](/monitor-availability-controller)
- [Monitor - Notificaciones de Órdenes](/monitor-notifications-order)
- [Monitor - Notificaciones del Sistema](/monitor-notifications-system)
- [Servicio de Monitor](/service-monitor)

### Base de Conocimiento del Producto

- [JS7 - How to set up e-mail notification for jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+set+up+e-mail+notification+for+jobs)
- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Monitor Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor+Service)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
  - [JS7 - Notifications - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration)
    - [JS7 - Notifications - Configuration Element CommandFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+CommandFragment)
    - [JS7 - Notifications - Configuration Element MailFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+MailFragment)
  - [JS7 - Passive Checks with a System Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Passive+Checks+with+a+System+Monitor)
- [JS7 - Workflow Instructions](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions)
  - [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction)
  - [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
