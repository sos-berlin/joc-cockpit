# Berichtsmuster

## Berichtsmuster: Top n Arbeitsabläufe mit der höchsten/niedrigsten Anzahl an fehlgeschlagenen Ausführungen

Die Berichtsmuster zählt die fehlgeschlagenen Ausführungen des Arbeitsablaufs:

- Ein Arbeitsablauf gilt als fehlgeschlagen, wenn der Auftrag den Arbeitsablauf mit einem erfolglosen Ergebnis verlässt, z.B. wenn ein Auftrag storniert wird oder wenn eine [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction) verwendet wird, die ein erfolgloses Ergebnis anzeigt.
- Ein Arbeitsablauf gilt nicht als fehlgeschlagen, nur weil ein Auftrag fehlgeschlagen ist. Wenn z.B. [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction) verwendet wird, kann ein späterer Wiederholungsversuch eines Auftrags erfolgreich sein. Stattdessen wird der resultierende Historie-Status eines Auftrags berücksichtigt.

## Berichtsmuster: Top n Jobs mit der höchsten/niedrigsten Anzahl von fehlgeschlagenen Ausführungen

Die Berichtsmuster zählt die fehlgeschlagenen Auftragsausführungen.

- Die Ausführung eines Shell-Jobs wird anhand des Exit-Codes des Jobs und der optionalen Ausgabe im stderr-Kanal als fehlgeschlagen betrachtet.
- Die Ausführung eines JVM-Auftrags wird anhand des Ergebnisses des Auftrags, das Ausnahmen enthalten kann, als fehlgeschlagen betrachtet.

## Berichtsmuster: Top n Agents mit der höchsten/niedrigsten Anzahl von parallelen Jobausführungen

Die Berichtsmuster zählt parallele Jobausführungen mit Agenten. Ein Auftrag1 wird als parallel zu Auftrag2 betrachtet, wenn

- Job1 startet, nachdem Job2 gestartet wurde und bevor Job2 endet oder
- Job1 endet nach dem Start von Job2 und vor dem Ende von Job2.

## Berichtsmuster: Top n hochkritische Jobs mit der höchsten/niedrigsten Anzahl an fehlgeschlagenen Ausführungen

Die Berichtsmuster zählt die fehlgeschlagenen Ausführungen von Jobs mit kritischer Wichtigkeit. Die Kritikalität ist ein Job-Attribut, siehe JS7 - Job Instruction.

Die Zählung erfolgt ähnlich wie bei der Berichtsmuster: Top n Jobs mit der höchsten/niedrigsten Anzahl an fehlgeschlagenen Ausführungen.

## Berichtsmuster: Top n Arbeitsabläufe mit der höchsten/niedrigsten Anzahl fehlgeschlagener Ausführungen für stornierte Aufträge

Die Berichtsmuster zählt fehlgeschlagene Arbeitsabläufe aufgrund von Aufträgen, die storniert wurden.

Der Vorgang *stornieren* wird durch einen Benutzereingriff auf einen Auftrag angewendet.

## Berichtsmuster: Top n Arbeitsabläufe mit höchstem/niedrigstem Bedarf an Ausführungszeit

Die Berichtsmuster berücksichtigt die Dauer erfolgreicher Ausführungen von Arbeitsabläufen. Fehlgeschlagene Ausführungen von Arbeitsabläufen werden nicht berücksichtigt.

## Berichtsmuster: Top n Jobs mit höchstem/niedrigstem Bedarf an Ausführungszeit

Die Berichtsmuster berücksichtigt die Dauer der erfolgreichen Job-Ausführungen. Fehlgeschlagene Job-Ausführungen werden nicht berücksichtigt.

## Berichtsmuster: Top n Perioden mit der höchsten/niedrigsten Anzahl von Job-Ausführungen

Die Berichtsmuster unterteilt den Berichtszeitraum in Schritte. Die Dauer eines Schritts wird durch die Einstellung *Schrittdauer* in der [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration) bestimmt. Der Beginn des nächsten Schritts wird durch die Einstellung "Schrittüberlappung" in der Berichtskonfiguration bestimmt.

Beispiel: 

- Schritt Dauer: 5m
- Schritt Überlappung: 2m
  - 00:00-00:05
  - 00:02-00:07
  - 00:04-00:09

Die Anzahl der Jobs in Ausführung wird pro Schritt gezählt.

## Berichtsmuster: Top n Perioden mit der höchsten/niedrigsten Anzahl von Arbeitsabläufen in Ausführung

Die Berichtsmuster unterteilt den *Berichtszeitraum* in Schritte. Die Dauer eines Schritts wird durch die Einstellung *Schrittdauer* in der [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration) bestimmt. Der Beginn des nächsten Schritts wird durch die Einstellung *Schrittüberlappung* in der Berichtskonfiguration bestimmt.

Die Anzahl der Aufträge in Ausführung wird pro Schritt gezählt.

## Berichtsmuster: Top n Aufträge mit der höchsten/niedrigsten Anzahl erfolgreicher Ausführungen

Die Berichtsmuster zählt Aufträge, die erfolgreich ausgeführt wurden. Fehlgeschlagene Aufträge werden nicht berücksichtigt.

Mögliche Gründe für fehlgeschlagene Aufträge finden Sie unter Berichtsmuster: Top n Jobs mit der höchsten/niedrigsten Anzahl an fehlgeschlagenen Ausführungen.

## Berichtsmuster: Top n Arbeitsabläufe mit der höchsten/niedrigsten Anzahl erfolgreicher Ausführungen

Die Berichtsmuster zählt Arbeitsabläufe, die erfolgreich abgeschlossen wurden. Fehlgeschlagene Ausführungen von Arbeitsabläufen werden nicht berücksichtigt.

Die Gründe für einen fehlgeschlagenen Arbeitsablauf finden Sie unter *Berichtsmuster: Top n Arbeitsabläufe mit der höchsten/niedrigsten Anzahl von fehlgeschlagenen Ausführungen*.

## Referenzen

### Kontext-Hilfe

- [Konfiguration - Inventar - Berichtsmustern](/configuration-inventory-reports)
- [Berichte](/reports)
- [Berichtsgenerierung](/report-creation)
- [Historie Berichtsläufe](/report-run-history)

### Product Knowledge Base

- Berichte
  - [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration)
  - [JS7 - Reports - Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Templates)
- Arbeitsablauf-Anweisungen
  - [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction)
  - [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction)
