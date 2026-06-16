# Recursos de Lock

La vista *Recursos de Lock* muestra información en tiempo real sobre el uso de Recursos de Lock.

Los Recursos de Lock se utilizan para limitar el paralelismo de Jobs e Instrucciones de Workflow entre Workflows.
Los Recursos de Lock son instrucciones de bloque que pueden abarcar varios Jobs e Instrucciones de Workflow en el mismo Workflow.

- Los **Locks Exclusivos** pueden ser utilizados por un único Job. El acceso exclusivo se configura desde el Recurso de Lock o desde su uso en el Workflow.
- Los **Locks Compartidos** pueden ser utilizados por un número configurable de Jobs.
  - Al Recurso de Lock se le asigna una *capacidad*, por ejemplo 6.
  - Cada uso del Recurso de Lock por un conjunto de Jobs tiene asignado un *peso*, por ejemplo 3 y 4 para su uso en los Workflows A y B. Esto permite que 2 Órdenes del Workflow A se ejecuten en paralelo y deniega la ejecución paralela de Órdenes de los Workflows A y B.

## Panel de Navegación

El panel izquierdo muestra el árbol de carpetas del inventario que contienen Recursos de Lock.

- Hacer clic en la carpeta muestra los Recursos de Lock de esa carpeta.
- Hacer clic en el ícono chevron-down disponible al pasar el cursor sobre una carpeta muestra los Recursos de Lock de la carpeta y de cualquier subcarpeta.

El ícono de Búsqueda Rápida ofrece la posibilidad de buscar Recursos de Lock basándose en la entrada del usuario:

- Escribir **Test** mostrará Recursos de Lock con nombres como *test-lock-1* y *TEST-lock-2*.
- Escribir **\*Test** mostrará Recursos de Lock con nombres como *test-lock-1* y *my-TEST-lock-2*.

## Panel de Recursos de Lock

### Visualización de Recursos de Lock

Se muestra la siguiente información:

- **Nombre** es el nombre único de un Recurso de Lock.
- **Fecha de Despliegue** es la fecha en que se desplegó el Recurso de Lock.
- **Estado** es uno de *Sincronizado* y *No Sincronizado* si el Recurso de Lock no ha sido desplegado al Controlador.
- **Peso Adquirido** indica el *peso* acumulativo de las Órdenes paralelas que adquirieron el lock.
- **Órdenes en Posesión** indica el número de Órdenes que adquirieron el lock.
- **Órdenes en Espera** indica el número de Órdenes que están esperando adquirir el lock.
- **Capacidad** indica la *capacidad* disponible del lock. Los *Locks Exclusivos* tienen una *capacidad* de 1; los *Locks Compartidos* tienen una *capacidad* individual.

### Visualización de Órdenes

Hacer clic en el ícono de flecha hacia abajo expandirá el Recurso de Lock y mostrará información detallada sobre las Órdenes en posesión que adquirieron el Recurso de Lock y las Órdenes que están esperando para adquirirlo.

## Búsqueda

La *Búsqueda* ofrece criterios para buscar Recursos de Lock por dependencias, por ejemplo buscando Workflows que incluyan un nombre de Job específico; se devolverán los Recursos de Lock utilizados por el Workflow.

## Referencias

- [Búsqueda de Recursos de Lock](/resources-resource-locks-search)
- [JS7 - Resource Locks](https://kb.sos-berlin.com/display/JS7/JS7+-+Resource+Locks)
