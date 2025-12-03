# Monitor - Agentenverfügbarkeit

Die Ansicht zeigt Indikatoren für die Verfügbarkeit von Agent-Instanzen an.

Wenn ein Agent Cluster verwendet wird, wird die Verfügbarkeit des Clusters berücksichtigt. Wenn z.B. eine Agent-Instanz in einem Cluster zu Wartungszwecken abgeschaltet wird und die verbleibende Instanz die Last übernimmt, wird die Verfügbarkeit dadurch nicht beeinträchtigt.

In der rechten oberen Ecke des Bildschirms finden Sie das Kontrollkästchen *Aktueller Controller*: Wenn es nicht markiert ist, wird die Verfügbarkeit für Agenten von allen verbundenen Controllern angezeigt, andernfalls werden die Informationen nur für Agenten angezeigt, die bei dem aktuell ausgewählten Controller registriert sind.

Benutzer sollten sich darüber im Klaren sein, dass die historischen Daten zur Agentenverfügbarkeit von [Cleanup Service](/service-cleanup) gelöscht werden können.

## Datum-Filter

In der oberen rechten Ecke des Panels können Sie einen Datumsbereich für die Anzeige der Verfügbarkeit auswählen:

- **Woche** schaltet den Datumsschieberegler auf den Zeitraum einer Woche um.
- **Monat** schaltet den Datumsschieberegler für den Zeitraum eines Monats um.
- mit **Bereich** können Sie das Start- und Enddatum festlegen.

## Laufende Zeit

Gibt den Prozentsatz an, für den bestätigt wird, dass Agenten im angegebenen Zeitraum verfügbar sind.

## Statistik

Zeigt die Verfügbarkeit in einem Balkendiagramm auf Tagesbasis im angegebenen Zeitraum an. Jeder Agent wird einzeln pro Tag angezeigt. 

## Übersicht

Zeigt die Verfügbarkeit pro Agent und Tag im angegebenen Zeitraum an.

- Die Grafik zeigt in grüner Farbe die Stunden an, für die die Verfügbarkeit der Agenten bestätigt ist. 
- Die rote Farbe zeigt die Nichtverfügbarkeit an.
- Die graue Farbe zeigt fehlende Daten an.

## Referenzen

- [Cleanup Service](/service-cleanup)
- [Monitor - Availability - Controller](/monitor-availability-controller)
- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)

