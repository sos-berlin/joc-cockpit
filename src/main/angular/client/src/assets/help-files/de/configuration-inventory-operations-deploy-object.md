# Konfiguration - Inventar - Vorgänge - Objekt bereitstellen

Die Bereitstellung von Objekten bedeutet, dass sie auf einen oder mehrere Controller übertragen werden. Dies gilt für Objekte wie Workflows und Job-Ressourcen, die über den Systemordner *Controller* verfügbar sind.

Die Ansicht *Konfiguration-&gt;Inventar* bietet die Möglichkeit, ein einzelnes Objekt zu verteilen und Objekte aus Ordnern zu verteilen, siehe [Ordner ausrollen](/configuration-inventory-operations-deploy-folder).

Wenn Sie ein einzelnes Objekt über die entsprechende Schaltfläche *Deploy* bereitstellen, wird ein Popup-Fenster wie das folgende angezeigt:

<img src="deploy-workflow.png" alt="Deploy Workflow" width="600" height="460" />

## Einsatz auf Controllern

Das Eingabefeld **Controller** akzeptiert einen oder mehrere Controller, für die das Objekt bereitgestellt werden soll.

Standardmäßig wird der aktuell ausgewählte Controller verwendet.

## Aktualisieren des Tagesplans

Die Bereitstellung von Objekten wie Workflows, Zeitplänen und Kalendern wirkt sich auf die [Tagesplan](/daily-plan) aus. Häufig soll die aktualisierte Version eines Objekts für Aufträge im Tagesplan verwendet werden. Die Benutzer steuern das Verhalten über die folgenden Optionen:

- **Tagesplan aktualisieren**
  - **Jetzt** legt die Aktualisierung des Tagesplans für Aufträge fest, die für einen Zeitpunkt ab jetzt geplant sind.
  - wenn Sie **Startdatum** auswählen, wird ein Eingabefeld für das Zieldatum hinzugefügt, ab dem der Tagesplan aktualisiert werden soll.
  - **Nein** legt fest, dass der Tagesplan nicht aktualisiert werden soll. Bestehende Aufträge bleiben bei der Verwendung der zuvor eingesetzten Versionen von Objekten.
- **Heute verspätete Aufträge einbeziehen** Wenn diese Option aktiviert ist, werden auch Aufträge berücksichtigt, die für einen vergangenen Zeitpunkt des aktuellen Tages geplant wurden, aber verspätet sind und nicht gestartet wurden.

## Abhängigkeiten einbeziehen

Inventarobjekte sind durch Abhängigkeiten miteinander verbunden, siehe [Abhängigkeitsmatrix](/dependencies-matrix). Zum Beispiel ein Workflow, der eine Job Resource und eine Resource Lock referenziert; ein Schedule, der einen Kalender und einen oder mehrere Workflows referenziert.

Bei der Bereitstellung von Objekten wird zum Beispiel die Konsistenz berücksichtigt:

- Wenn eine Job Resource erstellt wird und von einem neu erstellten Workflow referenziert wird, dann schließt die Bereitstellung des Workflows die Bereitstellung der Job Resource ein.
- Wenn eine Job Resource von einem bereitgestellten Workflow referenziert wird und widerrufen oder entfernt werden soll, muss auch der Workflow widerrufen oder entfernt werden.

Die Benutzer steuern die konsistente Bereitstellung über die folgenden Optionen:

- **Abhängigkeiten einbeziehen**
  - wenn diese Option aktiviert ist, werden sowohl referenzierende als auch referenzierte Objekte einbezogen.
    - Wenn sich verwandte Objekte im Entwurfsstatus befinden, wird eine gemeinsame Bereitstellung angeboten. Sie wird erzwungen, wenn dies aufgrund von Änderungen an den Objektbeziehungen erforderlich ist.
    - Wenn sich verwandte Objekte im Status Bereitgestellt/Freigegeben befinden, ist die gemeinsame Bereitstellung optional. Benutzer können verwandte Objekte für die gemeinsame Bereitstellung auswählen.
  - wenn diese Option nicht markiert ist, werden Abhängigkeiten nicht berücksichtigt. Die Benutzer müssen überprüfen, ob verwandte Objekte gültig und verteilt/freigegeben sind. Der Controller gibt Fehlermeldungen aus, wenn Objekte aufgrund einer inkonsistenten Verteilung fehlen.

## Referenzen

### Kontext-Hilfe

- [Configuration - Inventory - Operations - Deploy Folder](/configuration-inventory-operations-deploy-folder)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Tagesplan](/daily-plan)
- [Abhängigkeitsmatrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

