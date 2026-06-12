# Gestión del Certificado de Cifrado

El [JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption) ofrece una forma segura de manejar secretos utilizados en los Jobs. Los usuarios pueden cifrar y descifrar datos sensibles como contraseñas mediante el uso de claves asimétricas.

Para más detalles, consulte [Gestión de Claves de Cifrado](/encryption-manage-keys).

La página *Gestión del Certificado de Cifrado* se utiliza para especificar las propiedades del Certificado.

## Certificado

Las siguientes propiedades se especifican para un Certificado:

- **Alias del Certificado** es el nombre único que los usuarios asignan a un Certificado. Los usuarios pueden elegir libremente el nombre. El Certificado y sus propiedades se almacenarán en un Recurso de Job con el nombre indicado.
- **Certificado** permite copiar/pegar un Certificado en formato PEM. Un Certificado puede verse así:

<pre>
-----BEGIN CERTIFICATE-----
MIIB9TCCAZqgAwIBAgIJAIFT2KH9txb9MAoGCCqGSM49BAMCMFgxCzAJBgNVBAYT
AkRFMQ8wDQYDVQQIDAZCZXJsaW4xDzANBgNVBAcMBkJlcmxpbjEMMAoGA1UECgwD
U09TMQswCQYDVQQLDAJJVDEMMAoGA1UEAwwDSlM3MB4XDTI0MDYyNzA5MzU0MloX
DTI5MDYyNjA5MzU0MlowWDELMAkGA1UEBhMCREUxDzANBgNVBAgMBkJlcmxpbjEP
MA0GA1UEBwwGQmVybGluMQwwCgYDVQQKDANTT1MxCzAJBgNVBAsMAklUMQwwCgYD
VQQDDANKUzcwVjAQBgcqhkjOPQIBBgUrgQQACgNCAATBF6yXinah6K/x2TikPNaT
447gK2SxCH8vgO5NygZzUonzhaGOK5n1jktvhhmxmrn5V4VSHMC0NzU6O87nUKpA
o1AwTjAdBgNVHQ4EFgQUcovwh3OMrSXjP02VHG5cj03xHxswHwYDVR0jBBgwFoAU
covwh3OMrSXjP02VHG5cj03xHxswDAYDVR0TBAUwAwEB/zAKBggqhkjOPQQDAgNJ
ADBGAiEAwjGLIhLfV0q/cOYVAnXSZ+jWp8Og/lG5YdvtLcj9CD0CIQCK8O4wURQj
SbNCv0bJswLadTFEcz8ZoYP7alXJzj9FQQ== 
-----END CERTIFICATE-----
</pre>

- **Ruta al archivo de Clave Privada** especifica la ubicación de la Clave Privada en los Agentes correspondientes.
- **Carpeta del Recurso de Job** especifica la carpeta del inventario en la que se almacenará el Recurso de Job que contiene el Certificado. Se puede especificar una jerarquía de carpetas utilizando barras diagonales, como en /a/b/c. Las carpetas inexistentes serán creadas.

## Operaciones sobre el Certificado

Las siguientes operaciones están disponibles desde los enlaces:

- **Uso del Certificado por Agentes** muestra el *Nombre del Agente* y la URL de los Agentes a los que se ha asignado el Certificado.
- **Asignar Certificado a Agentes** ofrece la posibilidad de seleccionar Agentes Autónomos y Agentes en Clúster a los que se asignará el Certificado. Los usuarios deben asegurarse de que el Agente correspondiente tenga el archivo de Clave Privada en la ubicación especificada en la propiedad *Ruta al archivo de Clave Privada*. Los usuarios pueden seleccionar Agentes que conozcan la Clave Privada.
- **Prueba de Cifrado** permite realizar una prueba de cifrado:
  - Al hacer clic en el enlace se abre el campo de entrada *Texto plano* al que se puede añadir una cadena como *secreto*.
  - A la derecha del campo de entrada se ofrece el icono de cifrado. Al hacer clic en el icono se muestra la etiqueta *Resultado del Cifrado* con el resultado correspondiente.

## Referencias

### Ayuda Contextual

- [Gestión de Claves de Cifrado](/encryption-manage-keys)

### Base de Conocimiento del Producto

- [JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption)
  - [JS7 - Encryption - Management of Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Management+of+Encryption+Keys)
  - [JS7 - Encryption - Integration with Workflows - Jobs - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Workflows+-+Jobs+-+Orders)
  - [JS7 - Encryption - Integration with Shell CLI](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Shell+CLI)
  - [JS7 - Encryption - Integration with Secret Manager Products](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Secret+Manager+Products)
- [JS7 - How to create X.509 Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Encryption+Keys)
