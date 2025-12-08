# Konfiguration - Inventar - Ressourcen-Sperren

Der Bereich *Ressourcen-Sperren* bietet die Möglichkeit, Ressourcen-Sperren für die Verwendung mit Arbeitsabläufen festzulegen.

Ressourcen-Sperren begrenzen die Parallelität von Jobs und anderen Anweisungen des Arbeitsablaufs. Sie können als Ampel betrachtet werden, genauer gesagt als [Semaphor](https://en.wikipedia.org/wiki/Semaphore_%28programming%29):

- Aufträge müssen die Sperre erhalten, um im Arbeitsablauf fortfahren zu können. Andernfalls bleiben sie im *Wartezustand*, bis die Sperre verfügbar ist.
- Aufträge, die auf eine Sperre warten, verbrauchen keine Rechenressourcen wie die CPU,
- Die Versuche von Aufträgen, eine Sperre zu erhalten, werden für alle Jobs und andere Anweisungen in Arbeitsabläufen auf allen Agenten berücksichtigt.

Die folgenden Varianten sind für Ressourcen-Sperren verfügbar:

- **Exklusive Sperren** erlauben die einmalige Nutzung einer Sperre durch eine [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction).
- **Gemeinsame Sperren** erlauben die parallele Nutzung einer Sperre durch mehrere *Lock Anweisungen* desselben oder unterschiedlicher Arbeitsabläufe.
  - Der zugrunde liegende Anwendungsfall ist eine Ressource wie z.B. eine Datenbanktabelle, auf die eine begrenzte Anzahl von Jobs gleichzeitig zugreifen kann. Um Deadlocks in der Datenbank zu vermeiden, ist die Anzahl der Jobs, die auf die Tabelle zugreifen, begrenzt.
  - Jede *Lock Anweisung* gibt ein *Gewicht* an, das auf die *Kapazität* der Ressourcen-Sperre angerechnet wird. Wenn das *Gewicht* mit der verfügbaren *Kapazität* übereinstimmt, kann der Auftrag ausgeführt werden. Andernfalls wartet der Auftrag, bis der erforderliche Anteil an *Kapazität* verfügbar wird.

Das Folgende gilt für die Verwendung von Ressourcen-Sperren durch *Lock Anweisungen*:

- *Lock Anweisungen* sind Blockanweisungen, die in einem Arbeitsablauf verwendet werden und eine beliebige Anzahl von Jobs und anderen Arbeitsablauf-Anweisungen enthalten können.
- *Lock Anweisungen* können auf einer beliebigen Anzahl von Ebenen verschachtelt werden.
- Bei Job-Fehlern gibt der Auftrag standardmäßig die Sperre frei und wird an den Anfang der *Lock Anweisung* verschoben. Benutzer, die möchten, dass ein *gescheiterter* Auftrag weiterhin eine Sperre verwendet, können die [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction) mit dem Wert *false* für die Option *StopOnFailure* anwenden.

Ressourcen-Sperren werden über die folgenden Bedienfelder verwaltet:

- Der [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation) auf der linken Seite des Fensters bietet eine Navigation durch die Ordner, die Ressourcen-Sperren enthalten und Operationen für Ressourcen-Sperren.
- Der Bereich *Ressourcen-Sperren* auf der rechten Seite des Fensters enthält Details zur Konfiguration von Ressourcen-Sperren.

## Bereich: Ressourcen-Sperren

Für eine Ressourcen-Sperre sind die folgenden Eingaben möglich:

- **Name** ist der eindeutige Bezeichner einer Ressourcen-Sperre, siehe [Regeln zur Benennung von Objekten](/object-naming-rules).
- **Titel** enthält eine optionale Erklärung zum Zweck der Ressourcen-Sperre.
- **Kapazität** ist eine Zahl, die die maximale Akzeptanz von *Gewichten* aus parallelen *Lock Anweisungen* darstellt:
  - eine *Kapazität* von 1 beschränkt die Ressourcen-Sperre auf die einmalige Verwendung unabhängig von *exklusiven* oder *gemeinsamen* *Lock Anweisungen*.
  - eine größere *Kapazität* erlaubt die parallele Nutzung der Ressourcen-Sperre durch *Gemeinsame Sperren*. Verwandte *Lock Anweisungen* können die Verwendung der *Kapazität* der Sperre festlegen:
    - die *Exklusive* Verwendung versucht, die Sperre unabhängig von ihrer *Kapazität* exklusiv zu belegen. 
    - die *Gemeinsame* Verwendung prüft, ob das *Gewicht* der *Lock Anweisung* mit der verbleibenden *Kapazität* übereinstimmt.

### Operationen für Ressourcen-Sperren

Für verfügbare Operationen siehe [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation).

### Auftragsprioritäten

Ressourcen-Sperren berücksichtigen Auftrags-*Prioritäten*. Beim Hinzufügen von Aufträgen über [Konfiguration - Inventar - Zeitpläne](/configuration-inventory-schedules) und beim Hinzufügen von Ad-hoc-Aufträgen über [Auftrag hinzufügen](/workflows-orders-add) kann die *Priorität* angegeben werden.

Wenn mehrere Aufträge vor einer Ressourcen-Sperre warten, wird der Auftrag mit der höchsten *Priorität* als erster die Ressourcen-Sperre erhalten.

## Referenzen

### Kontext-Hilfe

- [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation)
- [Regeln zur Benennung von Objekten](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction)
- [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction)
- [Semaphor](https://en.wikipedia.org/wiki/Semaphore_%28programming%29)
