# Konfiguration - Inventarisierung - Arbeitsabläufe

Das *Workflow-Panel* bietet die Möglichkeit, Workflows aus einer Folge von Anweisungen zu entwerfen, die den Workflow für einen [gerichteten azyklischen Graphen](https://en.wikipedia.org/wiki/Directed_acyclic_graph) formen. 

- Benutzer können Anweisungen per Drag &amp; Drop aus der *Symbolleiste* ziehen, um Workflow-Muster zu erstellen, wie z.B. eine Abfolge von Jobs, das Verzweigen und Verbinden von Jobs, bedingte Ausführung usw.
- Die [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation) bietet eine Navigation nach Tags und Ordnern. Darüber hinaus bietet das Panel Operationen für Workflows.

*Toolbar Panel

Die *Symbolleiste* enthält die folgenden Anweisungen:

- **Job-Anweisung** implementiert einen Job. Workflows können eine beliebige Anzahl von Jobs enthalten. Einzelheiten finden Sie unter [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction).
- die Anweisung **Try/Catch** implementiert die Behandlung von Ausnahmen in einem *Try*-Block, der Jobs oder andere Anweisungen enthält. Wenn ein Auftrag fehlschlägt, werden die Anweisungen im *Catch*-Block ausgeführt. Ein leerer *Catch*-Block löst den Fehlerstatus einer zuvor fehlgeschlagenen Anweisung auf. Einzelheiten finden Sie unter [JS7 - Try-Catch Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Try-Catch+Instruction).
- **Retry Instruction** implementiert die wiederholte Ausführung einer Sequenz von Jobs oder anderen Anweisungen im Falle eines Fehlers. Wenn einer der Jobs im *Retry*-Block fehlschlägt, wird der Auftrag an den Anfang des *Retry*-Blocks verschoben, um die Ausführung zu wiederholen. Einzelheiten finden Sie unter [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction).
- **Finish Instruction** sorgt dafür, dass ein Auftrag den Workflow mit einem erfolgreichen oder nicht erfolgreichen Ergebnis im [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History) verlässt. Details finden Sie unter [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction).
- die **Fail-Anweisung** lässt eine Bestellung fehlschlagen. Ohne weitere Fehlerbehandlung verbleibt der Auftrag im Zustand *Failed*, siehe [Order States](/order-states). Eine umgebende *Try/Catch Instruction* oder *Retry Instruction* wird durch die *Fail Instruction* ausgelöst. Einzelheiten finden Sie unter [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction).
- mit der **Fork-Anweisung** können Aufträge verzweigt und verbunden werden, um die parallele Verarbeitung von Jobs und anderen Anweisungen in einem Workflow zu ermöglichen. Zweige werden durch Ziehen und Ablegen von Anweisungen auf der *Fork Instruction* erstellt. Wenn eine Order in die *Fork Instruction* eintritt, wird für jede Verzweigung eine Child Order erstellt. Einzelheiten finden Sie unter [JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction).
  - Jede Child Order leitet die Knoten in ihrem Zweig unabhängig von parallelen Child Orders weiter.
  - Child Orders können Ergebnisse an Parent Orders zurückgeben, indem sie Variablen übergeben.
  - Child Orders übernehmen die Rolle von Parent Orders in verschachtelten *Fork Instructions*.
- die **ForkList-Anweisung** ist die dynamische Version einer *Fork-Anweisung* und wird in den folgenden Varianten angeboten:
  - Die Anweisung erwartet, dass ein Auftrag eine *Listenvariable* bereitstellt, die als Liste (Array) von Werten implementiert ist. Die Liste kann eine beliebige Anzahl von Name/Wert-Paaren (Variablen) enthalten. Die *ForkList-Anweisung* ist als einzelne Verzweigung konzipiert: Abhängig von der Anzahl der Einträge, die mit der *List-Variablen* des Auftrags geliefert werden, erstellt der Agent dynamisch Verzweigungen für jeden Eintrag der *List-Variablen*. Dies ermöglicht zum Beispiel die Ausführung von Aufträgen für jeden Eintrag einer *Listenvariablen*. Einzelheiten finden Sie unter [JS7 - ForkList-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction).
  - Die Anweisung ermöglicht es, eine Reihe von Child Orders und Verzweigungen dynamisch zu erstellen und dieselbe Sequenz von Jobs oder anderen Anweisungen auf einer Reihe von Subagenten auszuführen: Benutzer können dieselben Jobs parallel auf einer Reihe von Servern oder Containern ausführen, die Subagenten betreiben. Zu den Anwendungsfällen gehört z.B. die Ausführung ähnlicher Sicherungsaufträge auf einer größeren Anzahl von Servern. Einzelheiten finden Sie unter [JS7 - ForkList-Join Instruction for Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction+for+Agent+Clusters).
- die **Zyklusanweisung** ermöglicht die wiederholte Ausführung aller oder einiger der Aufträge und anderer Anweisungen in einem Workflow. Es handelt sich um eine Blockanweisung, die den gesamten Workflow oder ausgewählte Jobs und Anweisungen in einem Workflow auslösen kann. Die *Zyklusanweisung* kann verschachtelt werden. Einzelheiten finden Sie unter [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction).
- die **Break Instruction** wird in einer *Cycle Instruction* verwendet, um den Zyklus zu beenden und um einen Auftrag aus dem Zyklus zu nehmen. Einzelheiten finden Sie unter [JS7 - Break Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Break+Instruction).
- **Lock Instruction** ist eine Blockinstruktion, die verwendet wird, um einen oder mehrere Jobs und andere Instruktionen zum gegenseitigen Ausschluss zu spezifizieren, um zu verhindern, dass Jobs parallel entweder im selben Workflow oder in verschiedenen Workflows ausgeführt werden. *Lock Instructions* können verschachtelt werden. Einzelheiten finden Sie unter [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction).
- die **Sleep-Anweisung** wird verwendet, um die weitere Verarbeitung in einem Workflow um eine in Sekunden angegebene Zeitspanne zu verzögern. Einzelheiten finden Sie unter [JS7 - Sleep Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Sleep+Instruction).
- die **Prompt-Anweisung** hält die Ausführung eines Auftrags in einem Workflow an, bis die Eingabeaufforderung bestätigt wird. Die Order erhält den Status *Prompting*. Benutzer können *Prompting*-Aufträge bestätigen oder abbrechen, siehe [Order States](/order-states). Einzelheiten finden Sie unter [JS7 - Prompt Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Prompt+Instruction).
- **AdmissionTime Instruction** hält die Ausführung einer Order in einem Workflow an, bis das angegebene Zeitfenster erreicht ist. Die Order erhält den Status *Warten*. Darüber hinaus können Aufträge abgebrochen werden, wenn sie das angegebene Zeitfenster überschreiten. Die Anweisung kann so konfiguriert werden, dass eine Order alle enthaltenen Anweisungen überspringt, falls kein passendes Zeitfenster für das tägliche Plandatum der Order gefunden wird. Einzelheiten finden Sie unter [[JS7 - AdmissionTime Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AdmissionTime+Instruction).
- die Anweisung **AddOrder Instruction** wird in einem Workflow verwendet, um eine Order für einen anderen Workflow zu erstellen. Standardmäßig werden hinzugefügte Aufträge asynchron in einem separaten Workflow und parallel zum aktuellen Auftrag ausgeführt, d.h. ihr Ausführungsergebnis wird nicht synchronisiert und hat keinen Einfluss auf den aktuellen Auftrag. Soll die Ausführung des hinzugefügten Auftrags synchronisiert werden, können die Anweisungen *ExpectNotices Instruction* und *ConsumeNotices Instruction* verwendet werden. Einzelheiten finden Sie unter [JS7 - AddOrder Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AddOrder+Instruction).
- die Anweisung **PostNotices Instruction** wird verwendet, um eine oder mehrere Benachrichtigungen für Schwarze Bretter zu erstellen. Die Notizen werden von den entsprechenden *ExpectNotices Instruction* und *ConsumeNotices Instruction* aus demselben oder aus verschiedenen Workflows erwartet. Ein Workflow kann eine beliebige Anzahl von *PostNotices Instruction* enthalten, um Benachrichtigungen an dasselbe oder an verschiedene Schwarze Bretter zu senden. Das Versenden einer Mitteilung blockiert nicht die weitere Ausführung einer Bestellung in einem Workflow. Der Auftrag wird sofort fortgesetzt, nachdem der Hinweis veröffentlicht wurde. Einzelheiten finden Sie unter [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction).
- die Anweisung **ExpectNotices Instruction** wird verwendet, um zu prüfen, ob auf einem oder mehreren Schwarzen Brettern, die durch eine *PostNotices Instruction* oder durch den Benutzer hinzugefügt wurden, Notizen vorhanden sind. Wenn die Benachrichtigung nicht vorhanden ist, bleibt der Auftrag mit der Anweisung im *Wartezustand*. Ein Workflow kann eine beliebige Anzahl von *ExpectNotices Instructions* enthalten, um Benachrichtigungen von der gleichen oder von verschiedenen Pinnwänden zu erwarten. Einzelheiten finden Sie unter [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction).
- die Anweisung **ConsumeNotices Instruction** wird verwendet, um Aufträge dazu zu bringen, Benachrichtigungen von einem oder mehreren Schwarzen Brettern zu erwarten, die durch eine *PostNotices Instruction* oder durch den Benutzer hinzugefügt werden. Die *ConsumeNotices Instruction* ist eine Blockinstruktion, die beliebige andere Instruktionen enthalten kann und die die erwarteten Notices löscht, wenn eine Order das Ende des Instruktionsblocks erreicht. Einzelheiten finden Sie unter [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction).
- **If Instruction** ist eine Blockanweisung, die für die bedingte Verarbeitung in einem Workflow verwendet wird. Sie ermöglicht die Überprüfung von Rückgabecodes und Rückgabewerten früherer Aufträge und die Auswertung von Auftragsvariablen. Einzelheiten finden Sie unter [JS7 - If Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+If+Instruction).
- die **Case-Anweisung** wird für die bedingte Verarbeitung von Jobs und anderen Anweisungen in einem Workflow verwendet. Die Anweisung erweitert die *If-Anweisung*. Die *Case-Anweisung* kann mit wiederholten *Case-When-Anweisungen* und optional mit einer einzelnen *Case-Else-Anweisung* verwendet werden. Einzelheiten finden Sie unter [JS7 - Case Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Case+Instruction).
- die **CaseWhen-Anweisung** wird verwendet, um ein Prädikat zu prüfen, ähnlich wie die *If-Anweisung*. Die Anweisung kann beliebig oft in einer *Case-Anweisung* vorkommen.
- die **CaseElse-Anweisung** wird verwendet, wenn alle Prüfungen der *CaseWhen-Anweisungen* fehlschlagen.
- die **StickySubagent-Anweisung** kann verwendet werden, um eine Reihe von Aufträgen mit demselben Subagenten eines Agenten-Clusters auszuführen. Die Blockanweisung prüft den ersten verfügbaren Subagenten eines Subagenten-Clusters. Dieser Subagent wird für die nachfolgenden Aufträge innerhalb der Blockanweisung verwendet. Die Verwendung von Agenten-Clustern unterliegt den Bedingungen für das Clustering mit der [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License). Einzelheiten finden Sie unter [JS7 - StickySubagent Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+StickySubagent+Instruction+for+Agent+Clusters).
- die **Options-Anweisung** ist eine Blockanweisung, die die Fehlerbehandlung für die *Lock-Anweisung* und die *ConsumeNotices-Anweisung* regelt. Wenn die *Options-Anweisung* vorhanden ist und die Eigenschaft *Stop on Failure* enthält, verbleiben die *Failed* Orders bei der fehlgeschlagenen Anweisung, z.B. einem Job. Wenn die Anweisung nicht vorhanden ist, werden Aufträge, die innerhalb einer *Lock Instruction* oder *ConsumeNotices Instruction* fehlschlagen, an den Anfang des Anweisungsblocks verschoben und verbleiben im Zustand *Failed*. Einzelheiten finden Sie unter [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction).
- mit **Einfügen** können Sie eine zuvor kopierte oder ausgeschnittene Anweisung per Drag &amp; Drop in den Workflow einfügen.

## Workflow-Panel

Das Panel enthält die grafische Darstellung eines Workflows.

- Sie können Anweisungen aus der *Symbolleiste* per Drag &amp; Drop in den Workflow ziehen.
  - Um die erste Anweisung in einem Workflow per Drag &amp; Drop abzulegen, halten Sie die Maustaste gedrückt und legen die Anweisung im angegebenen Ablagebereich des Workflows ab.
  - Um weitere Anweisungen per Drag &amp; Drop abzulegen, halten Sie die Maustaste gedrückt, navigieren zur gewünschten Verbindungslinie zwischen den Anweisungen und lassen die Maustaste los.
- Bei der *Auftragsanweisung* können Sie eine *Auftragsanweisung* per Drag &amp; Drop direkt auf den Knoten *Auftrag* ziehen, um einen neuen Zweig zu erstellen.
- Bei der *Wenn-Anweisung* können Sie eine *Auftragsanweisung* per Drag &amp; Drop direkt auf den *Wenn-Block* ziehen: die erste Anweisung stellt die *wahre* Verzweigung dar, die zweite Anweisung, die Sie per Drag &amp; Drop ziehen, erzeugt die *falsche* Verzweigung.

Arbeitsabläufe werden automatisch im Inventar gespeichert. Dies geschieht alle 30 Sekunden und beim Verlassen des *Workflow-Panels*.

Für einen Workflow sind die folgenden Eingaben möglich:

- **Name** ist der eindeutige Bezeichner eines Workflows, siehe [Regeln zur Benennung von Objekten](/object-naming-rules).
- **Titel** enthält eine optionale Erklärung zum Zweck des Workflows.
- **Job-Ressourcen** sind Inventarobjekte, die Variablen aus Schlüssel/Wert-Paaren enthalten, die aus Workflow-Variablen und aus Umgebungsvariablen verfügbar gemacht werden können. *Job Resources* können auf Job-Ebene zugewiesen werden und sie können auf Workflow-Ebene zugewiesen werden, wodurch sie für alle Jobs in einem Workflow verfügbar sind. Einzelheiten finden Sie unter [Konfiguration - Inventar - Job-Ressourcen](/configuration-inventory-job-resources).
- **Zeitzone**, die aus der [Profile - Preferences](/profile-preferences) des Benutzers übernommen wird. Für die Eingabe werden Zeitzonenkennungen wie *UTC*, *Europa/London* usw. akzeptiert. Eine vollständige Liste der Zeitzonenkennungen finden Sie unter [Liste der Zeitzonen der tz-Datenbank](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).
  - Die *Zeitzone* wird auf Zeiträume in Job Admission Times und in *Cycle Instructions* angewendet.
  - Es ist möglich, eine *Zeitzone* zu verwenden, die von der [Settings - Daily Plan](/settings-daily-plan) abweicht. Dies kann jedoch zu verwirrenden Ergebnissen führen.
- **Nicht deklarierte Variablen zulassen** bietet die Verwendung von Auftragsvariablen, die nicht mit dem Workflow deklariert sind. Dies bedeutet, dass Aufträge Variablen enthalten können, die nicht auf Datentyp oder obligatorische Verwendung geprüft werden. Aufträge schlagen fehl, wenn sie auf nicht deklarierte Variablen verweisen, die nicht in einer Order verfügbar sind.

### Workflow-Variablen

Workflow-Variablen werden im Workflow deklariert und zur Parametrisierung der Ausführung von Jobs verwendet:

- Erforderliche Variablen werden vom Workflow ohne Standardwert deklariert. Aufträge, die dem Workflow hinzugefügt werden, müssen Werte für erforderliche Variablen angeben.
- Optionale Variablen werden durch den Workflow mit einem Standardwert deklariert. Aufträge, die dem Workflow hinzugefügt werden, können Werte angeben, ansonsten wird der Standardwert verwendet.

Für Workflow-Variablen werden die folgenden Datentypen angeboten:

- **String** enthält beliebige Zeichen. Optional können die Werte in einfache Anführungszeichen gesetzt werden.
  - Konstante Werte: *hallo welt*
  - Funktionen: *now( format='yyyy-MM-dd hh:mm:ss', timezone='Europe/London' )*, *env('HOSTNAME')*
- **Number** enthält ganze Zahlen und Gleitkommazahlen wie 3.14.
- **Boolean** Werte sind *true* oder *false*.
- **Final** Werte werden vom Controller ausgewertet, wenn eine Bestellung hinzugefügt wird. Andere Datentypen werden vom Agenten ausgewertet, wenn ein Auftrag gestartet wird.
  - Die Hauptverwendung ist über Funktionen wie: *jobResourceVariable( 'meineJobResource', 'meineVariable' )*
  - Details finden Sie unter [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables).
- **List** ist ein Array-Datentyp, der das Hinzufügen einer beliebigen Anzahl von Variablen ermöglicht, wobei jede ihren eigenen Datentyp und Standardwert hat.
  - Referenzen auf Array-Variablen verwenden die Syntax: *$Farben(0).hellblau*, *$Farben(0).blau*, *$Farben(1).hellgrün*, *$Farben(1).grün*
- **Map** ist eine Liste von Variablen, die jeweils ihren eigenen Datentyp und Standardwert haben.
  - Verweise auf Map-Variablen verwenden die Syntax: *$Farben.blau*, *$Farben.grün*

### Suche in Workflows

Oben auf dem *Workflow-Panel* ist ein Suchsymbol verfügbar. Wenn Sie auf das Symbol klicken, können Sie eine Zeichenfolge eingeben, die dem Namen eines Auftrags oder einer Workflow-Anweisung entspricht.

- Wenn Sie das erste Zeichen eingeben, wird ein Listenfeld geöffnet, das die passenden Workflow-Anweisungen anzeigt und Treffer in roter Farbe markiert.
- Wenn Sie auf einen Treffer klicken, scrollt das Fenster zu dem entsprechenden Job oder der Workflow-Anweisung.
- Bei der Suche nach Anweisungen wird nicht zwischen Groß- und Kleinschreibung unterschieden und es wird nach links und rechts abgeschnitten. Wenn Sie zum Beispiel das Zeichen **O** (Großbuchstabe o) eingeben, wird *J**o**b* gefunden.

### Operationen auf Workflows

#### Einrichtungsvorgänge

Oben auf dem *Workflow-Panel* finden Sie die folgenden Statusanzeigen:

- **gültig** / **nicht gültig** zeigt mit blauer / oranger Farbe an, ob der Workflow konsistent und bereit für die Bereitstellung ist. *Ungültige* Workflows können nicht bereitgestellt werden, Änderungen werden jedoch im Inventar gespeichert. Wenn beispielsweise einem Auftrag kein Agent zugewiesen wurde, wird der Workflow *ungültig*. Innerhalb des Statusindikators *ungültig* ist das Informationssymbol (i) verfügbar, das den Grund anzeigt, warum der Workflow +ungültig* ist
- **Eingesetzt** / **nicht eingesetzt** zeigt an, ob die aktuelle Version des Workflows *eingesetzt* wurde oder ein Entwurf ist, der *nicht eingesetzt* wurde.

Die Schaltfläche *Einsatz* ermöglicht den Einsatz auf einem Controller mit einem einzigen Klick. Ansonsten sind Bereitstellungsvorgänge auf Ordnerebene verfügbar, siehe [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation).

#### Operationen auf Anweisungen

Wenn Sie den Mauszeiger über eine Anweisung bewegen, wird das 3-Punkte-Aktionsmenü für die folgenden Operationen angeboten:

- **Alle Anweisungen** bieten die Operationen *Kopieren*, *Ausschneiden* und *Entfernen*. Blockinstruktionen wie die *Gabelinstruktion* bieten zusätzlich die Operation *Alles entfernen*: Während *Entfernen* nur die Instruktion entfernt, entfernt die Operation *Alles entfernen* die Instruktion und alle enthaltenen Instruktionen wie z.B. Jobs.
- **Job Instruction** bietet die Operation *Make Job Template*, mit der aus dem aktuellen Auftrag eine Auftragsvorlage erstellt wird. Die Auftragsvorlage kann von anderen Aufträgen im gleichen oder in anderen Workflows verwendet werden.

#### Operationen Kopieren, Ausschneiden, Einfügen

*die Operationen *Kopieren** und **Ausschneiden** sind über das Aktionsmenü 3-Punkte einer Anweisung verfügbar. Die Operationen *Kopieren* und *Ausschneiden* für eine Blockanweisung wirken auf alle Anweisungen, die in der Blockanweisung enthalten sind. Um mehr als eine Anweisung aus derselben Ebene zu kopieren oder auszuschneiden, halten Sie die Maustaste gedrückt und markieren Sie die Anweisungen ähnlich wie mit einem Lasso. 

- das Tastaturkürzel **Strg+C** kopiert die markierten Anweisungen.
- mit dem Tastaturkürzel **Strg+X** können Sie die markierten Anweisungen ausschneiden.

**Über die *Symbolleiste* können Sie die kopierten oder ausgeschnittenen Anweisungen per Drag&amp;Drop in den Workflow ziehen.

- die Tastenkombination **Strg+V** fügt die kopierten oder ausgeschnittenen Anweisungen ein, wenn der Benutzer auf eine Verbindungslinie zwischen Workflow-Anweisungen klickt.

#### Bedienfeld

Wenn Sie auf die Leinwand des *Workflow-Panels* klicken, wird ein *Operations-Panel* sichtbar, das die folgenden Operationen bietet:

- Operationen zoomen
  - **Vergrößern** vergrößert die Größe der Workflow-Anweisungen.
  - **Verkleinern** verkleinert die Workflow-Anweisungen.
  - **Zoomen auf Standard** legt die Standardgröße der Workflow-Anweisungen fest.
  - **An das Panel anpassen** wählt eine Größe für die Workflow-Anweisungen, die es ermöglicht, den Workflow an die Panelgröße anzupassen.
- Rückgängig, Wiederherstellen
  - **Rückgängig** macht die letzte Änderung rückgängig. Es können bis zu 20 Vorgänge rückgängig gemacht werden.
  - **Rückgängig** stellt die letzte Änderung, die rückgängig gemacht wurde, wieder her.
- Download, Upload Operationen
  - **JSON herunterladen** lädt den Workflow im JSON-Speicherformat in eine .json-Datei herunter.
  - mit **JSON hochladen** können Sie eine .json-Datei hochladen, die den Workflow ersetzen wird.
- Operationen exportieren
  - **Bild exportieren** bietet den Download einer .png-Bilddatei des Workflows an.

## Referenzen

### Kontexthilfe

- [Konfiguration - Inventar - Job-Ressourcen](/configuration-inventory-job-resources)
- [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation)
- [Tagesplan](/daily-plan)
- [Order History](/history-orders)
- [Order States](/order-states)

### Product Knowledge Base

- [gerichteter azyklischer Graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph)
- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
- [JS7 - Workflow Instructions - Processing](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Processing)
  - [JS7 - AdmissionTime Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AdmissionTime+Instruction)
  - [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
  - [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction)
  - [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction)
  - [JS7 - Prompt Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Prompt+Instruction)
  - [JS7 - Sleep Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Sleep+Instruction)
- [JS7 - Workflow Instructions - Clustering](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Clustering)
  - [JS7 - ForkList-Join Instruction for Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction+for+Agent+Clusters)
  - [JS7 - StickySubagent Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+StickySubagent+Instruction+for+Agent+Clusters)
- [JS7 - Workflow Instructions - Conditional Processing](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Conditional+Processing)
  - [JS7 - If Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+If+Instruction)
  - [JS7 - Case Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Case+Instruction)
- [JS7 - Workflow Instructions - Cyclic Execution](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Cyclic+Execution)
  - [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction)
  - [JS7 - Break Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Break+Instruction)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)
  - [JS7 - AddOrder Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AddOrder+Instruction)
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)
- [JS7 - Workflow Instructions - Error Handling](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Error+Handling)
  - [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction)
  - [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction)
  - [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction)
  - [JS7 - Try-Catch Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Try-Catch+Instruction)
- [JS7 - Workflow Instructions - Forking](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Forking)
  - [JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction)
  - [JS7 - ForkList-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction)

