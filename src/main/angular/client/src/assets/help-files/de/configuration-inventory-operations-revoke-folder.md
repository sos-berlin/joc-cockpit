# Konfiguration - Inventar - Vorgänge - Ordner widerrufen

Das Widerrufen von Objekten bedeutet, dass sie aus dem Controller gelöscht werden und dass Objekte im Inventar im Entwurfsstatus verbleiben. Dies gilt für Objekte wie Workflows und Job-Ressourcen, die über den Systemordner *Controller* verfügbar sind.

Die Ansicht *Konfiguration-&gt;Inventar* bietet die Möglichkeit, ein einzelnes Objekt zu widerrufen, siehe [Configuration - Inventory - Operations - Revoke Object](/configuration-inventory-operations-revoke-object), und Objekte aus Ordnern zu widerrufen.

Wenn Sie Objekte aus einem Ordner widerrufen, indem Sie die Operation *Widerrufen* verwenden, die über das 3-Punkte-Aktionsmenü des Ordners im Navigationsbereich verfügbar ist, wird ein Popup-Fenster wie das folgende angezeigt:

<img src="revoke-folder.png" alt="Revoke Folder" width="600" height="580" />

## Objekte von Controllern widerrufen

Das Eingabefeld akzeptiert einen oder mehrere Controller, von denen Objekte widerrufen werden sollen.

Standardmäßig wird der aktuell ausgewählte Controller angezeigt.

## Aktualisieren des Tagesplans

Der Widerruf von Objekten wie Workflows und Job-Ressourcen wirkt sich auf die [Daily Plan](/daily-plan) aus. 

Bestehende Aufträge für entsprechende Workflows werden vom Controller zurückgerufen und aus dem Tagesplan entfernt.

## Einschließlich Unterordner

Mit der Option **Rekursiv behandeln** können Sie Objekte aus Unterordnern rekursiv widerrufen.

## Abhängigkeiten einbeziehen

Inventarobjekte sind durch Abhängigkeiten miteinander verbunden, siehe [Dependency Matrix](/dependencies-matrix). Zum Beispiel ein Workflow, der eine Job Resource und eine Resource Lock referenziert; ein Schedule, der einen Kalender und einen oder mehrere Workflows referenziert.

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

- [Configuration - Inventory - Operations - Revoke Object](/configuration-inventory-operations-revoke-object)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Dependency Matrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

