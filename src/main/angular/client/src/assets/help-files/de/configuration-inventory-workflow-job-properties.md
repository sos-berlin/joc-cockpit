# Konfiguration - Inventar - Arbeitsablauf - Job-Eigenschaften

Im Bereich *Arbeitsablauf* können Sie Arbeitsabläufe aus einer Folge von Anweisungen erstellen. Sie können die *Job Anweisung* per Drag&amp;Drop aus der *Funktionsleiste* an eine Position im Arbeitsablauf ziehen.

Die grafische Benutzeroberfläche bietet eine Reihe von Registerkarten zur Angabe von Details. Die erste Registerkarte wird für *Job-Eigenschaften* angeboten.

## Erforderliche Job-Eigenschaften

Die Mindesteigenschaften für einen Job sind wie folgt:

- **Name** identifiziert den Job anhand eines eindeutigen Namens. Wenn mehrere Jobs im Arbeitsablauf denselben Namen verwenden, wird nur eine Kopie des Jobs gespeichert und die anderen Vorkommen referenzieren den Job mit unterschiedlichen *Adressen*.
- **Adresse** ist ein eindeutiger Bezeichner für Anweisungen in einem Arbeitsablauf. Die Eindeutigkeit wird über Jobs und andere Anweisungen hinweg erzwungen. Wenn derselbe *Job Name* mehrmals in einem Arbeitsablauf verwendet wird, müssen unterschiedliche *Adressen* verwendet werden.
- **Agent** weist einen Agenten für die Ausführung des Jobs zu.
  - *Standalone Agents* werden über ihren *Agentennamen* ausgewählt.
  - *Cluster Agents* werden durch Auswahl des *Agent Cluster* und des gewünschten *Subagent Cluster* festgelegt.
- **Skript** enthält die Shell Kommandos, Aufrufe von Skripten und ausführbaren Dateien, die vom Job für die entsprechende Unix- oder Windows-Plattform ausgeführt werden.

## Optionale Job-Eigenschaften

- **Titel** beschreibt den Zweck des Jobs. Benutzer können Links mit Hilfe der Markdown-Syntax hinzufügen, z.B. \[Example\]\(https://example.com\). Der *Titel* wird beim Filtern der Ergebnisse berücksichtigt, zum Beispiel in der Ansicht [Arbeitsabläufe](/workflows).
- **Job-Ressourcen** sind Inventarobjekte, die Variablen aus Schlüssel/Wert-Paaren enthalten, die von Arbeitsablauf-Variablen und von Umgebungsvariablen verfügbar gemacht werden können. *Job-Ressourcen* können einem Job zugewiesen werden und sie können einem Arbeitsablauf zugewiesen werden, wodurch sie für alle Jobs im Arbeitsablauf verfügbar sind. Einzelheiten finden Sie unter [Konfiguration - Inventar - Job-Ressourcen](/configuration-inventory-job-resources).
- **Rückgabewert** gibt an, ob ein Job als erfolgreich oder fehlgeschlagen betrachtet wird. Standardmäßig steht der Wert 0 für Erfolg, andere Werte stehen für Misserfolg. Eine Reihe von erfolgreichen Rückgabewerten kann durch ein Komma getrennt werden, zum Beispiel *0,2,4,8*. Ein Bereich von Rückgabewerten kann durch zwei Punkte angegeben werden, z.B. *0..8* oder *0,2,4,8,16..64*, getrennt durch ein Komma. Negative Rückgabewerte sind undefiniert.
  - **Bei Erfolg** gibt erfolgreiche Rückgabewerte an.
  - **Bei Fehler** gibt erfolglose Rückgabewerte an, die einen Fehler anzeigen.
  - **Ignore** betrachtet Rückgabewerte nicht als Indikator für den Erfolg oder Misserfolg eines Jobs.
- **Rückgabewert bei Warnung** ist eine Teilmenge der erfolgreichen Rückgabewerte. Wenn ein erfolgreicher Rückgabewert als Warnung angegeben wird, wird eine Benachrichtigung erstellt. Der Ablauf des Auftrags im Arbeitsablauf wird durch Warnungen jedoch nicht beeinflusst.

### Job-Klassen

- **Job-Klasse** gibt den Typ des ausgeführten Jobs an. Einzelheiten finden Sie unter [JS7 - Job Classes](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Classes).
  - **Shell Jobs** werden mit der Shell des Betriebssystems ausgeführt, z.B. mit der Windows Shell oder der Unix Shell, die über /bin/sh verfügbar ist. Shell Jobs können beliebige Shell Kommandos, Aufrufe von Skripten und ausführbaren Dateien enthalten. Shell Jobs ermöglichen die Verwendung von Skriptsprachen wie Node.js, Perl, Python, PowerShell usw. Sie erfordern einen Interpreter, der mit dem Betriebssystem installiert wird und an der Befehlszeile ausgeführt werden kann.
  - **JVM Jobs** sind in einer Reihe von Sprachen implementiert, die für eine Java Virtual Machine betrieben werden, für die der JS7 Agent die [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API) bietet. Zu den unterstützten Sprachen gehören:
    - *Job Templates*
      - **JITL Jobs** sind Java Jobs, die mit JS7 ausgeliefert werden und die von [JS7 - Integration Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Integration+Job+Templates) aus verwendet werden, z.B. für den Zugriff auf Datenbanken, für den Zugriff auf entfernte Hosts über SSH usw.
    - *Benutzerdefinierte Jobs*
      - **Java Jobs** werden in der vom JS7 Agent genutzten JVM ausgeführt.
      - **JavaScript Jobs**, **Python Jobs** erfordern die Verwendung von Oracle® Graal Polyglot Bibliotheken mit dem JS7 Agent. Die Bibliiotheken stellen den JIT Compiler bereit.

### Umgebungsvariablen

Für *Shell Jobs* wird die Parametrierung über Umgebungsvariablen zur Verfügung gestellt.

- **Name** kann innerhalb der Grenzen des Betriebssystems frei gewählt werden, zum Beispiel ohne Bindestriche und Leerzeichen. Eine häufige Konvention bei der Namensgebung ist die Großschreibweise. Unter Unix wird bei *Namen* zwischen Groß- und Kleinschreibung unterschieden, unter Windows wird die Groß- und Kleinschreibung nicht berücksichtigt.
- **Wert** kann eine direkte Eingabe von Zeichenketten und Zahlen sein. Darüber hinaus können Arbeitsablauf-Variablen angegeben werden, die mit dem Arbeitsablauf deklariert werden und denen ein $-Zeichen vorangestellt wird, wie in *$variable*. Bei der Schreibweise von Arbeitsablauf-Variablen wird die Groß- und Kleinschreibung beachtet.

## Job-Eigenschaften verfügbar unter *Weitere Optionen*

Die Ansicht *Konfiguration - Inventar* bietet oben im Fenster den Schieberegler *Weitere Optionen*, der standardmäßig inaktiv ist. Wenn Sie den Schieberegler verwenden, werden zusätzliche Optionen verfügbar.

- **Dokumentation** enthält einen Verweis auf [Ressourcen - Dokumentationen](/resources-documentations), die zur Erläuterung von Jobs verwendet werden können. Der Verweis auf die Dokumentation ist in der Ansicht [Arbeitsabläufe](/workflows) sichtbar.

## Referenzen

### Kontext-Hilfe

- [Konfiguration - Inventar - Job-Ressourcen](/configuration-inventory-job-resources)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
  - [Konfiguration - Inventar - Arbeitsablauf - Job-Optionen](/configuration-inventory-workflow-job-options)
  - [Konfiguration - Inventar - Arbeitsablauf - Job-Knoteneigenschaften](/configuration-inventory-workflow-job-node-properties)
  - [Konfiguration - Inventar - Arbeitsablauf - Job-Benachrichtigungen](/configuration-inventory-workflow-job-notifications)
  - [Konfiguration - Inventar - Arbeitsablauf - Job-Kennzeichnungen](/configuration-inventory-workflow-job-tags)
- [Ressourcen - Dokumentationen](/resources-documentations)

### Product Knowledge Base

- [JS7 - Integration Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Integration+Job+Templates)
- [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API)
- [JS7 - Job Classes](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Classes)
- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
