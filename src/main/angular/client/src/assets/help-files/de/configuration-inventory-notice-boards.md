# Konfiguration - Inventar - Schwarze Bretter

Das *Bekanntmachungstafel-Panel* bietet die Möglichkeit, Bekanntmachungstafeln für die Verwendung mit Workflows festzulegen. Einzelheiten finden Sie unter [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards).

Anschlagtafeln implementieren Abhängigkeiten zwischen Workflows:

- Anschlagtafeln ermöglichen das Hinzufügen von Notizen 
  - ohne Benutzereingriff, siehe [Resources - Notice Boards](/resources-notice-boards).
  - von der Anweisung *PostNotices Instruction* in einem Workflow, siehe [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction).
- Workflows können so konfiguriert werden, dass Aufträge Benachrichtigungen aus den folgenden Anweisungen erwarten:
  - die *ExpectNotices Instruction* wird verwendet, um zu prüfen, ob Notizen von einem oder mehreren Schwarzen Brettern verfügbar sind, die durch eine *PostNotices Instruction* oder durch den Benutzer hinzugefügt wurden. Wenn die Benachrichtigung nicht vorhanden ist, verbleibt der Auftrag standardmäßig im Status *Warten* mit der Anweisung. Ein Workflow kann eine beliebige Anzahl von *ExpectNotices Instructions* enthalten, um Notizen von der gleichen oder von verschiedenen Anschlagtafeln zu erwarten. Einzelheiten finden Sie unter [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction).
  - die Anweisung *ConsumeNotices Instruction* wird verwendet, um Aufträge dazu zu bringen, eine oder mehrere Benachrichtigungen von Schwarzen Brettern zu erwarten, die durch eine *PostNotices Instruction* oder durch den Benutzer hinzugefügt wurden. Die *ConsumeNotices Instruction* ist eine Blockinstruktion, die beliebige andere Instruktionen enthalten kann und die die erwarteten Notices löscht, wenn eine Order das Ende des Instruktionsblocks erreicht. Einzelheiten finden Sie unter [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction).

Die folgenden Geschmacksrichtungen sind für Schwarze Bretter verfügbar:

- **Globale Hinweistafeln** implementieren Hinweise auf globaler Ebene, so dass derselbe Hinweis jederzeit für jeden Workflow verfügbar ist.
- **Schedulable Notice Boards** implementieren Notizen im Rahmen des [Daily Plan](/daily-plan). Eine Notiz existiert im Rahmen eines *Tagesplans*, zum Beispiel
  - Workflow 1 läuft von Montag bis Freitag.
  - Workflow 2 läuft Mo-So und hängt von der vorherigen Ausführung von Workflow 1 ab.
  - An Wochenenden wird Workflow 1 nicht gestartet. Damit Workflow 2 auch an Wochenenden starten kann, wird die Abhängigkeit mit Hilfe von *Schedulable Notice Boards* auf den Tagesplan abgebildet: für Tage, an denen kein Auftrag für Workflow 1 angekündigt ist, wird die Abhängigkeit ignoriert.

Schwarze Bretter werden über die folgenden Fenster verwaltet:

- Die [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) auf der linken Seite des Fensters bietet eine Navigation durch die Ordner, die die Tafeln enthalten. Außerdem bietet das Panel die Möglichkeit, Operationen an den schwarzen Brettern durchzuführen.
- Das *Bekanntmachungstafel-Panel* auf der rechten Seite des Fensters enthält Details zur Konfiguration der Bekanntmachungstafel.

*Board-Panel

Für ein Schwarzes Brett sind die folgenden Eingaben möglich:

- **Name** ist der eindeutige Bezeichner eines Schwarzen Bretts, siehe [Object Naming Rules](/object-naming-rules).
- **Titel** enthält eine optionale Erläuterung des Zwecks des Schwarzen Bretts.
- **Typ der Hinweistafel** ist eine der Optionen *Globale Hinweistafel* oder *Schedulable Notice Board*

### Globale Hinweistafeln

- **Notice ID for Posting Order** enthält einen konstanten Wert oder einen Ausdruck, der von der Posting Order abgeleitet ist:
  - Es kann ein leerer Wert oder eine Zeichenkette verwendet werden, die einen konstanten Wert angibt.
  - Es kann ein regulärer Ausdruck verwendet werden:
    - *Matching Daily Plan Date* extrahiert das Tagesplandatum aus der Order ID mit Hilfe des Ausdrucks: *replaceAll($js7OrderId, '^#([0-9]{4}-[0-9]{2}-[0-9]{2})#.*$', '$1')*
    - *Matching Daily Plan Date and Order Name* extrahiert das Tagesplan-Datum und den Order-Namen aus der Order-ID unter Verwendung des Ausdrucks: *replaceAll($js7OrderId, '^#([0-9]{4}-[0-9]{2}-[0-9]{2})#.*-([^:]*)(?::[^|]*)?([|].*)?$', '$1$2$3')*
    - *Matching Order Name* extrahiert den Namen der Bestellung anhand des Ausdrucks: *replaceAll($js7OrderId, '^#[0-9]{4}-[0-9]{2}-[0-9]{2}#.*-([^:]*)(?::[^|]*)?([|].*)?$', '$1$2')*
- die **Notice ID for Expecting Order** sollte denselben Ausdruck enthalten wie die *Notice ID for Posting Order*.

### Planbare Anschlagtafeln

- die **Notice ID for Posting Order** enthält einen konstanten Wert oder einen Ausdruck, der von der Posting Order abgeleitet ist:
  - Sie können einen leeren Wert oder einen String verwenden, der einen konstanten Wert angibt.
  - Es kann ein regulärer Ausdruck verwendet werden:
    - *Matching Order Name* extrahiert den Auftragsnamen anhand des Ausdrucks: *replaceAll($js7OrderId, '^#[0-9]{4}-[0-9]{2}-[0-9]{2}#.*-([^:]\*)(?::[^|]*)?([|].*)?$', '$1$2')*

### Operationen auf Anschlagtafeln

Für verfügbare Operationen siehe [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

## Verwendung mit Workflow-Anweisungen

Workflow-Anweisungen für Schwarze Bretter bieten die folgenden Optionen:

- die Anweisung **PostNotices Instruction** enthält die Liste der Schwarzen Bretter, für die Benachrichtigungen veröffentlicht werden. Die Anweisung benötigt keine Optionen.
- die Anweisungen **ExpectNotices Instruction**, **ConsumeNotices Instruction** enthalten die folgenden Eingaben:
  - **Ausdruck** gibt Bedingungen von einem oder mehreren Schwarzen Brettern an, die als *true* oder *false* ausgewertet werden:
    - **&amp;&amp;** als eine "und"-Bedingung
    - **||** als eine "oder"-Bedingung
    - **()** Paranthesen geben die Rangfolge an, nach der die Bedingungen ausgewertet werden.
    - Beachten Sie, dass Boardnamen in Ausdrücken in Anführungszeichen gesetzt werden müssen.
    - Beispiele:
      - **'NB1' &amp;&amp; 'NB2'**: erwartet, dass Bekanntmachungen von beiden Schwarzen Brettern *NB1* und *NB2* vorhanden sind, um als *wahr* ausgewertet zu werden.
      - **( 'NB1' &amp;&amp; 'NB2' ) || 'NB3'**: erwartet, dass Bekanntmachungen von *NB1* und *NB2* vorhanden sind. Wenn alternativ eine Meldung von *NB3* vorhanden ist, wird der Ausdruck als *true* ausgewertet.
  - **Wenn nicht angekündigt** legt das Verhalten für den Fall fest, dass eine Bekanntmachung nicht angekündigt wurde. Dies gilt für Tage, für die kein Auftrag aus einem Buchungsworkflow verfügbar ist.
    - **Warten** ist die Standardeinstellung und bewirkt, dass die Aufträge auf das Vorhandensein von Bekanntmachungen warten, unabhängig davon, ob sie angekündigt wurden oder nicht.
    - **Auslassen** veranlasst die Aufträge, die Anweisung zu überspringen, wenn die Mitteilung nicht angekündigt wurde.
    - **Process** ist für die *ConsumeNotices Instruction* verfügbar und veranlasst eine Order, die Blockinstruktion zu betreten, falls die Notice nicht angekündigt wird.

## Referenzen

### Kontext-Hilfe

- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Daily Plan - Dependencies](/daily-plan-dependencies)
- [Object Naming Rules](/object-naming-rules)
- [Resources - Notice Boards](/resources-notice-boards)

### Product Knowledge Base

- [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  - [JS7 - Schedulable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedulable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)  
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)

