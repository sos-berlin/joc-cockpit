# Überwachung - Verfügbarkeit - Agent

Die Ansicht zeigt Indikatoren für die Verfügbarkeit von Agenten an.

Wenn ein Agent Cluster verwendet wird, wird die Verfügbarkeit des Cluster berücksichtigt. Wenn z.B. ein Agent in einem Cluster zu Wartungszwecken abgeschaltet wird und die verbleibende Instanz die Verarbeitung übernimmt, wird die Verfügbarkeit dadurch nicht beeinträchtigt.

In der rechten oberen Ecke des Bildschirms finden Sie das Kontrollkästchen *Aktueller Controller*: Wenn es nicht markiert ist, wird die Verfügbarkeit für Agenten von allen verbundenen Controller Instanzen angezeigt, andernfalls werden die Informationen nur für Agenten angezeigt, die bei dem aktuell ausgewählten Controller registriert sind.

Benutzer sollten sich bewusst sein, dass die historischen Daten zur Agentenverfügbarkeit vom [Bereinigungsdienst](/service-cleanup) gelöscht werden.

## Filter

In der oberen rechten Ecke des Bereichs können Sie einen Datumsbereich für die Anzeige der Verfügbarkeit auswählen:

- **Woche** schaltet den Datumsschieberegler auf den Zeitraum einer Woche um.
- **Monat** schaltet den Datumsschieberegler für den Zeitraum eines Monats um.
- **Bereich** legt ein individuelles Start- und Enddatum fest.

## Laufzeit

Zeigt den Prozentsatz, für den bestätigt wird, dass Agenten im angegebenen Zeitraum verfügbar waren.

## Statistik

Zeigt die Verfügbarkeit in einem Balkendiagramm auf Tagesbasis im angegebenen Zeitraum an. Jeder Agent wird einzeln pro Tag angezeigt. 

## Übersicht

Zeigt die Verfügbarkeit pro Agent und Tag im angegebenen Zeitraum an.

- Die Grafik zeigt in grüner Farbe die Stunden an, für die die Verfügbarkeit der Agenten bestätigt ist. 
- Die rote Farbe zeigt die Nichtverfügbarkeit an.
- Die graue Farbe zeigt fehlende Daten an.

## Referenzen

- [Bereinigungsdienst](/service-cleanup)
- [Überwachung - Verfügbarkeit - Controller](/monitor-availability-controller)
- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
