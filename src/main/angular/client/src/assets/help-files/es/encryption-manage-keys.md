# Gestión de Claves de Cifrado

El [JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption) ofrece una forma segura de manejar secretos utilizados en los Jobs. Los usuarios pueden cifrar y descifrar datos sensibles como contraseñas mediante el uso de claves asimétricas.

El Cifrado y el Descifrado hacen uso de Claves Privadas y Certificados X.509 asimétricos. Esto incluye los siguientes roles:

- Emisor: tiene acceso al Certificado o Clave Pública del receptor y cifra un secreto basándose en la Clave Pública del receptor, que está disponible directamente o que puede calcularse a partir de un Certificado.
- Receptor: tiene acceso a la Clave Privada que permite el descifrado del secreto cifrado.

Para la creación de Claves de Cifrado consulte [JS7 - How to create X.509 Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Encryption+Keys).

Para la gestión de Claves de Cifrado consulte [JS7 - Encryption - Management of Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Management+of+Encryption+Keys).

El proceso de cifrado funciona de la siguiente manera:

<img src="encryption-process.png" alt="Encryption Process" width="750" height="240" />

El proceso de descifrado funciona de la siguiente manera:

<img src="decryption-process.png" alt="Decryption Process" width="880" height="210" />

La página *Gestión de Claves de Cifrado* se utiliza para gestionar Certificados y especificar las propiedades del Certificado.

## Lista de Certificados

Los Certificados de Cifrado existentes se muestran en una lista:

- **Menú de Acciones** ofrece actualizar y eliminar la entrada del Certificado.
- **Alias del Certificado** es el nombre único que los usuarios asignan a un Certificado.
- **Icono de Visualización** permite hacer clic en el icono para mostrar el Certificado correspondiente.
- **Ruta al archivo de Clave Privada** especifica la ubicación de la Clave Privada en los Agentes correspondientes.

## Operaciones sobre los Certificados

Desde la parte superior de la pantalla están disponibles los siguientes botones:

- **Agregar Certificado** ofrece la posibilidad de agregar un Certificado mediante copia/pegado. Encuentre más detalles en [Gestión del Certificado de Cifrado](/encryption-manage-certificate).
- **Importar Certificado** ofrece la posibilidad de cargar un archivo de Certificado.

Desde la *Lista de Certificados* se ofrecen las siguientes operaciones con el menú de acción de 3 puntos:

- **Actualizar Certificado** permite modificar la entrada del Certificado. Encuentre más detalles en [Gestión del Certificado de Cifrado](/encryption-manage-certificate).
- **Eliminar Certificado** eliminará la entrada del Certificado.

## Referencias

### Ayuda Contextual

- [Gestión del Certificado de Cifrado](/encryption-manage-certificate)

### Base de Conocimiento del Producto

- [JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption)
  - [JS7 - Encryption - Management of Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Management+of+Encryption+Keys)
  - [JS7 - Encryption - Integration with Workflows - Jobs - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Workflows+-+Jobs+-+Orders)
  - [JS7 - Encryption - Integration with Shell CLI](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Shell+CLI)
  - [JS7 - Encryption - Integration with Secret Manager Products](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Secret+Manager+Products)
- [JS7 - How to create X.509 Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Encryption+Keys)
