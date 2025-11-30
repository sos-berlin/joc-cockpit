# Befehle

Das Panel *Aufträge* enthält Informationen zu Aufträgen aus den folgenden Quellen:

- Aufträge, die von der [Daily Plan](/daily-plan)
- Aufträge, die bei Bedarf von Benutzern aus der Ansicht [Workflows](/workflows) hinzugefügt wurden
- Aufträge, die von [File Order Sources](/configuration-inventory-file-order-sources) hinzugefügt wurden, das Verzeichnisse auf eingehende Dateien überwacht

<img src="dashboard-orders.png" alt="Orders" width="330" height="140" />

## Status der Bestellung

Das Panel *Orders* enthält Informationen über den aktuellen Status von Orders. Das Panel wird aktualisiert, wenn sich der Status von Orders ändert.

- **Ausstehende** Aufträge wurden zu Workflows hinzugefügt, ohne dass eine Startzeit angegeben wurde; ihnen kann später eine Startzeit zugewiesen werden.
- **Geplant** Aufträge wurden zu Workflows hinzugefügt und sind für die Ausführung zu einem späteren Zeitpunkt vorgesehen.
- **In Progress** Aufträge werden durch Workflow-Anweisungen verarbeitet, aber es läuft kein Job. 
- **Laufend** Aufträge werden gerade von einem Job ausgeführt. 
- **Ausgesetzt** Aufträge wurden durch einen Benutzereingriff angehalten und können wieder aufgenommen werden.
- **Abgeschlossene** Aufträge haben einen Workflow beendet, wurden aber nicht entfernt, z.B. wenn eine Dateiauftragsquelle für die Dateibeobachtung verwendet wird und der Workflow eingehende Dateien nicht (erneut) verschieben würde. In diesem Fall bleibt der Auftrag so lange bestehen, wie die Datei im Eingangsverzeichnis vorhanden ist.
- **Aufforderung** Aufträge werden durch die *Aufforderungsanweisung* in einem Workflow angehalten und erfordern eine Bestätigung des Benutzers, um die Ausführung des Workflows fortzusetzen.
- **Wartende** Aufträge warten auf eine Ressource, z.B. eine *Ressourcensperre*, eine *Benachrichtigung*, eine *Wiederholung* oder ein *Zyklus*-Intervall, oder auf einen Prozess, falls der verwendete Agent ein Prozesslimit angibt, das überschritten wird.
- **Blockierte** Aufträge können nicht gestartet werden, z.B. wenn der Agent nicht erreichbar ist, seit der Auftrag hinzugefügt wurde.
- **Fehlgeschlagene** Aufträge zeigen an, dass ein Auftrag fehlgeschlagen ist oder dass eine *Fehleranweisung* die Fortführung des Auftrags verhindert. 

Wenn Sie auf die angegebene Anzahl von Aufträgen klicken, gelangen Sie auf die Seite [Orders Overview](/orders-overview), auf der die Aufträge im Detail angezeigt werden.

## Filter

Über die Dropdown-Schaltfläche in der oberen rechten Ecke des Fensters können Sie Bestellungen aus einem Datumsbereich auswählen:

- **Alle** zeigt alle beim Controller und den Agenten verfügbaren Aufträge an.
- **Heute** Aufträge beziehen sich auf den aktuellen Tag, der aus der Zeitzone im [Profile - Preferences](/profile-preferences) des Benutzers berechnet wird.
  - **Ausstehend** Aufträge ohne Startzeit,
  - **Geplante** Aufträge mit einer Startzeit für den aktuellen Tag,
  - **In Bearbeitung** Aufträge von einem beliebigen Datum in der Vergangenheit,
  - **Laufende** Aufträge von einem beliebigen Datum in der Vergangenheit,
  - **Ausgesetzte** Aufträge von einem beliebigen Datum in der Vergangenheit,
  - **Erledigte** Aufträge von einem beliebigen Datum in der Vergangenheit,
  - **Aufrufende** Aufträge von einem beliebigen Datum in der Vergangenheit,
  - **Wartende** Aufträge von einem beliebigen Datum in der Vergangenheit,
  - **Gesperrte** Aufträge von einem beliebigen Datum in der Vergangenheit,
  - **Fehlgeschlagene** Orders aus der Vergangenheit.
- **Nächste Stunde** enthält Aufträge, die für die nächste Stunde *geplant* sind.
- **Nächste 12 Stunden** enthält Aufträge, die für die nächsten 12 Stunden *geplant* sind.
- **Nächste 24 Stunden** enthält Aufträge, die für die nächsten 24 Stunden *geplant* sind.
- **Nächster Tag** enthält Aufträge, die bis zum Ende des nächsten Tages geplant* sind.
- **Nächste 7 Tage** umfasst Aufträge, die bis zum Ende der nächsten 7 Tage geplant* sind.

## Referenzen

### Kontext-Hilfe

- [Daily Plan](/daily-plan)
- [File Order Sources](/configuration-inventory-file-order-sources)
- [Orders Overview](/orders-overview)
- [Profile - Preferences](/profile-preferences)
- [Workflows](/workflows)

### Product Knowledge Base

- [JS7 - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Orders)
- [JS7 - Order State Transitions](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+State+Transitions)

