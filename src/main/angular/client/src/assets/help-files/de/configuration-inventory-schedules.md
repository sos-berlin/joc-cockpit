# Konfiguration - Inventar - Zeitpläne

Das *Schedule Panel* bietet die Möglichkeit, Regeln für die Erstellung von Aufträgen aus dem [Tagesplan](/daily-plan) festzulegen. Details finden Sie unter [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules).

- Zeitpläne legen den Zeitpunkt fest, zu dem die Ausführung von Aufträgen für Workflows beginnt. Ihnen werden ein oder mehrere Workflows und optional Variablen zugewiesen, die von Jobs in den jeweiligen Workflows verwendet werden.
  - **Startdaten** werden von [Konfiguration - Inventar - Kalender](/configuration-inventory-calendars) angegeben und begrenzen die Tage für die Ausführung der Workflows.
  - **Startzeiten** werden von Zeitplänen angegeben, die eine oder mehrere Zeiten an einem Tag angeben. Sie können die Tage für die Ausführung von Workflows weiter einschränken.
- Zeitpläne erstellen Aufträge auf täglicher Basis
  - für die einmalige Ausführung von Workflows. Dazu gehören Workflows, die zu einer Reihe von Zeitpunkten pro Tag starten.
  - für die zyklische Ausführung von Workflows. Damit wird die wiederholte Ausführung von Workflows in konfigurierbaren Intervallen festgelegt.
- Zeitpläne werden von [Tagesplan](/daily-plan) angewandt, um Aufträge für die resultierenden Daten und Zeiten zu erstellen.
  - Zeitpläne können manuell in der Ansicht Tagesplan angewendet werden.
  - Zeitpläne werden automatisch von der [Daily Plan Service](/service-daily-plan) angewendet.

Zeitpläne werden über die folgenden Fenster verwaltet:

- Die [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation) auf der linken Seite des Fensters bietet eine Navigation durch die Ordner mit den Zeitplänen. Außerdem bietet das Panel die Möglichkeit, Operationen mit den Zeitplänen durchzuführen.
- Das *Schedule Panel* auf der rechten Seite des Fensters enthält Details zur Zeitplankonfiguration.

*Schedule Panel

Für einen Zeitplan sind die folgenden Eingaben möglich:

- **Name** ist der eindeutige Bezeichner eines Zeitplans, siehe [Regeln zur Benennung von Objekten](/object-naming-rules).
- **Titel** enthält eine optionale Erklärung zum Zweck des Zeitplans.
- **Workflow-Namen** enthält die Liste der Workflows, die gestartet werden sollen.
- **Automatisch planen** gibt an, dass der Zeitplan vom [Daily Plan Service](/service-daily-plan) berücksichtigt wird.
- **Bestellung an Controller übermitteln, wenn geplant** legt fest, dass die Bestellungen sofort an einen Controller übermittelt werden, wenn sie geplant werden. Ohne diese Option übermittelt der Tagesplanungsdienst *geplante* Aufträge auf der Grundlage von [Settings - Daily Plan](/settings-daily-plan).

### Auftragsparametrisierung

- **Auftragsname**: Ein optionaler Name, der zum Filtern von Aufträgen in einer Reihe von Ansichten verwendet werden kann.
- **Tag Name**: Es kann eine beliebige Anzahl von Tags angegeben werden, die der Bestellung hinzugefügt werden sollen. Auftrags-Tags werden in einer Reihe von Ansichten angezeigt, wenn sie auf der Seite [Settings - JOC Cockpit](/settings-joc) angegeben werden.
- **Job-Zulassungszeiten ignorieren**: Aufträge können auf die Ausführung an bestimmten Tagen und/oder in bestimmten Zeitfenstern beschränkt werden. Aufträge, die außerhalb eines Zeitfensters ankommen, müssen auf das nächste verfügbare Zeitfenster warten. Diese Option erzwingt den Start von Aufträgen unabhängig von solchen Beschränkungen.

### Auftragsposition

Wenn ein Auftrag nicht vom ersten Knoten im Workflow aus starten soll, kann eine Position angegeben werden.

- **Block Position**: Für Workflows mit Blockanweisungen wie Try/Catch, ResourceLock, Fork/Join kann die entsprechende Anweisung ausgewählt werden.
- **Startposition**: Wenn keine *Startposition* angegeben wird, beginnt der Auftrag mit dem ersten Knoten.
  - Wenn keine *Block Position* angegeben wird, kann eine beliebige Anweisung der obersten Ebene im Workflow ausgewählt werden, von der aus die Order gestartet werden soll.
  - Wenn eine *Blockposition* angegeben ist, ist die *Startposition* ein Knoten auf gleicher Ebene innerhalb des Blocks.
- **Endpositionen**:
  - Wenn keine *Blockposition* angegeben ist, kann eine beliebige Anweisung der obersten Ebene im Workflow ausgewählt werden, vor der die Order endet.
  - Wenn eine *Blockposition* angegeben wird, kann ein beliebiger Knoten auf gleicher Ebene innerhalb des Blocks ausgewählt werden, vor dem der Auftrag beendet wird.
  - Es kann mehr als eine *Endposition* angegeben werden.
- **Priorität**:
  - Wenn die Order auf eine Ressourcensperre im Workflow trifft, die die Parallelität einschränkt, dann bestimmt ihre *Priorität* die Position in der Warteschlange der *wartenden* Orders.
  - *Prioritäten* werden mit negativen, null und positiven Ganzzahlen oder mit den angebotenen Abkürzungen angegeben. Eine höhere *Priorität* hat Vorrang. Die Abkürzungen bieten die folgenden Werte:
    - **Niedrig**: -20000
    - **Niedrig Normal**: -10000
    - **Normal**: 0
    - **Über Normal**: 10000
    - **Hoch**: 20000

### Bestellvariablen

Auftragsvariablen werden angegeben, wenn ein Workflow Variablen zur Parametrisierung der Ausführung von Aufträgen deklariert:

- Erforderliche Variablen werden von einem Workflow ohne Standardwert deklariert. Sie werden dem Zeitplan automatisch zur Verfügung gestellt und müssen mit entsprechenden Werten belegt werden.
- Optionale Variablen werden von einem Workflow mit einem Standardwert deklariert. Sie können über die folgenden Links aufgerufen werden:
  - **Variable ändern** ermöglicht die Auswahl bestimmter Variablen aus der Liste der Workflow-Variablen. Die Variablen werden ausgehend von ihrem Standardwert ausgefüllt.
  - **Variablen ändern** fügt Eingaben für alle Workflow-Variablen hinzu. Die Variablen werden ausgehend von ihrem Standardwert ausgefüllt.

Die Zuweisung von Werten zu Variablen umfasst die Angabe von Strings und Zahlen. Eine leere Zeichenkette kann ab zwei einfachen Anführungszeichen zugewiesen werden.

## Laufzeit

Über die Schaltfläche *Laufzeit* können Sie in einem Popup-Fenster die Startzeiten für Aufträge festlegen. Einzelheiten finden Sie unter [Konfiguration - Inventar - Zeitpläne - Startzeitregel](/configuration-inventory-schedules-run-time).

## Operationen auf Zeitplänen

Für verfügbare Operationen siehe [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation).

## Referenzen

### Kontext-Hilfe

- [Konfiguration - Inventar - Kalender](/configuration-inventory-calendars)
- [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation)
- [Konfiguration - Inventar - Zeitpläne - Startzeitregel](/configuration-inventory-schedules-run-time)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Tagesplan](/daily-plan)
- [Daily Plan Service](/service-daily-plan)
- [Regeln zur Benennung von Objekten](/object-naming-rules)
- [Order History](/history-orders)
- [Profile - Preferences](/profile-preferences)
- [Settings - Daily Plan](/settings-daily-plan)
- [Task History](/history-tasks)

### Product Knowledge Base

- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
- [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
- [Liste der Zeitzonen der tz-Datenbank](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

