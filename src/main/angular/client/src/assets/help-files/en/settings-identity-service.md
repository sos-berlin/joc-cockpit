# Configuración - Servicio de Identidad

Las siguientes configuraciones se aplican a cualquier [Servicio de Identidad](/identity-services). Los cambios tienen efecto inmediato.

La página de *Configuración* es accesible desde el ícono ![ícono de rueda](assets/images/wheel.png) en la barra de menú.

## Configuración del Servicio de Identidad

### Configuración: *idle\_session\_timeout*, Predeterminado: *30*m

Especifica la duración máxima en minutos de una sesión inactiva en el JOC Cockpit.

- Si los usuarios están inactivos durante el número de minutos indicado, la sesión de usuario expira y se termina. Los usuarios pueden especificar credenciales e iniciar sesión para crear una nueva sesión de usuario.
- Si la vigencia de un token de acceso proporcionado por un Servicio de Identidad externo es diferente al tiempo máximo de inactividad, el JOC Cockpit intentará renovar el token de acceso con el Servicio de Identidad. Renovar un token de acceso no requiere que el usuario vuelva a ingresar sus credenciales de inicio de sesión.
- Los Servicios de Identidad pueden restringir la vigencia de los tokens de acceso (tiempo de vida) y pueden limitar la renovación de tokens de acceso (tiempo de vida máximo). Si un token de acceso no puede renovarse, la sesión de usuario se termina y el usuario debe realizar el inicio de sesión.

### Configuración: *initial\_password*, Predeterminado: *initial*

Especifica la contraseña inicial utilizada al crear nuevas cuentas o al restablecer contraseñas en el [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service).

- Si un administrador agrega cuentas de usuario con el JOC Cockpit y no especifica una contraseña, se utilizará la Contraseña Inicial. Como regla general, el JOC Cockpit no permite el uso de contraseñas vacías sino que las rellena desde la *initial\_password*. Los administradores pueden aplicar la contraseña inicial y pueden especificar una contraseña individual para la cuenta dada.
- Al restablecer la contraseña de una cuenta de usuario, la contraseña existente será reemplazada por la *initial\_password*.
- Independientemente de si se asigna la *initial\_password* o una contraseña individual a una cuenta de usuario, la contraseña debe ser cambiada por el usuario en el primer inicio de sesión. Esto garantiza que los usuarios no puedan usar la contraseña inicial excepto para el inicio de sesión inicial.

### Configuración: *minimum\_password\_length*, Predeterminado: *1*

Especifica la longitud mínima para contraseñas en el Servicio de Identidad JOC.

Para cualquier contraseña especificada, incluida la *initial\_password*, se indica la longitud mínima.
Tenga en cuenta que el número de caracteres y la arbitrariedad en la selección de caracteres son factores clave para contraseñas seguras. La complejidad de contraseñas que requiere, por ejemplo, el uso de dígitos y caracteres especiales no agrega sustancialmente a la seguridad de la contraseña, excepto en el caso de contraseñas cortas.

## Referencias

### Ayuda Contextual

- [Servicios de Identidad](/identity-services)
- [Configuración](/settings)

### Base de Conocimiento del Producto

- [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
- [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
