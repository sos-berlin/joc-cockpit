# Konfiguration - Inventar - Ressourcen-Sperren

Die *Ressourcensperrentafel* bietet die Möglichkeit, Ressourcensperren für die Verwendung mit Workflows festzulegen.

Resource Locks begrenzen die Parallelität von Jobs und anderen Workflow-Anweisungen. Sie können als Ampel betrachtet werden, genauer gesagt als [Semaphor](https://en.wikipedia.org/wiki/Semaphore_%28programming%29) mit der Konsequenz, dass 

- Aufträge müssen die Sperre erhalten, um im Workflow fortfahren zu können. Andernfalls bleiben sie im *Wartezustand*, bis die Sperre verfügbar ist.
- Aufträge, die auf eine Sperre warten, verbrauchen keine Rechenressourcen wie die CPU,
- Die Versuche von Aufträgen, eine Sperre zu erhalten, werden für alle Jobs und andere Workflow-Anweisungen in Workflows und Agenten berücksichtigt.

Die folgenden Varianten sind für Ressourcensperren verfügbar:

- **Exclusive Locks** erlauben die einmalige Nutzung einer Sperre durch eine [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction).
- **Shared Locks** erlauben die parallele Nutzung einer Sperre durch mehrere *Lock Instructions* desselben oder verschiedener Workflows.
  - Der zugrunde liegende Anwendungsfall ist eine Ressource wie z.B. eine Datenbanktabelle, auf die eine begrenzte Anzahl von Jobs gleichzeitig zugreifen kann. Um Deadlocks in der Datenbank zu vermeiden, ist die Anzahl der Jobs, die auf die Tabelle zugreifen, begrenzt.
  - Jede *Lock-Anweisung* gibt ein *Gewicht* an, das auf die *Kapazität* der Ressourcensperre angerechnet wird. Wenn das *Gewicht* mit der verfügbaren *Kapazität* übereinstimmt, kann der Auftrag ausgeführt werden. Andernfalls wartet der Auftrag, bis der erforderliche Anteil an *Kapazität* verfügbar wird.

Das Folgende gilt für die Verwendung von Resource Locks durch *Lock Instructions*:

- *Lock Instructions* sind Blockinstruktionen, die in einem Workflow verwendet werden und eine beliebige Anzahl von Jobs und anderen Workflow Instructions hervorbringen können.
- *Lock Instructions* können auf einer beliebigen Anzahl von Ebenen verschachtelt werden.
- Bei Jobfehlern gibt der Auftrag standardmäßig die Sperre frei und wird an den Anfang der *Schließanweisung* verschoben. Benutzer, die möchten, dass ein *gescheiterter* Auftrag weiterhin eine Sperre verwendet, können die [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction) mit dem Wert *false* für die Option *StopOnFailure* anwenden.

Ressourcensperren werden über die folgenden Bedienfelder verwaltet:

- Die [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation) auf der linken Seite des Fensters bietet eine Navigation durch die Ordner, die Ressourcensperren enthalten. Darüber hinaus bietet das Panel Operationen mit Resource Locks.
- Das *Resource Lock Panel* auf der rechten Seite des Fensters enthält Details zur Konfiguration von Resource Locks.

*Resource Lock Panel

Für eine Ressourcensperre sind die folgenden Eingaben möglich:

- **Name** ist der eindeutige Bezeichner einer Ressourcensperre, siehe [Regeln zur Benennung von Objekten](/object-naming-rules).
- **Title** enthält eine optionale Erklärung zum Zweck der Ressourcensperre.
- **Capacity** ist eine Zahl, die die maximale Akzeptanz von *Gewichten* aus parallelen *Lock-Anweisungen* darstellt:
  - eine *Kapazität* von 1 beschränkt die Ressourcensperre auf die einmalige Verwendung unabhängig von *exklusiven* oder *gemeinsamen* *Lock-Anweisungen*.
  - eine größere *Capacity* erlaubt die parallele Nutzung der Ressourcensperre durch *Shared Locks*. Verwandte *Lock-Anweisungen* können die Verwendung der *Kapazität* des Locks festlegen:
    - die *Exclusive* Verwendung versucht, die Sperre unabhängig von ihrer *Capacity* exklusiv zu erwerben. 
    - die *Gemeinsame* Verwendung prüft, ob das *Gewicht* der *Schlossanweisung* mit der verbleibenden *Kapazität* übereinstimmt.

### Operationen mit Ressourcensperren

Für verfügbare Operationen siehe [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation).

### Auftragsprioritäten

Ressourcensperren berücksichtigen Auftrags *Prioritäten*. Beim Hinzufügen von Aufträgen über [Konfiguration - Inventar - Zeitpläne](/configuration-inventory-schedules) und beim Hinzufügen von Ad-hoc-Aufträgen über [Workflows - Add Orders](/workflows-orders-add) kann die *Priorität* angegeben werden.

Wenn mehrere Aufträge vor einer Ressourcensperre warten, wird der Auftrag mit der höchsten *Priorität* als erster die Ressourcensperre erhalten.

## Referenzen

### Kontext-Hilfe

- [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation)
- [Regeln zur Benennung von Objekten](/object-naming-rules)
- [Workflow - Inventory - Navigation Panel](/configuration-inventory-navigation)

### Produktwissen Basis

- [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction)
- [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction)
- [Semaphor](https://en.wikipedia.org/wiki/Semaphore_%28programming%29)

