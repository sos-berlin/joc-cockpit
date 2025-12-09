# Berichtsmuster

## Berichtsmuster: Häufigste n Arbeitsabläufe mit höchster/niedrigster Anzahl fehlgeschlagener Ausführungen

Das Berichtsmuster zählt die fehlgeschlagenen Ausführungen des Arbeitsablaufs:

- Ein Arbeitsablauf gilt als fehlgeschlagen, wenn der Auftrag den Arbeitsablauf mit einem fehlerhaften Ergebnis verlässt, z.B. wenn ein Auftrag abgebrochen wird oder wenn eine [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction) verwendet wird, die ein fehlerhaftes Ergebnis anzeigt.
- Ein Arbeitsablauf gilt nicht als fehlgeschlagen, nur weil ein Auftrag fehlgeschlagen ist. Wenn z.B. [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction) verwendet wird, kann ein späterer Wiederholungsversuch eines Auftrags erfolgreich sein. Stattdessen wird der resultierende Status der Historie eines Auftrags berücksichtigt.

## Berichtsmuster: Häufigste n Jobs mit höchster/niedrigster Anzahl fehlgeschlagener Ausführungen

Das Berichtsmuster zählt die fehlgeschlagenen Job-Ausführungen.

- Die Ausführung eines Shell Jobs wird anhand des Exit-Codes des Jobs und der optionalen Ausgabe im stderr Kanal als fehlgeschlagen betrachtet.
- Die Ausführung eines JVM Jobs wird anhand des Ergebnisses des Auftrags, das Ausnahmen enthalten kann, als fehlgeschlagen betrachtet.

## Berichtsmuster: Häufigste n Agenten mit höchster/niedrigster Anzahl paralleler Job-Ausführungen

Das Berichtsmuster zählt parallele Job-Ausführungen mit Agenten. Ein Auftrag1 wird als parallel zu Auftrag2 betrachtet, wenn

- Job1 startet, nachdem Job2 gestartet wurde und bevor Job2 endet oder
- Job1 endet nach dem Start von Job2 und vor dem Ende von Job2.

## Berichtsmuster: Häufigste n Jobs hoher Kritikalität mit höchster/niedrigster Anzahl fehlgeschlagener Ausführungen

Das Berichtsmuster zählt die fehlgeschlagenen Ausführungen von Jobs mit kritischer Wichtigkeit. Die Kritikalität ist ein Job-Attribut, siehe [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction).

Die Zählung erfolgt ähnlich wie beim Berichtsmuster: *Häufigste n Jobs mit höchster/niedrigster Anzahl fehlgeschlagener Ausführungen*.

## Berichtsmuster: Häufigste n Arbeitsabläufe mit höchster/niedrigster Anzahl fehlgeschlagener Ausführungen für abgebrochene Aufträge

Das Berichtsmuster zählt fehlgeschlagene Arbeitsabläufe aufgrund von Aufträgen, die abgebrochen wurden.

Die Operation *abbrechen* wird durch einen Benutzereingriff auf einen Auftrag angewendet.

## Berichtsmuster: Häufigste n Arbeitsabläufe mit höchster/niedrigster Ausführungsdauer

Das Berichtsmuster berücksichtigt die Dauer erfolgreicher Ausführungen von Arbeitsabläufen. Fehlgeschlagene Ausführungen von Arbeitsabläufen werden nicht berücksichtigt.

## Berichtsmuster: Häufigste n Jobs mit höchster/niedrigster Ausführungsdauer

Das Berichtsmuster berücksichtigt die Dauer der erfolgreichen Job-Ausführungen. Fehlgeschlagene Job-Ausführungen werden nicht berücksichtigt.

## Berichtsmuster: Häufigste n Zeiträume mit höchster/niedrigster Anzahl Arbeitsablauf-Ausführungen

Das Berichtsmuster unterteilt den *Berichtszeitraum* in Schritte. Die Dauer eines Schritts wird durch die Einstellung *Schrittdauer* in der [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration) bestimmt. Der Beginn des nächsten Schritts wird durch die Einstellung *Schrittüberlappung* in der Berichtsvorlage bestimmt.

Die Anzahl der Aufträge in Ausführung wird pro Schritt gezählt.

## Berichtsmuster: Häufigste n Zeiträume mit höchster/niedrigster Anzahl Job-Ausführungen

Das Berichtsmuster unterteilt den Berichtszeitraum in Schritte. Die Dauer eines Schritts wird durch die Einstellung *Schrittdauer* in der [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration) bestimmt. Der Beginn des nächsten Schritts wird durch die Einstellung *Schrittüberlappung* in der Berichtsvorlage bestimmt.

Beispiel: 

- Schritt Dauer: 5m
- Schritt Überlappung: 2m
  - 00:00-00:05
  - 00:02-00:07
  - 00:04-00:09

Die Anzahl der Jobs in Ausführung wird pro Schritt gezählt.

## Berichtsmuster: Häufigste n Arbeitsabläufe mit höchster/niedrigster Anzahl erfolgreicher Ausführungen

Das Berichtsmuster zählt Arbeitsabläufe, die erfolgreich abgeschlossen wurden. Fehlgeschlagene Ausführungen von Arbeitsabläufen werden nicht berücksichtigt.

Die Gründe für einen fehlgeschlagenen Arbeitsablauf finden Sie unter *Berichtsmuster: Häufigste n Arbeitsabläufe mit höchster/niedrigster Anzahl fehlgeschlagener Ausführungen*.

## Berichtsmuster: Häufigste n Jobs mit höchster/niedrigster Anzahl erfolgreicher Ausführungen

Das Berichtsmuster zählt Aufträge, die erfolgreich ausgeführt wurden. Fehlgeschlagene Aufträge werden nicht berücksichtigt.

Mögliche Gründe für fehlgeschlagene Aufträge finden Sie unter Berichtsmuster: *Häufigste n Jobs mit höchster/niedrigster Anzahl fehlgeschlagener Ausführungen*.

## Referenzen

### Kontext-Hilfe

- [Berichte](/reports)
- [Berichtsgenerierung](/report-creation)
- [Historie Berichtsläufe](/report-run-history)
- [Konfiguration - Inventar - Berichtsmustern](/configuration-inventory-reports)

### Product Knowledge Base

- Berichte
  - [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration)
  - [JS7 - Reports - Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Templates)
- Arbeitsablauf-Anweisungen
  - [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
  - [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction)
  - [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction)
