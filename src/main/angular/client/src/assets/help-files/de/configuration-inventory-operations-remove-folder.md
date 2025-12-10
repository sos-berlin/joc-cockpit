# Konfiguration - Inventar - Operationen - Ordner entfernen

Das Entfernen von Objekten bedeutet, dass sie aus Controller Instanzen und aus dem Inventar gelöscht werden. Dies gilt für Objekte wie Arbeitsabläufe und Zeitpläne, die in den Systemordnern *Controller* und *Automation* verfügbar sind.

Beim Entfernen eines Ordners werden auch die Unterordner rekursiv entfernt. Entfernte Objekte bleiben im Inventar-Papierkorb verfügbar.

Die Ansicht *Konfiguration-&gt;Inventar* bietet die Möglichkeit, ein einzelnes Objekt zu entfernen, siehe [Konfiguration - Inventar - Operationen - Objekt entfernen](/configuration-inventory-operations-remove-object), und Objekte aus Ordnern zu entfernen.

Wenn Sie einen Ordner mit der Operation *Entfernen* aus dem 3-Punkte Aktionsmenü des Ordners im Navigationsbereich entfernen, wird ein Popup-Fenster wie dieses angezeigt:

<img src="remove-folder.png" alt="Remove Folder" width="600" height="560" />

## Entfernen von Objekten aus Controller

Wenn Sie Objekte entfernen, werden sie aus allen Controller Instanzen entfernt, in denen sie eingesetzt wurden.

## Aktualisieren des Tagesplans

Das Entfernen von Objekten wie Arbeitsabläufen und Zeitplänen wirkt sich auf die [Tagesplan](/daily-plan) aus. 

Bestehende Aufträge für zugehörige Arbeitsabläufe werden aus Controller Instanzen gelöscht und aus dem Tagesplan entfernt.

## Abhängigkeiten einbeziehen

Inventarobjekte sind durch Abhängigkeiten miteinander verbunden, siehe [Abhängigkeitsmatrix](/dependencies-matrix). Zum Beispiel ein Arbeitsablauf, der eine Job-Ressource und eine Ressourcen-Sperre referenziert; ein Tagesplan, der einen Kalender und einen oder mehrere Arbeitsabläufe referenziert.

Beim Entfernen von Objekten wird die Konsistenz des Inventars berücksichtigt, zum Beispiel:

- Wenn eine Job-Ressource von einem Arbeitsablauf referenziert wird, dann beinhaltet das Entfernen der Job-Ressource auch das Zurückziehen des Arbeitsablaufs.
- Wenn ein Arbeitsablauf entfernt wird, dann wird ein Zeitplan, der auf diesen Arbeitsablauf verweist, zurückgenommen und die damit verbundenen Aufträge werden abgebrochen und aus dem Tagesplan entfernt.

Die Benutzer steuern das konsistente Entfernen von Objekten über die folgenden Optionen:

- **Abhängigkeiten einbeziehen**
  - wenn diese Option aktiviert ist, werden sowohl referenzierende als auch referenzierte Objekte einbezogen.
    - Wenn verwandte Objekte zuvor *ausgerollt* oder *freigegeben* wurden, wird ein gemeinsames Entfernen/Rückruf angeboten: Das Objekt, für das die *Entfernen* Operation ausgeführt wird, wird entfernt, verwandte Objekte werden für das *Zurückziehen*/*Zurücknehmen* angeboten. Der Rückruf wird erzwungen, wenn die Objektbeziehungen dies erfordern.
    - Dies gilt auch für Objekte im Entwurfsstatus, die zuvor ausgerollt oder freigegeben wurden.
  - wenn diese Option nicht aktiviert ist, werden Abhängigkeiten nicht berücksichtigt. Die Benutzer müssen überprüfen, ob verwandte Objekte gültig und *ausgerollt*/*freigegeben* sind. Der Controller gibt Fehlermeldungen aus, wenn Objekte aufgrund inkonsistenten Entfernens fehlen würden.

## Referenzen

### Kontext-Hilfe

- [Abhängigkeitsmatrix](/dependencies-matrix)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Konfiguration - Inventar - Operationen - Objekt entfernen](/configuration-inventory-operations-remove-object)
- [Tagesplan](/daily-plan)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
