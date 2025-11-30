# Konfiguration - Inventar - Vorgänge - Rückrufordner

Durch den Rückruf von Objekten werden diese deaktiviert, z.B. für die Verwendung mit dem [Daily Plan](/daily-plan). Dies gilt für Objekte wie Zeitpläne und Kalender, die im Systemordner *Automation* verfügbar sind.

Die Ansicht *Konfiguration-&gt;Inventar* bietet die Möglichkeit, ein einzelnes Objekt abzurufen, siehe [Configuration - Inventory - Operations - Recall Object](/configuration-inventory-operations-recall-object), und Objekte aus Ordnern abzurufen.

Wenn Sie Objekte aus einem Ordner mit der Operation *Aufrufen* aufrufen, die Sie über das Aktionsmenü mit den 3 Punkten im Navigationsbereich des Ordners erreichen, wird ein Popup-Fenster wie das folgende angezeigt:

<img src="recall-folder.png" alt="Recall Folder" width="600" height="600" />

## Aktualisieren des Tagesplans

Das Aufrufen von Objekten wie Zeitplänen und Kalendern wirkt sich auf die [Daily Plan](/daily-plan) aus. 

Bestehende Aufträge für Workflows, auf die von zugehörigen Zeitplänen verwiesen wird, werden vom Controller zurückgerufen und aus dem Tagesplan entfernt.

## Abhängigkeiten einbeziehen

Inventarobjekte sind durch Abhängigkeiten miteinander verbunden, siehe [Dependency Matrix](/dependencies-matrix). Zum Beispiel ein Workflow, der auf eine Job Resource und eine Resource Lock verweist; ein Zeitplan, der auf einen Kalender und einen oder mehrere Workflows verweist.

Beim Abrufen von Objekten wird die Konsistenz berücksichtigt, zum Beispiel:

- Wenn ein Zeitplan erstellt wird und auf einen neu erstellten Kalender verweist, dann beinhaltet die Freigabe des Zeitplans auch die Freigabe des Kalenders. Dazu gehört auch die Bereitstellung eines Workflow-Entwurfs, auf den der Zeitplan verweist.
- Wenn ein Kalender von einem freigegebenen Zeitplan referenziert wird und zurückgerufen oder entfernt werden soll, dann muss auch der Zeitplan zurückgerufen oder entfernt werden. Dazu gehört auch, dass Sie den Workflow, auf den der Zeitplan verweist, widerrufen oder entfernen.

Die Benutzer steuern die konsistente Bereitstellung über die folgenden Optionen:

- **Abhängigkeiten einbeziehen**
  - wenn diese Option aktiviert ist, werden sowohl referenzierende als auch referenzierte Objekte einbezogen.
    - Wenn sich verwandte Objekte im Status Bereitgestellt/Freigegeben befinden, wird ein gemeinsamer Rückruf angeboten. Der Rückruf wird erzwungen, wenn die Objektbeziehungen dies erfordern.
    - Wenn sich verwandte Objekte im Entwurfsstatus befinden, ist der gemeinsame Abruf optional. Benutzer können verwandte Objekte für den gemeinsamen Abruf auswählen.
  - wenn diese Option nicht markiert ist, werden Abhängigkeiten nicht berücksichtigt. Die Benutzer müssen überprüfen, ob die verknüpften Objekte gültig und bereitgestellt/freigegeben sind. Der Controller gibt Fehlermeldungen aus, wenn Objekte aufgrund einer inkonsistenten Bereitstellung fehlen.

## Referenzen

### Kontext-Hilfe

- [Configuration - Inventory - Operations - Recall Object](/configuration-inventory-operations-recall-object)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Dependency Matrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

