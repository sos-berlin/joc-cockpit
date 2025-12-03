# Konfiguration - Inventar - Vorgänge - Objekt widerrufen

Das Widerrufen von Objekten beinhaltet, dass sie aus dem Controller gelöscht werden und dass Objekte im Inventar im Entwurfsstatus verbleiben. Dies gilt für Objekte wie Workflows und Job-Ressourcen, die über den Systemordner *Controller* verfügbar sind.

Die Ansicht *Konfiguration-&gt;Inventar* bietet die Möglichkeit, ein einzelnes Objekt zu widerrufen und Objekte aus Ordnern zu widerrufen, siehe [Configuration - Inventory - Operations - Revoke Folder](/configuration-inventory-operations-revoke-folder).

Wenn Sie ein einzelnes Objekt mit der Operation *Rückgängig* widerrufen, die Sie über das 3-Punkte-Aktionsmenü des Objekts im Navigationsbereich aufrufen können, wird ein Popup-Fenster wie das folgende angezeigt:

<img src="revoke-workflow.png" alt="Revoke Workflow" width="600" height="460" />

## Objekt von Controllern widerrufen

Das Eingabefeld akzeptiert einen oder mehrere Controller, von denen das Objekt zurückgezogen werden soll.

Standardmäßig wird der aktuell ausgewählte Controller angezeigt.

## Aktualisieren des Tagesplans

Der Widerruf von Objekten wie Workflows und Job-Ressourcen wirkt sich auf die [Tagesplan](/daily-plan) aus. 

Bestehende Aufträge für entsprechende Workflows werden vom Controller zurückgerufen und aus dem Tagesplan entfernt.

## Einschließlich Abhängigkeiten

Inventarobjekte sind durch Abhängigkeiten miteinander verbunden, siehe [Dependency Matrix](/dependencies-matrix). Zum Beispiel ein Workflow, der eine Job-Ressource und eine Ressourcensperre referenziert; ein Tagesplan, der einen Kalender und einen oder mehrere Workflows referenziert.

Beim Widerruf von Objekten wird die Konsistenz berücksichtigt, zum Beispiel:

- Wenn eine Job Resource von einem Workflow referenziert wird, dann beinhaltet der Widerruf der Job Resource auch den Widerruf des Workflows.
- Wenn ein Workflow widerrufen wird, wird ein Zeitplan, der auf den Workflow verweist, zurückgerufen und die zugehörigen Aufträge werden zurückgerufen und aus dem Tagesplan entfernt.

Benutzer steuern den konsistenten Widerruf von Objekten über die folgenden Optionen:

- **Abhängigkeiten einbeziehen**
  - wenn diese Option aktiviert ist, werden sowohl referenzierende als auch referenzierte Objekte einbezogen.
    - Wenn verwandte Objekte zuvor bereitgestellt oder freigegeben wurden, wird ein gemeinsamer Entzug angeboten. Sie wird erzwungen, wenn die Objektbeziehungen dies erfordern.
    - Dies gilt auch für Objekte im Entwurfsstatus, die zuvor bereitgestellt oder freigegeben wurden.
  - wenn dieses Kontrollkästchen nicht aktiviert ist, werden Abhängigkeiten nicht berücksichtigt. Die Benutzer müssen überprüfen, ob verwandte Objekte gültig und bereitgestellt/freigegeben sind. Der Controller gibt Fehlermeldungen aus, wenn Objekte aufgrund eines inkonsistenten Widerrufs fehlen.

## Referenzen

### Kontext-Hilfe

- [Configuration - Inventory - Operations - Revoke Folder](/configuration-inventory-operations-revoke-folder)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Tagesplan](/daily-plan)
- [Dependency Matrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

