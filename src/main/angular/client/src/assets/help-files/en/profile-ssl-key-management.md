# Perfil - Gestión de Claves SSL

La pestaña *Perfil - Gestión de Claves SSL* ofrece la Autoridad de Certificación (CA) integrada que permite crear Certificados de Autenticación de Servidor y Certificados de Autenticación de Cliente para conexiones TLS/SSL con los productos JS7.

Para más detalles, consulte [JS7 - Profiles - SSL Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+SSL+Key+Management).

<img src="profile-ssl-key-management.png" alt="Gestión de Claves SSL" width="800" height="75" />

## Certificado de CA SSL

JS7 incluye un Certificado de CA SSL predeterminado. Los usuarios deben considerar el período de validez del Certificado. Los Certificados más nuevos se incluyen con las versiones de JS7 aproximadamente seis meses antes del vencimiento del certificado. En lugar de actualizar JS7, los usuarios pueden cargar un Certificado más nuevo.

Los usuarios pueden crear su propio Certificado de CA SSL:

- desde una Autoridad de Certificación (CA) Privada o CA Pública. El uso de una CA Privada se explica en [JS7 - How to create X.509 SSL TLS Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+SSL+TLS+Certificates).
- desde la CA SSL integrada que se incluye con JOC Cockpit.

## Operaciones sobre el Certificado de CA SSL

Se ofrecen las siguientes operaciones:

- **Mostrar** está disponible al hacer clic en el icono a la derecha del período de validez. Esto mostrará la Clave Privada y el Certificado de CA SSL.
- **Actualizar** invoca una ventana emergente que permite pegar una Clave Privada y Certificado de CA SSL actualizados.
- **Importar** invoca una ventana emergente que ofrece cargar la Clave Privada y el Certificado de CA SSL.
- **Generar** invoca una ventana emergente para generar la Clave Privada y el Certificado de CA SSL autoemitido.

## Referencias

### Ayuda de Contexto

- [Perfil](/profile)
- [Perfil - Gestión de Claves SSL](/profile-ssl-key-management)

### Base de Conocimiento del Producto

- [JS7 - Certificate Authority](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Authority)
  - [JS7 - Certificate Authority - Manage Certificates with JOC Cockpit](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Authority+-+Manage+Certificates+with+JOC+Cockpit)
  - [JS7 - Certificate Authority - Rollout Certificates for HTTPS Connections](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Authority+-+Rollout+Certificates+for+HTTPS+Connections)
- [JS7 - How to create X.509 SSL TLS Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+SSL+TLS+Certificates)
- [JS7 - Profiles - SSL Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+SSL+Key+Management)
