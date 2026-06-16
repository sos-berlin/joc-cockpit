# Perfil

El *Perfil* contiene la configuración relevante para la interacción de un usuario con JOC Cockpit.

Un *Perfil Base* está disponible, típicamente desde la cuenta *root*, que se usa

- para poblar los *Perfiles de Usuario* de las cuentas de usuario en el primer inicio de sesión,
- para proporcionar configuraciones relevantes para todas las cuentas de usuario si JOC Cockpit opera con el Nivel de Seguridad *bajo*.

Los usuarios pueden cambiar el *Perfil Base* a una cuenta diferente desde la página [Configuración - JOC Cockpit](/settings-joc).

Los usuarios deben tener en cuenta que los perfiles inactivos están sujetos a depuración por el [Servicio de Limpieza](/service-cleanup).

El *Perfil de Usuario* permite gestionar preferencias y configuraciones aplicables al usuario actual.

Para más detalles, consulte [JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles).

## Cambiar Contraseña

Haciendo clic en el enlace correspondiente, los usuarios pueden cambiar su contraseña si los [Servicios de Identidad](/identity-services) activos incluyen un servicio de tipo *JOC* que fue usado para el inicio de sesión actual.

- **Contraseña Anterior** espera que se especifique la contraseña actualmente en uso.
- **Nueva Contraseña** espera que se especifique la nueva contraseña.
    - Se requiere una longitud mínima de contraseña según la configuración en [Configuración - Servicio de Identidad](/settings-identity-service).
    - La *Contraseña Anterior* y la *Nueva Contraseña* deben ser diferentes.
- **Confirmar Contraseña** espera que se especifique nuevamente la nueva contraseña.

## Secciones del Perfil

La configuración de los *Perfiles de Usuario* está disponible desde las siguientes secciones:

- [Perfil - Preferencias](/profile-preferences)
- [Perfil - Permisos del Perfil](/profile-permissions)
- [Perfil - Gestión de Claves de Firma](/profile-signature-key-management)
- [Perfil - Gestión de Claves SSL](/profile-ssl-key-management)
- [Perfil - Gestión de Git](/profile-git-management)
- [Perfil - Gestión de Favoritos](/profile-favorite-management)

## Referencias

### Ayuda de Contexto

- [Servicio de Limpieza](/service-cleanup)
- [Servicios de Identidad](/identity-services)
- [Configuración - JOC Cockpit](/settings-joc)
- [Configuración - Servicio de Identidad](/settings-identity-service)

### Base de Conocimiento del Producto

- [JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles)
