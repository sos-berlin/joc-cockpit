# Ressourcen - Schwarze Bretter

Die Ansicht *Aushangtafeln* zeigt Live-Informationen über die Nutzung von Schwarzen Brettern an.

Mit Hilfe von Hinweistafeln werden Abhängigkeiten zwischen Arbeitsabläufen durch die Verwendung von Hinweisen hergestellt. Eine Notiz ist eine Markierung, die an ein Schwarzes Brett angehängt ist oder nicht vorhanden ist. Anschlagbretter sind in den folgenden Varianten verfügbar:

- **Globale Notice Boards** implementieren Notices* auf globaler Ebene, wodurch dieselbe Notice jederzeit für jeden Arbeitsablauf verfügbar ist. 
- **Schedulable Notice Boards** implementieren Notizen im Rahmen des [Daily Plan](/daily-plan). Die Notiz existiert oder existiert nicht pro *Tagesplan* Datum, zum Beispiel
  - Arbeitsablauf 1 läuft von Montag bis Freitag.
  - Arbeitsablauf 2 läuft Mo-So und hängt von der vorherigen Ausführung von Arbeitsablauf 1 ab.
  - An Wochenenden wird Arbeitsablauf 1 nicht gestartet. Damit Arbeitsablauf 2 am Wochenende starten kann, wird die Abhängigkeit mit Hilfe von *Schedulable Notice Boards* auf den Tagesplan abgebildet: Wenn kein Auftrag für Arbeitsablauf 1 angekündigt ist, kann die Abhängigkeit ignoriert werden.

*Notice Boards* werden in Arbeitsabläufen von den folgenden Anweisungen referenziert:

- **PostNotices Instruction** postet eine oder mehrere *Notices*.
- anweisung **ExpectNotices Instruction** wartet auf das Vorhandensein einer oder mehrerer *Notices*.
- die Anweisung **ConsumeNotices Instruction** ist eine Blockanweisung, die
  - eine Reihe von Jobs und Arbeitsabläufen im selben Arbeitsablauf umfassen kann,
  - wartet auf das Vorhandensein einer oder mehrerer *Notices* und löscht *Notices* nach Abschluss des Blocks.

## Navigationsleiste

Die linke Leiste zeigt den Baum der Inventarordner an, die die Hinweistafeln enthalten.

- Wenn Sie auf einen Ordner klicken, werden die Pinnwände dieses Ordners angezeigt.
- Wenn Sie auf das Symbol mit dem Sparren nach unten klicken, wenn Sie den Mauszeiger über einen Ordner bewegen, werden die Tafeln aus diesem Ordner und allen Unterordnern angezeigt.

Mit dem Symbol Schnellsuche können Sie auf der Grundlage von Benutzereingaben nach Pinnwänden suchen:

- Wenn Sie **Test** eingeben, werden Schwarze Bretter mit Namen wie *test-board-1* und *TEST-board-2* angezeigt. 
- Wenn Sie **Test** eingeben, werden Pinnwände mit Namen wie *test-board-1* und *my-TEST-board-2* angezeigt

## Pinnwand

Die Anzeige konzentriert sich auf *Aushangtafeln*, zugehörige *Aushänge* und Aufträge.

Die Ansicht [Daily Plan - Dependencies](/daily-plan-dependencies) konzentriert sich auf die Anzeige von *Aushangtafeln*, *Mitteilungen* und Aufträgen, die sich auf ein bestimmtes Datum des Tagesplans beziehen.

### Anzeige von Hinweistafeln

Die folgenden Informationen werden angezeigt:

- **Name** ist der eindeutige Name eines Schwarzen Bretts.
- **Datum der Bereitstellung** ist das Datum, an dem die Tafel bereitgestellt wurde.
- **Status** ist einer der Werte *Synchronisiert* und *Nicht synchronisiert*, wenn die Hinweistafel noch nicht an den Controller übermittelt wurde.
- **Anzahl der Mitteilungen** gibt die Anzahl der *Mitteilungen* für die Tafel an.
  - **Globale Hinweistafeln** enthalten eindeutige *Hinweise*.
  - **Schedulable Notice Boards** enthalten *Mitteilungen* pro Tagesplan-Datum.
- **Anzahl der zu erwartenden Aufträge** zeigt die Anzahl der Aufträge an, die die Veröffentlichung einer *Mitteilung* erwarten.

### Anzeige von Hinweisen und Aufträgen

Wenn Sie auf das Pfeil-nach-unten-Symbol klicken, wird das Schwarze Brett vergrößert und Sie erhalten detaillierte Informationen über *Mitteilungen*, die veröffentlicht wurden, und Aufträge, die auf die Veröffentlichung von *Mitteilungen* warten.

### Vorgänge auf dem Schwarzen Brett

Die folgenden Operationen sind verfügbar:

- **Bekanntmachung** veröffentlicht die entsprechende *Bekanntmachung* ähnlich wie eine *Bekanntmachungsanweisung*.
- **Notiz löschen** löscht die *Notiz* ähnlich wie eine *Notizen verbrauchen-Anweisung*.

## Suche

 [Resources - Notice Boards - Search](/resources-notice-boards-search) bietet Kriterien für die Suche nach Schwarzen Brettern aus Abhängigkeiten. Wenn Sie z.B. nach Arbeitsabläufen suchen, die einen bestimmten Jobnamen enthalten, werden die von diesem Arbeitsablauf verwendeten Schwarzen Bretter angezeigt.

## Referenzen

### Kontexthilfe

- [Configuration - Inventory - Notice Boards](/configuration-inventory-notice-boards)
- [Daily Plan](/daily-plan)
- [Daily Plan - Dependencies](/daily-plan-dependencies)
- [Resources - Notice Boards - Search](/resources-notice-boards-search)

### Product Knowledge Base

- [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  - [JS7 - Schedulable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedulable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)  
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)

