# Übersicht - Auftragszustände

Aufträge können aus den folgenden Quellen hinzugefügt werden:

- Aufträge des [Tagesplans](/daily-plan)
- Aufträge, die bei Bedarf von Benutzern aus der Ansicht [Arbeitsabläufe](/workflows) hinzugefügt werden
- Aufträge, die von [Dateiauftragsquellen](/configuration-inventory-file-order-sources) hinzugefügt wurden, die Verzeichnisse auf eingehende Dateien überwachen

Die Zustände aktueller Aufträge werden in der Ansicht *Übersicht* angezeigt:

<img src="dashboard-orders-de.png" alt="Orders" width="330" height="140" />

## Auftragszustände

Die folgenden *Auftragszustände* sind verfügbar:

- **Anstehende** Aufträge wurden zu Arbeitsabläufen hinzugefügt, ohne dass eine Startzeit angegeben wurde, sie können später mit einer Startzeit versehen werden.
- **Eingeplante** Aufträge wurden zu Arbeitsabläufen hinzugefügt und sind für die Ausführung zu einem späteren Zeitpunkt geplant.
- **Fortschreitende** Aufträge werden durch Arbeitsabläufe verarbeitet, aber es läuft kein Job. 
- **Ausführende** Aufträge befinden sich in der Ausführung eines Jobs. 
- **Ausgesetzte** Aufträge wurden durch einen Benutzereingriff angehalten und können wieder aufgenommen werden.
- **Abgeschlossene** Aufträge haben einen Arbeitsablauf beendet, wurden aber nicht entfernt, z.B. wenn eine Dateiauftragsquelle für die Dateiüberwachung verwendet wird und der Arbeitsablauf eingehende Dateien nicht verschiebt oder löscht. In diesem Fall bleibt der Auftrag so lange bestehen, wie die Datei im Eingangsverzeichnis vorhanden ist.
- **Anfragende** Aufträge werden durch die *Prompt Anweisung* in einem Arbeitsablauf in eine Warteschleife gestellt und erfordern eine Bestätigung des Benutzers, um die Ausführung des Arbeitsablaufs fortzusetzen.
- **Wartende** Aufträge warten auf eine Ressource, z.B. eine *Ressourcen-Sperre*, eine *Notiz*, ein *Wiederholungs*- oder *Zyklus*-Intervall oder auf einen Prozess, falls der verwendete Agent ein Prozesslimit konfiguriert, das überschritten wird.
- **Blockierte** Aufträge können nicht gestartet werden, z.B. wenn der Agent nicht erreichbar ist, seit der Auftrag hinzugefügt wurde.
- **Fehlgeschlagene** Aufträge zeigen an, dass ein Auftrag fehlgeschlagen ist oder dass eine *Fail Anweisung* die erfolgreiche Ausführung des Auftrags verhindert. 

Wenn Sie auf die angegebene Anzahl von Aufträgen klicken, gelangen Sie auf die Seite [Auftragsübersicht](/orders-overview), auf der die Aufträge im Detail angezeigt werden.

## Referenzen

### Kontext-Hilte

- [Arbeitsabläufe](/workflows)
- [Auftragsübersicht](/orders-overview)
- [Dateiauftragsquellen](/configuration-inventory-file-order-sources)
- [Tagesplan](/daily-plan)

### Product Knowledge Base

- [JS7 - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Orders)
- [JS7 - Order State Transitions](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+State+Transitions)
