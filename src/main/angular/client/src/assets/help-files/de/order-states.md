# Quellen für Aufträge

Aufträge können aus den folgenden Quellen hinzugefügt werden:

- Aufträge, die von der [Tagesplan](/daily-plan)
- Aufträge, die bei Bedarf von Benutzern aus der Ansicht [Workflows](/workflows) hinzugefügt werden
- Aufträge, die von Dateiauftragsquellen hinzugefügt wurden, die Verzeichnisse auf eingehende Dateien überwachen

## Auftragsstatus

Die folgenden *Auftragszustände* sind verfügbar:

- **Ausstehend** Aufträge wurden zu Arbeitsabläufen hinzugefügt, ohne dass eine Startzeit angegeben wurde, sie können später mit einer Startzeit versehen werden.
- **Geplant** Aufträge wurden zu Arbeitsabläufen hinzugefügt und sind für die Ausführung zu einem späteren Zeitpunkt geplant.
- **In Bearbeitung** Aufträge werden durch Arbeitsabläufe bearbeitet, aber es läuft kein Job. 
- **Laufend** Aufträge befinden sich in der Ausführung eines Auftrags. 
- **Ausgesetzt** Aufträge wurden durch einen Benutzereingriff angehalten und können wieder aufgenommen werden.
- **Abgeschlossen** Aufträge haben einen Arbeitsablauf beendet, wurden aber nicht entfernt, z.B. wenn eine Dateiauftragsquelle für die Dateibeobachtung verwendet wird und der Arbeitsablauf eingehende Dateien nicht (erneut) verschieben würde. In diesem Fall bleibt der Auftrag so lange bestehen, wie die Datei im Eingangsverzeichnis vorhanden ist.
- **Prompting** Aufträge werden durch die *Prompt Instruction* in einem Arbeitsablauf in die Warteschleife gestellt und erfordern eine Bestätigung des Benutzers, um die Ausführung des Arbeitsablaufs fortzusetzen.
- **Wartend** Aufträge warten auf eine Ressource, z.B. eine *Ressourcensperre*, eine *Benachrichtigung*, ein *Retry*- oder *Cycle*-Intervall oder auf einen Prozess, falls der verwendete Agent ein Prozesslimit angibt, das überschritten wird.
- **Blockierte** Aufträge können nicht gestartet werden, z.B. wenn der Agent nicht erreichbar ist, seit der Auftrag hinzugefügt wurde.
- **Fehlgeschlagene** Aufträge zeigen an, dass ein Auftrag fehlgeschlagen ist oder dass eine *Fehleranweisung* die Ausführung des Auftrags verhindert. 

Wenn Sie auf die angegebene Anzahl von Aufträgen klicken, gelangen Sie auf die Seite [Orders Overview](/orders-overview), auf der die Aufträge im Detail angezeigt werden.

## Referenzen

- [Tagesplan](/daily-plan)
- [Orders Overview](/orders-overview)
- [Workflows](/workflows)
- [JS7 - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Orders)
- [JS7 - Order State Transitions](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+State+Transitions)

