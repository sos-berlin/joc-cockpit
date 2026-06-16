# Búsqueda de Calendarios

La *Búsqueda de Calendarios* se utiliza para buscar Calendarios basándose en criterios como:

- **Entrada del Usuario** que coincida con un nombre o título determinado, opcionalmente limitado por carpetas.

## Metacaracteres

- El metacarácter **?** reemplazará cualquier carácter individual.
- El metacarácter **\*** reemplazará cero o más caracteres.

La búsqueda se realiza sin distinción de mayúsculas y minúsculas y de forma parcialmente calificada, por ejemplo:

- **test** encontrará Calendarios con el nombre "My-**Test**-Board-1" y "**TEST**-Board-2"
- **te?t** encontrará Calendarios con el nombre "Global-**Test**-Board-1" y "**TEXT**-Board-2"
- **te\*t** encontrará Calendarios con el nombre "My-**tExt**-Board-1" y "My-**Terminat**ing-Board-2"

## Búsqueda Avanzada

La función está disponible haciendo clic en el enlace:<br/>**> Avanzado**

### Búsqueda por Atributos

La Búsqueda Avanzada permite buscar por atributos de objetos:

- **Nombre del Agente** devolverá Calendarios para Workflows que incluyan Jobs ejecutados con el Agente especificado.
- **Contar Jobs** devolverá Calendarios para Workflows que utilicen el número mínimo de Jobs especificado con el término **Desde**. Si se usa con el término **Hasta**, se devolverán Workflows que incluyan un número de Jobs en el rango entre *Desde* y *Hasta*. Si solo se usa el término *Hasta*, se devolverán Workflows que no incluyan un número de Jobs que supere el término *Hasta*.
- **Nombre del Job** devolverá Calendarios para Workflows que incluyan Jobs que coincidan con el nombre dado. Al usar la casilla de verificación *Coincidencia Exacta* para **Nombre del Job**, el término de búsqueda ingresado debe coincidir completamente con el nombre de un Job, incluyendo distinción de mayúsculas y minúsculas.

### Búsqueda por Dependencias

El metacarácter de búsqueda **\*** se utiliza para especificar que se buscan dependencias, por ejemplo con un Recurso de Lock sin importar el nombre que use:

- El metacarácter **\*** para **Recursos de Lock** devolverá Calendarios para Workflows que utilicen un Recurso de Lock.
- El metacarácter **\*** para **Órdenes Disparadas por Archivo** devolverá Calendarios para Workflows referenciados por una Orden Disparada por Archivo.

## Referencias

- [Configuración - Inventario - Calendarios](/configuration-inventory-calendars)
- [Recursos - Calendarios](/resources-calendars)
- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
