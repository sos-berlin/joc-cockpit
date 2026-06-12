# Búsqueda de Recursos de Lock

La *Búsqueda de Recursos de Lock* se utiliza para buscar Recursos de Lock basándose en criterios como:

- **Entrada del Usuario** que coincida con un nombre o título determinado, opcionalmente limitado por carpetas.

## Metacaracteres

- El metacarácter **?** reemplazará cualquier carácter individual.
- El metacarácter **\*** reemplazará cero o más caracteres.

La búsqueda se realiza sin distinción de mayúsculas y minúsculas y de forma parcialmente calificada, por ejemplo:

- **test** encontrará Recursos de Lock con el nombre "My-**Test**-Board-1" y "**TEST**-Board-2"
- **te?t** encontrará Recursos de Lock con el nombre "Global-**Test**-Board-1" y "**TEXT**-Board-2"
- **te\*t** encontrará Recursos de Lock con el nombre "My-**tExt**-Board-1" y "My-**Terminat**ing-Board-2"

## Búsqueda Avanzada

La función está disponible haciendo clic en el enlace:<br/>**> Avanzado**

### Búsqueda por Atributos

La Búsqueda Avanzada permite buscar por atributos de objetos:

- **Nombre del Agente** devolverá Recursos de Lock para Workflows que incluyan Jobs ejecutados con el Agente especificado.
- **Contar Jobs** devolverá Recursos de Lock para Workflows que utilicen el número mínimo de Jobs especificado con el término **Desde**. Si se usa con el término **Hasta**, se devolverán Workflows que incluyan un número de Jobs en el rango entre *Desde* y *Hasta*. Si solo se usa el término *Hasta*, se devolverán Workflows que no incluyan un número de Jobs que supere el término *Hasta*.
- **Nombre del Job** devolverá Recursos de Lock para Workflows que incluyan Jobs que coincidan con el nombre dado. Al usar la casilla de verificación *Coincidencia Exacta* para **Nombre del Job**, el término de búsqueda ingresado debe coincidir completamente con el nombre de un Job, incluyendo distinción de mayúsculas y minúsculas.

### Búsqueda por Dependencias

El metacarácter de búsqueda **\*** se utiliza para especificar que se buscan dependencias, por ejemplo con un Tablero de Avisos sin importar el nombre que use:

- El metacarácter **\*** para **Tableros de Avisos** devolverá Recursos de Lock para Workflows que utilicen un Tablero de Avisos.
- El metacarácter **\*** para **Órdenes Disparadas por Archivo** devolverá Recursos de Lock para Workflows referenciados por una Orden Disparada por Archivo.

## Referencias

- [Recursos - Recursos de Lock](/resources-resource-locks)
