# Überwachung - Verfügbarkeit - Controller

Die Ansicht zeigt Indikatoren für die Verfügbarkeit der Controller an.

Wenn ein Controller Cluster verwendet wird, wird die Verfügbarkeit des Cluster berücksichtigt. Wenn z.B. eine Controller Instanz in einem Cluster zu Wartungszwecken abgeschaltet wird und die verbleibende Instanz die Verarbeitung übernimmt, wird die Verfügbarkeit dadurch nicht verringert.

In der rechten oberen Ecke des Bildschirms finden Sie das Kontrollkästchen *Aktueller Controller*: Wenn es nicht markiert ist, wird die Verfügbarkeit für alle angeschlossenen Controller angezeigt, andernfalls werden die Informationen nur für den aktuell ausgewählten Controller angezeigt.

Benutzer sollten sich bewusst sein, dass die historischen Daten zur Controller Verfügbarkeit vom [Bereinigungsdienst](/service-cleanup) gelöscht werden.

## Filter

In der oberen rechten Ecke des Bereichs können Sie einen Datumsbereich für die Anzeige der Verfügbarkeit auswählen:

- **Woche** schaltet den Datumsschieberegler auf den Zeitraum einer Woche um.
- **Monat** schaltet den Datumsschieberegler für den Zeitraum eines Monats um.
- **Bereich** legt ein individuelles Start- und Enddatum fest.

## Laufzeit

Zeigt den Prozentsatz, für den die Verfügbarkeit des Controller im angegebenen Zeitraum bestätigt ist.

## Statistik

Zeigt die Verfügbarkeit in einem Balkendiagramm auf täglicher Basis für den angegebenen Zeitraum an.

## Übersicht

Zeigt die Verfügbarkeit pro Controller und Tag im angegebenen Zeitraum an.

- Die Grafik zeigt in grüner Farbe die Stunden an, für die die Verfügbarkeit des Controller bestätigt ist. 
- Die rote Farbe zeigt die Nichtverfügbarkeit an.
- Die graue Farbe zeigt fehlende Daten an.

## Referenzen

- [Bereinigungsdienst](/service-cleanup)
- [Überwachung - Verfügbarkeit - Agent](/monitor-availability-agent)
- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
