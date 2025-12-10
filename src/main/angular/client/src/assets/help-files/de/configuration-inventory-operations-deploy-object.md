# Konfiguration - Inventar - Operationen - Objekt ausrollen

Das Ausrollen von Objekten bedeutet, dass sie auf einen oder mehrere Controller übertragen werden. Dies gilt für Objekte wie Arbeitsabläufe und Job-Ressourcen, die über den Systemordner *Controller* verfügbar sind.

Die Ansicht *Konfiguration-&gt;Inventar* bietet die Möglichkeit, ein einzelnes Objekt auszurollen und Objekte aus Ordnern auszurollen, siehe [Ordner ausrollen](/configuration-inventory-operations-deploy-folder).

Wenn Sie ein einzelnes Objekt über die entsprechende Schaltfläche *Ausrollen* übertragen, wird ein Popup-Fenster wie das folgende angezeigt:

<img src="deploy-workflow.png" alt="Deploy Workflow" width="600" height="460" />

## Ausrollen für Controller

Das Eingabefeld **Controller** akzeptiert einen oder mehrere Controller, für die das Objekt ausgerollt werden soll.

Standardmäßig wird der aktuell ausgewählte Controller verwendet.

## Aktualisieren des Tagesplans

Das Ausrollen von Objekten wie Arbeitsabläufen, Zeitplänen und Kalendern wirkt sich auf den [Tagesplan](/daily-plan) aus. Häufig soll die aktualisierte Version eines Objekts für Aufträge im Tagesplan verwendet werden. Die Benutzer steuern das Verhalten über die folgenden Optionen:

- **Tagesplan aktualisieren**
  - **Jetzt** legt die Aktualisierung des Tagesplans für Aufträge fest, die für einen Zeitpunkt ab jetzt geplant sind.
  - **Startdatum** öffnet ein Eingabefeld für das Zieldatum, ab dem der Tagesplan aktualisiert werden soll.
  - **Nein** legt fest, dass der Tagesplan nicht aktualisiert werden soll. Bestehende Aufträge bleiben bei der Verwendung der zuvor eingesetzten Versionen von Objekten.
- **Heutige verspätete Aufträge einbeziehen** Wenn diese Option aktiviert ist, werden auch Aufträge berücksichtigt, die für einen zurückliegenden Zeitpunkt des aktuellen Tages geplant wurden, aber verspätet sind und nicht gestartet wurden.

## Abhängigkeiten einbeziehen

Inventarobjekte sind durch Abhängigkeiten miteinander verbunden, siehe [Abhängigkeitsmatrix](/dependencies-matrix). Zum Beispiel ein Arbeitsablauf, der eine Job-Ressource und eine Ressourcen-Sperre referenziert; ein Zeitplan, der einen Kalender und einen oder mehrere Arbeitsabläufe referenziert.

Beim Ausrollen von Objekten wird die Konsistenz berücksichtigt:

- Wenn eine Job-Ressource erstellt wird und von einem neu erstellten Arbeitsablauf referenziert wird, dann schließt das Ausrollen des Arbeitsablauf das Ausrollen der Job-Ressource ein.
- Wenn eine Job-Ressource von einem ausgerollten Arbeitsablauf referenziert wird und zurückgezogen oder entfernt werden soll, muss auch der Arbeitsablauf zurückgezogen oder entfernt werden.

Die Benutzer steuern das konsistente Ausrollen über die folgenden Optionen:

- **Abhängigkeiten einbeziehen**
  - wenn diese Option aktiviert ist, werden sowohl referenzierende als auch referenzierte Objekte einbezogen.
    - Wenn sich verwandte Objekte im Entwurfsstatus befinden, wird ein gemeinsames Ausrollen angeboten. Es wird erzwungen, wenn dies aufgrund von Änderungen an den Objektbeziehungen erforderlich ist.
    - Wenn sich verwandte Objekte im Status *ausgerollt*/*freigegeben* befinden, ist das gemeinsame Ausrollen optional. Benutzer können verwandte Objekte für das gemeinsame Ausrollen auswählen.
  - wenn diese Option nicht markiert ist, werden Abhängigkeiten nicht berücksichtigt. Die Benutzer müssen überprüfen, ob verwandte Objekte gültig und *ausgerollt*/*freigegeben* sind. Der Controller gibt Fehlermeldungen aus, wenn Objekte aufgrund eines inkonsistenten Ausrollens fehlen.

## Referenzen

### Kontext-Hilfe

- [Abhängigkeitsmatrix](/dependencies-matrix)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Konfiguration - Inventar - Operationen - Ordner ausrollen](/configuration-inventory-operations-deploy-folder)
- [Tagesplan](/daily-plan)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
