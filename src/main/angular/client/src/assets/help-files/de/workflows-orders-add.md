# Aufträge zu Arbeitsabläufen hinzufügen

Aufträge können bei Bedarf hinzugefügt werden und werden unabhängig vom Tagesplan ausgeführt.

Benutzer, die mit den Standardwerten zufrieden sind und einen Auftrag zur sofortigen Ausführung einreichen möchten, müssen keine weiteren Eingaben machen. 

### Auftrag-Attribute

- **Auftragsname**: Ein optionaler Name, der zum Filtern von Aufträgen in einer Reihe von Ansichten verwendet werden kann.
- **Tag Name**: Hier können Sie eine beliebige Anzahl von Tags angeben, die dem Auftrag hinzugefügt werden. Tags werden in einer Reihe von Ansichten angezeigt, wenn Sie sie auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) angeben.
- **Job-Zulassungszeiten ignorieren**: Aufträge können auf die Ausführung an bestimmten Tagen und/oder in bestimmten Zeitfenstern beschränkt werden. Aufträge, die außerhalb eines Zeitfensters ankommen, müssen auf das nächste verfügbare Zeitfenster warten. Diese Option erzwingt den Start von Aufträgen unabhängig von solchen Beschränkungen.

### Startzeit

- **Jetzt**: Der Auftrag wird sofort beginnen.
- **Bestimmtes Datum**: Der Auftrag beginnt zu dem angegebenen Datum und der angegebenen Uhrzeit.
- **Relativ zur aktuellen Zeit**: Der Auftrag beginnt mit einem Versatz von Stunden, Minuten und Sekunden gegenüber der aktuellen Uhrzeit. Beispiele:
  - **30s**: 30 Sekunden später
  - **15m**: 15 Minuten später
  - **1h**: 1 Stunde später
  - **1h 15m 30s** oder **01:15:30**: 1 Stunde, 15 Minuten und 30 Sekunden später
- **Keine Startzeit**: Der Auftrag wird nicht gestartet, sondern ist ab dem Status *anhängig* verfügbar und kann später mit einer Startzeit versehen werden.

### Abhängigkeiten von Aufträgen

- **Notice Space Key**: Wenn der Arbeitsablauf Abhängigkeiten auf der Basis von Notizen enthält, kann ein Tagesplan-Datum angegeben werden, zu dem die Abhängigkeiten aufgelöst werden sollen. Standardmäßig wird der aktuelle Tag verwendet.
  - es werden vergangene Daten akzeptiert, für die ein Plan geöffnet ist.
  - zukünftige Daten werden akzeptiert.

### Auftragsposition

Wenn ein Auftrag nicht mit dem ersten Knoten im Arbeitsablauf beginnen soll, kann eine Position angegeben werden.

- **Block Position**: Für Arbeitsabläufe mit Blockanweisungen wie Try/Catch, ResourceLock, Fork/Join kann die entsprechende Anweisung ausgewählt werden.
- **Startposition**: Wenn keine Startposition angegeben wird, beginnt der Auftrag mit dem ersten Knoten.
  - Wenn keine Blockposition angegeben ist, kann eine beliebige Anweisung der obersten Ebene des Arbeitsablaufs ausgewählt werden, von der aus der Auftrag gestartet wird.
  - Wenn eine Blockposition angegeben ist, ist die Startposition ein Knoten der gleichen Ebene innerhalb des Blocks.
- **Endpositionen**:
  - Wenn keine Blockposition angegeben ist, kann eine beliebige Anweisung der obersten Ebene des Arbeitsablaufs ausgewählt werden, vor der der Auftrag endet.
  - Wenn eine Blockposition angegeben ist, kann ein beliebiger Knoten innerhalb des Blocks ausgewählt werden, vor dem der Auftrag beendet wird.
  - Es kann mehr als eine Endposition angegeben werden.
- **Priorität**:
  - Wenn der Auftrag auf eine Ressourcensperre im Arbeitsablauf trifft, die die Parallelität einschränkt, dann bestimmt seine *Priorität* die Position in der Warteschlange der *wartenden* Aufträge.
  - *Prioritäten* werden mit negativen, null und positiven Ganzzahlen oder mit den angebotenen Abkürzungen angegeben. Eine höhere *Priorität* hat Vorrang. Die Abkürzungen bieten die folgenden Werte:
    - **Niedrig**: -20000
    - **Niedrig Normal**: -10000
    - **Normal**: 0
    - **Über Normal**: 10000
    - **Hoch**: 20000

### Auftragsparametrisierung

- **Parametrisierung aus Zeitplan zuweisen**: Wenn dem Arbeitsablauf ein Zeitplan zugewiesen ist, kann dieser ausgewählt werden, um seine Parametrisierung wie Variablen und Tags in den aktuellen Auftrag zu kopieren.
- **Variable modifizieren**: 
  - Wenn der Arbeitsablauf Variablen ohne Standardwerte angibt, muss der aktuelle Auftrag die entsprechenden Werte angeben.
  - Wenn der Arbeitsablauf Variablen mit Standardwerten angibt, können Sie über den Link eine Variable auswählen, für die ein neuer Wert angegeben werden soll.
- **Variablen modifizieren**: Verhält sich ähnlich wie *Variable ändern*, zeigt aber alle verfügbaren Variablen an.

### Zusätzliche Aufträge

- **Auftrag hinzufügen**: Wenn mehr als ein Auftrag zum Arbeitsablauf hinzugefügt werden soll, dann fügt der Link die Parametrisierung für den zusätzlichen Auftrag hinzu.
- **Aufträge aus Zeitplänen hinzufügen**: Wenn dem Arbeitsablauf ein oder mehrere Zeitpläne zugewiesen sind, wird für jeden Zeitplan ein parametrisierter Auftrag aus einem Zeitplan hinzugefügt.

## Referenzen

- [Einstellungen - JOC Cockpit](/settings-joc)
- [Arbeitsabläufe](/workflows)
- [JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows)

