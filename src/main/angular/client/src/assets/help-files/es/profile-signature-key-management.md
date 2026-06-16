# Perfil - Gestión de Claves de Firma

La pestaña *Perfil - Gestión de Claves de Firma* contiene el Certificado de Firma utilizado para el despliegue de Workflows y Recursos de Job.

- Si JOC Cockpit opera con el Nivel de Seguridad *bajo*, el Certificado de Firma se almacena con la cuenta *root* y se usa para las operaciones de despliegue de cualquier cuenta de usuario.
- Si JOC Cockpit opera con el Nivel de Seguridad *medio*, el Certificado de Firma se almacena individualmente con la cuenta de usuario y se usa para las operaciones de despliegue de la cuenta de usuario correspondiente.
- Si JOC Cockpit opera con el Nivel de Seguridad *alto*, el Certificado de Firma se almacena fuera de JOC Cockpit y la pestaña *Gestión de Claves de Firma* no está disponible.

Para más detalles, consulte [JS7 - Profiles - Signature Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+Signature+Key+Management).

<img src="profile-signature-key-management.png" alt="Gestión de Claves de Firma" width="800" height="75" />

## Certificado de Firma

JS7 incluye un Certificado de Firma predeterminado. Los usuarios deben considerar el período de validez del Certificado. Los Certificados más nuevos se incluyen con las versiones de JS7 aproximadamente seis meses antes del vencimiento del certificado. En lugar de actualizar JS7, los usuarios pueden cargar un Certificado más nuevo disponible en [JS7 - How to update the Digital Signing Certificate for deployment](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+update+the+Digital+Signing+Certificate+for+deployment).

Los usuarios pueden crear su propio Certificado de Firma:

- desde una Autoridad de Certificación (CA) Privada o CA Pública. El uso de una CA Privada se explica en [JS7 - How to create X.509 Signing Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Signing+Certificates).
- desde la CA integrada que se incluye con JOC Cockpit.

Al usar una CA Privada o CA Pública, el Certificado de CA Raíz o el Certificado de CA Intermedio que se usó para firmar el Certificado de Firma debe estar disponible para las instancias del Controlador y del Agente. El Certificado debe estar disponible en un archivo en formato PEM ubicado en el directorio *./config/private/trusted-x509-keys* del Controlador y del Agente.

## Operaciones sobre el Certificado de Firma

Se ofrecen las siguientes operaciones:

- **Mostrar** está disponible al hacer clic en el icono a la derecha del período de validez. Esto mostrará la Clave Privada y el Certificado de Firma.
- **Actualizar** invoca una ventana emergente que permite pegar una Clave Privada y Certificado de Firma actualizados.
- **Importar** invoca una ventana emergente que ofrece cargar la Clave Privada y el Certificado de Firma.
- **Generar** invoca una ventana emergente para generar la Clave Privada y el Certificado de Firma desde la CA integrada.
  - Los usuarios deben verificar que la pestaña [Perfil - Gestión de Claves SSL](/profile-ssl-key-management) tenga un Certificado de CA Raíz o Certificado de CA Intermedio válido.
  - Al generar claves, los usuarios deben seleccionar la opción *Usar CA SSL* para usar la CA integrada al crear y firmar un nuevo Certificado de Firma.
- **Eliminar** eliminará la Clave Privada y el Certificado de Firma. En los Niveles de Seguridad *bajo* y *medio*, esto impedirá que los Workflows y Recursos de Job sean desplegados.

## Referencias

### Ayuda de Contexto

- [Perfil](/profile)
- [Perfil - Gestión de Claves SSL](/profile-ssl-key-management)

### Base de Conocimiento del Producto

- [JS7 - How to create X.509 Signing Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Signing+Certificates)
- [JS7 - How to update the Digital Signing Certificate for deployment](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+update+the+Digital+Signing+Certificate+for+deployment)
- [JS7 - Profiles - Signature Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+Signature+Key+Management)
