# Konfiguration - Inventar - Workflow - Auftragseigenschaften

Im Bereich *Workflow* können Sie Workflows aus einer Folge von Anweisungen erstellen. Sie können die *Auftragsanweisung* per Drag &amp; Drop aus der *Symbolleiste* an eine Position im Workflow ziehen.

Die grafische Benutzeroberfläche bietet eine Reihe von Registerkarten zur Angabe von Auftragsdetails. Die erste Registerkarte wird für *Job-Eigenschaften* angeboten.

## Erforderliche Auftragseigenschaften

Die Mindesteigenschaften für einen Auftrag sind wie folgt:

- **Name** identifiziert den Auftrag anhand eines eindeutigen Namens. Wenn mehrere Aufträge im Workflow denselben Namen verwenden, wird nur eine Kopie des Auftrags gespeichert und die anderen Vorkommen referenzieren den Auftrag mit unterschiedlichen *Job Labels*.
- **Label** ist ein eindeutiger Bezeichner für Anweisungen in einem Workflow. Die Eindeutigkeit wird über Jobs und andere Anweisungen hinweg erzwungen. Wenn derselbe *Job Name* mehrmals in einem Workflow verwendet wird, müssen unterschiedliche *Labels* verwendet werden.
- **Agent** weist einen Agenten für die Ausführung des Auftrags zu.
  - *Standalone-Agenten* werden über ihren *Agentennamen* ausgewählt.
  - *Cluster-Agenten* werden durch Auswahl des *Agentenclusters* und des gewünschten *Unteragentenclusters* festgelegt.
- **Skript** enthält die Shell-Befehle, Aufrufe von Skripten und ausführbaren Dateien, die vom Job für die entsprechende Unix- oder Windows-Plattform ausgeführt werden.

## Optionale Auftragseigenschaften

- **Title** beschreibt den Zweck des Auftrags. Benutzer können Links mit Hilfe der Markdown-Syntax hinzufügen, z.B. \[Example\]\(https://example.com\). Der *Titel* wird beim Filtern der Ergebnisse berücksichtigt, zum Beispiel in der Ansicht [Arbeitsabläufe](/workflows).
- **Job-Ressourcen** sind Inventarobjekte, die Variablen aus Schlüssel/Wert-Paaren enthalten, die von Workflow-Variablen und von Umgebungsvariablen verfügbar gemacht werden können. *Job Resources* können auf Job-Ebene zugewiesen werden und sie können auf Workflow-Ebene zugewiesen werden, wodurch sie für alle Jobs in einem Workflow verfügbar sind. Einzelheiten finden Sie unter [Konfiguration - Inventar - Job-Ressourcen](/configuration-inventory-job-resources).
- **Return Code** gibt an, ob ein Auftrag als erfolgreich oder fehlgeschlagen betrachtet wird. Standardmäßig steht der Wert 0 für Erfolg, andere Werte stehen für Misserfolg. Eine Reihe von erfolgreichen Rückgabewerten kann durch ein Komma getrennt werden, zum Beispiel *0,2,4,8*. Ein Bereich von Rückgabewerten kann durch zwei Punkte angegeben werden, z.B. *0..8* oder *0,2,4,8,16..64*, getrennt durch ein Komma. Negative Rückgabewerte sind undefiniert.
  - **Bei Erfolg** gibt erfolgreiche Rückgabewerte an.
  - **On Failure** gibt erfolglose Rückgabewerte an, die einen Fehler anzeigen.
  - **Ignore** betrachtet Rückgabecodes nicht als Indikator für den Erfolg oder Misserfolg eines Auftrags.
- **Rückgabecode bei Warnung** ist eine Teilmenge der erfolgreichen Rückgabecodes. Wenn ein erfolgreicher Rückgabecode als Warnung angegeben wird, wird eine Benachrichtigung erstellt. Der Ablauf des Auftrags im Workflow wird durch Warnungen jedoch nicht beeinflusst.

### Auftragsklassen

- **Die Auftragsklasse** gibt den Typ des ausgeführten Auftrags an. Einzelheiten finden Sie unter [JS7 - Job Classes](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Classes).
  - **Shell-Jobs** werden mit der Shell des Betriebssystems ausgeführt, z.B. mit der Windows-Shell oder der Unix-Shell, die über /bin/sh verfügbar ist. Shell-Jobs können beliebige Shell-Befehle, Aufrufe von Skripts und ausführbare Dateien enthalten. Shell-Jobs ermöglichen die Verwendung von Skriptsprachen wie Node.js, Perl, Python, PowerShell usw. Sie erfordern einen Interpreter, der mit dem Betriebssystem installiert wird und von der Befehlszeile aus ausgeführt werden kann.
  - **JVM Jobs** sind in einer Reihe von Sprachen implementiert, die für eine Java Virtual Machine betrieben werden, für die der JS7 Agent die [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API) bietet. Zu den unterstützten Sprachen gehören:
    - *Job Templates*
      - **JITL-Jobs** sind Java-Jobs, die mit JS7 ausgeliefert werden und die von [JS7 - Integration Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Integration+Job+Templates) aus verwendet werden, z.B. für den Zugriff auf Datenbanken, für den Zugriff auf entfernte Hosts über SSH usw.
    - *Benutzerdefinierte Jobs*
      - **Java Jobs** werden in der vom JS7 Agent bereitgestellten JVM ausgeführt.
      - **JavaScript Jobs** erfordern die Verwendung der Oracle® GraalVM Java Virtual Machine mit dem JS7 Agent. Die JVM stellt den Interpreter/Compiler für JavaScript bereit.

### Umgebungsvariablen

Für *Shell Jobs* wird die Parametrisierung über Umgebungsvariablen zur Verfügung gestellt.

- **Name** kann innerhalb der Grenzen des Betriebssystems frei gewählt werden, zum Beispiel ohne Bindestriche und Leerzeichen. Eine häufige Konvention bei der Namensgebung ist die Großschreibweise. Unter Unix wird bei *Namen* zwischen Groß- und Kleinschreibung unterschieden, unter Windows wird die Groß- und Kleinschreibung nicht berücksichtigt.
- **Wert** kann eine direkte Eingabe von Strings oder Zahlen sein. Darüber hinaus können Workflow-Variablen angegeben werden, die mit dem Workflow deklariert werden und denen ein $-Zeichen vorangestellt wird, wie in *$variable*. Bei der Schreibweise von Workflow-Variablen wird die Groß- und Kleinschreibung beachtet.

## Auftragseigenschaften verfügbar unter *Weitere Optionen*

Die Ansicht *Konfiguration - Inventar* bietet oben im Fenster den Schieberegler *Weitere Optionen*, der standardmäßig inaktiv ist. Wenn Sie den Schieberegler verwenden, werden zusätzliche Optionen verfügbar.

- **Dokumentation** enthält einen Verweis auf [Resources - Documentations](/resources-documentations), der zur Erläuterung des Auftrags verwendet werden kann. Der Verweis auf die Dokumentation ist in der Ansicht [Arbeitsabläufe](/workflows) sichtbar.

## Referenzen

### Kontexthilfe

- [Konfiguration - Inventar - Job-Ressourcen](/configuration-inventory-job-resources)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
  - [Configuration - Inventory - Workflows - Job Options](/configuration-inventory-workflows-job-options)
  - [Configuration - Inventory - Workflows - Job Node Properties](/configuration-inventory-workflows-job-node-properties)
  - [Configuration - Inventory - Workflows - Job Notifications](/configuration-inventory-workflows-job-notifications)
  - [Configuration - Inventory - Workflows - Job Tags](/configuration-inventory-workflows-job-tags)
- [Resources - Documentations](/resources-documentations)

### Product Knowledge Base

- [JS7 - Integration Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Integration+Job+Templates)
- [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API)
- [JS7 - Job Classes](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Classes)
- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)

