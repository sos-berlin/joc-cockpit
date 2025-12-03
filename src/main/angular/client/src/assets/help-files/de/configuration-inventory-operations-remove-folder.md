# Konfiguration - Inventar - Vorgänge - Ordner entfernen

Das Entfernen von Objekten bedeutet, dass sie aus Controllern und aus dem Inventar gelöscht werden. Dies gilt für Objekte wie Workflows und Zeitpläne, die in den Systemordnern *Controller* und *Automation* verfügbar sind.

Beim Entfernen eines Ordners werden auch die Unterordner rekursiv entfernt. Entfernte Objekte bleiben im Inventar-Papierkorb verfügbar.

Die Ansicht *Konfiguration-&gt;Inventar* bietet die Möglichkeit, ein einzelnes Objekt zu entfernen, siehe [Configuration - Inventory - Operations - Remove Object](/configuration-inventory-operations-remove-object), und Objekte aus Ordnern zu entfernen.

Wenn Sie einen Ordner mit der Operation *Entfernen* aus dem 3-Punkte-Aktionsmenü des Ordners im Navigationsbereich entfernen, wird ein Popup-Fenster wie dieses angezeigt:

<img src="remove-folder.png" alt="Remove Folder" width="600" height="560" />

## Entfernen von Objekten aus Controllern

Wenn Sie Objekte entfernen, werden sie aus allen Controllern entfernt, in denen sie eingesetzt wurden.

## Aktualisieren des Tagesplans

Das Entfernen von Objekten wie Workflows und Zeitplänen wirkt sich auf die [Tagesplan](/daily-plan) aus. 

Bestehende Aufträge für zugehörige Workflows werden aus Controllern gelöscht und aus dem Tagesplan entfernt.

## Abhängigkeiten einbeziehen

Inventarobjekte sind durch Abhängigkeiten miteinander verbunden, siehe [Dependency Matrix](/dependencies-matrix). Zum Beispiel ein Workflow, der eine Job-Ressource und eine Ressourcensperre referenziert; ein Tagesplan, der einen Kalender und einen oder mehrere Workflows referenziert.

Beim Entfernen von Objekten wird die Konsistenz berücksichtigt, zum Beispiel:

- Wenn eine Job Resource von einem Workflow referenziert wird, dann beinhaltet das Entfernen der Job Resource auch das Widerrufen des Workflows.
- Wenn ein Workflow entfernt wird, wird ein Zeitplan, der auf diesen Workflow verweist, zurückgerufen und die damit verbundenen Aufträge werden storniert und aus dem Tagesplan entfernt.

Die Benutzer steuern die konsistente Entfernung von Objekten über die folgenden Optionen:

- **Abhängigkeiten einbeziehen**
  - wenn diese Option aktiviert ist, werden sowohl referenzierende als auch referenzierte Objekte einbezogen.
    - Wenn verwandte Objekte zuvor bereitgestellt oder freigegeben wurden, wird ein gemeinsames Entfernen/Widerrufen angeboten: Das Objekt, für das die *Entfernen*-Operation ausgeführt wird, wird entfernt, verwandte Objekte werden als widerrufen/zurückgerufen angeboten. Der Widerruf wird erzwungen, wenn die Objektbeziehungen dies erfordern.
    - Dies gilt auch für Objekte im Entwurfsstatus, die zuvor bereitgestellt oder freigegeben wurden.
  - wenn dieses Kontrollkästchen nicht aktiviert ist, werden Abhängigkeiten nicht berücksichtigt. Die Benutzer müssen überprüfen, ob verwandte Objekte gültig und bereitgestellt/freigegeben sind. Der Controller gibt Fehlermeldungen aus, wenn Objekte aufgrund eines inkonsistenten Widerrufs fehlen.

## Referenzen

### Kontext-Hilfe

- [Configuration - Inventory - Operations - Remove Object](/configuration-inventory-operations-remove-object)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Tagesplan](/daily-plan)
- [Dependency Matrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

