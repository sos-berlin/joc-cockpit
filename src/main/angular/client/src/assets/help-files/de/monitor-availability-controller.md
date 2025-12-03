# Monitor - Controller Verfügbarkeit

Die Ansicht zeigt Indikatoren für die Verfügbarkeit eines Controllers an.

Wenn ein Controller Cluster verwendet wird, wird die Verfügbarkeit des Clusters berücksichtigt. Wenn z.B. eine Controller-Instanz in einem Cluster zu Wartungszwecken abgeschaltet wird und die verbleibende Instanz die Last aufnimmt, wird die Verfügbarkeit dadurch nicht verringert.

In der rechten oberen Ecke des Bildschirms finden Sie das Kontrollkästchen *Aktueller Controller*: Wenn es nicht markiert ist, wird die Verfügbarkeit für alle angeschlossenen Controller angezeigt, andernfalls werden die Informationen nur für den aktuell ausgewählten Controller angezeigt.

Benutzer sollten sich darüber im Klaren sein, dass die historischen Daten zur Controller-Verfügbarkeit von [Cleanup Service](/service-cleanup) gelöscht werden können.

## Datum-Filter

In der oberen rechten Ecke des Panels können Sie einen Datumsbereich für die Anzeige der Verfügbarkeit auswählen:

- **Woche** schaltet den Datumsschieberegler auf den Zeitraum einer Woche um.
- **Monat** schaltet den Datumsschieberegler für den Zeitraum eines Monats um.
- mit **Bereich** können Sie das Start- und Enddatum festlegen.

## Laufende Zeit

Gibt den Prozentsatz an, für den die Verfügbarkeit des Controllers im angegebenen Zeitraum bestätigt wird.

## Statistik

Zeigt die Verfügbarkeit in einem Balkendiagramm auf täglicher Basis für den angegebenen Zeitraum an.

## Übersicht

Zeigt die Verfügbarkeit pro Controller und Tag in dem angegebenen Zeitraum an.

- Die Grafik zeigt in grüner Farbe die Stunden an, für die die Verfügbarkeit des Controllers bestätigt ist. 
- Die rote Farbe zeigt die Nichtverfügbarkeit an.
- Die graue Farbe zeigt fehlende Daten an.

## Referenzen

- [Cleanup Service](/service-cleanup)
- [Monitor - Availability - Agent](/monitor-availability-agent)
- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)

