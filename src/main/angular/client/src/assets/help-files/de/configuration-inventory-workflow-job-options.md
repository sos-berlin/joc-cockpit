# Konfiguration - Inventar - Workflow - Auftragsoptionen

Im Bereich *Workflow* können Sie Workflows aus einer Folge von Anweisungen erstellen. Sie können die *Auftragsanweisung* per Drag &amp; Drop aus der *Symbolleiste* an eine Position im Workflow ziehen.

Die grafische Benutzeroberfläche bietet eine Reihe von Registerkarten für die Angabe von Auftragsdetails. Die zweite Registerkarte wird für *Job-Optionen* angeboten.

## Häufig verwendete Auftragsoptionen

- **Parallelität** gibt die Anzahl der parallelen Instanzen an, für die der Auftrag ausgeführt werden kann. Wenn mehr als ein Auftrag den Workflow bearbeitet, können sie den Auftrag parallel ausführen. Zusätzlich zur *Parallelität* gilt das Prozesslimit, das von Standalone-Agenten und Agent-Clustern durchgesetzt wird.
- **Die *Kritikalität* gibt die Relevanz von Fehlern im Auftrag an. Die *Kritikalität* ist bei Benachrichtigungen über Auftragsausfälle verfügbar.

### Job-Ausführungszeiträume

- **Timeout** gibt die maximale Ausführungszeit an, die der Auftrag in Anspruch nehmen darf. Wenn der Auftrag die *Zeitüberschreitung* überschreitet, wird er vom Agenten unter Berücksichtigung der *Grace Timeout* des Auftrags abgebrochen. Die Eingabe kann in den folgenden Formaten angegeben werden:
  - *1* oder *1s*: entweder eine Zahl oder eine Zahl gefolgt von *s* gibt den *Timeout* in Sekunden an.
  - *1m 2d 3h*: gibt 1 Monat, 2 Tage und 3 Stunden als maximalen Ausführungszeitraum an.
  - *01:02:03*: gibt 1 Stunde, 2 Minuten und 3 Sekunden als maximalen Ausführungszeitraum an.
- **Warnung bei kürzerer Ausführungszeit** löst eine Warnung und eine entsprechende Benachrichtigung aus, wenn der Auftrag früher als in der angegebenen Zeitspanne beendet wird. Die Eingabeformate umfassen:
  - *1* oder *1s*: entweder eine Zahl oder eine Zahl gefolgt von *s* gibt den Ausführungszeitraum in Sekunden an.
  - *01:02:03*: gibt 1 Stunde, 2 Minuten und 3 Sekunden für den Ausführungszeitraum an.
  - *30%*: gibt eine um 30% kürzere Ausführungszeit an als der Durchschnitt der bisherigen Ausführungen des Auftrags. Bei der Berechnung wird die [Task History](/history-tasks) verwendet, die der Bereinigung durch die [Cleanup Service](/service-cleanup) unterliegt.
- **Warnung bei längerer Ausführungsdauer** löst eine Warnung und eine damit verbundene Benachrichtigung aus, wenn der Job die angegebene Dauer überschreiten wird. Die Eingabeformate umfassen:
  - *1* oder *1s*: entweder eine Zahl oder eine Zahl gefolgt von *s* gibt den Ausführungszeitraum in Sekunden an.
  - *01:02:03*: gibt 1 Stunde, 2 Minuten und 3 Sekunden für den Ausführungszeitraum an.
  - *30%*: gibt eine um 30% längere Ausführungszeit an als der Durchschnitt der bisherigen Ausführungen des Auftrags. Für die Berechnung wird die [Task History](/history-tasks) verwendet, die von der [Cleanup Service](/service-cleanup) bereinigt wird.

### Job Log Ausgabe

- **Fail on output to stderr** legt fest, dass der Agent den Auftrag fehlschlagen lässt, wenn er Ausgaben in den stderr-Kanal schreibt. Diese Prüfung erfolgt zusätzlich zur Prüfung des *Rückgabewerts* (bei Shell Jobs: Exit Code) eines Jobs.
- **Warn on output to stderr** legt fest, dass die gleiche Prüfung wie bei *Fail on output to stderr* durchgeführt wird. Der Auftrag wird jedoch nicht fehlgeschlagen, sondern es wird eine Warnung ausgegeben und eine Benachrichtigung erstellt.

### Job Admission Times

*Admission Times* legt fest, wann ein Auftrag gestartet werden kann oder übersprungen werden soll und wie lange ein Auftrag ausgeführt werden kann. Einzelheiten finden Sie unter [JS7 - Admission Times for Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Admission+Times+for+Jobs).

- **Job überspringen, wenn keine Zulassung zum Datum des Auftrags** legt fest, dass der Job übersprungen wird, wenn seine *Zulassungszeit* nicht mit dem Datum des Auftrags übereinstimmt. Die *Zulassungszeit* des Auftrags kann beispielsweise Wochenenden ausschließen, was dazu führt, dass der Auftrag von Montag bis Freitag ausgeführt wird und von Aufträgen, die für Samstag-Sonntag geplant sind, übersprungen wird. Sie sollten bedenken, dass das Datum, für das der Auftrag geplant ist, relevant ist und nicht das Ankunftsdatum des Auftrags im Auftrag. Wenn das geplante Datum des Auftrags mit der *Zulassungszeit* übereinstimmt, der Auftrag aber zu einem späteren Zeitpunkt außerhalb der *Zulassungszeit* eintrifft, dann wird der Auftrag nicht übersprungen und der Auftrag wartet auf die nächste *Zulassungszeit*.
- **Auftrag am Ende des Zeitraums beenden** legt fest, dass der Agent den Auftrag abbricht, wenn er den mit *Zulassungszeit* festgelegten Zeitpunkt überschreitet.
- mit **Zulassungszeit** können Sie über den Link *Zeiträume anzeigen* Tage und Stunden angeben, an denen Aufträge ausgeführt werden können.

#### Zulassungsarten

*Mit den Zulassungstypen* können Sie Tage angeben, an denen der Job starten kann. Darüber hinaus können Sie Monatsbereiche angeben, die den *Zulassungstyp* auf bestimmte Monate beschränken.

- **Wochentage** geben die Wochentage an, an denen der Auftrag beginnen kann.
- **Bestimmte Wochentage** geben relative Wochentage an, wie z.B. den ersten oder letzten Montag eines Monats.
- **Bestimmte Tage** geben die Tage des Jahres an.
- **Monatstage** geben relative Tage in einem Monat an, z.B. den ersten oder letzten Tag eines Monats.

#### Ausführungszeitraum

Der *Ausführungszeitraum* wird durch seinen *Beginn* und seine *Dauer* festgelegt:

- **Beginn** wird durch eine Uhrzeit im Format HH:MM:SS angegeben, zum Beispiel 10:15:00 für ein Viertel nach 10 Uhr.
- **Dauer** wird durch die Verwendung der folgenden Formate angegeben:
  - *1* oder *1s*: entweder eine Zahl oder eine Zahl gefolgt von *s* gibt die *Dauer* in Sekunden an.
  - *1m 2d 3h*: gibt 1 Monat, 2 Tage und 3 Stunden für die *Dauer* an.
  - *01:02:03*: gibt 1 Stunde, 2 Minuten und 3 Sekunden für die *Dauer* an.

## Auftragsoptionen verfügbar unter *Weitere Optionen*

Die Ansicht *Konfiguration - Inventar* bietet oben im Fenster den Schieberegler *Weitere Optionen*, der standardmäßig inaktiv ist. Wenn Sie den Schieberegler verwenden, werden zusätzliche Optionen verfügbar.

- **Grace Timeout** wird auf Jobs mit Unix angewendet, die ein SIGTERM-Signal erhalten, wenn ihr *Timeout* überschritten wird oder wenn sie durch einen Benutzereingriff zwangsweise beendet werden. Wenn der Auftrag nicht als Reaktion auf SIGTERM beendet wird, sendet der Agent nach dem *Grace Timeout* ein SIGKILL-Signal, um den Auftrag zwangsweise zu beenden. Einzelheiten finden Sie unter [JS7 - FAQ - How does JobScheduler terminate Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+FAQ+-+How+does+JobScheduler+terminate+Jobs) und [JS7 - Agent Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Operation).
- **Kompatibilität** bietet die Kompatibilitätsebene *v1* für Benutzer des Zweigs 1.x von JobScheduler. Im Kompatibilitätsmodus wird das folgende Verhalten geändert:
  - *Umgebungsvariablen* müssen nicht angegeben werden, sondern werden automatisch für alle Workflow-Variablen erstellt. Die Namen der Umgebungsvariablen werden mit dem Präfix *SCHEDULER_PARAM_* versehen, wobei nur Großbuchstaben verwendet werden.
  - Für die Verwendung von Job-Argumenten bietet der Kompatibilitätsmodus eine entsprechende Registerkarte.

### Neustart von Jobs

- **Job nicht neu startbar** gilt für Jobs, die vom Agenten oder von seinem Watchdog beim Stoppen oder Abbrechen des Agenten zwangsweise beendet wurden. Standardmäßig gelten Jobs als neustartbar und werden neu gestartet, wenn der Agent neu gestartet wird. Benutzer können dieses Verhalten durch Aktivieren des Kontrollkästchens verhindern.

### Jobs für Windows unter verschiedenen Benutzerkonten ausführen

Die folgenden Optionen legen für Jobs, die mit Agenten für Windows ausgeführt werden, fest, dass der Job den Benutzerkontext wechseln soll, siehe [JS7 - Running Jobs as a different User](https://kb.sos-berlin.com/display/JS7/JS7+-+Running+Jobs+as+a+different+User).

- **Credential Key** gibt den Schlüssel des Eintrags im Windows Credential Manager an, der die Anmeldeinformationen des Zielbenutzerkontos enthält.
- **Benutzerprofil laden** gibt an, ob das Profil des Zielbenutzerkontos einschließlich der Registrierungseinträge beim Start des Auftrags geladen werden soll.

## Referenzen

### Kontext-Hilfe

- [Cleanup Service](/service-cleanup)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  - [Configuration - Inventory - Workflows - Job Properties](/configuration-inventory-workflows-job-properties)
  - [Configuration - Inventory - Workflows - Job Node Properties](/configuration-inventory-workflows-job-node-properties)
  - [Configuration - Inventory - Workflows - Job Notifications](/configuration-inventory-workflows-job-notifications)
  - [Configuration - Inventory - Workflows - Job Tags](/configuration-inventory-workflows-job-tags)
- [Task History](/history-tasks)

### Product Knowledge Base

- [JS7 - Admission Times for Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Admission+Times+for+Jobs).
- [JS7 - Agent Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Operation)
- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - FAQ - How does JobScheduler terminate Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+FAQ+-+How+does+JobScheduler+terminate+Jobs)
- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
- [JS7 - Running Jobs as a different User](https://kb.sos-berlin.com/display/JS7/JS7+-+Running+Jobs+as+a+different+User)

