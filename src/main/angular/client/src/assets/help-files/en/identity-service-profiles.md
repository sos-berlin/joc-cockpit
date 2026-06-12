# Servicio de Identidad - Perfiles

Los Servicios de Identidad controlan el acceso a JOC Cockpit mediante autenticación y autorización, consulte [Servicios de Identidad](/identity-services).

Para los usuarios que inician sesión con un Servicio de Identidad, en el primer inicio de sesión se creará un *Perfil* para el Servicio de Identidad correspondiente.

- Si hay más de un Servicio de Identidad disponible para el inicio de sesión, el usuario tendrá un *Perfil* con cada Servicio de Identidad en el que se haya realizado un inicio de sesión exitoso.
- El *Perfil* se crea a partir de la cuenta especificada con el parámetro *default_profile_account* en la página [Configuración - JOC Cockpit](/settings-joc). Por defecto, se utilizará el *Perfil* de la cuenta *root*.
- Los *Perfiles* serán purgados si no se utilizan durante un período prolongado. La página [Configuración - Servicio de Limpieza](/settings-cleanup) especifica el período máximo durante el cual un *Perfil* permanecerá vigente cuando no se produzca ningún inicio de sesión desde la cuenta de usuario correspondiente.

## Operaciones sobre los Perfiles

La sub-vista muestra la lista de *Perfiles* activos y la fecha del último inicio de sesión. Las siguientes operaciones están disponibles para los *Perfiles* individualmente:

- Al hacer clic en el *Perfil* se navega a la sub-vista [Servicio de Identidad - Roles](/identity-service-roles) para mostrar los roles utilizados por el *Perfil* indicado.
- El menú de acción de un *Perfil* ofrece las siguientes operaciones:
  - **Eliminar Preferencias del Perfil** restablecerá las [Preferencias del Perfil](/profile-preferences) a sus valores predeterminados. Otras configuraciones del *Perfil*, como *Gestión de Git* y *Gestión de Favoritos*, permanecerán vigentes. La operación puede utilizarse para forzar la aplicación del *Perfil* de la cuenta predeterminada.
  - **Eliminar Perfil** borra el *Perfil* de la cuenta de usuario. En el próximo inicio de sesión de la cuenta correspondiente se creará un nuevo *Perfil*.

Los usuarios pueden seleccionar uno o más *Perfiles* para realizar las operaciones anteriores en forma masiva para los *Perfiles* seleccionados.

## Referencias

### Ayuda Contextual

- [Servicio de Identidad - Configuración](/identity-service-configuration)
- [Servicio de Identidad - Cuentas](/identity-service-accounts)
- [Servicio de Identidad - Roles](/identity-service-roles)
- [Servicios de Identidad](/identity-services)
- [Perfil - Preferencias](/profile-preferences)
- [Configuración - Servicio de Limpieza](/settings-cleanup)
- [Configuración - JOC Cockpit](/settings-joc)

### Base de Conocimiento del Producto

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
