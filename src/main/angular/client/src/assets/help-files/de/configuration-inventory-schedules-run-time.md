# Konfiguration - Inventar - Zeitpläne - Startzeitregel

Der Bereich *Zeitplan* bietet die Möglichkeit, Regeln für die Erstellung von Aufträgen im [Tagesplan](/daily-plan) festzulegen.

Über die Schaltfläche *Startzeitregel* können Sie in einem Popup-Fenster Startzeiten für Aufträge festlegen: Zunächst wird ein Kalender zugewiesen, dann werden Zeiträume festgelegt und optional gelten Einschränkungen.

## Zeitzone

Laufzeiten werden aus einer **Zeitzone** angegeben, die aus der [Profil - Einstellungen](/profile-preferences) des Benutzers ausgefüllt wird. Für die Eingabe werden Zeitzonenkennungen wie *UTC*, *Europa/London* usw. akzeptiert. Eine vollständige Liste der Zeitzonenkennungen finden Sie unter [Liste der Zeitzonen der tz-Datenbank](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

- Die Startzeiten für Aufträge werden in der angegebenen Zeitzone berücksichtigt.
- Es ist möglich, eine andere Zeitzone als die von [Einstellungen - Tagesplan](/settings-daily-plan) den Startzeiten des Zeitplans zuzuweisen. Benutzer sollten beachten: 
  - Aufträgen wird ein tägliches Startdatum zugewiesen.
  - Die Startzeiten werden anhand der Zeitzone des Tagesplans berechnet.
- Ein Tagesplan kann Aufträge für ein bestimmtes Datum enthalten, die sich mit einem früheren oder späteren Tag überschneiden. Ein Beispiel,
  - angenommen, die Zeitzone des Tagesplans ist UTC,
  - angenommen, die Zeitzone des Zeitplans ist Asia/Calcutta (UTC+05:30) und die Startzeit ist *23:00*,
  - wenn ein Auftrag für den Tagesplan von Dienstag erstellt wird, wird er eine Startzeit für Mittwoch *04:30* UTC aufweisen. Das Ergebnis ist korrekt, kann aber für Benutzer, die sich in den Zeitzonen verirrt haben, verwirrend sein.

Für manche Benutzer ist es überraschend, dass ein Tag nicht 24 Stunden lang ist, sondern bis zu 50 Stunden umfassen kann. Die Dauer eines Tages ist immer 24 Stunden lang, da sie von der Erdrotation abhängt. Für eine bestimmte Zeitzone gibt es jedoch eine 50-stündige Abdeckung, um alle möglichen Zeiten rund um den Planeten zu erfassen.

## Kalender

Zunächst sollte ein Kalender zugewiesen werden:

- **Arbeitstagskalender** ist über eine gleichnamige Schaltfläche verfügbar und gibt die Tage an, für die Aufträge erstellt werden sollen. Bei wiederholter Verwendung fügt er Startzeiteinträge mit Zeiträumen pro Arbeitstagskalender hinzu.
- **Kalender für Nicht-Arbeitstage** ist über eine Schaltfläche mit demselben Namen verfügbar und bietet die Möglichkeit, die Tage anzugeben, für die keine Aufträge erstellt werden sollen. Sie können eine beliebige Anzahl von Kalendern für Nicht-Arbeitstage hinzufügen, die dann zusammengeführt werden.

## Perioden

Als nächstes sollten Sie einen oder mehrere Zeiträume für Startzeiten angeben. Die Eingabe *Wiederholungsintervall* bietet die folgenden Optionen:

- **Einzelner Start** ist ein einzelner Zeitpunkt.
  - **Startzeit** wird mit der Syntax *HH:MM:SS* angegeben.
  - **Bei Nicht-Arbeitstag** gibt an, was geschehen soll, wenn ein Zeitraum auf einen Tag trifft, der in einem Kalender für Nicht-Arbeitstage angegeben ist.
    - **Ausführung verhindern** ist das Standardverhalten, um keine Aufträge zu erstellen.
    - **Nicht-Arbeitstag ignorieren** setzt den Nicht-Arbeitstagskalender außer Kraft und erstellt einen Auftrag.
    - **vor Nicht-Arbeitstag** fügt einen Auftrag für den nächsten Arbeitstag vor dem Nicht-Arbeitstag hinzu. Ein Beispiel:
      - Ein Arbeitstagskalender gibt Mo-Do für Arbeitstage an. 
      - Ein Kalender für Nicht-Arbeitstage gibt einen bestimmten Montag im Jahr als Nicht-Arbeitstag an.
      - Der nächste Tag vor dem Nicht-Arbeitstag ist dann der vorherige Sonntag. Wenn Wochenenden ausgeschlossen sind und dem Kalender für Nicht-Arbeitstage hinzugefügt werden, ist der nächste Tag der vorhergehende Freitag.
    - **nach Nicht-Arbeitstag** fügt einen Auftrag zum nächsten Arbeitstag nach dem Nicht-Arbeitstag hinzu. Ein Beispiel:
      - Ein Arbeitstagskalender gibt Di-Fr für Arbeitstage an. 
      - Ein Kalender für Nicht-Arbeitstage gibt einen bestimmten Freitag im Jahr als Nicht-Arbeitstag an.
      - Der nächste Tag nach dem Nicht-Arbeitstag ist der nächste Samstag. Werden Wochenenden ausgeschlossen und dem Kalender für Nicht-Arbeitstage hinzugefügt, ist der darauf folgende Tag der nächste Montag.        
- **Wiederholen** gibt einen wiederholten Zeitraum für zyklische Aufträge an. Für die Eingabe wird die folgende Syntax verwendet: *HH:MM:SS*.
  - **Wiederholungsintervall** ist das Intervall zwischen zwei Zyklen, zum Beispiel *02:00* für 2-stündige Zyklen.
  - **Begin** ist die Startzeit des ersten Zyklus, z.B. *06:00* für 6 Uhr morgens.
  - **Ende** ist die Endezeit des letzten Zyklus, zum Beispiel *22:00* für 22 Uhr.
  - **Bei Nicht-Arbeitstag** gibt an, was geschehen soll, wenn eine Periode auf einen Tag trifft, der in einem Kalender für Nicht-Arbeitstage angegeben ist. Die Konfiguration ist dieselbe wie für *Einzelner Start*.

## Einschränkungen

*Einschränkungen* werden verwendet, um die Tage einzuschränken, für die Aufträge erstellt werden sollen:

- Zugewiesene Kalender mit Arbeitstagen und Kalender mit Nicht-Arbeitstagen werden zu den Tagen zusammengefasst, die sich für die Ausführung von Aufträgen ergeben.
- Einschränkungen gelten weiter und halten Regeln ähnlich wie [Konfiguration - Inventar - Kalender](/configuration-inventory-calendars):
  - **Wochentage** geben den Wochentag an.
  - **Spezifische Wochentage** geben relative Wochentage an, wie z.B. den ersten oder letzten Montag eines Monats.
  - **Bestimmte Tage** geben die Tage des Jahres an.
  - **Monatstage** geben relative Tage in einem Monat an, z.B. den ersten oder letzten Tag eines Monats.
  - **Jeder** gibt wiederkehrende Zeiträume an, z.B. jeden 2. Tag, jede 1. Woche, jeden 3. Monat. Dazu müssen Sie das Datum *Gültig ab* angeben, ab dem die Tage gezählt werden.
  - **Nationale Feiertage** gibt bekannte Feiertage an. Die daraus resultierenden Tage sind nicht verbindlich und können von der lokalen Gesetzgebung abweichen.
  - **Kalender für Nicht-Arbeitstage** schließen die entsprechenden Tage aus den Kalendern für Nicht-Arbeitstage für den aktuellen Kalender aus.

*Einschränkungen* ermöglichen es, die Anzahl der verwendeten Kalender zu begrenzen. Anstatt einzelne Kalender für bestimmte Regeln, wie z.B. den ersten Tag des Monats, zu erstellen, können Benutzer einen Standardkalender anwenden, der alle Tage des Jahres abdeckt, und die gewünschte *Einschränkung* anwenden.

Die Verwendung von Kalendern für Nicht-Arbeitstage unterscheidet sich bei der Zuweisung der *Laufzeit* und bei der Zuweisung der *Einschränkung*:

- Beispiel:
  - Nehmen Sie einen Arbeitstagskalender Mo-Fr an.
  - Nehmen Sie eine Zeitplan *Einschränkung* für *4. des Monats* an.
  - Die resultierenden Tage werden aus dem Arbeitstagskalender und dem 4. Tag der resultierenden Liste von Tagen berechnet.
- Zeitpläne können auch Verweise auf Kalender für Nicht-Arbeitstage enthalten.
  - Die Kalender für Nicht-Arbeitstage werden *nach* der Berechnung der *Einschränkung* eines jeden Zeitplans angewendet.
  - Wenn Benutzer bestimmte Nicht-Arbeitstage aus dem Kalender ausschließen möchten, bevor die *Beschränkung* für den 4. des Monats angewendet wird, haben sie die Möglichkeit
    - die Nicht-Arbeitstage aus den *Ausgeschlossenen Häufigkeiten* des Arbeitstagskalenders anzugeben.
    - die Tage aus Nicht-Arbeitstagskalendern anzugeben, auf die die *Einschränkung* angewendet wird.

## Zyklische Aufträge vs. zyklische Arbeitsabläufe

Benutzer sollten die Auswirkungen von zyklischen Aufträgen berücksichtigen: Sie erstellen einzelne Auftragsinstanzen pro Zyklus. Als Alternative zu zyklischen Aufträgen, die von Zeitplänen mit wiederkehrenden Intervallen erstellt werden, steht [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction) für zyklische Arbeitsabläufe zur Verfügung.

- Ausführung
  - Eine *Cycle Anweisung*, die einen kompletten Arbeitsablauf umfasst, entspricht der Verwendung von zyklischer Aufträge aus einem Zeitplan.
  - Eine *Cycle Anweisung* kann verwendet werden, um Teile eines Arbeitsablaufs in Zyklen auszuführen.
- Effizienz
  - Zeitpläne erstellen für jede Periode eines zyklischen Auftrags eine Anzahl von Auftragsinstanzen. Wenn ein einzelner Arbeitsablauf alle 30 Sekunden ausgeführt wird, ergibt das 2880 Aufträge pro Tag.
  - *Cycle Anweisungen* bewirken die zyklische Ausführung eines Arbeitsablaufs aus einem einzigen Auftrag.
  - Die Verarbeitung von zyklischen Arbeitsabläufen ist bei weitem effizienter als die Verarbeitung von zyklischen Aufträgen.
- Fehlerbehandlung
  - Fehlschlag
    - Wenn ein Auftrag in einem Arbeitsablauf fehlschlägt, dann geschieht dies für jede Auftragsinstanz eines zyklischen Auftrags einzeln.
    - Wenn ein Auftrag innerhalb einer *Cycle Anweisung* fehlschlägt, werden je nach Fehlerbehandlung alle Zyklen übersprungen, die stattfinden würden, während sich der Auftrag im *Fehlerzustand* befindet.
  - Benachrichtigung
    - Für jede fehlgeschlagene Auftragsinstanz eines zyklischen Auftrags wird eine Benachrichtigung erstellt.
    - Für den einzelne Auftrag eines zyklischen Arbeitsablaufs wird eine einzelne Benachrichtigung erstellt.
  - Eingreifen
    - Alle Operationen an zyklischen Aufträgen werden auf alle enthaltenen Auftragsinstanzen angewendet, z.B. die Wiederaufnahme der Ausführung nach einem Fehler. Dies führt zu einer parallelen Ausführung von Aufträgen, die zuvor für die Ausführung in Intervallen geplant waren.
    - Bei zyklischen Arbeitsabläufen gibt es einen einzigen Auftrag, der auf einen Benutzereingriff wartet.
- Protokollierung
  - Für jede Auftragsinstanz eines zyklischen Auftrags wird ein separater Eintrag in der [Auftragshistorie](/history-orders) und in der [Prozesshistorie](/history-tasks) erstellt.
  - Für einen zyklischen Arbeitsablauf gibt es einen einzelnen Eintrag in der Auftragshistorie, an den die Protokollausgabe eines jeden Zyklus angehängt wird. In der Auftragshistorie werden einzelne Einträge pro Auftragsausführung hinzugefügt.

## Referenzen

### Kontext-Hilfe

- [Auftragshistorie](/history-orders)
- [Einstellungen - Tagesplan](/settings-daily-plan)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Konfiguration - Inventar - Kalender](/configuration-inventory-calendars)
- [Konfiguration - Inventar - Zeitpläne](/configuration-inventory-schedules)
- [Profil - Einstellungen](/profile-preferences)
- [Prozesshistorie](/history-tasks)
- [Regeln zur Benennung von Objekten](/object-naming-rules)
- [Tagesplan](/daily-plan)
- [Tagesplandienst](/service-daily-plan)

### Product Knowledge Base

- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
- [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
- [Liste der Zeitzonen der tz-Datenbank](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
