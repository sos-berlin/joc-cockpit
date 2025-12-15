# Konfiguration - Inventar - Arbeitsabläufe - Job-Knoteneigenschaften

Im Bereich *Arbeitsablauf* können Sie Arbeitsabläufe aus einer Folge von Anweisungen erstellen. Sie können die *Job Anweisung* per Drag&amp;Drop aus der *Funktionsleiste* an eine Position im Arbeitsablauf ziehen.

Die grafische Benutzeroberfläche bietet eine Reihe von Registerkarten zur Angabe von Details. Die vierte Registerkarte wird für *Knoteneigenschaften* angeboten.

## Job-Knoteneigenschaften

Ein Knoten ist die Position eines Jobs im Arbeitsablauf. Wenn derselbe Job mehrmals im selben Arbeitsablauf vorkommt, verwendet er denselben *Job-Namen*, aber unterschiedliche *Adressen*. Die *Adresse* identifiziert den Knoten im Arbeitsablauf.

Sollte derselbe Job mit unterschiedlichen Parametersätzen pro Vorkommen im Arbeitsablauf verwendet werden, dann können *Knoteneigenschaften* verwendet werden. Sie bieten Schlüssel/Wert-Paare, die Knotenvariablen erstellen.

- **Name** gibt den Namen der Knotenvariable an, die in Shell Jobs verwendet werden kann
  - in Shell Jobs, indem Sie einer Umgebungsvariablen den *Namen* der Knotenvariablen mit der Syntax *$myNodeVariable* zuweisen.
  - in JVM Jobs, indem Sie einem Job-Argument den *Name* der Knotenvariable mit der Syntax *$myNodeVariable* zuweisen.
- **Wert** akzeptiert Eingaben in Form von Zeichenketten, Zahlen und Verweisen auf Arbeitsablauf-Variablen wie in *$myWorkflowVariable*.

Für die Namen von Knotenvariablen wird zwischen Groß- und Kleinschreibung unterschieden.

## Referenzen

### Kontext-Hilfe

- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
  - [Konfiguration - Inventar - Arbeitsablauf - Job-Optionen](/configuration-inventory-workflow-job-options)
  - [Konfiguration - Inventar - Arbeitsablauf - Job-Eigenschaften](/configuration-inventory-workflow-job-properties)
  - [Konfiguration - Inventar - Arbeitsablauf - Job-Benachrichtigungen](/configuration-inventory-workflow-job-notifications)
  - [Konfiguration - Inventar - Arbeitsablauf - Job-Kennzeichnungen](/configuration-inventory-workflow-job-tags)

### Product Knowledge Base

- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
