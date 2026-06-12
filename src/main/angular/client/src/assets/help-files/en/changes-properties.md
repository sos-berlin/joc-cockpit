# Propiedades del Cambio

JOC Cockpit ofrece la gestión de [JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes) sobre objetos como Workflows. Un Cambio es una colección de objetos de inventario que están sujetos a operaciones de despliegue conjunto:

- para despliegue en Controladores,
- para distribución mediante [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import),
- para distribución mediante la [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface).

Los Cambios incluyen objetos de inventario como Workflows, Planificaciones, etc., y también incluyen objetos referenciados, por ejemplo un Recurso de Job referenciado por un Workflow.

- Los usuarios pueden agregar objetos de inventario directamente a un Cambio.
- Los objetos referenciados se asocian automáticamente a un Cambio.

La ventana emergente *Cambio - Propiedades* se utiliza para especificar las propiedades de los Cambios.

## Propiedades

Los Cambios contienen las siguientes propiedades:

- **Nombre** es el nombre único que los usuarios asignan a un Cambio.
- **Título** explica el propósito del Cambio.
- **Estado** es uno de *Abierto* o *Cerrado*. Los Cambios cerrados no se ofrecen para operaciones de despliegue o exportación.

## Referencias

### Ayuda Contextual

- [Cambios](/changes)

### Base de Conocimiento del Producto

- [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface)
- [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import)
- [JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes)
