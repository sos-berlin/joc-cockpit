# Konfiguration - Inventar - Zeitpläne

Der Bereich *Zeitpläne* bietet die Möglichkeit, Regeln für die Erstellung von Aufträgen aus dem [Tagesplan](/daily-plan) festzulegen. Details finden Sie unter [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules).

- Zeitpläne legen den Zeitpunkt fest, zu dem die Ausführung von Aufträgen für Arbeitsabläufe beginnt. Ihnen werden ein oder mehrere Arbeitsabläufe und optional Variablen zugewiesen, die von Jobs in den jeweiligen Arbeitsabläufen verwendet werden.
  - **Starttage** werden von [Konfiguration - Inventar - Kalender](/configuration-inventory-calendars) bestimmt und begrenzen die Tage für die Ausführung der Arbeitsabläufe.
  - **Startzeiten** werden von Zeitplänen bestimmt, die eine oder mehrere Zeiten an einem Tag angeben. Sie können die Tage für die Ausführung von Arbeitsabläufen weiter einschränken.
- Zeitpläne erstellen Aufträge auf täglicher Basis
  - für die einmalige Ausführung von Arbeitsabläufen. Dazu gehören Arbeitsabläufe, die zu einer Reihe von Zeitpunkten pro Tag starten.
  - für die zyklische Ausführung von Arbeitsabläufen. Damit wird die wiederholte Ausführung von Arbeitsabläufen in konfigurierbaren Intervallen festgelegt.
- Zeitpläne werden vom [Tagesplan](/daily-plan) angewendet, um Aufträge für die resultierenden Tage und Zeiten zu erstellen.
  - Zeitpläne können manuell in der Ansicht des Tagesplans angewendet werden.
  - Zeitpläne werden automatisch vom [Tagesplandienst](/service-daily-plan) angewendet.

Zeitpläne werden über die folgenden Fenster verwaltet:

- Der [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation) auf der linken Seite des Fensters bietet eine Navigation durch die Ordner mit den Zeitplänen und Operationen für Zeitpläne.
- Der Bereich *Zeitplan* auf der rechten Seite des Fensters enthält Details zur Zeitplankonfiguration.

## Bereich: Zeitplan

Für einen Zeitplan sind die folgenden Eingaben möglich:

- **Name** ist der eindeutige Bezeichner eines Zeitplans, siehe [Regeln zur Benennung von Objekten](/object-naming-rules).
- **Titel** enthält eine optionale Erklärung zum Zweck des Zeitplans.
- **Namen der Arbeitsabläufe** enthält die Liste der Arbeitsabläufe, die gestartet werden sollen.
- **Automatisch planen** gibt an, dass der Zeitplan vom [Tagesplandienst](/service-daily-plan) berücksichtigt wird.
- **Auftrag an Controller übermitteln, wenn geplant** legt fest, dass die Aufträge sofort an einen Controller übermittelt werden, wenn sie geplant werden. Ohne diese Option übermittelt der Tagesplandienst *geplante* Aufträge auf der Grundlage von [Einstellungen - Tagesplan](/settings-daily-plan).

### Auftragsparametrierung

- **Auftragsname**: Ein optionaler Name, der zum Filtern von Aufträgen in einer Reihe von Ansichten verwendet werden kann.
- **Kennzeichnung**: Es kann eine beliebige Anzahl von Kennzeichnungen angegeben werden, die dem Auftrag hinzugefügt werden sollen. Auftrags-Kennzeichnungen werden in einer Reihe von Ansichten angezeigt, wenn sie auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) angegeben werden.
- **Zutrittszeiten der Anweisungen/Jobs ignorieren**: Jobs können auf die Ausführung an bestimmten Tagen und/oder in bestimmten Zeitfenstern beschränkt werden. Dasselbe gilt bei Verwendung der *AdmissionTimes Anweisung*. Aufträge, die außerhalb eines Zeitfensters ankommen, müssen auf das nächste verfügbare Zeitfenster warten. Diese Option erzwingt den Start von Jobs und anderen Anweisungen unabhängig von solchen Beschränkungen.

### Auftragsposition

Wenn ein Auftrag nicht vom ersten Knoten im Arbeitsablauf aus starten soll, kann eine Position angegeben werden.

- **Blockposition**: Für Arbeitsabläufe mit Blockanweisungen wie Try/Catch, Lock, Fork/Join kann die entsprechende Anweisung ausgewählt werden.
- **Startposition**: Wenn keine *Startposition* angegeben wird, beginnt der Auftrag mit dem ersten Knoten.
  - Wenn keine *Blockposition* angegeben wird, kann eine beliebige Anweisung der ersten Ebene im Arbeitsablauf ausgewählt werden, von der aus der Auftrag gestartet werden soll.
  - Wenn eine *Blockposition* angegeben ist, ist die *Startposition* ein Knoten auf gleicher Ebene innerhalb des Blocks.
- **Endpositionen**:
  - Wenn keine *Blockposition* angegeben ist, kann eine beliebige Anweisung der ersten Ebene im Arbeitsablauf ausgewählt werden, vor der der Auftrag endet.
  - Wenn eine *Blockposition* angegeben wird, kann ein beliebiger Knoten auf gleicher Ebene innerhalb des Blocks ausgewählt werden, vor dem der Auftrag beendet wird.
  - Es kann mehr als eine *Endposition* angegeben werden.
- **Priorität**:
  - Wenn der Auftrag auf eine Ressourcen-Sperre im Arbeitsablauf trifft, die die Parallelität einschränkt, dann bestimmt seine *Priorität* die Position in der Warteschlange der *wartenden* Aufträge.
  - *Prioritäten* werden mit negativen, null und positiven Ganzzahlen oder mit den angebotenen Abkürzungen angegeben. Eine höhere *Priorität* hat Vorrang. Die Abkürzungen bieten die folgenden Werte:
    - **Niedrig**: -20000
    - **Niedriger als Normal**: -10000
    - **Normal**: 0
    - **Höher als Normal**: 10000
    - **Hoch**: 20000

### Auftragsvariablen

Auftragsvariablen werden angegeben, wenn ein Arbeitsablauf Variablen zur Parametrierung der Ausführung von Aufträgen deklariert:

- Erforderliche Variablen werden von einem Arbeitsablauf ohne Standardwert deklariert. Sie werden dem Zeitplan automatisch zur Verfügung gestellt und müssen mit entsprechenden Werten belegt werden.
- Optionale Variablen werden von einem Arbeitsablauf mit einem Standardwert deklariert. Sie können über die folgenden Links aufgerufen werden:
  - **Variable ändern** ermöglicht die Auswahl bestimmter Variablen aus der Liste der Arbeitsablauf-Variablen. Die Variablen werden ausgehend von ihrem Standardwert ausgefüllt.
  - **Variablen ändern** fügt Eingaben für alle Arbeitsablauf-Variablen hinzu. Die Variablen werden ausgehend von ihrem Standardwert ausgefüllt.

Die Zuweisung von Werten zu Variablen umfasst die Angabe von Zeichenketten und Zahlen. Eine leere Zeichenkette kann mit zwei einfachen Anführungszeichen zugewiesen werden.

## Startzeitregel

Über die Schaltfläche *Startzeitregel* können Sie in einem Popup-Fenster die Startzeiten für Aufträge festlegen. Einzelheiten finden Sie unter [Konfiguration - Inventar - Zeitpläne - Startzeitregel](/configuration-inventory-schedules-run-time).

## Operationen für Zeitpläne

Für verfügbare Operationen siehe [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation).

## Referenzen

### Kontext-Hilfe

- [Auftragshistorie](/history-orders)
- [Einstellungen - Tagesplan](/settings-daily-plan)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Konfiguration - Inventar - Kalender](/configuration-inventory-calendars)
- [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation)
- [Konfiguration - Inventar - Zeitpläne - Startzeitregel](/configuration-inventory-schedules-run-time)
- [Profil - Einstellungen](/profile-preferences)
- [Prozesshistorie](/history-tasks)
- [Regeln zur Benennung von Objekten](/object-naming-rules)
- [Tagesplan](/daily-plan)
- [Tagesplandienst](/service-daily-plan)

### Product Knowledge Base

- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
- [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
- [Liste der Zeitzonen der tz-Datenbank](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
