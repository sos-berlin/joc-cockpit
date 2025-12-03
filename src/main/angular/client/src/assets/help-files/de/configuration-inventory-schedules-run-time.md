# Konfiguration - Inventar - Zeitpläne - Laufzeit

Das *Schedule Panel* bietet die Möglichkeit, Regeln für die Erstellung von Aufträgen auf [Tagesplan](/daily-plan) festzulegen.

Über die Schaltfläche *Laufzeit* können Sie in einem Popup-Fenster Startzeiten für Aufträge festlegen: Zunächst wird ein Kalender zugewiesen, dann werden Zeiträume festgelegt und optional gelten Einschränkungen.

## Zeitzone

Laufzeiten werden aus einer **Zeitzone** angegeben, die aus der [Profile - Preferences](/profile-preferences) des Benutzers ausgefüllt wird. Für die Eingabe werden Zeitzonenkennungen wie *UTC*, *Europa/London* usw. akzeptiert. Eine vollständige Liste der Zeitzonenkennungen finden Sie unter [Liste der Zeitzonen der tz-Datenbank](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

- Die Startzeiten für Aufträge werden in der angegebenen Zeitzone berücksichtigt.
- Es ist möglich, eine andere Zeitzone als die von [Settings - Daily Plan](/settings-daily-plan) und für die Laufzeiten der Orders zu verwenden. Benutzer sollten beachten, dass 
  - Orders wird ein tägliches Plandatum zugewiesen.
  - Die Startzeiten werden anhand der Zeitzone des Plans berechnet.
- Folglich kann der Tagesplan Orders für ein bestimmtes Datum enthalten, die sich mit einem früheren oder späteren Tag überschneiden. Ein Beispiel,
  - angenommen, die Zeitzone des Tagesplans ist UTC,
  - angenommen, die Zeitzone des Plans ist Asien/Kalkutta (UTC+05:30) und die Startzeit ist *23:00*,
  - wenn eine Order für den Tagesplan von Dienstag erstellt wird, wird sie eine Startzeit für Mittwoch *04:30* UTC angeben. Das Ergebnis ist korrekt, kann aber für Benutzer, die sich in den Zeitzonen verirrt haben, verwirrend sein.

Für manche Benutzer ist es überraschend, dass ein Tag nicht 24 Stunden lang ist, sondern bis zu 50 Stunden umfassen kann. Die Dauer eines Tages ist immer 24 Stunden lang, da sie von der Erdrotation abhängt. Für eine bestimmte Zeitzone gibt es jedoch eine 50-stündige Abdeckung, um alle möglichen Zeiten rund um den Planeten zu erfassen.

## Kalender Zuweisung

Zunächst sollte ein Kalender zugewiesen werden:

- **Arbeitstagskalender** ist über eine gleichnamige Schaltfläche verfügbar und gibt die Tage an, für die Aufträge erstellt werden sollen. Bei wiederholter Verwendung fügt er Laufzeiteinträge mit Zeiträumen pro Arbeitstag Kalender hinzu.
- **Kalender für arbeitsfreie Tage** ist über eine Schaltfläche mit demselben Namen verfügbar und bietet die Möglichkeit, die Tage anzugeben, für die keine Aufträge erstellt werden sollen. Sie können eine beliebige Anzahl von Kalendern für arbeitsfreie Tage hinzufügen, die dann zusammengeführt werden.

## Perioden

Als nächstes sollten Sie einen oder mehrere Zeiträume für Startzeiten angeben. Die Eingabe *Wiederholungsintervall* bietet die folgenden Optionen:

- **Einzelner Start** ist ein einzelner Zeitpunkt.
  - **Startzeit** wird mit der Syntax *HH:MM:SS* angegeben.
  - **Am arbeitsfreien Tag** gibt an, was geschehen soll, wenn ein Zeitraum auf einen Tag trifft, der in einem Kalender für arbeitsfreie Tage angegeben ist.
    - **Ausführung unterdrücken** ist das Standardverhalten, um keine Order zu erstellen.
    - **Nicht-Arbeitstag ignorieren** setzt den Nicht-Arbeitstag-Kalender außer Kraft und erstellt eine Order.
    - **Vor arbeitsfreiem Tag** fügt eine Order für den nächsten Arbeitstag vor dem arbeitsfreien Tag hinzu. Ein Beispiel:
      - Ein Arbeitstagskalender gibt Mo-Do für Arbeitstage an. 
      - Ein Kalender für arbeitsfreie Tage gibt einen bestimmten Montag im Jahr als arbeitsfreien Tag an.
      - Der nächste Tag vor dem arbeitsfreien Tag ist dann der vorherige Sonntag. Wenn Wochenenden ausgeschlossen sind und dem Kalender für arbeitsfreie Tage hinzugefügt werden, ist der nächste Tag der vorhergehende Freitag.
    - **nach arbeitsfreiem Tag** fügt eine Order zum nächsten Arbeitstag nach dem arbeitsfreien Tag hinzu. Ein Beispiel:
      - Ein Arbeitstagskalender gibt Di-Fr für Arbeitstage an. 
      - Ein Kalender für arbeitsfreie Tage gibt einen bestimmten Freitag im Jahr als arbeitsfreien Tag an.
      - Der nächste Tag nach dem arbeitsfreien Tag ist der nächste Samstag. Werden Wochenenden ausgeschlossen und dem Kalender für arbeitsfreie Tage hinzugefügt, ist der darauf folgende Tag der nächste Montag.        
- **Wiederholung** gibt einen wiederholten Zeitraum für zyklische Aufträge an. Für die Eingabe wird die folgende Syntax verwendet: *HH:MM:SS*.
  - **Wiederholungszeit** ist das Intervall zwischen den Zyklen, zum Beispiel *02:00* für 2-stündige Zyklen.
  - **Begin** ist die Startzeit des ersten Zyklus, z.B. *06:00* für 6 Uhr morgens.
  - **Ende** ist die Endzeit des letzten Zyklus, zum Beispiel *22:00* für 22 Uhr.
  - **Am arbeitsfreien Tag** gibt an, was geschehen soll, wenn eine Periode auf einen Tag trifft, der in einem Kalender für arbeitsfreie Tage angegeben ist. Die Konfiguration ist dieselbe wie für *Einzelstart*-Perioden.

*Einschränkungen

*Einschränkungen* werden verwendet, um die Tage einzuschränken, für die Aufträge erstellt werden sollen:

- Zugewiesene Kalender mit Arbeitstagen und Kalender mit Nicht-Arbeitstagen werden zu den Tagen zusammengefasst, die sich für die Workflow-Ausführung von Aufträgen ergeben.
- Einschränkungen gelten weiter und halten Regeln ähnlich wie [Konfiguration - Inventar - Kalender](/configuration-inventory-calendars):
  - **Wochentage** geben den Wochentag an.
  - **Spezifische Wochentage** geben relative Wochentage an, wie z.B. den ersten oder letzten Montag eines Monats.
  - **Bestimmte Tage** geben die Tage des Jahres an.
  - **Monatstage** geben relative Tage in einem Monat an, z.B. den ersten oder letzten Tag eines Monats.
  - **Jeder** gibt wiederkehrende Zeiträume an, z.B. jeden 2. Tag, jede 1. Woche, jeden 3. Dazu müssen Sie das Datum *Gültig ab* angeben, ab dem die Tage gezählt werden.
  - **Nationale Feiertage** gibt bekannte Feiertage an. Die daraus resultierenden Tage sind nicht verbindlich und können von der lokalen Gesetzgebung abweichen.
  - **Kalender für arbeitsfreie Tage** schließen die entsprechenden Tage aus den Kalendern für arbeitsfreie Tage für den aktuellen Kalender aus.

*Einschränkungen* ermöglichen es, die Anzahl der verwendeten Kalender zu begrenzen. Anstatt einzelne Kalender für bestimmte Regeln, wie z.B. den ersten Tag des Monats, zu erstellen, können Benutzer einen Standardkalender anwenden, der alle Tage des Jahres abdeckt, und die gewünschte *Einschränkung* anwenden.

Die Verwendung von Kalendern für arbeitsfreie Tage unterscheidet sich bei der Zuweisung der *Laufzeit* und bei der Zuweisung der *Einschränkung*:

- Beispiel:
  - Nehmen Sie einen Arbeitstagskalender Mo-Fr an.
  - Nehmen Sie eine Zeitplan *Einschränkung* für *4. des Monats* an.
  - Die resultierenden Tage werden aus dem Arbeitstagskalender und dem 4. Tag der resultierenden Liste von Tagen berechnet.
- Zeitpläne können auch Verweise auf Kalender für arbeitsfreie Tage enthalten.
  - Die Kalender für arbeitsfreie Tage werden *nach* der Berechnung der *Einschränkung* eines jeden Zeitplans angewendet.
  - Wenn Benutzer bestimmte arbeitsfreie Tage aus dem Kalender ausschließen möchten, bevor die *Beschränkung* für den 4. des Monats angewandt wird, haben sie die Möglichkeit
    - die arbeitsfreien Tage aus den *Ausgenommenen Häufigkeiten* des Arbeitstagskalenders anzugeben.
    - um Tage aus Nicht-Arbeitstagskalendern anzugeben, auf die die *Einschränkung* angewendet wird

## Zyklische Aufträge vs. zyklische Workflows

Benutzer sollten die Auswirkungen von zyklischen Aufträgen berücksichtigen: Sie erstellen einzelne Auftragsinstanzen pro Zyklus. Als Alternative zu zyklischen Aufträgen, die von Zeitplänen mit wiederkehrenden Intervallen erstellt werden, steht [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction) für zyklische Workflows zur Verfügung.

- Ausführung
  - Eine *Cycle Instruction*, die einen kompletten Workflow auslöst, entspricht der Verwendung von Cyclic Orders aus einem Schedule.
  - Eine *Cycle Instruction* kann verwendet werden, um Teile eines Workflows in Zyklen auszuführen.
- Effizienz
  - Zeitpläne erstellen für jede Periode eines zyklischen Auftrags eine Anzahl von Auftragsinstanzen. Wenn ein einzelner Workflow alle 30 Sekunden ausgeführt wird, ergibt das 2880 Aufträge pro Tag.
  - *Cycle Instructions* bewirken die zyklische Ausführung eines Workflows aus einer einzigen Order.
  - Die Verarbeitung von zyklischen Workflows ist bei weitem effizienter als die Verarbeitung von zyklischen Aufträgen.
- Fehlerbehandlung
  - Fehlschlag
    - Wenn ein Auftrag in einem Workflow fehlschlägt, dann geschieht dies für jede Auftragsinstanz eines zyklischen Auftrags einzeln.
    - Wenn ein Auftrag innerhalb einer *Zyklusanweisung* fehlschlägt, werden je nach Fehlerbehandlung alle Zyklen übersprungen, die stattfinden würden, während sich ein Auftrag im *Fehlerzustand* befindet.
  - Benachrichtigung
    - Für jede fehlgeschlagene Auftragsinstanz eines zyklischen Auftrags wird eine Benachrichtigung erstellt.
    - Für die einzelne Bestellung eines zyklischen Workflows wird eine einzelne Benachrichtigung erstellt.
  - Eingreifen
    - Alle Operationen an zyklischen Aufträgen werden auf alle enthaltenen Auftragsinstanzen angewendet, z.B. die Wiederaufnahme der Ausführung nach einem Fehler. Dies führt zu einer parallelen Ausführung von Aufträgen, die zuvor für die Ausführung in Intervallen geplant waren.
    - Bei zyklischen Workflows gibt es eine einzige Order, die auf einen Benutzereingriff wartet.
- Protokollierung
  - Für jede Auftragsinstanz eines zyklischen Auftrags wird ein separater Eintrag in der [Order History](/history-orders) und in der [Task History](/history-tasks) erstellt.
  - Für einen zyklischen Workflow gibt es einen einzelnen Eintrag in der Auftragshistorie, an den die Protokollausgabe eines jeden Zyklus angehängt wird. In der Auftragshistorie werden einzelne Einträge pro Auftragsausführung hinzugefügt.

## Referenzen

### Kontexthilfe

- [Konfiguration - Inventar - Kalender](/configuration-inventory-calendars)
- [Konfiguration - Inventar - Zeitpläne](/configuration-inventory-schedules)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Tagesplan](/daily-plan)
- [Daily Plan Service](/service-daily-plan)
- [Regeln zur Benennung von Objekten](/object-naming-rules)
- [Order History](/history-orders)
- [Profile - Preferences](/profile-preferences)
- [Settings - Daily Plan](/settings-daily-plan)
- [Task History](/history-tasks)

### Product Knowledge Base

- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
- [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
- [Liste der Zeitzonen der tz-Datenbank](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

