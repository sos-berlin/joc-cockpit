# Übersicht - Aufträge

Der Bereich *Aufträge* enthält Informationen zu Aufträgen aus den folgenden Quellen:

- Aufträge des [Tagesplans](/daily-plan)
- Aufträge, die bei Bedarf von Benutzern aus der Ansicht [Arbeitsabläufe](/workflows) hinzugefügt wurden
- Aufträge, die von [Dateiauftragsquellen](/configuration-inventory-file-order-sources) hinzugefügt wurden, die Verzeichnisse auf eingehende Dateien überwachen

<img src="dashboard-orders-de.png" alt="Orders" width="330" height="140" />

## Auftragszustände

Der Bereich *Aufträge* enthält Informationen über den aktuellen Zustand von Aufrägen. Der Bereich wird aktualisiert, wenn sich der Zustand von Aufträgen ändert.

- **Anstehende** Aufträge wurden zu Arbeitsabläufen hinzugefügt, ohne dass eine Startzeit angegeben wurde, sie können später mit einer Startzeit versehen werden.
- **Eingeplante** Aufträge wurden zu Arbeitsabläufen hinzugefügt und sind für die Ausführung zu einem späteren Zeitpunkt geplant.
- **Fortschreitende** Aufträge werden durch Arbeitsabläufe verarbeitet, aber es läuft kein Job. 
- **Ausführende** Aufträge befinden sich in der Ausführung eines Jobs. 
- **Ausgesetzte** Aufträge wurden durch einen Benutzereingriff angehalten und können wieder aufgenommen werden.
- **Abgeschlossene** Aufträge haben einen Arbeitsablauf beendet, wurden aber nicht entfernt, z.B. wenn eine Dateiauftragsquelle für die Dateiüberwachung verwendet wird und der Arbeitsablauf eingehende Dateien nicht verschiebt oder löscht. In diesem Fall bleibt der Auftrag so lange bestehen, wie die Datei im Eingangsverzeichnis vorhanden ist.
- **Anfragende** Aufträge werden durch die *Prompt Anweisung* in einem Arbeitsablauf in eine Warteschleife gestellt und erfordern eine Bestätigung des Benutzers, um die Ausführung des Arbeitsablaufs fortzusetzen.
- **Wartende** Aufträge warten auf eine Ressource, z.B. eine *Ressourcen-Sperre*, eine *Notiz*, ein *Wiederholungs*- oder *Zyklus*-Intervall oder auf einen Prozess, falls der verwendete Agent ein Prozesslimit konfiguriert, das überschritten wird.
- **Blockierte** Aufträge können nicht gestartet werden, z.B. wenn der Agent nicht erreichbar ist, seit der Auftrag hinzugefügt wurde.
- **Fehlgeschlagene** Aufträge zeigen an, dass ein Auftrag fehlgeschlagen ist oder dass eine *Fail Anweisung* die Ausführung des Auftrags verhindert. 

Wenn Sie auf die angegebene Anzahl von Aufträgen klicken, gelangen Sie auf die Seite [Auftragsübersicht](/orders-overview), auf der die Aufträge im Detail angezeigt werden.

## Filter

Über die Schaltfläche in der oberen rechten Ecke des Fensters können Sie Aufträge aus einem Datumsbereich auswählen:

- **Alle** zeigt alle beim Controller und den Agenten verfügbaren Aufträge an.
- **Heute** Aufträge beziehen sich auf den aktuellen Tag, der aus der Zeitzone im [Profil - Einstellungen](/profile-preferences) des Benutzers berechnet wird.
  - **Anstehende** Aufträge ohne Startzeit,
  - **Eingeplante** Aufträge mit einer Startzeit für den aktuellen Tag,
  - **Fortschreitende** Aufträge von einem beliebigen Datum in der Vergangenheit,
  - **Ausführende** Aufträge von einem beliebigen Datum in der Vergangenheit,
  - **Ausgesetzte** Aufträge von einem beliebigen Datum in der Vergangenheit,
  - **Abgeschlossene** Aufträge von einem beliebigen Datum in der Vergangenheit,
  - **Anfragende** Aufträge von einem beliebigen Datum in der Vergangenheit,
  - **Wartende** Aufträge von einem beliebigen Datum in der Vergangenheit,
  - **Blockierte** Aufträge von einem beliebigen Datum in der Vergangenheit,
  - **Fehlgeschlagene** Aufträge aus der Vergangenheit.
- **Nächste Stunde** enthält Aufträge, die für die nächste Stunde *eingeplant* sind.
- **Nächste 12 Stunden** enthält Aufträge, die für die nächsten 12 Stunden *eingeplant* sind.
- **Nächste 24 Stunden** enthält Aufträge, die für die nächsten 24 Stunden *eingeplant* sind.
- **Nächster Tag** enthält Aufträge, die bis zum Ende des nächsten Tages *eingeplant* sind.
- **Nächste 7 Tage** umfasst Aufträge, die bis zum Ende der nächsten 7 Tage *eingeplant* sind.

## Referenzen

### Kontext-Hilfe

- [Arbeitsabläufe](/workflows)
- [Auftragsübersicht](/orders-overview)
- [Dateiauftragsquellen](/configuration-inventory-file-order-sources)
- [Profil - Einstellungen](/profile-preferences)
- [Tagesplan](/daily-plan)

### Product Knowledge Base

- [JS7 - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Orders)
- [JS7 - Order State Transitions](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+State+Transitions)
