# Búsqueda de Workflows

La Búsqueda de Workflows se utiliza para buscar Workflows basándose en criterios como:

- **Entrada del Usuario** que coincida con un nombre o título determinado, opcionalmente limitado por carpetas,
- Disponibilidad del Workflow
  - Los Workflows **Sincronizados** están desplegados en un Controlador.
  - Los Workflows **Suspendidos** están congelados, es decir, aceptan Órdenes pero no permitirán que las Órdenes inicien.
  - Los Workflows **Pendientes** esperan la confirmación de un Agente de que los Workflows han sido suspendidos.
- Disponibilidad de Jobs
  - Los Jobs **Omitidos** no serán considerados para ejecución cuando las Órdenes pasen por ellos.
  - Los Jobs **Detenidos** suspenderán las Órdenes que lleguen.

## Metacaracteres

- El metacarácter **?** reemplaza cualquier carácter individual.
- El metacarácter **\*** reemplaza cero o más caracteres.

La búsqueda se realiza sin distinción de mayúsculas y minúsculas y de forma parcialmente calificada, por ejemplo:

- **rest** encontrará Workflows con el nombre "pdfNon**Rest**artable" y "**REST**-RunningTaskLog"
- **re?t** encontrará Workflows con el nombre "ActivePassiveDi**rect**or" y "JITL-JS7**REST**ClientJob"
- **re\*t** encontrará Workflows con el nombre "pdSQLExecuto**rExt**ractJSON" y "pdu**Reset**Subagent"

## Búsqueda Avanzada

La función está disponible haciendo clic en el enlace:<br/>**> Avanzado**

### Búsqueda por Atributos

La Búsqueda Avanzada permite buscar por atributos de objetos:

- **Nombre del Agente** devolverá Workflows que incluyan Jobs ejecutados con el Agente especificado.
- **Contar Jobs** devolverá Workflows que utilicen el número mínimo de Jobs especificado con el término **Desde**. Si se usa con el término **Hasta**, se devolverán Workflows que incluyan un número de Jobs en el rango entre *Desde* y *Hasta*. Si solo se usa el término *Hasta*, se devolverán Workflows que no incluyan un número de Jobs que supere el término *Hasta*.
- **Nombre del Job** devuelve Workflows que incluyan Jobs que coincidan con el nombre dado. Al usar la casilla de verificación *Coincidencia Exacta* para **Nombre del Job**, el término de búsqueda ingresado debe coincidir completamente con el nombre de un Job, incluyendo distinción de mayúsculas y minúsculas.

### Búsqueda por Dependencias

El metacarácter de búsqueda **\*** se utiliza para especificar que se buscan dependencias, por ejemplo con un Recurso de Lock sin importar el nombre que use:

- El metacarácter **\*** para **Recursos de Lock** devolverá Workflows que utilicen un Recurso de Lock.
- El metacarácter **\*** para **Órdenes Disparadas por Archivo** devolverá Workflows referenciados por una Orden Disparada por Archivo.
