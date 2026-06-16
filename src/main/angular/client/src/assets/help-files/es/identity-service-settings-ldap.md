# Servicio de Identidad - Configuración de LDAP

Los Servicios de Identidad controlan el acceso a JOC Cockpit mediante autenticación y autorización, consulte [Servicios de Identidad](/identity-services).

Los Servicios de Identidad se especifican desde la siguiente configuración:

- **Configuración General** que contiene las propiedades disponibles para todos los Servicios de Identidad, consulte [Servicio de Identidad - Configuración](/identity-service-configuration).
- **Configuración** específica para el Tipo de Servicio de Identidad LDAP.

## Configuración

Para LDAP se ofrecen las pestañas *Opciones Básicas* y *Opciones Avanzadas*.

- *Opciones Básicas* puede aplicarse si se utiliza Microsoft Active Directory® o similares.
- *Opciones Avanzadas* ofrece configuración detallada para cualquier servidor LDAP.

Para más detalles consulte:
- [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
  - [JS7 - LDAP Identity Service Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service+Configuration)
  - [JS7 - LDAP over TLS using STARTTLS and LDAP over SSL using LDAPS](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+over+TLS+using+STARTTLS+and+LDAP+over+SSL+using+LDAPS)

### Configuración: Opciones Básicas

- **Host del Servidor LDAP** espera el nombre de host o la dirección IP del servidor LDAP. Si se usan protocolos TLS/SSL, se debe utilizar el Nombre de Dominio Completo (FQDN) del host para el que se emite el certificado SSL del servidor LDAP.
- **Protocolo del Servidor LDAP** puede ser Texto plano, TLS o SSL. El Texto plano no se recomienda ya que la cuenta de usuario y la contraseña se enviarán por la red sin cifrado. Los protocolos TLS y SSL se consideran seguros ya que cifran el contenido/conexión al servidor LDAP.
- **Puerto del Servidor LDAP** es el puerto en el que escucha el servidor LDAP. Para conexiones de Texto plano y TLS se utiliza frecuentemente el puerto 389; para conexiones SSL el puerto 636 es una opción frecuente.
- **El Servidor LDAP es Active Directory** simplifica la configuración si el servidor LDAP está implementado por Active Directory. Se asumen automáticamente varios atributos para la búsqueda de usuarios y grupos si se utiliza Active Directory.
- **El Servidor LDAP ofrece el atributo samAccountName** especifica si el atributo *samAccountName* actúa como identificador único de una cuenta de usuario. Este atributo frecuentemente está disponible en servidores LDAP de Active Directory.
- **El Servidor LDAP ofrece el atributo memberOf** simplifica la búsqueda de Grupos de Seguridad de los que la cuenta de usuario es miembro. Este atributo frecuentemente está disponible en servidores LDAP de tipo Active Directory; sin embargo, otros productos LDAP también pueden implementar el atributo.
- **Plantilla DN de Usuario LDAP** es un marcador de posición para el Nombre Distinguido (DN) que identifica una cuenta de usuario. El valor *{0}* puede utilizarse para servidores LDAP de Active Directory y será reemplazado por la cuenta de usuario especificada durante el inicio de sesión.
- **Base de Búsqueda del Servidor LDAP** se utiliza para buscar cuentas de usuario en la jerarquía de entradas del servidor LDAP, por ejemplo *OU=Operations, O=IT, O=Users, DC=example, DC=com*.
- **Filtro de Búsqueda de Usuarios LDAP** especifica una consulta LDAP que se utiliza para identificar la cuenta de usuario en la jerarquía de entradas LDAP.

### Configuración: Opciones Avanzadas

#### Configuración General

- **URL del Servidor LDAP** especifica el protocolo, por ejemplo *ldap://* para conexiones de Texto plano y TLS, *ldaps://* para conexiones SSL. Al protocolo se añade el nombre de host (FQDN) y el puerto del servidor LDAP.
- **Tiempo de Espera de Lectura del Servidor LDAP** especifica la duración en segundos durante la cual JOC Cockpit esperará las respuestas del servidor LDAP cuando la conexión está establecida.
- **Tiempo de Espera de Conexión del Servidor LDAP** especifica la duración en segundos durante la cual JOC Cockpit esperará las respuestas del servidor LDAP al establecer la conexión.
- **LDAP Start TLS** este interruptor hace que TLS sea el protocolo para la conexión al servidor LDAP.
- **Verificación del Nombre de Host LDAP** este interruptor debe estar activo para verificar si los nombres de host en la URL del servidor LDAP y en el certificado del servidor LDAP coinciden.
- **Ruta del Almacén de Confianza LDAP** especifica la ubicación de un almacén de confianza en caso de que el servidor LDAP esté configurado para protocolos TLS/SSL. El almacén de confianza indicado debe incluir un certificado X.509 especificado para el Uso Extendido de Clave de Autenticación de Servidor.
  - Para conexiones a proveedores de identidad LDAP conocidos como Azure®, los usuarios deben especificar la ruta al archivo del almacén de confianza *cacerts* de Java que se incluye con el JDK de Java utilizado con JOC Cockpit.
  - El almacén de confianza puede incluir un Certificado firmado por una CA privada o un Certificado firmado por una CA pública. Normalmente se utiliza el Certificado de CA Raíz, ya que de lo contrario la cadena completa de certificados implicada en la firma del Certificado de Autenticación de Servidor debe estar disponible en el almacén de confianza.
  - Si el servidor LDAP opera con conexiones TLS/SSL y esta configuración no se especifica, JOC Cockpit utilizará el almacén de confianza configurado en el archivo de configuración *JETTY_BASE/resources/joc/joc.properties*. Esto incluye el uso de las configuraciones para la contraseña y el tipo del almacén de confianza.
  - La ruta al almacén de confianza se especifica en relación con el directorio *JETTY_BASE/resources/joc*. Si el almacén de confianza se encuentra en este directorio, especifique solo el nombre del archivo, normalmente con extensión .p12. Se pueden especificar otras ubicaciones relativas usando, por ejemplo, *../../joc-truststore.p12* si el almacén de confianza se encuentra en el directorio *JETTY_BASE*. No se puede especificar una ruta absoluta ni una ruta que se encuentre antes del directorio *JETTY_BASE* en la jerarquía del sistema de archivos.
- **Contraseña del Almacén de Confianza LDAP** especifica la contraseña que protege el almacén de confianza LDAP. Si se utiliza el almacén de confianza *cacerts* del JDK de Java, la contraseña predeterminada es *changeit*.
- **Tipo de Almacén de Confianza LDAP** especifica el tipo de almacén de confianza, que es uno de *PKCS12* o *JKS* (obsoleto).

#### Configuración de Autenticación

- **Plantilla DN de Usuario LDAP** es un marcador de posición para el Nombre Distinguido (DN) que identifica una cuenta de usuario. El valor *{0}* puede utilizarse para servidores LDAP de Active Directory y será reemplazado por la cuenta de usuario especificada durante el inicio de sesión.
- **Plantilla DN de Usuario del Sistema LDAP** se aplica si se utiliza una *Cuenta de Usuario del Sistema* para vincularse al servidor LDAP y verificar si la cuenta de usuario que realiza el inicio de sesión existe con la cuenta y contraseña indicadas. Se desaconseja el uso de una *Cuenta de Usuario del Sistema* ya que expone la contraseña de la cuenta. La configuración es similar a la *Plantilla DN de Usuario LDAP* y especifica el marcador de posición para el Nombre Distinguido de la *Cuenta de Usuario del Sistema*.
- **Cuenta de Usuario del Sistema LDAP** especifica la cuenta de usuario de manera similar al inicio de sesión desde el *samAccountName* u otro atributo, por ejemplo usando *cuenta@dominio*.
- **Contraseña de Usuario del Sistema LDAP** especifica la contraseña de la *Cuenta de Usuario del Sistema*.

#### Configuración de Autorización

- **Base de Búsqueda LDAP** se utiliza para buscar cuentas de usuario en la jerarquía de entradas del servidor LDAP, por ejemplo *OU=Operations, O=IT, O=Users, DC=example,DC=com*.
- **Base de Búsqueda de Grupos LDAP** se utiliza de manera similar a la *Base de Búsqueda* para buscar los Grupos de Seguridad de los que la cuenta de usuario es miembro.
- **Filtro de Búsqueda de Grupos LDAP** especifica una consulta LDAP que se utiliza para identificar los Grupos de Seguridad de los que la cuenta de usuario es miembro. El filtro se aplica a los resultados de búsqueda a partir de la Base de Búsqueda de Grupos.
- **Atributo de Nombre de Grupo LDAP** especifica el atributo que proporciona el nombre del Grupo de Seguridad del que la cuenta de usuario es miembro, por ejemplo el atributo *CN* (Nombre Común).
- Mapeo de Grupos/Roles LDAP
  - **Deshabilitar búsqueda de grupos anidados** especifica que los Grupos de Seguridad no se buscarán de forma recursiva si son miembros de Grupos de Seguridad.
  - **Mapeo de Grupo/Nombre** especifica el mapeo de los Grupos de Seguridad de los que la cuenta de usuario es miembro y los roles de JS7. Los Grupos de Seguridad deben especificarse en función del *Atributo de Búsqueda de Grupo LDAP* como Nombres Distinguidos, por ejemplo *CN=js7_admins, OU=Operations, O=IT, O=Groups, DC=example, DC=com*, o como Nombres Comunes, por ejemplo *js7_admins*.

## Referencias

### Ayuda Contextual

- [Servicio de Identidad - Configuración](/identity-service-configuration)
- [Servicios de Identidad](/identity-services)

### Base de Conocimiento del Producto

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
  - [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
    - [JS7 - LDAP Identity Service Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service+Configuration)
    - [JS7 - LDAP over TLS using STARTTLS and LDAP over SSL using LDAPS](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+over+TLS+using+STARTTLS+and+LDAP+over+SSL+using+LDAPS)
