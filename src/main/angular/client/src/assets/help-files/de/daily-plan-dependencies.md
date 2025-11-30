# Tagesplan Abhängigkeiten

Workflow-Abhängigkeiten können z.B. für alle Tage und für bestimmte Tagesplan-Termine erzwungen werden:

- Workflow 1 läuft von Montag bis Freitag.
- Workflow 2 läuft Mo-So und hängt von der vorherigen Ausführung von Workflow 1 ab.
- An Wochenenden wird Workflow 1 nicht gestartet. Um den Start von Workflow 2 an Wochenenden zu ermöglichen, wird die Abhängigkeit mit Hilfe von *Schedulable Notice Boards* auf den Tagesplan abgebildet: Wenn kein Auftrag für Workflow 1 angekündigt wird, wird die Abhängigkeit ignoriert.

## Kalender

Das Kalender-Widget bietet Ihnen die Möglichkeit, ein Tagesplan-Datum auszuwählen, für das Abhängigkeiten angezeigt werden sollen.

- **Hellrote Farbe**: Vergangene Plandaten, die geschlossen sind und für die keine Aufträge hinzugefügt werden können.
- **Grüne Farbe**: Vergangene und zukünftige Plandaten, die offen sind und das Hinzufügen von Orders erlauben.

Operationen an Plandaten umfassen:

- **Plan öffnen**: Dies geschieht automatisch, wenn neue Orders für ein Plandatum hinzugefügt werden. Benutzer können einen geschlossenen Plan wieder öffnen.
- **Plan schließen**: Ein offener Plan wird geschlossen und erlaubt keine neuen Orders mehr. Dies geschieht automatisch für vergangene Plandaten mit einer Verzögerung von einem Tag. Benutzer können die entsprechende Einstellung auf der Seite [Settings - Daily Plan](/settings-daily-plan) ändern. Sie können einen offenen Plan früher schließen, um zu verhindern, dass weitere Aufträge hinzugefügt werden.

## Anzeige von Abhängigkeiten

Die folgenden Objekte werden angezeigt:

- **Posting Workflow**: Auf der linken Seite wird der Workflow angezeigt, der Benachrichtigungen bucht.
- **Hinweis**: Im mittleren Bereich wird der Name der Bekanntmachungstafel angezeigt, die die Bekanntmachung erstellt.
- **Empfangs-Workflow**: Auf der rechten Seite wird der Workflow angezeigt, der die Mitteilung erwartet oder konsumiert.

Die folgenden Beziehungen werden angezeigt:

- **Buchender Workflow**: Erstellt eine oder mehrere Benachrichtigungen, die von einem oder mehreren *Empfangenden Workflows* erwartet/verbraucht werden.
- **Empfangende Workflows**: Erwartet/konsumiert eine oder mehrere Nachrichten von demselben oder verschiedenen *Buchungs-Workflows*.

Der Erfüllungsstatus von Abhängigkeiten wird durch Linien angezeigt:

- **Linie in blauer Farbe**: Eine Benachrichtigung ist für einen zukünftigen Zeitpunkt angekündigt, an dem der Auftrag des *Posting Workflows* beginnen und die Benachrichtigung erstellen wird.
- **Linie in grünlicher Farbe**: Die Abhängigkeit ist ungelöst, eine Mitteilung wurde gebucht, aber noch nicht von allen *Empfangenden Workflows* bearbeitet.
  - **Empfangende Workflows in grünlicher Farbe**: Der Auftrag des *Empfangenden Workflows* ist gestartet, aber noch nicht zu der Workflow-Anweisung weitergeleitet worden, die Benachrichtigungen prüft.
  - **Empfangende Workflows in blauer Farbe**: Der Auftrag des *Empfangenden Workflows* ist für einen späteren Zeitpunkt im Laufe des Tages eingeplant.
- **Linie in grauer Farbe**: Die Abhängigkeit ist aufgelöst, die Benachrichtigung wurde versandt und von einem *Empfangenden Workflow* verbraucht.

## Filter

Mit Filtern können Sie die Anzeige von Workflows und Abhängigkeiten einschränken:

- **Bekanntgegebene Mitteilungen**: Zeigt Workflows an, für die Benachrichtigungen angekündigt sind, d.h. Aufträge sind geplant, haben aber noch nicht begonnen und die Benachrichtigung wurde noch nicht veröffentlicht. Wenn eine Mitteilung veröffentlicht wird, wird ihre Ankündigung gelöscht.
- **Bekanntmachungen vorhanden**: Zeigt die Workflows an, für die Bekanntmachungen veröffentlicht wurden und bearbeitet werden können. Wenn eine Notiz von einem Workflow verbraucht wird, wird sie gelöscht und ist nicht mehr vorhanden.

Wenn beide Filterschaltflächen aktiv sind, werden angekündigte und veröffentlichte Meldungen angezeigt, aber Abhängigkeiten, die aufgelöst wurden und für die Meldungen verbraucht wurden und nicht mehr vorhanden sind, werden ausgeschlossen.

Wenn beide Filterschaltflächen inaktiv sind, werden alle Workflows und Abhängigkeiten angezeigt, einschließlich der Meldungen, die angekündigt wurden, die vorhanden sind oder die verbraucht wurden.

## Referenzen

### Kontexthilfe

- [Configuration - Inventory - Notice Boards](/configuration-inventory-notice-boards)
- [Daily Plan](/daily-plan)
- [Resources - Notice Boards](/resources-notice-boards)
- [Settings - Daily Plan](/settings-daily-plan)

### Product Knowledge Base

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  - [JS7 - Schedulable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedulable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)  
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)

