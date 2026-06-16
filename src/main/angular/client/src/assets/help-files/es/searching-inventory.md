# Búsqueda de Inventario

La Búsqueda de Inventario se utiliza para limitar los resultados por tipo de objeto, por ejemplo:

- devolver objetos que coincidan con un nombre o título determinado, opcionalmente limitado por carpetas
- devolver objetos desplegados o liberados, objetos en borrador, objetos no válidos

## Metacaracteres

- El metacarácter **?** reemplaza cualquier carácter individual.
- El metacarácter **\*** reemplaza cero o más caracteres.

La búsqueda se realiza sin distinción de mayúsculas y minúsculas y de forma parcialmente calificada, por ejemplo:

- **rest** encontrará objetos con el nombre "pdfNon**Rest**artable" y "**REST**-RunningTaskLog"
- **re?t** encontrará objetos con el nombre "ActivePassiveDi**rect**or" y "JITL-JS7**REST**ClientJob"
- **re\*t** encontrará objetos con el nombre "pdSQLExecuto**rExt**ractJSON" y "pdu**Reset**Subagent"

## Búsqueda Avanzada

La función está disponible haciendo clic en el enlace: **> Avanzado**

### Búsqueda por Atributos

La Búsqueda Avanzada permite buscar por atributos de objetos:

- **Nombre del Agente** devolverá resultados que incluyan Jobs ejecutados con el Agente especificado.
- **Contar Jobs** limitará los resultados de búsqueda a Workflows que utilicen el número mínimo de Jobs especificado con el término **Desde**. Si se usa con el término **Hasta**, se devolverán Workflows que incluyan un número de Jobs en el rango entre *Desde* y *Hasta*. Si solo se usa el término *Hasta*, se devolverán Workflows que no incluyan un número de Jobs que supere el término *Hasta*.
- **Nombre del Job** devuelve Workflows que incluyan Jobs que coincidan con el nombre dado.

Al usar la casilla de verificación *Coincidencia Exacta* para **Nombre del Job**, el término de búsqueda ingresado debe coincidir completamente con el nombre de un Job, incluyendo distinción de mayúsculas y minúsculas. La búsqueda por nombres de Jobs ofrece operaciones masivas sobre Jobs para los Workflows resultantes.

### Búsqueda por Dependencias

El metacarácter de búsqueda **\*** se utiliza para especificar que se buscan dependencias, por ejemplo con un Recurso de Lock sin importar el nombre que use:

- la búsqueda con el metacarácter **\*** para **Recursos de Lock** devolverá Workflows que utilicen un Recurso de Lock
- la búsqueda con el metacarácter **\*** para **Órdenes Disparadas por Archivo** devolverá Workflows referenciados por una Orden Disparada por Archivo

## Referencias

[JS7 - Inventory Search](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Search)
