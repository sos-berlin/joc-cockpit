# Configuración - Inventario - Scripts Incluidos

El *Panel de Scripts Incluidos* permite especificar fragmentos de código para su uso con Jobs. Para más detalles ver [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes).

Los Jobs de Shell pueden utilizarse con varios lenguajes de scripting como Bash, Python, PowerShell, etc.

- Los usuarios frecuentemente reutilizan fragmentos de código en varios Jobs, por ejemplo funciones reutilizables que se llaman en varios *Scripts de Job*.
- Esto aplica tanto a Jobs de Shell que usan Bash, etc., como al uso de cualquier lenguaje de scripting con un Job.
- Los Scripts Incluidos se expanden en los *Scripts de Job* cuando el Workflow es desplegado. Esto implica que los cambios en los Scripts Incluidos requieren desplegar el Workflow relacionado. JS7 realiza un seguimiento de las dependencias y ofrece desplegar los Workflows relacionados al liberar el Script Incluido.

Los Scripts Incluidos se gestionan desde los siguientes paneles:

- El [Panel de Navegación - Configuración - Inventario](/configuration-inventory-navigation) en el lado izquierdo de la ventana ofrece navegación por carpetas que contienen Scripts Incluidos. Además, el panel ofrece operaciones sobre Scripts Incluidos.
- El *Panel de Scripts Incluidos* en el lado derecho de la ventana contiene los detalles de configuración del Script Incluido.

## Panel de Scripts Incluidos

Para un Script Incluido están disponibles los siguientes campos de entrada:

- **Nombre** es el identificador único de un Script Incluido, ver [Reglas de Nomenclatura de Objetos](/object-naming-rules).
- **Título** contiene una explicación opcional del propósito del Script Incluido.
- **Script Incluido** contiene el fragmento de código.

## Operaciones sobre Scripts Incluidos

Para las operaciones disponibles ver [Panel de Navegación - Configuración - Inventario](/configuration-inventory-navigation).

## Uso con Jobs

Los Jobs referencian Scripts Incluidos desde la propiedad *Script de Job* usando una de las siguientes sintaxis:

- **\#\#!include *nombre-script-incluido***
- **::!include *nombre-script-incluido***
- **//!include *nombre-script-incluido***

El *nombre-script-incluido* especifica el identificador del Script Incluido. Los usuarios pueden escribir la entrada anterior en el *Script de Job* y pueden invocar la Búsqueda Rápida.

### Búsqueda Rápida

Al presionar el atajo de teclado CTRL+Espacio mientras el cursor está en el *Script de Job* se invocará la Búsqueda Rápida de Scripts Incluidos:

- La Búsqueda Rápida ofrece:
  - navegación desde carpetas del inventario,
  - selección de Scripts Incluidos por nombre al escribir uno o más caracteres.
- La Búsqueda Rápida no distingue entre mayúsculas y minúsculas y aplica truncamiento por la derecha. Para la búsqueda con truncamiento por la izquierda, los usuarios pueden aplicar el metacarácter \* que es un comodín para cualquier número de caracteres.
- Tras seleccionar un Script Incluido, la entrada relacionada se agrega a la línea donde se encuentra el cursor.

### Parametrización

Los Scripts Incluidos pueden parametrizarse de la siguiente manera:

- **\#\#!include *nombre-script-incluido* --replace="literal-buscar","literal-reemplazar"**
- **::!include *nombre-script-incluido* --replace="literal-buscar","literal-reemplazar"**
- **//!include *nombre-script-incluido* --replace="literal-buscar","literal-reemplazar"**

El *literal-buscar* se buscará en el Script Incluido y será reemplazado por el *literal-reemplazar* cuando el Workflow que contiene el Job relacionado sea desplegado.

### Ejemplos

#### PowerShell para Unix

Para su uso con PowerShell en plataformas Unix se sugiere el siguiente shebang para un Script Incluido:

<pre>
#!/usr/bin/env pwsh
</pre>

#### PowerShell para Windows

Para su uso con PowerShell en plataformas Windows se sugiere el siguiente shebang para un Script Incluido:

<pre>
@@setlocal enabledelayedexpansion & for /f %%a in ('bitsadmin /rawreturn /create guid') do set g=%%a& set g=!g:~0,-1!& set f=%~n0.!g!.ps1 & @@findstr/v "^@@[fs].*&" "%~f0" > !f! & powershell.exe -NonInteractive -File !f! & set e=!errorlevel! & del /q !f! & exit !e!/b&
</pre>

El Script Incluido escribirá el contenido del *Script de Job* en un archivo temporal que será ejecutado con el binario *powershell.exe*. Los usuarios deben cambiar al binario *pwsh.exe* si se utilizan versiones más recientes de PowerShell. Los errores del script serán considerados por el Agente de JS7 y la salida del Log se limpiará de caracteres de escape para coloración.

## Referencias

### Ayuda Contextual

- [Panel de Navegación - Configuración - Inventario](/configuration-inventory-navigation)
- [Configuración - Inventario - Workflow - Opciones de Job](/configuration-inventory-workflow-job-options)
- [Reglas de Nomenclatura de Objetos](/object-naming-rules)

### Base de Conocimiento del Producto

- [JS7 - How to run PowerShell scripts from jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+run+PowerShell+scripts+from+jobs)
- [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes)
