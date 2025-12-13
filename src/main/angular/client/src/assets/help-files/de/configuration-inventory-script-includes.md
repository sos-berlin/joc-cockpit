# Konfiguration - Inventar - Skript-Bausteine

Der Bereich *Skript-Baustein* bietet die Möglichkeit, Code-Blöcke für die Verwendung mit Jobs festzulegen. Einzelheiten finden Sie unter [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes).

Shell Jobs können für eine Reihe von Skriptsprachen wie Bash, Python, PowerShell usw. verwendet werden.

- Benutzer verwenden häufig Code-Blöcke in einer Reihe von Jobs wieder, z.B. wiederverwendbare Funktionen, die in einer Reihe von *Job-Skripten* aufgerufen werden.
- Dies gilt für Shell Jobs, die Bash usw. verwenden, und es gilt für die Verwendung einer beliebigen Skriptsprache mit einem Job.
- Skript-Bausteine werden in *Job-Skripten* expandiert, wenn der Arbeitsablauf ausgerollt wird. Dies bedeutet, dass Änderungen an Skript-Bausteinen das Ausrollen des entsprechenden Arbeitsablaufs erfordern. JS7 verfolgt die Abhängigkeiten und bietet das Ausrollen der zugehörigen Arbeitsabläufe an, wenn Sie den Skript-Baustein freigeben.

Skript-Bausteine werden über die folgenden Bedienfelder verwaltet:

- Der [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation) auf der linken Seite des Fensters bietet eine Navigation durch die Ordner, die Skript-Bausteine enthalten und Operationen für Skript-Bausteine.
- Der Bereich *Skript-Baustein* auf der rechten Seite des Fensters enthält Details zur Konfiguration von Skript-Bausteinen.

## Bereich: Skript-Baustein

Für Skript-Bausteine sind die folgenden Eingaben möglich:

- **Name** ist der eindeutige Bezeichner eines Skript-Bausteins, siehe [Regeln zur Benennung von Objekten](/object-naming-rules).
- **Titel** enthält eine optionale Erklärung des Zwecks des Skript-Bausteins.
- **Skript-Baustein** enthält den Codeschnipsel.

## Operationen für Skript-Bausteine

Für verfügbare Operationen siehe [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation).

## Verwendung mit Jobs

Jobs referenzieren Skript-Bausteine über die Eigenschaft *Job-Skript* mit einer der folgenden Syntaxvarianten:

- **\#\#!include *script-include-name***
- **::!include *script-include-name***
- **//!include *script-include-name***

Das *script-include-name* gibt den Bezeichner des Skript-Bausteins an. Benutzer können die obige Eingabe in das *Job-Skript* eingeben und die Schnellsuche aufrufen.

### Schnellsuche

Wenn Sie die Tastenkombination STRG+Leertaste drücken, während sich der Cursor im *Job-Skript* befindet, wird die *Schnellsuche* für Skript-Bausteine aufgerufen:

- Die *Schnellsuche* bietet 
  - die Navigation von Inventarordnern,
  - die Auswahl von Skript-Bausteinen nach Namen, wenn Sie ein oder mehrere Zeichen eingeben.
- Bei der *Schnellsuche* wird die Groß- und Kleinschreibung nicht berücksichtigt und es wird nach rechts abgeschnitten. Für links abgeschnittene Eingaben können Sie das Metazeichen \* verwenden, das als Platzhalter für eine beliebige Anzahl von Zeichen dient.
- Nachdem Sie einen Skript-Baustein ausgewählt haben, wird die zugehörige Eingabe in die Zeile eingefügt, in der sich der Cursor befindet.

### Parametrierung

Skript-Bausteine können wie folgt parametriert werden:

- **\#\#:!include *script-include-name* --replace="search-literal", "replacement-literal"**
- **::!include *script-include-name* --replace="search-literal", "replacement-literal"**
- **//!include *script-include-name* --replace="search-literal", "replacement-literal"**

Das *Such-Literal* wird im Skript-Baustein nachgeschlagen und durch das *Ersatz-Literal* ersetzt, wenn der Arbeitsablauf, der den entsprechenden Job enthält, ausgerollt wird.

### Beispiele

#### PowerShell für Unix

Für die Verwendung mit der PowerShell auf Unix-Plattformen wird der folgende Shebang für einen Skript-Baustein vorgeschlagen:

<pre>
#!/usr/bin/env pwsh
</pre>

#### PowerShell für Windows

Für die Verwendung mit PowerShell auf Windows-Plattformen wird der folgende Shebang für einen Skript-Baustein vorgeschlagen:

<pre>
@@setlocal enabledelayedexpansion &amp; set NO_COLOR=1 &amp; set f=%RANDOM%.ps1 &amp; @@findstr/v "^@@[fs].*&amp;" "%~f0" &gt; !f! &amp; powershell.exe -NonInteractive -File !f! &amp; set e=!errorlevel! &amp; del /q !f! &amp; exit !e!/b&amp
</pre>

Der Skript-Baustein schreibt den Inhalt des *Job-Skripts* in eine temporäre Datei, die mit der Binärdatei *powershell.exe* ausgeführt wird. Benutzer sollten zur Verwendung der Binärdatei *pwsh.exe* wechseln, wenn spätere PowerShell-Versionen im Einsatz sind. Skriptfehler werden vom JS7 Agenten berücksichtigt und die Protokollausgabe wird von Escape-Zeichen für die Farbgebung befreit. 

## Referenzen

### Kontext-Hilfe

- [Konfiguration - Inventar - Arbeitsablauf - Job-Optionen](/configuration-inventory-workflow-job-options)
- [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation)
- [Regeln zur Benennung von Objekten](/object-naming-rules)

### Product Knowledge Base

- [JS7 - How to run PowerShell scripts from jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+run+PowerShell+scripts+from+jobs)
- [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes)
