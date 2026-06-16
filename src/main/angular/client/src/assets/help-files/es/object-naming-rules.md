# Reglas de Nomenclatura de Objetos

Los nombres de objetos se especifican en varios lugares para:

- Workflows, Jobs, Variables, Tableros de Avisos, Recursos de Lock, Órdenes Disparadas por Archivo, Recursos de Job, Carpetas,
- Calendarios, Planificaciones, Inclusiones de Scripts, Plantillas de Job, Reportes.

JS7 no impone convenciones de nomenclatura para los objetos: los usuarios son libres de elegir las convenciones de nomenclatura que prefieran, por ejemplo, para nombres de Job usando:

- estilo camelCase como en: *loadDataWarehouseDaily*
- estilo kebab como en: *load-data-warehouse-daily*
- estilo mixto como en: *DataWarehouse-Load-Daily*

## Conjunto de Caracteres

JS7 permite el uso de caracteres Unicode para los Nombres de Objetos.

### Nombres de Objetos

Se aplican varias restricciones a los Nombres de Objetos:

#### Reglas de Nomenclatura

- Se deben considerar las siguientes reglas de nomenclatura para los Nombres de Objetos: [Java Identifiers](https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.8)
- No se permiten caracteres de control según la expresión regular \[^\\\\x00-\\\\x1F\\\\x7F\\\\x80-\\\\x9F\]
- No se permiten caracteres de puntuación. Sin embargo, los puntos '.', el guion bajo '_' y el guion '-' están permitidos según la expresión regular: \[^\\\\x20-\\\\x2C\\\\x2F\\\\x3A-\\\\x40\\\\x5B-\\\\x5E\\\\x60\\\\x7B-\\\\x7E\\\\xA0-\\\\xBF\\\\xD7\\\\xF7\]
  - Punto: no se permite como carácter inicial o final, y no se permiten dos puntos consecutivos.
  - Guion: no se permite como carácter inicial o final, y no se permiten dos guiones consecutivos.
  - No se permiten corchetes \[({})\]
- No se permiten caracteres de ancho medio (half-width), consulte [Halfwidth and Fullwidth Forms](https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_(Unicode_block)).
- No se permiten espacios.
- Los Nombres de Objetos pueden comenzar con un dígito.
- No se permite el uso de palabras reservadas de Java:
  - *abstract, continue, for, new, switch, assert, default, goto, package, synchronized, boolean, do, if, private, this, break, double, implements, protected, throw, byte, else, import, public, throws, case, enum, instanceof, return, transient, catch, extends, int, short, try, char, final, interface, static, void, class, finally, long, strictfp, volatile, const, float, native, super, while*
  - Ejemplo: el uso de la palabra reservada *switch* no está permitido; el uso de *myswitch* sí está permitido.

#### Ejemplos

- Caracteres de idiomas nacionales como el japonés:
  - *こんにちは世界*
- Uso de punto, guion, guion bajo:
  - *Say.Hello*
  - *Say-Hello*
  - *say_hello*

### Etiquetas

Se aplican reglas más permisivas a las *Etiquetas* que se usan para indicar la posición de un Job u otra instrucción de Workflow:

- Las Etiquetas pueden comenzar con dígitos, caracteres, _
- Las Etiquetas pueden incluir $, _, -, #, :, !
- Las Etiquetas no pueden incluir lo que no está permitido para los Nombres de Objetos, por ejemplo, sin comillas, sin espacios, \[, \], {, }, /, \, =, +

### Unicidad de los Nombres de Objetos

Los Nombres de Objetos en JS7 son únicos por tipo de objeto, es decir, por Workflow, por Job en un Workflow, por Recurso de Lock, etc.

- Los usuarios pueden agregar Nombres de Objetos con mayúsculas/minúsculas.
- El nombre del objeto se conserva exactamente como fue escrito por el usuario en la GUI del JOC Cockpit.
- Los usuarios no pueden agregar el mismo Nombre de Objeto con una ortografía diferente si el DBMS subyacente no lo admite para el tipo de datos *nvarchar*. Por ejemplo, si existe un Nombre de Objeto *myLock*, no se puede crear un nuevo objeto con el nombre *mylock* cuando se usa el DBMS MySQL.

### Longitud de los Nombres de Objetos

La longitud máxima de los Nombres de Objetos es la siguiente:

- Básicamente, los Nombres de Objetos pueden tener hasta 255 caracteres Unicode.
- Se aplican las siguientes restricciones:
  - Los objetos típicamente se ubican en carpetas: la longitud total de la jerarquía de carpetas y el nombre del objeto no puede superar los 255 caracteres.
  - Las ramas dentro de una [JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction) están limitadas a 10 caracteres.
  - Las ramas pueden anidarse hasta 15 niveles.

## Referencias

- [Halfwidth and Fullwidth Forms](https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_(Unicode_block))
- [Java Identifiers](https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.8)
- [JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction)
- [JS7 - Object Naming Rules](https://kb.sos-berlin.com/display/JS7/JS7+-+Object+Naming+Rules)
