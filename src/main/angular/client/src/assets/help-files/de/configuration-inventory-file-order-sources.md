# Konfiguration - Inventar - Dateiauftragsquellen

Der Bereich *Dateiauftragsquelle* ermöglicht die Angabe von Quellen für [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching) mit Arbeitsabläufen:

- Ein Verzeichnis wird von einem Agenten auf eingehende Dateien überwacht.
- Für jede eingehende Datei wird ein Auftrag erstellt, der diese Datei repräsentiert. 
  - Wenn die Datei vor Abschluss des Arbeitsablaufs von einem Job verschoben oder entfernt wird, setzt der Auftrag den Arbeitsablauf fort und verlässt ihn nach Abschluss.
  - Bleibt die Datei nach Abschluss des Arbeitsablaufs an ihrem Platz, dann bleibt der Auftrag im Zustand *abgeschlossen* verfügbar. Damit der Auftrag den Arbeitsablauf verlässt, muss die eingehende Datei verschoben oder entfernt werden.
- Aufträge enthalten die Variable *file*, die den Pfad zur eingehenden Datei benennt. Die Variable *file* muss vom Arbeitsablauf deklariert werden und kann von Jobs verwendet werden.

Quellen für Dateiaufträge werden einem Arbeitsablauf zugewiesen, dem sie für jede eingehende Datei einen Auftrag hinzufügen.

Quellen für Dateiaufträge werden über die folgenden Fenster verwaltet:

- Der [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation) auf der linken Seite des Fensters bietet Navigation in Ordnern, die Quellen für Dateiaufträge enthalten und Operationen für Dateiauftragsquellen.
- Der Bereich *Dateiauftragsquelle* auf der rechten Seite des Fensters enthält Details zur Konfiguration der Dateiauftragsquelle.

## Bereich: Dateiauftragsquelle

Für eine Dateiauftragsquelle sind die folgenden Eingaben möglich:

- **Name** ist der eindeutige Bezeichner einer Dateiauftragsquelle, siehe [Regeln zur Benennung von Objekten](/object-naming-rules).
- **Titel** enthält eine optionale Erklärung zum Zweck der Dateiauftragsquelle.
- **Kennzeichnung** bietet die Möglichkeit, eine Anzahl von Begriffen anzugeben, die den Aufträgen für eingehende Dateien zugewiesen werden.
- **Arbeitsablauf** gibt den Namen eines Arbeitsablaufs an, dem Aufträge für eingehende Dateien hinzugefügt werden.
- **Agent** gibt den Agenten an, der das eingehende Verzeichnis überwacht. Wenn ein Agent Cluster verwendet wird, dann wird die Dateiüberwachung aus Gründen der Hochverfügbarkeit von Director Agent durchgeführt: Im Fall einer Umschaltung oder einer Akivierung der Ausfallsicherung übernimmt der Standby Director Agent die aktive Rolle der Überwachung von Verzeichnissen.
- **Verzeichnis** gibt das Verzeichnis an, das auf eingehende Dateien überwacht wird. Dem Laufzeitkonto des Agenten müssen Lese- und Schreibrechte (Verschieben, Entfernen) für eingehende Dateien aus dem *Verzeichnis* zugewiesen werden.
- **Muster** gibt einen Java-kompatiblen [regulären Ausdruck](https://en.wikipedia.org/wiki/Regular_expression) an, der mit den Namen der eingehenden Dateien übereinstimmt. Reguläre Ausdrücke unterscheiden sich von der Verwendung von Wildcards. Ein Beispiel, 
  - **.\*** passt auf jeden Dateinamen,
  - **.\*\\.csv$** passt zu Dateinamen mit der Erweiterung .csv.
- **Zeitzone** gibt die Zeitzone an, um Aufträge aus eingehenden Dateien dem entsprechenden Tagesplandatum zuzuordnen, siehe [Tagesplan](/daily-plan). Für die Eingabe werden Zeitzonenkennungen wie *UTC*, *Europa/London* usw. akzeptiert. Eine vollständige Liste der Zeitzonen und Kennungen finden Sie unter [Liste der Zeitzonen der tz-Datenbank](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).
- **Verzögerung** gibt die Anzahl der Sekunden an, die der Agent wartet, bis die eingehende Datei als stabil angesehen wird.
  - Unter Unix können Dateien zur gleichen Zeit geschrieben werden, in der der Agent sie liest. Dies gilt nicht für Windows-Umgebungen, die standardmäßig das Lesen und Schreiben von Dateien zum selben Zeitpunkt nicht zulassen.
  - In einem ersten Schritt prüft der Agent die Dateigröße und den Zeitstempel der Änderung. In einem zweiten Schritt wartet der Agent auf die *Verzögerung* und wiederholt die Prüfung. Wenn die Dateigröße und der Änderungszeitstempel unverändert sind, erstellt der Agent den Auftrag, andernfalls wird der zweite Schritt wiederholt.
- **Priorität**
  - Wenn ein Auftrag auf eine *Ressourcen-Sperre* im Arbeitsabläufen trifft, die die Parallelität einschränkt, dann bestimmt seine *Priorität* die Position in der Warteschlange der *wartenden* Aufträge.
  - die *Prioritäten* werden durch negative, null und positive Ganzzahlen oder durch die angebotenen Abkürzungen festgelegt. Eine höhere *Priorität* hat Vorrang. Die Abkürzungen bieten die folgenden Werte:
    - **Niedrig**: -20000
    - **Niedriger als Normal**: -10000
    - **Normal**: 0
    - **Höher als Normal**: 10000
    - **Hoch**: 20000

### Operationen für Dateiauftragsquellen

Für verfügbare Operationen siehe [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation).

## Referenzen

### Kontext-Hilfe

- [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation)
- [Regeln zur Benennung von Objekten](/object-naming-rules)
- [Regulärer Ausdruck](https://en.wikipedia.org/wiki/Regular_expression)
- [Tagesplan](/daily-plan)

### Product Knowledge Base

- [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching)
- [Liste der Zeitzonen der tz-Datenbank](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
