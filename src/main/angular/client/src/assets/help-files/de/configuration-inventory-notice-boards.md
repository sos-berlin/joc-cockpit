# Konfiguration - Inventar - Notizbretter

Der Bereich *Notizbrett* bietet die Möglichkeit, Notizbretter für die Verwendung mit Arbeitsabläufen festzulegen. Einzelheiten finden Sie unter [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards).

Notizbretter implementieren Abhängigkeiten zwischen Arbeitsabläufen:

- Notizbretter ermöglichen das Hinzufügen von Notizen 
  - ohne Benutzereingriff, siehe [Ressourcen - Notizbretter](/resources-notice-boards).
  - von der *PostNotices Anweisung* in einem Arbeitsablauf, siehe [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction).
- Arbeitsabläufe können so konfiguriert werden, dass Aufträge Notizen aus den folgenden Anweisungen erwarten:
  - die *ExpectNotices Anweisung* wird verwendet, um zu prüfen, ob Notizen von einem oder mehreren Notizbrettern verfügbar sind, die durch eine *PostNotices Anweisung* oder durch den Benutzer hinzugefügt wurden. Wenn die Notiz nicht vorhanden ist, verbleibt der Auftrag standardmäßig im Status *Wartend* an der Anweisung. Ein Arbeitsablauf kann eine beliebige Anzahl von *ExpectNotices Anweisungen* enthalten, um Notizen vom gleichen oder von unterschiedlichen Notizbrettern zu erwarten. Einzelheiten finden Sie unter [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction).
  - die *ConsumeNotices Anweisung* wird verwendet, um Aufträge zu veranlassen, eine oder mehrere Notizen von Notizbrettern zu erwarten, die durch eine *PostNotices Anweisung* oder durch den Benutzer hinzugefügt wurden. Die *ConsumeNotices Anweisung* ist eine Blockanweisung, die beliebige andere Anweisungen enthalten kann und die die erwarteten Notizen löscht, wenn ein Auftrag das Ende des Anweisungsblocks erreicht. Einzelheiten finden Sie unter [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction).

Die folgenden Varianten sind für Notizbretter verfügbar:

- **Globale Notizbretter** implementieren Notizen auf globaler Ebene, so dass dieselbe Notiz jederzeit für jeden Arbeitsablauf verfügbar ist.
- **Planbare Notizbretter** implementieren Notizen im Rahmen des [Tagesplan](/daily-plan). Eine Notiz existiert im Rahmen eines *Tagesplans*, zum Beispiel
  - Arbeitsablauf 1 läuft von Montag bis Freitag.
  - Arbeitsablauf 2 läuft Mo-So und hängt von der vorherigen Ausführung von Arbeitsablauf 1 ab.
  - An Wochenenden wird Arbeitsablauf 1 nicht gestartet. Damit Arbeitsablauf 2 auch an Wochenenden starten kann, wird die Abhängigkeit mit Hilfe von *Planbaren Notizbrettern* auf den Tagesplan abgebildet: für Tage, an denen kein Auftrag für Arbeitsablauf 1 angekündigt ist, wird die Abhängigkeit ignoriert.

Notizbretter werden über die folgenden Fenster verwaltet:

- Der [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation) auf der linken Seite des Fensters bietet eine Navigation durch die Ordner, die die Notizbretter enthalten. Außerdem bietet der Bereich die Möglichkeit, Operationen an den Notizbrettern durchzuführen.
- Der Bereich *Notizbrett* auf der rechten Seite des Fensters enthält Details zur Konfiguration des Notizbretts.

## Bereich: Notizbrett

Für ein Notizbrett sind die folgenden Eingaben möglich:

- **Name** ist der eindeutige Bezeichner eines Notizbretts, siehe [Regeln zur Benennung von Objekten](/object-naming-rules).
- **Titel** enthält eine optionale Erläuterung des Zwecks des Notizbretts.
- **Typ des Notizbretts** ist eine der Optionen *Globales Notizbrett* oder *Planbares Notizbrett*.

### Globale Notizbretter

- **Notizkennung für sendenden Auftrag** enthält einen konstanten Wert oder einen Ausdruck, der von dem sendendedn Auftrag abgeleitet ist:
  - Es kann ein leerer Wert oder eine Zeichenkette verwendet werden, die einen konstanten Wert angibt.
  - Es kann ein regulärer Ausdruck verwendet werden:
    - *Matching Daily Plan Date* extrahiert das Tagesplandatum aus der Auftragskennung mit Hilfe des Ausdrucks: *replaceAll($js7OrderId, '^#([0-9]{4}-[0-9]{2}-[0-9]{2})#.*$', '$1')*
    - *Matching Daily Plan Date and Order Name* extrahiert das Tagesplan-Datum und den Auftragsnamen aus der Auftragskennung unter Verwendung des Ausdrucks: *replaceAll($js7OrderId, '^#([0-9]{4}-[0-9]{2}-[0-9]{2})#.*-([^:]*)(?::[^|]*)?([|].*)?$', '$1$2$3')*
    - *Matching Order Name* extrahiert den Auftragsnamen anhand des Ausdrucks: *replaceAll($js7OrderId, '^#[0-9]{4}-[0-9]{2}-[0-9]{2}#.*-([^:]*)(?::[^|]*)?([|].*)?$', '$1$2')*
- **Notizkennung des wartenden Auftrags** sollte denselben Ausdruck enthalten wie die *Notizkennung des sendenden Auftrags*.

### Planbare Notizbretter

- **Notizkennung für sendenden Auftrag** enthält einen konstanten Wert oder einen Ausdruck, der vom sendenden Auftrag abgeleitet ist:
  - Sie können einen leeren Wert oder eine Zeichenkette verwenden, die einen konstanten Wert angibt.
  - Es kann ein regulärer Ausdruck verwendet werden:
    - *Matching Order Name* extrahiert den Auftragsnamen anhand des Ausdrucks: *replaceAll($js7OrderId, '^#[0-9]{4}-[0-9]{2}-[0-9]{2}#.*-([^:]\*)(?::[^|]*)?([|].*)?$', '$1$2')*

### Operationen für Notizbretter

Für verfügbare Operationen siehe [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation).

## Verwendung mit Arbeitsablauf-Anweisungen

Arbeitsablauf-Anweisungen für Notizbretter bieten die folgenden Optionen:

- die **PostNotices Anweisung** enthält die Liste der Notizbretter, für die Notizen veröffentlicht werden. Die Anweisung benötigt keine Optionen.
- die **ExpectNotices Anweisung**, **ConsumeNotices Anweisung** enthalten die folgenden Eingaben:
  - **Ausdruck** gibt Bedingungen von einem oder mehreren Notizbrettern an, die als *true* oder *false* ausgewertet werden:
    - **&amp;&amp;** als eine "und"-Bedingung
    - **||** als eine "oder"-Bedingung
    - **()** Klammern geben die Rangfolge an, nach der die Bedingungen ausgewertet werden.
    - Beachten Sie, dass die Namen der Notizbretter in Ausdrücken in Anführungszeichen gesetzt werden müssen.
    - Beispiele:
      - **'NB1' &amp;&amp; 'NB2'**: erwartet, dass Notizen von beiden Notizbrettern *NB1* und *NB2* vorhanden sind, um als *wahr* ausgewertet zu werden.
      - **( 'NB1' &amp;&amp; 'NB2' ) || 'NB3'**: erwartet, dass Notizen von *NB1* und *NB2* vorhanden sind. Wenn alternativ eine Notiz von *NB3* vorhanden ist, wird der Ausdruck als *true* ausgewertet.
  - **Wenn nicht angekündigt** legt das Verhalten für den Fall fest, dass eine Notiz nicht angekündigt wurde. Dies gilt für Tage, an denen kein Auftrag für einen Arbeitsablauf verfügbar ist.
    - **Warten** ist die Standardeinstellung und bewirkt, dass die Aufträge auf das Vorhandensein von Notizen warten, unabhängig davon, ob sie angekündigt wurden oder nicht.
    - **Ausführen** ist für die *ConsumeNotices Anweisung* verfügbar und veranlasst Aufträge, die Blockanweisung auszuführen, falls die Notiz nicht angekündigt ist.
    - **Überspringen** veranlasst die Aufträge, die Anweisung zu überspringen, wenn keine Notiz angekündigt ist.

## Referenzen

### Kontext-Hilfe

- [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation)
- [Regeln zur Benennung von Objekten](/object-naming-rules)
- [Ressourcen - Notizbretter](/resources-notice-boards)
- [Tagesplan - Abhängigkeiten](/daily-plan-dependencies)

### Product Knowledge Base

- [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  - [JS7 - Plannable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Plannable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)  
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)
