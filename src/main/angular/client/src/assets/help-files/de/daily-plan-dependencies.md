# Tagesplan - Abhängigkeiten

Abhängigkeiten in Arbeitsabläufen können z.B. für alle Tage und für bestimmte Tage des [Tagesplans](/daily-plan) erzwungen werden:

- Arbeitsablauf 1 läuft von Montag bis Freitag.
- Arbeitsablauf 2 läuft Mo-So und hängt von der vorherigen Ausführung von Arbeitsablauf 1 ab.
- An Wochenenden wird Arbeitsablauf 1 nicht gestartet. Um den Start von Arbeitsablauf 2 an Wochenenden zu ermöglichen, wird die Abhängigkeit mit Hilfe von *Planbaren Notizbrettern* auf den Tagesplan abgebildet: Wenn kein Auftrag für Arbeitsablauf 1 angekündigt ist, wird die Abhängigkeit ignoriert.

## Kalender

Der Kalender bietet Ihnen die Möglichkeit, ein Tagesplandatum auszuwählen, für das Abhängigkeiten angezeigt werden sollen.

- **Hellrote Farbe**: Zurückliegende Tage des Plans, die geschlossen sind und für die keine Aufträge hinzugefügt werden können.
- **Grüne Farbe**: Zurückliegende und zukünftige Tage des Plans, die offen sind und das Hinzufügen von Aufträgen erlauben.

Operationen an Tagen des Plans umfassen:

- **Plan öffnen**: Dies geschieht automatisch, wenn Aufträge für einen Tag des Plans hinzugefügt werden. Benutzer können einen geschlossenen Plan wieder öffnen.
- **Plan schließen**: Ein offener Plan wird geschlossen und erlaubt keine neuen Aufträge. Dies geschieht automatisch für zurückliegende Tage des Plans mit einer Verzögerung von einem Tag. Benutzer können die entsprechende Einstellung auf der Seite [Einstellungen - Tagesplan](/settings-daily-plan) ändern. Sie können einen offenen Plan früher schließen, um zu verhindern, dass weitere Aufträge hinzugefügt werden.

## Anzeige von Abhängigkeiten

Die folgenden Objekte werden angezeigt:

- **Sendender Arbeitsablauf**: Auf der linken Seite wird der Arbeitsablauf angezeigt, der Notizen sendet.
- **Noitz**: Im mittleren Bereich wird der Name des Notizbretts angezeigt, das die Notiz erstellt.
- **Empfangender Arbeitsablauf**: Auf der rechten Seite wird der Arbeitsablauf angezeigt, der die Notiz erwartet oder verbraucht.

Die folgenden Beziehungen werden angezeigt:

- **Sendender Arbeitsablauf**: Erstellt eine oder mehrere Notizen, die von einem oder mehreren *Empfangenden Arbeitsabläufen* erwartet/verbraucht werden.
- **Empfangende Arbeitsabläufe**: Erwartet/verbraucht eine oder mehrere Notizen von demselben oder unterschiedlichen *Sendenden Arbeitsabläufen*.

Der Erfüllungsstatus von Abhängigkeiten wird durch Linien angezeigt:

- **Linie in blauer Farbe**: Eine Notiz ist für einen zukünftigen Zeitpunkt angekündigt, an dem der Auftrag des *Sendenden Arbeitsablaufs* beginnen und die Notiz erstellen wird.
- **Linie in grünlicher Farbe**: Die Abhängigkeit ist ungelöst, eine Notiz wurde gesendet, aber noch nicht von allen *Empfangenden Arbeitsabläufen* verarbeitet.
  - **Empfangende Arbeitsabläufe in grünlicher Farbe**: Der Auftrag des *Empfangenden Arbeitsablaufs* ist gestartet, aber noch nicht zu der Arbeitsablauf-Anweisung fortgeschritten, die Notizen prüft.
  - **Empfangende Arbeitsabläufe in blauer Farbe**: Der Auftrag des *Empfangenden Arbeitsablaufs* ist für einen späteren Zeitpunkt im Laufe des Tages eingeplant.
- **Linie in grauer Farbe**: Die Abhängigkeit ist aufgelöst, die Notiz wurde gesendet und von einem *Empfangenden Arbeitsablauf* verbraucht.

## Filter

Mit Filtern können Sie die Anzeige von Arbeitsabläufen und Abhängigkeiten einschränken:

- **Angekündigte Notizen**: Zeigt Arbeitsabläufe an, für die Notizen angekündigt sind, d.h. Aufträge sind geplant, haben aber noch nicht begonnen und die Notiz wurde noch nicht gesendet. Wenn eine Notiz gesendet wird, wird ihre Ankündigung gelöscht.
- **Ankündigung vorhanden**: Zeigt die Arbeitsabläufe an, für die Notizen veröffentlicht wurden und verarbeitet werden können. Wenn eine Notiz von einem Arbeitsablauf verbraucht wird, wird sie gelöscht und ist nicht mehr vorhanden.

Wenn beide Filterschaltflächen aktiv sind, werden angekündigte und gesendete Notizen angezeigt, aber Abhängigkeiten, die aufgelöst wurden und für die Notizen verbraucht wurden und nicht mehr vorhanden sind, werden ausgeschlossen.

Wenn beide Filterschaltflächen inaktiv sind, werden alle Arbeitsabläufe und Abhängigkeiten angezeigt, einschließlich der Notizen, die angekündigt wurden, die gesendet wurden oder die verbraucht wurden.

## Referenzen

### Kontext-Hilfe

- [Einstellungen - Tagesplan](/settings-daily-plan)
- [Konfiguration - Inventar - Notizbretter](/configuration-inventory-notice-boards)
- [Ressourcen - Notizbretter](/resources-notice-boards)
- [Tagesplan](/daily-plan)

### Product Knowledge Base

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  - [JS7 - Plannable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Plannable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)  
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)
