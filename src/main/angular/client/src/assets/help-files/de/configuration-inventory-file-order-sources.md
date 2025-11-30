# Konfiguration - Inventar - Quellen für Dateiaufträge

Das *File Order Source Panel* ermöglicht die Angabe von Quellen für [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching) mit Workflows:

- Ein Verzeichnis wird von einem Agenten auf eingehende Dateien überwacht.
- Für jede eingehende Datei wird ein Auftrag erstellt, der diese Datei repräsentiert. 
  - Wenn die Datei vor Abschluss des Workflows von einem Job verschoben oder entfernt wird, setzt der Auftrag den Workflow fort und verlässt ihn nach Abschluss.
  - Bleibt die Datei nach Abschluss des Workflows an ihrem Platz, dann bleibt die Order im Status *erledigt* verfügbar. Damit die Bestellung den Workflow verlässt, muss die eingehende Datei verschoben oder entfernt werden.
- Aufträge enthalten die Variable *file*, die den Pfad zu der eingehenden Datei enthält. Die Variable *file* muss vom Workflow deklariert werden und kann von Jobs verwendet werden.

Quellen für Dateiaufträge werden einem Workflow zugewiesen, dem sie für jede eingehende Datei einen Auftrag hinzufügen.

Quellen für Dateibestellungen werden über die folgenden Fenster verwaltet:

- Unter [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) auf der linken Seite des Fensters können Sie in den Ordnern navigieren, die Quellen für Dateiaufträge enthalten. Darüber hinaus bietet das Panel Operationen für Datei-Order-Quellen.
- Das *Panel für Datei-Order-Quellen* auf der rechten Seite des Fensters enthält Details zur Konfiguration der Datei-Order-Quellen.

*File Order Source Panel

Für eine Datei-Order-Quelle sind die folgenden Eingaben möglich:

- **Name** ist der eindeutige Bezeichner einer Datei-Order-Quelle, siehe [Object Naming Rules](/object-naming-rules).
- **Titel** enthält eine optionale Erklärung zum Zweck der Dateibestellquelle.
- **Tag Name** bietet die Möglichkeit, eine Anzahl von Tags anzugeben, die den für eingehende Dateien erstellten Aufträgen zugewiesen werden sollen.
- **Workflow-Name** gibt den Namen eines Workflows an, dem Aufträge für eingehende Dateien hinzugefügt werden.
- **Agent** gibt den Agenten an, der das eingehende Verzeichnis überwacht.  Wenn ein Agent Cluster verwendet wird, wird die Datei-Überwachung aus Gründen der Hochverfügbarkeit von Director-Agenten durchgeführt: Im Falle einer Umschaltung oder eines Failover übernimmt der Standby-Director-Agent die aktive Rolle der Überwachung von Verzeichnissen.
- **Verzeichnis** gibt das Verzeichnis an, das auf eingehende Dateien überwacht wird. Dem Laufzeitkonto des Agenten müssen Lese- und Schreibrechte (Verschieben, Entfernen) für eingehende Dateien aus dem *Verzeichnis** zugewiesen werden.
- **Pattern** gibt einen Java-[regulären Ausdruck](https://en.wikipedia.org/wiki/Regular_expression) an, der mit den Namen der eingehenden Dateien übereinstimmt. Reguläre Ausdrücke unterscheiden sich von der Verwendung von Wildcards. Ein Beispiel, 
  - **.\*** passt auf jeden Dateinamen,
  - **.csv$** passt zu Dateinamen mit der Erweiterung .csv.
- **Zeitzone** gibt die zutreffende Zeitzone an, um Aufträge aus eingehenden Dateien dem entsprechenden Tagesplandatum zuzuordnen, siehe [Daily Plan](/daily-plan). Für die Eingabe werden Zeitzonenkennungen wie *UTC*, *Europa/London* usw. akzeptiert. Eine vollständige Liste der Zeitzonenkennungen finden Sie unter [Liste der Zeitzonen der tz-Datenbank](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).
- **Delay** gibt die Anzahl der Sekunden an, die der Agent wartet, bis die eingehende Datei als stabil angesehen wird.
  - Unter Unix können Dateien zur gleichen Zeit geschrieben werden, in der der Agent sie liest. Dies gilt nicht für Windows-Umgebungen, die standardmäßig das Lesen und Schreiben von Dateien zum selben Zeitpunkt nicht zulassen.
  - In einem ersten Schritt prüft der Agent die Dateigröße und den Zeitstempel der Änderung. In einem zweiten Schritt wartet der Agent auf die *Verzögerung* und wiederholt die Prüfung. Wenn die Dateigröße und der Änderungszeitstempel unverändert sind, erstellt der Agent den Auftrag, andernfalls wird der zweite Schritt wiederholt.
- **Priorität**
  - Wenn ein Auftrag auf eine *Ressourcensperre* im Workflow trifft, die die Parallelität einschränkt, dann bestimmt seine *Priorität* die Position in der Warteschlange der *wartenden* Aufträge.
  - die *Prioritäten* werden durch negative, null und positive Ganzzahlen oder durch die angebotenen Abkürzungen festgelegt. Eine höhere *Priorität* hat Vorrang. Die Abkürzungen bieten die folgenden Werte:
    - **Niedrig**: -20000
    - **Niedrig Normal**: -10000
    - **Normal**: 0
    - **Über Normal**: 10000
    - **Hoch**: 20000

### Operationen auf Datei-Order-Quellen

Für verfügbare Operationen siehe [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

## Referenzen

### Kontext-Hilfe

- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Daily Plan](/daily-plan)
- [Object Naming Rules](/object-naming-rules)
- [Regulärer Ausdruck](https://en.wikipedia.org/wiki/Regular_expression)

### Product Knowledge Base

- [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching)
- [Liste der Zeitzonen der tz-Datenbank](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

