# Servicio de Identidad - Configuración de OIDC

Los Servicios de Identidad controlan el acceso a JOC Cockpit mediante autenticación y autorización, consulte [Servicios de Identidad](/identity-services).

Los Servicios de Identidad se especifican desde la siguiente configuración:

- **Configuración General** que contiene las propiedades disponibles para todos los Servicios de Identidad, consulte [Servicio de Identidad - Configuración](/identity-service-configuration).
- **Configuración** específica para el Tipo de Servicio de Identidad OIDC.

## Configuración

Las siguientes configuraciones están disponibles:

- **Nombre OIDC** es utilizado por JOC Cockpit como título del botón de inicio de sesión correspondiente en la página de inicio de sesión.
- **URL de Autenticación OIDC** es utilizada por el Cliente para iniciar sesión en el Proveedor de Identidad OIDC. El Cliente llama a esta URL para el inicio de sesión y devuelve el Token de Acceso del Proveedor de Identidad OIDC. Se utiliza igualmente al leer la configuración del Proveedor de Identidad OIDC con la URL */.well-known/openid-configuration* y se usa como emisor durante la verificación del token.
- **Tipo de Flujo**
  - **Flujo de Código de Autorización** es el flujo más comúnmente utilizado con seguridad demostrada.
  - **Flujo Implícito** es un flujo anterior considerado inseguro.
  - **Flujo de Credenciales de Cliente** es un flujo simplificado para procesamiento por lotes sin interacción del usuario.
- **ID de Cliente OIDC** identifica al Cliente con el Proveedor de Identidad OIDC.
- **Secreto de Cliente OIDC** es la contraseña asignada al *ID de Cliente OIDC* en el Proveedor de Identidad OIDC.
- **Atributo de Nombre de Usuario OIDC** es el nombre del atributo utilizado por el Servicio de Identidad OIDC para identificar la cuenta de usuario.
  - Se aplica la siguiente estrategia para identificar el atributo utilizado para mapear a la cuenta de JOC Cockpit:
    - Se llama a la URL *https://identity-provider/.well-known/openid-configuration*.
    - La respuesta se verifica para el objeto *claims_supported*:
      - Si no está disponible o está vacío, se utilizará el atributo *email*.
      - Si está disponible y contiene el atributo *preferred_username*, se utilizará este atributo.
    - Si no se ha identificado ningún atributo, se utilizará el atributo *email*.
  - Si esto no resulta en una cuenta de usuario identificable, los usuarios pueden especificar el nombre del atributo. Frecuentemente los Proveedores de Identidad OIDC admiten nombres de atributo como *username* o *email*.
- **Claims OIDC** especifican *roles* o *grupos* de OIDC que se utilizan para el mapeo a roles de JS7. Los *Claims OIDC* predeterminados incluyen *roles*, *groups*.
- **Scopes OIDC** especifican el ámbito para el cual los *Claims OIDC* serán devueltos por el Proveedor de Servicio de Identidad OIDC. Los *Scopes OIDC* predeterminados incluyen *roles*, *groups*, *profile*.
- **Mapeo de Grupos/Roles OIDC** incluye la asignación de roles a cuentas.
  - Se puede especificar una lista de claims que contienen los grupos configurados en el Proveedor de Servicio de Identidad OIDC. Los claims disponibles pueden obtenerse verificando el *JSON Web Token* durante el registro.
  - Durante la asignación, los grupos disponibles del Proveedor de Servicio de Identidad OIDC se asignan a los roles configurados con el Servicio de Identidad. Se puede asignar cualquier número de roles a cada grupo.
- **Imagen OIDC** opcionalmente puede cargarse y se mostrará en la página de inicio de sesión. Los usuarios pueden hacer clic en la imagen para iniciar sesión con el Servicio de Identidad OIDC.
- **Ruta del Almacén de Confianza OIDC** si se indica, debe incluir un certificado X.509 especificado para el Uso Extendido de Clave de Autenticación de Servidor para el Proveedor de Identidad.
  - Para conexiones a proveedores de identidad OIDC conocidos como Azure®, los usuarios deben especificar la ruta al archivo del almacén de confianza *cacerts* de Java que se incluye con el JDK de Java utilizado con JOC Cockpit.
  - El almacén de confianza debe incluir un Certificado autofirmado de una CA privada o pública. Normalmente se utiliza el Certificado de CA, ya que de lo contrario la cadena completa de certificados implicada en la firma del Certificado de Autenticación de Servidor debe estar disponible en el almacén de confianza.
  - Si esta configuración no se especifica, JOC Cockpit utilizará el almacén de confianza configurado en el archivo de configuración *JETTY_BASE/resources/joc/joc.properties*. Esto incluye el uso de las configuraciones para la *Contraseña del Almacén de Confianza OIDC* y el *Tipo de Almacén de Confianza OIDC*.
  - La ruta al almacén de confianza puede especificarse en relación con el directorio *JETTY_BASE/resources/joc*. Si el almacén de confianza se encuentra en este directorio, solo se especifica el nombre del archivo, normalmente con extensión .p12 o .pfx. Se pueden especificar otras ubicaciones relativas usando, por ejemplo, *../../joc-truststore.p12* si el almacén de confianza se encuentra en el directorio *JETTY_BASE*.
  - Se puede especificar una ruta absoluta.
- **Tipo de Almacén de Confianza OIDC** es uno de PKCS12 o JKS (obsoleto).
- **Contraseña del Almacén de Confianza OIDC** especifica la contraseña que protege el almacén de confianza. Para el almacén de confianza *cacerts* del JDK de Java, la contraseña predeterminada es *changeit*.

## Referencias

### Ayuda Contextual

- [Servicio de Identidad - Configuración](/identity-service-configuration)
- [Servicios de Identidad](/identity-services)

### Base de Conocimiento del Producto

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
- [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)
