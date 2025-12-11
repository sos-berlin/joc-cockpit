# Konfiguration - Inventar - Arbeitsabläufe

Der Bereich *Arbeitsablauf* bietet die Möglichkeit, Arbeitsabläufe aus einer Folge von Anweisungen zu entwerfen, die den Arbeitsablauf für einen [gerichteten azyklischen Graphen](https://en.wikipedia.org/wiki/Directed_acyclic_graph) formen. 

- Benutzer können Anweisungen per Drag&amp;Drop aus der *Funktionsleiste* ziehen, wie z.B. eine Abfolge von Jobs, das Verzweigen und Verbinden von Jobs, bedingte Ausführung usw.
- Der [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation) bietet eine Navigation nach Kennzeichnungen und Ordnern. Darüber hinaus bietet der Bereich Operationen für Arbeitsabläufe.

## Bereich: Funktionsleiste

Die *Funktionsleiste* enthält die folgenden Anweisungen:

- **Job Anweisung** implementiert einen Job. Arbeitsabläufe können eine beliebige Anzahl von Jobs enthalten. Einzelheiten finden Sie unter [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction).
- **Try/Catch Anweisung** implementiert die Behandlung von Ausnahmen in einem *Try*-Block, der Jobs oder andere Anweisungen enthält. Wenn ein Auftrag fehlschlägt, werden die Anweisungen im *Catch*-Block ausgeführt. Ein leerer *Catch*-Block löst den Fehlerstatus einer zuvor fehlgeschlagenen Anweisung auf. Einzelheiten finden Sie unter [JS7 - Try-Catch Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Try-Catch+Instruction).
- **Retry Anweisung** implementiert die wiederholte Ausführung einer Folge von Jobs oder anderen Anweisungen im Falle eines Fehlers. Wenn einer der Jobs im *Retry*-Block fehlschlägt, wird der Auftrag an den Anfang des *Retry*-Blocks verschoben, um die Ausführung zu wiederholen. Einzelheiten finden Sie unter [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction).
- **Finish Anweisung** sorgt dafür, dass ein Auftrag den Arbeitsablauf mit einem erfolgreichen oder nicht erfolgreichen Ergebnis in der [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History) verlässt. Details finden Sie unter [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction).
- **Fail Anweisung** lässt einen Auftrag fehlschlagen. Ohne weitere Fehlerbehandlung verbleibt der Auftrag im Zustand *Failed*, siehe [Auftragszustände](/order-states). Eine umgebende *Try/Catch Anweisung* oder *Retry Anweisung* wird durch die *Fail Anweisung* ausgelöst. Einzelheiten finden Sie unter [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction).
- **Fork Anweisung** lässt Aufträge verzweigen und verbunden, um die parallele Verarbeitung von Jobs und anderen Anweisungen in einem Arbeitsablauf zu ermöglichen. Zweige werden durch Ziehen und Ablegen von Anweisungen auf der *Fork Anweisung* erstellt. Wenn ein Auftrag in die *Fork Anweisung* eintritt, wird für jede Verzweigung ein Kindauftrag erstellt. Einzelheiten finden Sie unter [JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction).
  - Jeder Kindauftrag passiert die Knoten in seinem Zweig unabhängig von parallelen Kindaufträgen.
  - Kindaufträge können Ergebnisse an Elternaufträge zurückgeben, indem sie Variablen übergeben.
  - Kindaufträge übernehmen die Rolle von Elternaufträgen in verschachtelten *Fork Anweisungen*.
- **ForkList Anweisung** ist die dynamische Version einer *Fork-Anweisung* und wird in den folgenden Varianten angeboten:
  - Die Anweisung erwartet, dass ein Auftrag eine *Listenvariable* bereitstellt, die als Liste (Array) von Werten implementiert ist. Die Liste kann eine beliebige Anzahl von Name/Wert-Paaren (Variablen) enthalten. Die *ForkList Anweisung* ist als einzelne Verzweigung konzipiert: Abhängig von der Anzahl der Einträge, die mit der *Listenvariable* des Auftrags geliefert werden, erstellt der Agent dynamisch Verzweigungen für jeden Eintrag der *Listenvariable*. Dies ermöglicht zum Beispiel die Ausführung von Aufträgen für jeden Eintrag einer *Listenvariable*. Einzelheiten finden Sie unter [JS7 - ForkList-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction).
  - Die Anweisung ermöglicht es, eine Reihe von Kindaufträgen und Verzweigungen dynamisch zu erstellen und dieselbe Sequenz von Jobs oder anderen Anweisungen auf einer Reihe von Subagenten auszuführen: Benutzer können dieselben Jobs parallel auf einer Reihe von Servern oder Containern ausführen, die Subagenten betreiben. Zu den Anwendungsfällen gehört z.B. die Ausführung ähnlicher Sicherungsaufträge auf einer größeren Anzahl von Servern. Einzelheiten finden Sie unter [JS7 - ForkList-Join Instruction for Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction+for+Agent+Clusters).
- **Cycle Anweisung** ermöglicht die wiederholte Ausführung aller oder einiger Jobs und anderer Anweisungen in einem Arbeitsablauf. Es handelt sich um eine Blockanweisung, die den gesamten Arbeitsablauf oder ausgewählte Jobs und Anweisungen in einem Arbeitsablauf umfassen kann. Die *Cycle Anweisung* kann verschachtelt werden. Einzelheiten finden Sie unter [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction).
- **Break Anweisung** wird in einer *Cycle Anweisung* verwendet, um den Zyklus zu beenden und um einen Auftrag aus dem Zyklus zu nehmen. Einzelheiten finden Sie unter [JS7 - Break Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Break+Instruction).
- **Lock Anweisung** ist eine Blockanweisung, die verwendet wird, um einen oder mehrere Jobs und andere Anweisungen zum gegenseitigen Ausschluss zu spezifizieren, um zu verhindern, dass Jobs parallel entweder im selben Arbeitsablauf oder in unterschiedlichen Arbeitsabläufen ausgeführt werden. *Lock Anweisungen* können verschachtelt werden. Einzelheiten finden Sie unter [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction).
- **Sleep Anweisung** wird verwendet, um die weitere Verarbeitung in einem Arbeitsablauf um eine in Sekunden angebbare Zeitspanne zu verzögern. Einzelheiten finden Sie unter [JS7 - Sleep Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Sleep+Instruction).
- **Prompt Anweisung** hält die Ausführung eines Auftrags in einem Arbeitsablauf an, bis die Aufforderung bestätigt wird. Der Auftrag erhält den Status *Prompting*. Benutzer können Aufträge im *Prompting* Status bestätigen oder abbrechen, siehe [Auftragszustände](/order-states). Einzelheiten finden Sie unter [JS7 - Prompt Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Prompt+Instruction).
- **AdmissionTimes Anweisung** hält die Ausführung eines Auftrags in einem Arbeitsablauf an, bis das angegebene Zeitfenster erreicht ist. Der Auftrag erhält den Status *Wartend*. Darüber hinaus können Aufträge abgebrochen werden, wenn sie das angebbare Zeitfenster überschreiten. Die Anweisung kann so konfiguriert werden, dass ein Auftrag alle enthaltenen Anweisungen überspringt, falls kein passendes Zeitfenster für das Startdatum des Auftrags gefunden wird. Einzelheiten finden Sie unter [[JS7 - AdmissionTimes Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AdmissionTimes+Instruction).
- **AddOrder Anweisung** wird in einem Arbeitsablauf verwendet, um einen Auftrag für einen anderen Arbeitsablauf zu erstellen. Standardmäßig werden hinzugefügte Aufträge asynchron in einem separaten Arbeitsablauf und parallel zum aktuellen Auftrag ausgeführt, d.h. ihr Ausführungsergebnis wird nicht synchronisiert und hat keinen Einfluss auf den aktuellen Auftrag. Soll die Ausführung des hinzugefügten Auftrags synchronisiert werden, können die  *ExpectNotices Anweisung* und *ConsumeNotices Anweisung* verwendet werden. Einzelheiten finden Sie unter [JS7 - AddOrder Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AddOrder+Instruction).
- **PostNotices Anweisung** wird verwendet, um eine oder mehrere Benachrichtigungen für Notizbretter zu erstellen. Die Notizen werden von den entsprechenden *ExpectNotices Anweisung* und *ConsumeNotices Anweisung* aus demselben oder aus verschiedenen Arbeitsabläufe erwartet. Ein Arbeitsablauf kann eine beliebige Anzahl von *PostNotices Anweisungen* enthalten, um Benachrichtigungen an dasselbe oder an unterschiedliche Notizbretter zu senden. Das Versenden einer Mitteilung blockiert nicht die weitere Ausführung eines Auftrags in einem Arbeitsablauf. Der Auftrag wird sofort fortgesetzt, nachdem die Notiz veröffentlicht wurde. Einzelheiten finden Sie unter [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction).
- **ExpectNotices Anweisung** wird verwendet, um zu prüfen, ob auf einem oder mehreren Notizbrettern, die durch eine *PostNotices Anweisung* oder durch den Benutzer hinzugefügt wurden, Notizen vorhanden sind. Wenn die Benachrichtigung nicht vorhanden ist, bleibt der Auftrag an der Anweisung im *Wartezustand*. Ein Arbeitsablauf kann eine beliebige Anzahl von *ExpectNotices Anweisungen* enthalten, um Benachrichtigungen von der gleichen oder von verschiedenen Notizbrettern zu erwarten. Einzelheiten finden Sie unter [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction).
- **ConsumeNotices Anweisung** wird verwendet, um Aufträge dazu zu veranlassen, Benachrichtigungen von einem oder mehreren Notizbrettern zu erwarten, die durch eine *PostNotices Anweisung* oder durch den Benutzer hinzugefügt werden. Die *ConsumeNotices Anweisung* ist eine Blockanweisung, die beliebige andere Anweisungen enthalten kann und die die erwarteten Notizen löscht, wenn ein Auftrag das Ende des Anweisungsblocks erreicht. Einzelheiten finden Sie unter [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction).
- **If Anweisung** ist eine Blockanweisung, die für die bedingte Verarbeitung in einem Arbeitsablauf verwendet wird. Sie ermöglicht die Überprüfung von Rückgabewerten und die Auswertung von Auftragsvariablen. Einzelheiten finden Sie unter [JS7 - If Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+If+Instruction).
- die **Case Anweisung** wird für die bedingte Verarbeitung von Jobs und anderen Anweisungen in einem Arbeitsablauf verwendet. Die Anweisung erweitert die *If Anweisung*. Die *Case Anweisung* kann mit wiederholten *Case-When Anweisungen* und optional mit einer einzelnen *Case-Else Anweisung* verwendet werden. Einzelheiten finden Sie unter [JS7 - Case Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Case+Instruction).
- die **CaseWhen Anweisung** wird verwendet, um ein Prädikat zu prüfen, ähnlich wie die *If Anweisung*. Die Anweisung kann beliebig oft in einer *Case Anweisung* vorkommen.
- die **CaseElse Anweisung** wird verwendet, wenn alle Prüfungen der *CaseWhen Anweisungen* fehlschlagen.
- die **StickySubagent Anweisung** kann verwendet werden, um eine Reihe von Aufträgen mit demselben Subagenten eines Agent Cluster auszuführen. Die Blockanweisung prüft den ersten verfügbaren Subagenten eines Subagent Cluster. Dieser Subagent wird für die nachfolgenden Jobs innerhalb der Blockanweisung verwendet. Die Verwendung eines Agent Cluster unterliegt den Bedingungen für das Clustering mit der [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License). Einzelheiten finden Sie unter [JS7 - StickySubagent Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+StickySubagent+Instruction+for+Agent+Clusters).
- **Options Anweisung** ist eine Blockanweisung, die die Fehlerbehandlung für die *Lock Anweisung* und die *ConsumeNotices Anweisung* regelt. Wenn die *Options Anweisung* vorhanden ist und die Eigenschaft *Stoppen im Fehlerfall* enthält, verbleiben die *fehlgeschlagenen* Aufträge bei der fehlgeschlagenen Anweisung, z.B. einem Job. Wenn die Anweisung nicht vorhanden ist, werden Aufträge, die innerhalb einer *Lock Anweisung* oder *ConsumeNotices Anweisung* fehlschlagen, an den Anfang des Anweisungsblocks verschoben und verbleiben im Zustand *Failed*. Einzelheiten finden Sie unter [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction).
- mit **Einfügen** können Sie eine oder mehrere zuvor kopierte oder ausgeschnittene Anweisungen per Drag&amp;Drop in den Arbeitsablauf einfügen.

## Bereich: Arbeitsablauf

Der Bereich enthält die grafische Darstellung eines Arbeitsablaufs.

- Sie können Anweisungen aus der *Funktionsleiste* per Drag&amp;Drop in den Arbeitsablauf ziehen.
  - Um die erste Anweisung in einem Arbeitsablauf per Drag&amp;Drop abzulegen, halten Sie die Maustaste gedrückt und legen die Anweisung im angegebenen Ablagebereich des Arbeitsablaufs ab.
  - Um weitere Anweisungen per Drag&amp;Drop abzulegen, halten Sie die Maustaste gedrückt, navigieren zur gewünschten Verbindungslinie zwischen den Anweisungen und lassen die Maustaste los.
- Bei der *Fork Anweisung* und *If Anweisung* können Sie eine *Job Anweisung* per Drag&amp;Drop direkt auf den Knoten *Fork* ziehen, um einen neuen Zweig zu erstellen.
- Bei der *When Anweisung* können Sie eine *Job Anweisung* per Drag&amp;Drop direkt auf den *When-Block* ziehen: die erste Anweisung stellt die *wahr* Verzweigung dar, die zweite Anweisung, die Sie per Drag&amp;Drop ziehen, erzeugt die *falsch* Verzweigung.

Arbeitsabläufe werden automatisch im Inventar gespeichert. Dies geschieht alle 30 Sekunden und beim Verlassen des *Arbeitsablaufsbereichs*.

Für einen Arbeitsablauf sind die folgenden Eingaben möglich:

- **Name** ist der eindeutige Bezeichner eines Arbeitsablaufs, siehe [Regeln zur Benennung von Objekten](/object-naming-rules).
- **Titel** enthält eine optionale Erklärung zum Zweck des Arbeitsablaufs.
- **Job-Ressourcen** sind Inventarobjekte, die Variablen aus Schlüssel/Wert-Paaren enthalten, die aus Variablen des Arbeitsablaufs und aus Umgebungsvariablen verfügbar gemacht werden können. *Job-Ressourcen* können dem Job zugewiesen werden und sie können dem Arbeitsablauf zugewiesen werden, wodurch sie für alle Jobs in einem Arbeitsablauf verfügbar sind. Einzelheiten finden Sie unter [Konfiguration - Inventar - Job-Ressourcen](/configuration-inventory-job-resources).
- **Zeitzone**, die aus den [Profil - Einstellungen](/profile-preferences) des Benutzers übernommen wird. Für die Eingabe werden Zeitzonenkennungen wie *UTC*, *Europa/London* usw. akzeptiert. Eine vollständige Liste der Zeitzonenkennungen finden Sie unter [Liste der Zeitzonen der tz-Datenbank](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).
  - Die *Zeitzone* wird auf Zeiträume in *Job Zutrittszeiten* und in *Cycle Anweisungen* angewendet.
  - Es ist möglich, eine *Zeitzone* zu verwenden, die von den [Einstellungen - Tagesplan](/settings-daily-plan) abweicht. Dies kann jedoch zu verwirrenden Ergebnissen führen.
- **Nicht deklarierte Variablen zulassen** bietet die Verwendung von Auftragsvariablen, die nicht mit dem Arbeitsablauf deklariert sind. Dies bedeutet, dass Aufträge Variablen enthalten können, die nicht auf Datentyp oder obligatorische Verwendung geprüft werden. Aufträge schlagen fehl, wenn sie auf nicht deklarierte Variablen verweisen, die nicht in einem Auftrag verfügbar sind.

### Variablen des Arbeitsablaufs

Variablen des Arbeitsablaufs werden im Arbeitsablauf deklariert und zur Parametrierung der Ausführung von Jobs verwendet:

- Erforderliche Variablen werden vom Arbeitsablauf ohne Standardwert deklariert. Aufträge, die dem Arbeitsablauf hinzugefügt werden, müssen Werte für erforderliche Variablen angeben.
- Optionale Variablen werden durch den Arbeitsablauf mit einem Standardwert deklariert. Aufträge, die dem Arbeitsablauf hinzugefügt werden, können Werte angeben, ansonsten wird der Standardwert verwendet.

Für Variablen des Arbeitsablaufs werden die folgenden Datentypen angeboten:

- **Zeichenkette** enthält beliebige Zeichen. Optional können die Werte in einfache Anführungszeichen gesetzt werden.
  - Konstante Werte: *hallo welt*
  - Funktionen: *now( format='yyyy-MM-dd hh:mm:ss', timezone='Europe/London' )*, *env('HOSTNAME')*
- **Zahl** enthält ganze Zahlen und Gleitkommazahlen wie 3,14.
- **Wahrheitswert** Werte sind *wahr* oder *falsch*.
- **Final** Werte werden vom Controller ausgewertet, wenn ein Auftrag hinzugefügt wird. Andere Datentypen werden vom Agenten ausgewertet, wenn ein Auftrag gestartet wird.
  - Die hauptsächliche Verwendung liegt in Funktionen wie: *jobResourceVariable( 'meineJobResource', 'meineVariable' )*
  - Details finden Sie unter [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables).
- **Liste** ist ein Array-Datentyp, der das Hinzufügen einer beliebigen Anzahl von Variablen ermöglicht, wobei jede ihren eigenen Datentyp und Standardwert hat.
  - Referenzen auf Array-Variablen verwenden die Syntax: *$Farben(0).hellblau*, *$Farben(0).blau*, *$Farben(1).hellgruen*, *$Farben(1).gruen*
- **Map** ist eine Liste von Variablen, die jeweils ihren eigenen Datentyp und Standardwert haben.
  - Verweise auf Map-Variablen verwenden die Syntax: *$Farben.blau*, *$Farben.gruen*

### Suche in Arbeitsabläufen

Über dem *Arbeitsablaufsbereich* ist ein Suchsymbol verfügbar. Wenn Sie auf das Symbol klicken, können Sie eine Zeichenfolge eingeben, die dem Namen eines Jobs oder einer Anweisung im Arbeitsablauf entspricht.

- Wenn Sie das erste Zeichen eingeben, wird ein Listenfeld geöffnet, das die passenden Anweisungen im Arbeitsablauf anzeigt und Treffer in roter Farbe markiert.
- Wenn Sie auf einen Treffer klicken, blättert das Fenster zu dem entsprechenden Job oder der Anweisung im Arbeitsablauf.
- Bei der Suche nach Anweisungen wird nicht zwischen Groß- und Kleinschreibung unterschieden und es wird nach links und rechts abgeschnitten. Wenn Sie zum Beispiel das Zeichen **O** (Großbuchstabe o) eingeben, wird *J**o**b* gefunden.

### Operationen für Arbeitsabläufe

#### Operationen für Ausrollen

Über dem *Arbeitsablaufsbereich* finden Sie die folgenden Statusanzeigen:

- **gültig** / **nicht gültig** zeigt mit blauer / oranger Farbe an, ob der Arbeitsablauf konsistent und bereit für das Ausrollen ist. *Ungültige* Arbeitsabläufe können nicht ausgerollt werden, Änderungen werden jedoch im Inventar gespeichert. Wenn beispielsweise einem Job kein Agent zugewiesen wurde, wird der Arbeitsablauf *ungültig*. Innerhalb des Statusindikators *ungültig* ist das Informationssymbol (i) verfügbar, das den Grund anzeigt, warum der Arbeitsablauf *ungültig* ist
- **ausgerollt** / **nicht ausgerollt** zeigt an, ob die aktuelle Version des Arbeitsablaufs *ausgerollt* wurde oder ein Entwurf ist, der *nicht ausgerollt* wurde.

Die Schaltfläche *Ausrollen* ermöglicht das Übertragen auf einen Controller mit einem einzigen Klick. Ansonsten sind Operationen für das Ausrollen auf Ordnerebene verfügbar, siehe [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation).

#### Operationen für Anweisungen

Wenn Sie den Mauszeiger über eine Anweisung bewegen, wird das 3-Punkte Aktionsmenü für die folgenden Operationen angeboten:

- **Alle Anweisungen** bieten die Operationen *Kopieren*, *Ausschneiden* und *Entfernen*. Blockanweisungen wie die *Fork Anweisung* bieten zusätzlich die Operation *Alles entfernen*: Während *Entfernen* nur die Anweisung entfernt, entfernt die Operation *Alles entfernen* die Anweisung und alle ggf. rekursiv enthaltenen Anweisungen wie z.B. Jobs.
- **Job Anweisung** bietet die Operation *Als Job-Vorlage*, mit der aus dem aktuellen Job eine Job-Vorlage erstellt wird. Die Job-Vorlage kann von anderen Jobs im gleichen oder in anderen Arbeitsabläufen verwendet werden.

#### Operationen für Kopieren, Ausschneiden, Einfügen

**Kopieren** und **Ausschneiden** sind über das 3-Punkte Aktionsmenü einer Anweisung verfügbar. Die Operationen *Kopieren* und *Ausschneiden* für eine Blockanweisung wirken auf alle Anweisungen, die in der Blockanweisung enthalten sind. Um mehr als eine Anweisung aus derselben Ebene zu kopieren oder auszuschneiden, halten Sie die Maustaste gedrückt und markieren Sie die Anweisungen ähnlich wie mit einem Lasso. 

- das Tastaturkürzel **Strg+C** kopiert die markierten Anweisungen.
- mit dem Tastaturkürzel **Strg+X** können Sie die markierten Anweisungen ausschneiden.

**Einfügen** ist über die *Funktionsleiste* verfügbar und erlaubt die kopierten oder ausgeschnittenen Anweisungen per Drag&amp;Drop in den Arbeitsablauf zu ziehen.

- die Tastenkombination **Strg+V** fügt die kopierten oder ausgeschnittenen Anweisungen ein, wenn der Benutzer auf eine Verbindungslinie zwischen Anweisungen im Arbeitsablauf klickt.

#### Operationen für Darstellung

Wenn Sie auf den Hintergrund des Bereichs *Arbeitsablauf* klicken, wird eine *Funktionsleiste* sichtbar, die die folgenden Operationen bietet:

- Operationen für Zoomen
  - **Vergrößern** vergrößert die Größe der Anweisungen im Arbeitsablauf.
  - **Verkleinern** verkleinert die Größe der Anweisungen im Arbeitsablauf.
  - **Zoomen auf Standard** lässt Größe der Anweisungen im Arbeitsablauf auf den Standard zurückfallen.
  - **An den Bereich anpassen** wählt eine Größe für die Anweisungen im Arbeitsablauf, die es ermöglicht, den kompletten Arbeitsablauf an die Bereichsgröße anzupassen.
- Rückgängig, Wiederherstellen
  - **Rückgängig** macht die letzte Änderung rückgängig. Es können bis zu 20 Operationen rückgängig gemacht werden.
  - **Wiederholen** stellt die letzte Änderung, die rückgängig gemacht wurde, wieder her.
- Operationen für Hochladen, Herunterladen
  - **JSON Format herunterladen** lädt den Arbeitsablauf im JSON Format in eine .json-Datei herunter.
  - **JSON Format hochladen** erlaubt das Hochladen einer .json-Datei, die den Arbeitsablauf ersetzen wird.
- Operationen exportieren
  - **Exportieren im PNG Format** bietet das Herunterladen einer .png Bilddatei des Arbeitsablaufs an.

## Referenzen

### Kontext-Hilfe

- [Auftragshistorie](/history-orders)
- [Auftragszustände](/order-states)
- [Konfiguration - Inventar - Job-Ressourcen](/configuration-inventory-job-resources)
- [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation)
- [Tagesplan](/daily-plan)

### Product Knowledge Base

- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
- [JS7 - Workflow Instructions - Processing](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Processing)
  - [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
  - [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction)
  - [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction)
  - [JS7 - Prompt Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Prompt+Instruction)
  - [JS7 - Sleep Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Sleep+Instruction)
- [JS7 - Workflow Instructions - Clustering](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Clustering)
  - [JS7 - ForkList-Join Instruction for Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction+for+Agent+Clusters)
  - [JS7 - StickySubagent Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+StickySubagent+Instruction+for+Agent+Clusters)
- [JS7 - Workflow Instructions - Conditional Processing](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Conditional+Processing)
  - [JS7 - AdmissionTimes Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AdmissionTimes+Instruction)
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
- [gerichteter azyklischer Graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph)
