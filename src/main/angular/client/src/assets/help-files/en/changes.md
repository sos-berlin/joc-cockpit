# Administrar Cambios

JOC Cockpit ofrece la gestión de [JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes) sobre objetos como Workflows. Un Cambio se considera una lista de objetos de inventario que están sujetos a operaciones de despliegue conjunto:

- para despliegue en Controladores,
- para distribución mediante [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import),
- para distribución mediante la [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface).

Los Cambios incluyen objetos de inventario como Workflows, Planificaciones, etc., y también incluyen objetos referenciados, por ejemplo un Recurso de Job referenciado por un Workflow.

- Los usuarios pueden agregar objetos de inventario directamente a un Cambio.
- Los objetos referenciados se asocian automáticamente a un Cambio.

La página *Administrar Cambios* se utiliza para agregar, actualizar y eliminar Cambios.

## Lista de Cambios

Los Cambios existentes se muestran en una lista:

- **Menú de Acciones** ofrece actualizar y eliminar la entrada del Cambio.
- **Nombre** es el nombre único que los usuarios asignan a un Cambio.
- **Título** explica el propósito del Cambio.
- **Estado** es uno de *Abierto* o *Cerrado*. Los Cambios cerrados no se ofrecen para operaciones de despliegue o exportación.
- **Propietario** indica la cuenta que es dueña del Cambio.
- **Objetos** ofrece un ícono para mostrar los objetos sujetos al Cambio.

## Operaciones sobre Cambios

Desde la parte superior de la pantalla están disponibles los siguientes botones:

- **Agregar Cambio** ofrece la posibilidad de agregar un Cambio. Consulte los detalles en [Cambios - Propiedades](/changes-properties).

Desde la *Lista de Cambios*, las siguientes operaciones están disponibles mediante el menú de acciones de 3 puntos:

- **Editar** permite actualizar las propiedades del Cambio. Consulte los detalles en [Cambios - Propiedades](/changes-properties).
- **Eliminar** eliminará la entrada del Cambio.

## Referencias

### Ayuda Contextual

- [Cambios - Propiedades](/changes-properties)

### Base de Conocimiento del Producto

- [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface)
- [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import)
- [JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes)
