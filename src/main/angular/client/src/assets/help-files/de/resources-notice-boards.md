# Ressourcen - Notizbretter

Die Ansicht *Ressourcen-&gt;Notizbretter* zeigt Informationen über die Nutzung von Notizbrettern an.

Mit Hilfe von Notizbrettern werden Abhängigkeiten zwischen Arbeitsabläufen durch die Verwendung von *Notizen* hergestellt. Eine *Notiz* ist eine Markierung, die an ein Notizbrett angehängt ist oder nicht vorhanden ist. Notizbretter sind in den folgenden Varianten verfügbar:

- **Globale Notizbretter** implementieren *Notizen* auf globaler Ebene, so dass dieselbe *Notiz* jederzeit für jeden Arbeitsablauf verfügbar ist.
- **Planbare Notizbretter** implementieren *Notizen* im Rahmen des [Tagesplan](/daily-plan). Eine *Notiz* existiert im Rahmen eines *Tagesplans*, zum Beispiel
  - Arbeitsablauf 1 läuft von Montag bis Freitag.
  - Arbeitsablauf 2 läuft Mo-So und hängt von der vorherigen Ausführung von Arbeitsablauf 1 ab.
  - An Wochenenden wird Arbeitsablauf 1 nicht gestartet. Damit Arbeitsablauf 2 auch an Wochenenden starten kann, wird die Abhängigkeit mit Hilfe von *Planbaren Notizbrettern* auf den Tagesplan abgebildet: für Tage, an denen kein Auftrag für Arbeitsablauf 1 angekündigt ist, wird die Abhängigkeit ignoriert.

Notizbretter werden in Arbeitsabläufen von den folgenden Anweisungen referenziert:

- **PostNotices Anweisung** sendet eine oder mehrere *Notizen*.
- **ExpectNotices Anweisung** wartet auf das Vorhandensein einer oder mehrerer *Notizen*.
- **ConsumeNotices Anweisung** ist eine Blockanweisung, die
  - eine Reihe von Jobs und anderen Anweisungen im selben Arbeitsablauf umfassen kann,
  - auf das Vorhandensein einer oder mehrerer *Notizen* wartet und die *Notizen* nach Abschluss des Blocks löscht.

## Bereich: Navigation

Die linke Seite zeigt die Struktur der Inventarordner an, die die Notizbretter enthalten.

- Wenn Sie auf einen Ordner klicken, werden die Notizbretter dieses Ordners angezeigt.
- Wenn Sie den Mauszeiger über einen Ordner bewegen, wird das Symbol mit dem Doppelpfeil nach unten angzeigt. Wenn Sie das Symbol klicken, werden die Notizbretter aus diesem Ordner und allen Unterordnern angezeigt.

Mit dem Symbol *Schnellsuche* können Sie auf der Grundlage von Benutzereingaben nach Notizbrettern suchen:

- Wenn Sie **Test** eingeben, werden Notizbretter mit Namen wie *test-board-1* und *TEST-board-2* angezeigt. 
- Wenn Sie **\*Test** eingeben, werden Notizbretter mit Namen wie *test-board-1* und *my-TEST-board-2* angezeigt

## Bereich: Notizbretter

Die Anzeige beinhaltet *Notizbretter*, *Notizen* und Aufträge.

Die Ansicht [Tagesplan - Abhängigkeiten](/daily-plan-dependencies) ist fokussiert auf die Anzeige von *Notizbrettern*, *Notizen* und Aufträgen, die sich auf ein bestimmtes Datum des Tagesplans beziehen.

### Anzeige von Notizbrettern

Die folgenden Informationen werden angezeigt:

- **Name** ist der eindeutige Name eines Notizbretts.
- **Ausrolldatum** ist das Datum, an dem das Notizbrett ausgerollt wurde.
- **Status** ist einer der Werte *synchron* und *nicht synchron*, wenn das Notizbrett noch nicht an den Controller übermittelt wurde.
- **Anzahl Notizen** gibt die Anzahl der *Notizen* für das Notizbrett an.
  - **Globale Notizbretter** enthalten eindeutige *Notizen*.
  - **Planbare Notizbretter** enthalten *Notizen* pro Tagesplandatum.
- **Anzahl wartender Aufträge** zeigt die Anzahl der Aufträge an, die die Veröffentlichung einer *Notiz* erwarten.

### Anzeige von Notizen und Aufträgen

Wenn Sie auf das Pfeil-nach-unten-Symbol klicken, wird das Notizbrett vergrößert und Sie erhalten detaillierte Informationen über *Notizen*, die veröffentlicht wurden, und Aufträge, die auf die Veröffentlichung von *Notizen* warten.

### Operationen für Notizbretter

Die folgenden Operationen sind verfügbar:

- **Notiz senden** veröffentlicht die entsprechende *Notiz* ähnlich wie eine *PostNotices Anweisung*.
- **Notiz löschen** löscht die *Notiz* ähnlich wie eine *ConsumeNotices Anweisung*.

## Suche

 [Resources - Notice Boards - Search](/resources-notice-boards-search) bietet Kriterien für die Suche nach Notizbrettern aus Abhängigkeiten. Wenn Sie z.B. nach Arbeitsabläufen suchen, die einen bestimmten Job-Namen enthalten, werden die von diesem Arbeitsablauf verwendeten Notizbretter angezeigt.

## Referenzen

### Kontext-Hilfe

- [Konfiguration - Inventar - Notizbretter](/configuration-inventory-notice-boards)
- [Ressourcen - Notizbretter - Suche](/resources-notice-boards-search)
- [Tagesplan](/daily-plan)
- [Tagesplan - Abhängigkeiten](/daily-plan-dependencies)

### Product Knowledge Base

- [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  - [JS7 - Plannable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Plannable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)  
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)
