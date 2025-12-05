# Tagesplan

Die Ansicht *Tagesplan* bietet einen Überblick über die Aufträge, die für die zukünftige Ausführung geplant sind, und ermöglicht es den Benutzern, den *Tagesplan* zu verwalten. 

Die [Tagesplandienst](/service-daily-plan) wird verwendet, um Aufträge für den Tagesplan zu erstellen und an die Controller zu übermitteln. Der Dienst wird im Hintergrund betrieben und arbeitet täglich, um Aufträge für einige Tage im Voraus zu planen und zu übermitteln.

Der Tagesplan unterliegt der Bereinigung der Datenbank, die von [Bereinigungsdienst](/service-cleanup) durchgeführt wird.

Für Operationen im Zusammenhang mit dem *Kalenderpanel* siehe [Daily Plan - Calendar](/daily-plan-calendar).

## Zustände bestellen

Der Tagesplan enthält Aufträge, die einen der folgenden Status haben:

- **Geplant**: Die Aufträge wurden erstellt, aber noch nicht an den Controller und die Agenten *übermittelt*.
- **Vorgelegt**: Die Aufträge wurden an den Controller und die Agenten weitergeleitet, die die Aufträge selbstständig starten werden. Dieser Status gilt für Aufträge, die für eine zukünftige Ausführung geplant sind, und für Aufträge, die gerade ausgeführt werden.
- **Erledigt**: Die Aufträge wurden abgeschlossen. Die Ansicht [Auftragshistorie](/history-orders) erklärt, ob die Ausführung erfolgreich war oder fehlgeschlagen ist.

## Order Status Übergänge

Der Tagesplan bietet die folgenden Zustandsübergänge:

<pre>
      ┌──────────────────┐
      ▼ ▲
   Erstellen │
      │ │
      ▼ │
  ┌───├──────┐ Entfernen ▲
  │ Geplant │───────────┘
  │ Bestellt │───────────┐
  ┖───┌──────┘ ▲
      │ │
   Einreichen │
      │ │
      ▼ │
  ┌───├───────┐ │
  │ Eingereicht │ │ │
  │ Bestellungen │ │ │
  ┖───┌───────┘ │
      │ │
      ▼ Abbrechen ▲
      ├──────────────────┘
      │ ▲
   Ausführen / Ausführen lassen │
      │ │
      ▼ │
  ┌───├───────┐ │
  │ Beendet │ │ │
  │ Bestellungen │ │ │
  ┖───┌───────┘ │
      │ │
      ▼ Abbrechen ▲
      ┖──────────────────┘
</pre>

## Tagesplan-Panel

### Auftragsstatus Operationen

Operationen sind sowohl einzeln über das Aktionsmenü einer Bestellung als auch über Massenoperationen verfügbar.

Die folgenden Filterschaltflächen schränken den Umfang der Operationen ein: 

- **Alle**: Die Operation wird auf Aufträge mit beliebigem Status angewendet.
- **Geplant**: Die Operationen *Einsenden* und *Entfernen* können auf *geplante* Aufträge angewendet werden, die noch nicht an den Controller *eingegeben* wurden.
- **Eingereicht**: Die Operationen *Ausführen lassen* und *Abbrechen* können auf Aufträge angewendet werden, die dem Controller und den Agenten *vorgelegt* wurden.
- **Beendet**: Die Operation *Abbrechen* kann auf Aufträge angewandt werden, die abgeschlossen wurden.
- **Spät** ist ein zusätzlicher Filter über den Auftragsstatus, der anzeigt, dass Aufträge später als erwartet gestartet wurden.

#### Lebenszyklus-Operationen

- **Aufträge ausführen lassen**
  - Wenn diese Option auf *eingereichte* Aufträge angewendet wird, werden diese sofort gestartet. Aufträge im Rahmen einer Massenoperation werden gleichzeitig gestartet.
- **Auftragsübermittlung**
  - Wenn diese Option auf *geplante* Aufträge angewandt wird, werden diese auf den Status *übermittelt* gesetzt und an den Controller und die Agenten weitergeleitet.
- **Auftrag stornieren**
  - Wenn diese Option auf *übermittelte* Aufträge angewendet wird, werden die Aufträge vom Controller und den Agenten zurückgerufen und auf den Status *geplant* gesetzt.
- **Auftrag entfernen**
  - Wenn diese Option auf *geplante* Aufträge angewendet wird, werden die Aufträge aus dem Tagesplan entfernt. Ein späterer Lauf des Tagesplan-Service wird nicht versuchen, Aufträge zu dem angegebenen Datum hinzuzufügen.
- **Order kopieren**
  - **Startzeit**: Kopiert die Aufträge auf ein zukünftiges Datum des Tagesplans. Die Eingabe von Datum/Uhrzeit ist ähnlich wie die Änderung der Startzeit einer Order.
  - **Tagesplan-Zuordnung beibehalten**: Kalenderbasierte Abhängigkeiten von Schwarzen Brettern werden zum ursprünglichen Tagesplandatum aufgelöst.
  - **Job-Zulassungszeiten ignorieren**: Aufträge können darauf beschränkt werden, an bestimmten Tagen und/oder in bestimmten Zeitfenstern zu laufen. Ankommende Aufträge müssen dann auf das nächste verfügbare Zeitfenster warten. Diese Option erzwingt den Start von Aufträgen unabhängig von solchen Beschränkungen.

#### Startzeit ändern

- **Jetzt**: Aufträge werden sofort gestartet.
- **Bestimmtes Datum**: Die Aufträge beginnen an dem angegebenen Datum und zu der angegebenen Uhrzeit. Bei der Auflösung von kalenderbasierten Abhängigkeiten wird den Aufträgen das entsprechende Tagesplandatum zugewiesen.
- **Relativ zur aktuellen Zeit**: Aufträge beginnen mit einem Offset zur aktuellen Zeit in Sekunden oder in Stunden, Minuten, Sekunden, z.B. *15* für einen Start in 15 Sekunden oder *01:30:15* für einen Start 1 Stunde, 30 Minuten und 15 Sekunden später.
- **Relativ zur Startzeit**: Die Aufträge beginnen mit einem positiven oder negativen Offset zu ihrer ursprünglichen Startzeit in Sekunden oder in Stunden, 
minuten, Sekunden, z.B. *-04:00:00* für einen Start 4 Stunden früher oder *+12:00:00* für einen Start 12 Stunden später. Die Zuordnung der Aufträge zum ursprünglichen Tagesplandatum bleibt bestehen, wenn es um die Auflösung von kalenderbasierten Abhängigkeiten geht.

#### Parametrisierung ändern

Für verwandte Workflows, die Variablen angeben, können die Werte geändert werden. Wenn Sie mit Massenoperationen arbeiten, haben alle Aufträge die gleichen Variablenwerte.

- **Variable ändern**: 
  - Wenn der Workflow Variablen ohne Standardwerte angibt, muss der Auftrag die entsprechenden Werte angeben.
  - Wenn der Workflow Variablen mit Standardwerten angibt, ist ihre Angabe in einer Bestellung optional.

Eine Position kann angegeben werden, wenn die Order nicht beim ersten Knoten im Workflow, sondern bei einem späteren Knoten beginnen soll.

- **Block Position**: Für Workflows, die Blockanweisungen wie *Try/Catch*, *Resource Lock*, *Fork/Join* enthalten, kann die entsprechende Anweisung ausgewählt werden.
- **Startposition**: Wenn keine *Startposition* angegeben ist, beginnt der Auftrag beim ersten Knoten im Workflow oder bei der *Blockposition*
  - Wenn keine *Blockposition* angegeben wird, kann eine beliebige Anweisung der obersten Ebene im Workflow ausgewählt werden, von der aus die Order gestartet wird.
  - Wenn eine *Blockposition* angegeben ist, dann ist die Startposition ein Knoten auf gleicher Ebene innerhalb des Blocks.
- **Endpositionen**:
  - Wenn keine *Blockposition* angegeben ist, kann eine beliebige Anweisung der obersten Ebene im Workflow ausgewählt werden, vor der die Order endet.
  - Wenn eine *Blockposition* angegeben wird, kann ein beliebiger Knoten auf gleicher Ebene innerhalb des Blocks ausgewählt werden, vor dem der Auftrag beendet wird.
  - Es kann mehr als eine *Endposition* angegeben werden.

#### Priorität ändern

- **Priorität**:
  - Wenn ein Auftrag auf eine *Ressourcensperre* im Workflow trifft, die die Parallelität einschränkt, dann bestimmt seine *Priorität* die Position in der Warteschlange der *wartenden* Aufträge.
  - die *Prioritäten* werden durch negative, null und positive Ganzzahlen oder durch die angebotenen Abkürzungen festgelegt. Eine höhere *Priorität* hat Vorrang. Die Abkürzungen bieten die folgenden Werte:
    - **Niedrig**: -20000
    - **Niedrig Normal**: -10000
    - **Normal**: 0
    - **Über Normal**: 10000
    - **Hoch**: 20000

## Referenzen

### Kontext-Hilfe

- [Bereinigungsdienst](/service-cleanup)
- [Daily Plan - Calendar](/daily-plan-calendar)
- [Tagesplandienst](/service-daily-plan)
- [Auftragshistorie](/history-orders)
- [Einstellungen - Tagesplan](/settings-daily-plan)

### Product Knowledge Base

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)

