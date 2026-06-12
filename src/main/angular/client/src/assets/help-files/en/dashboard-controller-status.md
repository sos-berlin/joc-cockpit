# Dashboard - Estado del Controlador

El panel *Estado del Controlador* proporciona información sobre los Controladores registrados.

## Instancias del Controlador

Cada instancia del Controlador mostrada ofrece los siguientes atributos:

- **ID del Controlador**: indica un identificador único especificado al instalar el Controlador. En un Clúster de Controladores, todas las instancias comparten el mismo ID de Controlador.
- **URL**: especifica la URL mediante la cual se puede acceder a la instancia del Controlador.
- **Estado**: indica el estado del componente, siendo *operativo* o *desconocido* si la instancia del Controlador no puede ser alcanzada.
- **Rol en el Clúster**: indica el rol *activo* o *en espera* de una instancia del Controlador en un clúster.

Al hacer clic en el ID de una instancia del Controlador, el dashboard cambiará para mostrar el estado del producto del Controlador correspondiente.

## Operaciones sobre las Instancias del Controlador

Las siguientes operaciones están disponibles:

Las instancias del Controlador ofrecen las siguientes operaciones desde el menú de acción de los tres puntos de cada instancia:

- **Terminar**, **Terminar y Reiniciar**: apagan la instancia. Para la instancia activa en un clúster, el menú se expande con:
  - **con conmutación**: para transferir el rol activo a la instancia en espera.
  - **sin conmutación**: para mantener el rol activo en la instancia apagada. Los usuarios deben tener en cuenta que no se producirá conmutación por error y que ninguna instancia quedará activa.
- **Cancelar**, **Cancelar y Reiniciar**: terminan forzosamente la instancia. Si se aplica a la instancia activa en un clúster, se forzará la conmutación por error:
  - **con conmutación por error**: transferirá el rol activo a la instancia en espera.
- **Descargar Log**: ofrece el archivo controller.log del Controlador para descarga en formato comprimido .gz.

## Referencias

- [Dashboard - Estado del Producto](/dashboard-product-status)
