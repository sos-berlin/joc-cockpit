# Configuration - Inventory - Script Includes

The *Script Include Panel* offers specifying code snippets for use with Jobs. For details see [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes).

Shell Jobs can be used for a number of scripting languages such as Bash, Python, PowerShell etc.

- Users frequently re-use code snippets across a number of Jobs, for example re-usable functions that are called in a number of *Job Scripts*.
- This applies to Shell Jobs using Bash etc. and it applies to use of any scripting language with a Job.
- Script Includes are expanded in *Job Scripts* when the Workflow is deployed. This implies that changes to Script Includes require deploying the related Workflow. The JS7 keeps track of dependencies and offers deploying related Workflows when releasing the Script Include.

Script Includes are managed from the following panels:

- The [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) on the left side of the window offers navigation by folders holding Script Includes. In addition, the panel offers operations on Script Includes.
- The *Script Include Panel* on the right side of the window holds details for Script Include configuration.

## Script Include Panel

For a Script Include the following inputs are available:

- **Name** is the unique identifier of a Script Include, see [Object Naming Rules](/object-naming-rules).
- **Title** holds an optional explanation of the Script Include's purpose.
- **Script Include** holds the code snippet.

## Operations on Script Includes

For available operations see [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

## Use with Jobs

Jobs reference Script Includes from the *Job Script* property using one of the following syntax flavors:

- **\#\#!include *script-include-name***
- **::!include *script-include-name***
- **//!include *script-include-name***

The *script-include-name* specifies the identifier of the Script Include. Users can type the above input into the *Job Script* and they can invoke Quick Search.

### Quick Search

Hitting the CTRL+Space keyboard shortcut while the cursor is in the *Job Script* will invoke the Quick Search for Script Includes:

- Quick Search offers 
  - navigation from inventory folders,
  - selecting Script Includes by name when typing one or more characters.
- Quick Search is case-insensitive and is right-truncated. For left-truncated input users can apply the \* meta character that is a placeholder for any number of characters.
- After selecting a Script Include, the related input is added to the line that holds the cursor.

### Parameterization

Script Includes can be parameterized like this:

- **\#\#!include *script-include-name* --replace="search-literal","replacement-literal"**
- **::!include *script-include-name* --replace="search-literal","replacement-literal"**
- **//!include *script-include-name* --replace="search-literal","replacement-literal"**

The *search-literal* will be looked up in the Script Include and will be replaced by the *replacement-literal* when the Workflow holding the related Job will be deployed.

### Examples

#### PowerShell for Unix

For use with PowerShell on Unix platforms the following shebang is suggested for a Script Include:

<pre>
#!/usr/bin/env pwsh
</pre>

#### PowerShell for Windows

For use with PowerShell on Windows platforms the following shebang is suggested for a Script Include:

<pre>
@@setlocal enabledelayedexpansion & set NO_COLOR=1 & set f=%RANDOM%.ps1 & @@findstr/v "^@@[fs].*&" "%~f0" > !f! & powershell.exe -NonInteractive -File !f! & set e=!errorlevel! & del /q !f! & exit !e!/b&
</pre>

The Script Include will write the contents of the *Job Script* to a temporary file that will be executed with the *powershell.exe* binary. Users should switch to using the *pwsh.exe* binary if later PowerShell versions are in use. Script errors will be considered by the JS7 Agent and log output will be stripped from escape characters for colouring. 

## References

### Context Help

- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options)
- [Object Naming Rules](/object-naming-rules)

### Product Knowledge Base

- [JS7 - How to run PowerShell scripts from jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+run+PowerShell+scripts+from+jobs)
- [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes)
