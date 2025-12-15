# Tagesplan

Die Ansicht *Tagesplan* bietet einen Überblick über die Aufträge, die für die zukünftige Ausführung geplant sind, und ermöglicht es den Benutzern, den *Tagesplan* zu verwalten. 

Die [Tagesplandienst](/service-daily-plan) wird verwendet, um Aufträge für den Tagesplan zu erstellen und an die Controller zu übermitteln. Der Dienst wird im Hintergrund betrieben und arbeitet täglich, um Aufträge für einige Tage im Voraus zu planen und zu übermitteln.

Der Tagesplan unterliegt der Bereinigung der Datenbank, die vom [Bereinigungsdienst](/service-cleanup) durchgeführt wird.

Für Operationen im Zusammenhang mit dem *Kalenderbereich* siehe [Tagesplan - Kalender](/daily-plan-calendar).

## Auftragszustände

Der Tagesplan enthält Aufträge, die einen der folgenden Zustände haben:

- **Geplant**: Die Aufträge wurden erstellt, aber noch nicht an den Controller und die Agenten *übermittelt*.
- **Übermittelt**: Die Aufträge wurden an den Controller und die Agenten weitergeleitet, die die Aufträge selbstständig starten werden. Dieser Zustand gilt für Aufträge, die für eine zukünftige Ausführung geplant sind, und für Aufträge, die gerade ausgeführt werden.
- **Beendet**: Die Aufträge wurden abgeschlossen. Die Ansicht [Auftragshistorie](/history-orders) zeigt, ob die Ausführung erfolgreich war oder fehlgeschlagen ist.

## Auftragszustand Transitionen

Der Tagesplan bietet die folgenden Zustandstransitionen:

<pre>
      ┌──────────────────┐
      ▼                  ▲
   Erstellen             │
      │                  │
      ▼                  │
  ┌───├──────┐  Löschen  ▲
  │ Geplante │───────────┘
  │ Aufträge │───────────┐
  ┖───┌──────┘           ▲
      │                  │
   Übermitteln           │
      │                  │
      ▼                  │
  ┌───├──────────┐       │
  │ Übermittelte │       │
  │ Aufträge     │       │
  ┖───┌──────────┘       │
      │                  │
      ▼       Abbrechen  ▲
      ├──────────────────┘
      │                  ▲
   Ausführen             │
      │                  │
      ▼                  │
  ┌───├───────┐          │
  │ Beendete  │          │
  │ Aufträge  │          │
  ┖───┌───────┘          │
      │                  │
      ▼       Abbrechen  ▲
      ┖──────────────────┘
</pre>

## Bereich: Tagesplan

### Operationen für Auftragszustände

Operationen sind sowohl einzeln über das Aktionsmenü eines Auftrags als auch über Massenoperationen verfügbar.

Die folgenden Filterschaltflächen schränken den Umfang der Operationen ein: 

- **Alle**: Die Operation wird auf Aufträge in beliebigen Zuständen angewendet.
- **Geplant**: Die Operationen *Übermitteln* und *Entfernen* können auf *geplante* Aufträge angewendet werden, die noch nicht an den Controller *übermittelt* wurden.
- **Übermittelt**: Die Operationen *Ausführen lassen* und *Abbrechen* können auf Aufträge angewendet werden, die dem Controller und den Agenten *übermittelt* wurden.
- **Beendet**: Die Operation *Abbrechen* kann auf Aufträge angewandt werden, die abgeschlossen wurden.
- **Verspätet** ist ein zusätzlicher Filter über den Auftragszustand, der anzeigt, dass Aufträge später als erwartet gestartet wurden.

#### Operationen für Lebenszyklus

- **Auftrag laufen lassen**
  - Wenn diese Option auf *übermittelte* Aufträge angewendet wird, werden diese sofort gestartet. Aufträge im Rahmen einer Massenoperation werden gleichzeitig gestartet.
- **Auftrag übermitteln**
  - Wenn diese Option auf *geplante* Aufträge angewandt wird, werden diese auf den Status *übermittelt* gesetzt und an den Controller und die Agenten weitergeleitet.
- **Auftrag abbrechen**
  - Wenn diese Option auf *übermittelte* Aufträge angewendet wird, werden die Aufträge vom Controller und den Agenten zurückgezogen und auf den Zustand *geplant* gesetzt.
- **Auftrag entfernen**
  - Wenn diese Option auf *geplante* Aufträge angewendet wird, werden die Aufträge aus dem Tagesplan entfernt. Ein späterer Lauf des Tagesplandienstes wird nicht versuchen, Aufträge erneut dem angegebenen Datum hinzuzufügen.
- **Auftrag kopieren**
  - **Startzeit**: Kopiert die Aufträge auf ein zukünftiges Datum des Tagesplans. Die Eingabe von Datum/Uhrzeit ist ähnlich wie die Änderung der Startzeit eines Auftrags.
  - **Tagesplan-Zuordnung beibehalten**: Kalenderbasierte Abhängigkeiten von Notizbrettern werden zum ursprünglichen Tagesplandatum aufgelöst.
  - **Job Zutrittszeiten ignorieren**: Aufträge können darauf beschränkt werden, an bestimmten Tagen und/oder in bestimmten Zeitfenstern zu laufen. Ankommende Aufträge müssen dann auf das nächste verfügbare Zeitfenster warten. Diese Option erzwingt den Start von Aufträgen unabhängig von solchen Beschränkungen.

#### Startzeit ändern

- **Jetzt**: Aufträge werden sofort gestartet.
- **Bestimmtes Datum**: Die Aufträge beginnen an dem angegebenen Datum und zu der angegebenen Uhrzeit. Bei der Auflösung von kalenderbasierten Abhängigkeiten wird den Aufträgen das entsprechende Tagesplandatum zugewiesen.
- **Relativ zur Uhrzeit**: Aufträge beginnen mit einem Versatz zur aktuellen Zeit in Sekunden oder in Stunden, Minuten, Sekunden, z.B. *15* für einen Start in 15 Sekunden oder *01:30:15* für einen Start 1 Stunde, 30 Minuten und 15 Sekunden später.
- **Relativ zur Startzeit**: Die Aufträge beginnen mit einem positiven oder negativen Versatz zu ihrer ursprünglichen Startzeit in Sekunden oder in Stunden, Minuten, Sekunden, z.B. *-04:00:00* für einen Start 4 Stunden früher oder *+12:00:00* für einen Start 12 Stunden später. Die Zuordnung der Aufträge zum ursprünglichen Tagesplandatum bleibt bestehen, wenn es um die Auflösung von kalenderbasierten Abhängigkeiten geht.

#### Parametrierung ändern

Für verwandte Arbeitsabläufe, die Variablen angeben, können die Werte geändert werden. Wenn Sie mit Massenoperationen arbeiten, haben alle Aufträge die gleichen Variablenwerte.

- **Variable ändern**: 
  - Wenn der Arbeitsablauf Variablen ohne Standardwerte benennt, muss der Auftrag die entsprechenden Werte angeben.
  - Wenn der Arbeitsablauf Variablen mit Standardwerten benennt, ist ihre Angabe in einem Auftrag optional.

Eine Position kann angegeben werden, wenn der Auftrag nicht beim ersten Knoten im Arbeitsablauf, sondern bei einem späteren Knoten beginnen soll.

- **Blockposition**: Für Arbeitsabläufe, die Blockanweisungen wie *Try/Catch*, *Lock*, *Fork/Join* enthalten, kann die entsprechende Anweisung ausgewählt werden.
- **Startposition**: Wenn keine *Startposition* angegeben ist, beginnt der Auftrag beim ersten Knoten im Arbeitsablauf oder bei der *Blockposition*
  - Wenn keine *Blockposition* angegeben wird, kann eine beliebige Anweisung der obersten Ebene im Arbeitsablauf ausgewählt werden, von der aus der Auftrag gestartet wird.
  - Wenn eine *Blockposition* angegeben ist, dann ist die Startposition ein Knoten auf gleicher Ebene innerhalb des Blocks.
- **Endpositionen**:
  - Wenn keine *Blockposition* angegeben ist, kann eine beliebige Anweisung der obersten Ebene im Arbeitsablauf ausgewählt werden, vor der der Auftrag endet.
  - Wenn eine *Blockposition* angegeben wird, kann ein beliebiger Knoten auf gleicher Ebene innerhalb des Blocks ausgewählt werden, vor dem der Auftrag beendet wird.
  - Es kann mehr als eine *Endposition* angegeben werden.

#### Priorität ändern

- **Priorität**:
  - Wenn ein Auftrag auf eine *Ressourcen-Sperre* im Arbeitsablauf trifft, die die Parallelität einschränkt, dann bestimmt seine *Priorität* die Position in der Warteschlange der *wartenden* Aufträge.
  - die *Prioritäten* werden durch negative, null und positive Ganzzahlen oder durch die angebotenen Abkürzungen festgelegt. Eine höhere *Priorität* hat Vorrang. Die Abkürzungen bieten die folgenden Werte:
    - **Niedrig**: -20000
    - **Niedriger als Normal**: -10000
    - **Normal**: 0
    - **Höher als Normal**: 10000
    - **Hoch**: 20000

## Referenzen

### Kontext-Hilfe

- [Auftragshistorie](/history-orders)
- [Bereinigungsdienst](/service-cleanup)
- [Einstellungen - Tagesplan](/settings-daily-plan)
- [Tagesplan - Kalender](/daily-plan-calendar)
- [Tagesplandienst](/service-daily-plan)

### Product Knowledge Base

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
