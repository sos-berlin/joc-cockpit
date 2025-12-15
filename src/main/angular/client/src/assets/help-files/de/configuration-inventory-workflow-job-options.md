# Konfiguration - Inventar - Arbeitsablauf - Job-Optionen

Im Bereich *Arbeitsablauf* können Sie Arbeitsabläufe aus einer Folge von Anweisungen erstellen. Sie können die *Job Anweisung* per Drag&amp;Drop aus der *Funktionsleiste* an eine Position im Arbeitsablauf ziehen.

Die grafische Benutzeroberfläche bietet eine Reihe von Registerkarten für die Angabe von Details. Die zweite Registerkarte wird für *Job-Optionen* angeboten.

## Häufig verwendete Job-Optionen

- **Parallelität** gibt die Anzahl der parallelen Instanzen an, für die der Job ausgeführt werden kann. Wenn mehr als ein Auftrag den Arbeitsablauf durchläuft, können diese den Job parallel ausführen. Zusätzlich zur *Parallelität* gilt das Prozesslimit, das für Standalone Agenten und Agent Cluster konfiguriert werden kann.
- **Kritikalität** gibt die Relevanz von Fehlern im Job an. Die *Kritikalität* ist bei Benachrichtigungen über Job-Fehler verfügbar.

### Ausführungszeiträume

- **Zeitablauf** gibt die maximale Ausführungszeit an, die der Job in Anspruch nehmen darf. Wenn der Job den *Zeitablauf* überschreitet, wird er vom Agenten unter Berücksichtigung der *Toleranzfrist* abgebrochen. Die Eingabe kann in den folgenden Formaten angegeben werden:
  - *1* oder *1s*: entweder eine Zahl oder eine Zahl gefolgt von *s* gibt den *Zeitablauf* in Sekunden an.
  - *1m 2d 3h*: gibt 1 Monat, 2 Tage und 3 Stunden als maximalen Ausführungszeitraum an.
  - *01:02:03*: gibt 1 Stunde, 2 Minuten und 3 Sekunden als maximalen Ausführungszeitraum an.
- **Warnen bei kürzerer Dauer** löst eine Warnung und eine entsprechende Benachrichtigung aus, wenn der Job früher als in der angegebenen Zeitspanne beendet wird. Die Eingabeformate umfassen:
  - *1* oder *1s*: entweder eine Zahl oder eine Zahl gefolgt von *s* gibt den Ausführungszeitraum in Sekunden an.
  - *01:02:03*: gibt 1 Stunde, 2 Minuten und 3 Sekunden für den Ausführungszeitraum an.
  - *30%*: gibt eine um 30% kürzere Ausführungszeit an als der Durchschnitt der bisherigen Ausführungen des Jobs. Bei der Berechnung wird die [Prozesshistorie](/history-tasks) verwendet, die der Bereinigung durch die [Bereinigungsdienst](/service-cleanup) unterliegt.
- **Warnen bei längerer Dauer** löst eine Warnung und eine damit verbundene Benachrichtigung aus, wenn der Job die angegebene Dauer überschreiten wird. Die Eingabeformate umfassen:
  - *1* oder *1s*: entweder eine Zahl oder eine Zahl gefolgt von *s* gibt den Ausführungszeitraum in Sekunden an.
  - *01:02:03*: gibt 1 Stunde, 2 Minuten und 3 Sekunden für den Ausführungszeitraum an.
  - *30%*: gibt eine um 30% längere Ausführungszeit an als der Durchschnitt der bisherigen Ausführungen des Jobs. Für die Berechnung wird die [Prozesshistorie](/history-tasks) verwendet, die durch den [Bereinigungsdienst](/service-cleanup) bereinigt wird.

### Log Ausgaben

- **Scheitern bei Ausgaben in stderr** legt fest, dass der Agent den Job fehlschlagen lässt, wenn er Ausgaben in den stderr-Kanal schreibt. Diese Prüfung erfolgt zusätzlich zur Prüfung des *Rückgabewerts* (bei Shell Jobs: Exit Code) eines Jobs.
- **Warnen bei Ausgaben in stderr** legt fest, dass die gleiche Prüfung wie bei *Scheitern bei Ausgaben in stderr* durchgeführt wird. Der Job wird jedoch nicht fehlschlagen, sondern es wird eine Warnung ausgegeben und eine Benachrichtigung erzeugt.

### Zutrittszeiten

*Zutrittszeiten* legt fest, wann ein Job gestartet werden kann oder übersprungen werden soll und wie lange ein Job ausgeführt werden kann. Einzelheiten finden Sie unter [JS7 - Admission Times for Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Admission+Times+for+Jobs).

- **Job überspringen bei fehlender Zutrittszeit für Auftragsdatum** legt fest, dass der Job übersprungen wird, wenn seine *Zutrittszeit* nicht mit dem Datum des Auftrags übereinstimmt. Die *Zutrittszeit* des Jobs kann beispielsweise Wochenenden ausschließen, was dazu führt, dass der Job von Montag bis Freitag ausgeführt wird und von Aufträgen, die für Samstag-Sonntag geplant sind, übersprungen wird. Sie sollten bedenken, dass das Datum, für das der Auftrag geplant ist, relevant ist und nicht das Ankunftsdatum des Auftrags im Job. Wenn das geplante Datum des Auftrags mit der *Zutrittszeit* übereinstimmt, der Auftrag aber zu einem späteren Zeitpunkt außerhalb der *Zutrittszeit* eintrifft, dann wird der Job nicht übersprungen und der Auftrag wartet auf die nächste *Zutrittszeit*.
- **Job am Ende des Zeitraums beenden** legt fest, dass der Agent den Job abbricht, wenn er die *Zutrittszeit* überschreitet.
- Für **Zutrittszeiten** können Sie über den Link *Periode anzeigen* Tage und Stunden angeben, an denen der Job ausgeführt werden kann.

#### Art der Zutrittseit

Mit der *Art der Zutrittszeit* können Sie Tage angeben, an denen der Job starten kann. Darüber hinaus können Sie Monatsbereiche angeben, die die *Art der Zutrittszeit* auf bestimmte Monate beschränken.

- **Wochentage** geben die Wochentage an, an denen der Job starten kann.
- **Bestimmte Wochentage** geben relative Wochentage an, wie z.B. den ersten oder letzten Montag eines Monats.
- **Bestimmte Tage** geben Tage im Jahr an.
- **Monatstage** geben relative Tage in einem Monat an, z.B. den ersten oder letzten Tag eines Monats.

#### Ausführungszeitraum

Der *Ausführungszeitraum* wird durch seinen *Beginn* und seine *Dauer* festgelegt:

- **Beginn** wird durch eine Uhrzeit im Format HH:MM:SS angegeben, zum Beispiel 10:15:00 für ein Viertel nach 10 Uhr.
- **Dauer** wird durch die Verwendung der folgenden Formate angegeben:
  - *1* oder *1s*: entweder eine Zahl oder eine Zahl gefolgt von *s* gibt die *Dauer* in Sekunden an.
  - *1m 2d 3h*: gibt 1 Monat, 2 Tage und 3 Stunden für die *Dauer* an.
  - *01:02:03*: gibt 1 Stunde, 2 Minuten und 3 Sekunden für die *Dauer* an.

## Job-Optionen verfügbar unter *Weitere Optionen*

Die Ansicht *Konfiguration - Inventar* bietet oben im Fenster den Schieberegler *Weitere Optionen*, der standardmäßig inaktiv ist. Wenn Sie den Schieberegler verwenden, werden zusätzliche Optionen verfügbar.

- **Toleranzfrist** wird auf Jobs mit Unix angewendet, die ein SIGTERM-Signal erhalten, wenn ihr *Zeitablauf* überschritten wird oder wenn sie durch einen Benutzereingriff zwangsweise beendet werden. Wenn der Job nicht als Reaktion auf SIGTERM beendet wird, sendet der Agent nach Ablauf der *Toleranzfrist* ein SIGKILL-Signal, um den Job zwangsweise zu beenden. Einzelheiten finden Sie unter [JS7 - FAQ - How does JobScheduler terminate Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+FAQ+-+How+does+JobScheduler+terminate+Jobs) und [JS7 - Agent Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Operation).
- **Kompatibilität** bietet die Kompatibilitätsebene *v1* für Benutzer des Zweigs 1.x von JobScheduler. Im Kompatibilitätsmodus wird das folgende Verhalten geändert:
  - *Umgebungsvariablen* müssen nicht angegeben werden, sondern werden automatisch für alle Arbeitsablauf-Variablen erstellt. Die Namen der Umgebungsvariablen werden mit dem Präfix *SCHEDULER_PARAM_* versehen, wobei nur Großbuchstaben verwendet werden.
  - Für die Verwendung von Job-Argumenten bietet der Kompatibilitätsmodus eine entsprechende Registerkarte.

### Neustart von Jobs

- **Job nicht wiederanlauffähig** gilt für Jobs, die vom Agenten oder von seinem Watchdog beim Stoppen oder Abbrechen des Agenten zwangsweise beendet wurden. Standardmäßig gelten Jobs als wiederanlauffähig und werden neu gestartet, wenn der Agent nach Abbruch neu gestartet wird. Benutzer können dieses Verhalten durch Aktivieren des Kontrollkästchens verhindern.

### Jobs für Windows unter anderen Benutzerkonten ausführen

Die folgenden Optionen legen für Jobs, die mit Agenten für Windows ausgeführt werden, fest, dass der Job den Benutzerkontext wechseln soll, siehe [JS7 - Running Jobs as a different User](https://kb.sos-berlin.com/display/JS7/JS7+-+Running+Jobs+as+a+different+User).

- **Berechtigungsschlüssel** gibt den Schlüssel des Eintrags im Windows Credential Manager an, der die Anmeldeinformationen des Zielbenutzerkontos enthält.
- **Anwenderprofil laden** gibt an, ob das Profil des Zielbenutzerkontos einschließlich der Registrierungseinträge beim Start des Jobs geladen werden soll.

## Referenzen

### Kontext-Hilfe

- [Bereinigungsdienst](/service-cleanup)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
  - [Konfiguration - Inventar - Arbeitsablauf - Job-Eigenschaften](/configuration-inventory-workflow-job-properties)
  - [Konfiguration - Inventar - Arbeitsablauf - Job-Knoteneigenschaften](/configuration-inventory-workflow-job-node-properties)
  - [Konfiguration - Inventar - Arbeitsablauf - Job-Benachrichtigungen](/configuration-inventory-workflow-job-notifications)
  - [Konfiguration - Inventar - Arbeitsablauf - Job-Kennzeichnungen](/configuration-inventory-workflow-job-tags)
- [Prozesshistorie](/history-tasks)

### Product Knowledge Base

- [JS7 - Admission Times for Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Admission+Times+for+Jobs).
- [JS7 - Agent Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Operation)
- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - FAQ - How does JobScheduler terminate Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+FAQ+-+How+does+JobScheduler+terminate+Jobs)
- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
- [JS7 - Running Jobs as a different User](https://kb.sos-berlin.com/display/JS7/JS7+-+Running+Jobs+as+a+different+User)
