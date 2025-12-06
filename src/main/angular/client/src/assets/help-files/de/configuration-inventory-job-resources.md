# Konfiguration - Inventar - Job-Ressourcen

Im Bereich *Job-Ressourcen* können Sie Job-Ressourcen für die Verwendung mit Arbeitsabläufen und Jobs konfigurieren.

Job-Ressourcen enthalten Variablen aus Schlüssel/Wert-Paaren, die für die folgenden Zwecke verwendet werden:

- Für JVM Jobs, die in der Java Virtual Machine des Agenten ablaufen, werden Variablen aus *Argumenten* angegeben. Wenn einem Job eine Job-Ressource zugewiesen wird, werden die entsprechenden Job-Argumente implizit versorgt.
- Für Shell Jobs werden die Variablen unter *Umgebungsvariablen* angegeben. Wenn einem Job eine Job-Ressource zugewiesen wird, werden die Umgebungsvariablen automatisch erstellt.

Job-Ressourcen werden einem Arbeitsablauf oder Job über die entsprechende Objekteigenschaft zugewiesen, siehe [Konfiguration - Inventar - Arbeitsablauf - Job-Optionen](/configuration-inventory-workflow-job-options). Wenn sie auf Ebene des Arbeitsablaufs zugewiesen werden, sind die Variablen der Job-Ressource für alle Jobs im Arbeitsablauf verfügbar.

Job-Ressourcen werden über die folgenden Fenster verwaltet:

- Der [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation) auf der linken Seite des Fensters bietet eine Navigation durch die Ordner mit den Job-Ressourcen und die Möglichkeit, Job-Ressourcen zu bearbeiten.
- Der Bereich *Job-Ressourcen* auf der rechten Seite des Fensters enthält Details zur Konfiguration der Job-Ressourcen.

## Bereich: Job-Ressource

Für eine Job-Ressource sind die folgenden Eingaben möglich:

- **Name** ist der eindeutige Bezeichner einer Job-Ressource, siehe [Regeln zur Benennung von Objekten](/object-naming-rules).
- **Titel** enthält eine optionale Erläuterung des Zwecks der Job-Ressource.

Der Bereich ermöglicht die Konfiguration von Variablen der Job-Ressource auf den folgenden Registerkarten:

- **Argumente** werden von JVM Jobs verwendet, die mit Java, JavaScript usw. erstellt wurden.
- **Umgebungsvariablen** werden von Shell Jobs verwendet.

Die Variablen der Job-Ressource werden für jede Registerkarte über die folgenden Eingaben konfiguriert:

- **Name** kann innerhalb der [Regeln zur Benennung von Objekten](/object-naming-rules) frei gewählt werden.
  - Für *Argumente* gelten Java-Begrenzungen. Bei der Schreibweise von *Argument*-Namen wird die Groß- und Kleinschreibung beachtet.
  - Für *Umgebungsvariablen* gelten die Einschränkungen des Betriebssystems, z.B. der Ausschluss von Bindestrichen und Leerzeichen. Eine häufige Konvention bei der Namensgebung ist die Großschreibweise. Unter Unix wird bei den Namen von Umgebungsvariablen zwischen Groß- und Kleinschreibung unterschieden, unter Windows wird die Groß- und Kleinschreibung nicht berücksichtigt.
- **Wert** kann eine direkte Eingabe von Zeichenketten, Zahlen oder Ausdrücken sein, siehe [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables).

Wenn dieselbe Variable sowohl für *Argumente* als auch für *Umgebungsvariablen* zur Verfügung gestellt wird, kann der Wert der Umgebungsvariablen den Namen des *Arguments* wie folgt referenzieren: *$argument*

### Operationen für Job-Ressourcen

Für verfügbare Operationen siehe [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation).

## Referenzen

### Kontext-Hilfe

- [Konfiguration - Inventar - Arbeitsablauf - Job-Optionen](/configuration-inventory-workflow-job-options)
- [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation)
- [Regeln zur Benennung von Objekten](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
