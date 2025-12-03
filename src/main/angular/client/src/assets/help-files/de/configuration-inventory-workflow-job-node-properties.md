# Konfiguration - Inventar - Workflow - Job-Knoten-Eigenschaften

Im Bereich *Workflow* können Sie Workflows aus einer Folge von Anweisungen erstellen. Sie können die *Auftragsanweisung* per Drag &amp; Drop aus der *Symbolleiste* an eine Position im Workflow ziehen.

Die grafische Benutzeroberfläche bietet eine Reihe von Registerkarten zur Angabe von Auftragsdetails. Die vierte Registerkarte wird für *Knoteneigenschaften* angeboten.

## Knoteneigenschaften

Ein Knoten ist die Position eines Auftrags im Workflow. Wenn derselbe Auftrag mehrmals im selben Workflow vorkommt, verwendet er denselben *Auftragsnamen*, aber unterschiedliche *Etiketten*. Das *Label* identifiziert den Knoten im Workflow.

Sollte derselbe Auftrag mit unterschiedlichen Parametersätzen pro Vorkommen im Workflow verwendet werden, dann können *Knoteneigenschaften* verwendet werden. Sie bieten Schlüssel/Wert-Paare, die Knotenvariablen erstellen.

- **Name** gibt den Namen der Knotenvariable an, die in Shell-Jobs verwendet werden kann
  - in Shell-Jobs, indem Sie einer Umgebungsvariablen den *Name* der Knotenvariablen mit der Syntax *$meineKnotenvariable* zuweisen.
  - in JVM-Jobs, indem Sie einer Jobvariablen den *Name* der Knotenvariable mit der Syntax *$myNodeVariable* zuweisen.
- **Wert** akzeptiert Eingaben in Form von Strings, Zahlen und Verweisen auf Workflow-Variablen wie in *$meineWorkflowVariable*.

Bei den Namen von Knotenvariablen wird zwischen Groß- und Kleinschreibung unterschieden.

## Referenzen

### Kontexthilfe

- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
  - [Configuration - Inventory - Workflows - Job Options](/configuration-inventory-workflows-job-options)
  - [Configuration - Inventory - Workflows - Job Properties](/configuration-inventory-workflows-job-properties)
  - [Configuration - Inventory - Workflows - Job Notifications](/configuration-inventory-workflows-job-notifications)
  - [Configuration - Inventory - Workflows - Job Tags](/configuration-inventory-workflows-job-tags)

### Product Knowledge Base

- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)

