# Servicio de Identidad - Configuración de Keycloak

Los Servicios de Identidad controlan el acceso a JOC Cockpit mediante autenticación y autorización, consulte [Servicios de Identidad](/identity-services).

Los Servicios de Identidad se especifican desde la siguiente configuración:

- **Configuración General** que contiene las propiedades disponibles para todos los Servicios de Identidad, consulte [Servicio de Identidad - Configuración](/identity-service-configuration).
- **Configuración** específica para el Tipo de Servicio de Identidad Keycloak.

## Configuración

- **URL de Keycloak** es la URL base para la que está disponible la API REST de Keycloak.
- **Cuenta Administrativa de Keycloak** es una cuenta de Keycloak con un rol administrativo que tiene asignados los roles *realm-management.view-clients* y *realm-management.view-users* en Keycloak. La cuenta administrativa se utiliza para recuperar los roles de una cuenta de Keycloak y para renovar los tokens de acceso.
- **Contraseña Administrativa de Keycloak** es la contraseña para la *Cuenta Administrativa de Keycloak*.
- **Ruta del Almacén de Confianza de Keycloak** especifica la ubicación de un almacén de confianza en caso de que el servidor Keycloak esté configurado para conexiones HTTPS. El almacén de confianza indicado debe incluir un certificado X.509 especificado para el Uso Extendido de Clave de Autenticación de Servidor.
  - El almacén de confianza puede incluir un Certificado firmado por una CA privada o un Certificado firmado por una CA pública. Normalmente se utiliza el Certificado de CA Raíz, ya que de lo contrario la cadena completa de certificados implicada en la firma del Certificado de Autenticación de Servidor debe estar disponible en el almacén de confianza.
  - Si el servidor Keycloak opera con conexiones HTTPS y esta configuración no se especifica, JOC Cockpit utilizará el almacén de confianza configurado en el archivo de configuración *JETTY_BASE/resources/joc/joc.properties*. Esto incluye el uso de las configuraciones para la contraseña y el tipo del almacén de confianza.
- La ruta al almacén de confianza se especifica en relación con el directorio *JETTY_BASE/resources/joc*. Si el almacén de confianza se encuentra en este directorio, solo se especifica el nombre del archivo, normalmente con extensión .p12. Se pueden especificar otras ubicaciones relativas usando, por ejemplo, *../../joc-truststore.p12* si el almacén de confianza se encuentra en el directorio *JETTY_BASE*. No se puede especificar una ruta absoluta ni una ruta que se encuentre antes del directorio *JETTY_BASE* en la jerarquía del sistema de archivos.
- **Contraseña del Almacén de Confianza de Keycloak** especifica la contraseña que protege el almacén de confianza si el servidor Keycloak está configurado para conexiones HTTPS.
- **Tipo de Almacén de Confianza de Keycloak** es uno de *PKCS12* o *JKS* (obsoleto). Esta configuración se utiliza si el servidor Keycloak está configurado para conexiones HTTPS.
- Los Clientes de Keycloak son entidades que solicitan a Keycloak autenticar una cuenta de usuario. Por ejemplo, una aplicación como JOC Cockpit actúa como Cliente ante el servidor Keycloak. Los Clientes utilizan Keycloak para autenticarse y proporcionar una solución de inicio de sesión único.
  - El **ID de Cliente de Keycloak** y el *Secreto de Cliente de Keycloak* se utilizan para:
    - solicitar un token de acceso
      - para la autenticación de usuarios,
      - para el acceso administrativo,
    - validar un token de acceso existente,
    - renovar un token de acceso existente.
  - El **Secreto de Cliente de Keycloak** es propiedad del Cliente y debe ser conocido tanto por el servidor Keycloak como por JOC Cockpit.
- **Realm de Keycloak** gestiona un conjunto de usuarios, credenciales, roles y grupos. Un usuario pertenece a un realm e inicia sesión en un realm. Los realms están aislados entre sí; gestionan y autentican exclusivamente las cuentas de usuario que controlan.
- **Keycloak versión 16 o anterior** es un interruptor de compatibilidad para versiones anteriores de Keycloak.

## Referencias

### Ayuda Contextual

- [Servicio de Identidad - Configuración](/identity-service-configuration)
- [Servicios de Identidad](/identity-services)

### Base de Conocimiento del Producto

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
- [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)
