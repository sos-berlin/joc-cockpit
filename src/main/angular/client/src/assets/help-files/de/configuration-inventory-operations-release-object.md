# Konfiguration - Inventar - Vorgänge - Objekt freigeben

Durch die Freigabe von Objekten werden diese aktiviert, z.B. für die Verwendung mit dem [Daily Plan](/daily-plan). Dies gilt für Objekte wie Zeitpläne und Kalender, die im Systemordner *Automation* verfügbar sind.

Die Ansicht *Konfiguration-&gt;Inventar* bietet die Freigabe eines einzelnen Objekts und die Freigabe von Objekten aus Ordnern, siehe [Configuration - Inventory - Operations - Release Folder](/configuration-inventory-operations-release-folder).

Wenn Sie ein einzelnes Objekt über die entsprechende Schaltfläche *Freigeben* freigeben, wird ein Popup-Fenster wie das folgende angezeigt:

<img src="release-schedule.png" alt="Release Schedule" width="600" height="330" />

## Aktualisieren des Tagesplans

Das Freigeben von Objekten wie Zeitplänen und Kalendern wirkt sich auf die [Daily Plan](/daily-plan) aus. Häufig soll die aktualisierte Version eines Objekts für Aufträge im Tagesplan verwendet werden. Die Benutzer steuern das Verhalten über die folgenden Optionen:

- **Tagesplan aktualisieren**
  - **Jetzt** legt die Aktualisierung des Tagesplans für Aufträge fest, die für einen Zeitpunkt ab jetzt geplant sind.
  - wenn Sie **Startdatum** auswählen, wird ein Eingabefeld für das Zieldatum hinzugefügt, ab dem der Tagesplan aktualisiert werden soll.
  - **Nein** legt fest, dass der Tagesplan nicht aktualisiert werden soll. Bestehende Aufträge bleiben bei der Verwendung der zuvor eingesetzten Versionen von Objekten.
- **Heute verspätete Aufträge einbeziehen** Wenn diese Option aktiviert ist, werden auch Aufträge berücksichtigt, die für einen vergangenen Zeitpunkt des aktuellen Tages geplant wurden, aber verspätet sind und nicht gestartet wurden.

## Abhängigkeiten einbeziehen

Inventarobjekte sind durch Abhängigkeiten miteinander verbunden, siehe [Dependency Matrix](/dependencies-matrix). Zum Beispiel ein Workflow, der eine Job-Ressource und eine Ressourcensperre referenziert; ein Zeitplan, der einen Kalender und einen oder mehrere Workflows referenziert.

Bei der Freigabe von Objekten wird die Konsistenz berücksichtigt, zum Beispiel:

- Wenn ein Zeitplan erstellt wird und auf einen neu erstellten Kalender verweist, dann beinhaltet die Freigabe des Zeitplans auch die Freigabe des Kalenders. Dazu gehört auch die Freigabe eines Workflow-Entwurfs, auf den der Zeitplan verweist.
- Wenn ein Kalender von einem freigegebenen Zeitplan referenziert wird und zurückgerufen oder entfernt werden soll, dann muss auch der Zeitplan zurückgerufen oder entfernt werden. Dazu gehört auch, dass Sie den Workflow, auf den der Zeitplan verweist, widerrufen oder entfernen.

Die Benutzer steuern die konsistente Bereitstellung über die folgenden Optionen:

- **Abhängigkeiten einbeziehen**
  - wenn diese Option aktiviert ist, werden sowohl referenzierende als auch referenzierte Objekte einbezogen.
    - Wenn sich verwandte Objekte im Entwurfsstatus befinden, wird eine gemeinsame Bereitstellung angeboten. Sie wird erzwungen, wenn dies aufgrund von Änderungen an den Objektbeziehungen erforderlich ist.
    - Wenn sich verwandte Objekte im Status Bereitgestellt/Freigegeben befinden, ist die gemeinsame Bereitstellung optional. Benutzer können verwandte Objekte für die gemeinsame Bereitstellung auswählen.
  - wenn diese Option nicht markiert ist, werden Abhängigkeiten nicht berücksichtigt. Die Benutzer müssen überprüfen, ob verwandte Objekte gültig und bereitgestellt/freigegeben sind. Der Controller gibt Fehlermeldungen aus, wenn Objekte aufgrund einer inkonsistenten Verteilung fehlen.

## Referenzen

### Kontext-Hilfe

- [Configuration - Inventory - Operations - Release Folder](/configuration-inventory-operations-release-folder)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Dependency Matrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

