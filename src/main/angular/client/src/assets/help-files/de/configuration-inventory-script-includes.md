# Konfiguration - Inventar - Skript enthält

Das *Script Include Panel* bietet die Möglichkeit, Codeschnipsel für die Verwendung mit Jobs festzulegen. Einzelheiten finden Sie unter [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes).

Shell Jobs können für eine Reihe von Skriptsprachen wie Bash, Python, PowerShell usw. verwendet werden.

- Benutzer verwenden häufig Codeschnipsel in einer Reihe von Jobs wieder, z.B. wiederverwendbare Funktionen, die in einer Reihe von *Job Scripts* aufgerufen werden.
- Dies gilt für Shell-Jobs, die Bash usw. verwenden, und es gilt für die Verwendung einer beliebigen Skriptsprache mit einem Job.
- Script Includes werden in *Job Scripts* erweitert, wenn der Workflow bereitgestellt wird. Dies bedeutet, dass Änderungen an Script Includes die Bereitstellung des entsprechenden Workflows erfordern. JS7 verfolgt die Abhängigkeiten und bietet die Bereitstellung der zugehörigen Workflows an, wenn Sie das Script Include freigeben.

Script Includes werden über die folgenden Bedienfelder verwaltet:

- Die [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation) auf der linken Seite des Fensters bietet eine Navigation durch die Ordner, die Script Includes enthalten. Darüber hinaus bietet das Panel Operationen mit Script Includes.
- Das *Script Include Panel* auf der rechten Seite des Fensters enthält Details zur Konfiguration von Script Includes.

*Skript Include Panel

Für ein Script Include sind die folgenden Eingaben möglich:

- **Name** ist der eindeutige Bezeichner eines Script Include, siehe [Regeln zur Benennung von Objekten](/object-naming-rules).
- **Titel** enthält eine optionale Erklärung des Zwecks des Script Include.
- **Skript Include** enthält den Codeschnipsel.

## Operationen mit Script Includes

Für verfügbare Operationen siehe [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation).

## Verwendung mit Jobs

Jobs referenzieren Script Includes über die Eigenschaft *Job Script* mit einer der folgenden Syntaxvarianten:

- **###!include *script-include-name***
- **::!include *script-include-name***
- **//!include *script-include-name***

Der *script-include-name* gibt den Bezeichner des Script-Includes an. Benutzer können die obige Eingabe in das *Job Script* eingeben und die Schnellsuche aufrufen.

### Schnellsuche

Wenn Sie die Tastenkombination STRG+Leertaste drücken, während sich der Cursor im *Auftragsskript* befindet, wird die Schnellsuche für Script-Includes aufgerufen:

- Die Schnellsuche bietet 
  - die Navigation von Inventarordnern aus,
  - auswahl von Script Includes nach Namen, wenn Sie ein oder mehrere Zeichen eingeben.
- Bei der Schnellsuche wird die Groß- und Kleinschreibung nicht berücksichtigt und es wird nach rechts abgeschnitten. Für links abgeschnittene Eingaben können Sie das Metazeichen \* verwenden, das als Platzhalter für eine beliebige Anzahl von Zeichen dient.
- Nachdem Sie ein Script Include ausgewählt haben, wird die zugehörige Eingabe in die Zeile eingefügt, in der sich der Cursor befindet.

### Parametrisierung

Script Includes können wie folgt parametrisiert werden:

- **:!include *script-include-name* --replace="search-literal", "replacement-literal "**
- **::!include *script-include-name* --replace="search-literal", "replacement-literal "**
- **//!include *script-include-name* --replace="search-literal", "replacement-literal "**

Die *Such-Literal* wird im Script Include nachgeschlagen und durch die *Ersatz-Literal* ersetzt, wenn der Workflow, der den entsprechenden Job enthält, bereitgestellt wird.

### Beispiele

#### PowerShell für Unix

Für die Verwendung mit der PowerShell auf Unix-Plattformen wird der folgende Shebang für ein Script Include vorgeschlagen:

<pre>
#!/usr/bin/env pwsh
</pre>

#### PowerShell für Windows

Für die Verwendung mit der PowerShell auf Windows-Plattformen wird der folgende Shebang für ein Script Include vorgeschlagen:

<pre>
@@setlocal enabledelayedexpansion &amp; set NO_COLOR=1 &amp; set f=%RANDOM%.ps1 &amp; @@findstr/v "^@@[fs].*&amp;" "%~f0" &gt; !f! &amp; powershell.exe -NonInteractive -File !f! &amp; set e=!errorlevel! &amp; del /q !f! &amp; exit !e!/b&amp
</pre>

Das Skript Include schreibt den Inhalt des *Job-Skripts* in eine temporäre Datei, die mit der Binärdatei *powershell.exe* ausgeführt wird. Benutzer sollten zur Verwendung der Binärdatei *pwsh.exe* wechseln, wenn spätere PowerShell-Versionen im Einsatz sind. Skriptfehler werden vom JS7-Agenten berücksichtigt und die Protokollausgabe wird von Escape-Zeichen für die Farbgebung befreit. 

## Referenzen

### Kontexthilfe

- [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation)
- [Konfiguration - Inventar - Arbeitsablauf - Job-Optionen](/configuration-inventory-workflow-job-options)
- [Regeln zur Benennung von Objekten](/object-naming-rules)

### Product Knowledge Base

- [JS7 - How to run PowerShell scripts from jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+run+PowerShell+scripts+from+jobs)
- [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes)

