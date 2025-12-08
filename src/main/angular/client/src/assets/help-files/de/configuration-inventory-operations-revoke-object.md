# Konfiguration - Inventar - Operationen - Objekt zurückziehen

Das Zurückziehen von Objekten beinhaltet, dass sie aus dem Controller gelöscht werden und dass Objekte im Inventar im Entwurfsstatus verbleiben. Dies gilt für Objekte wie Arbeitsabläufe und Job-Ressourcen, die über den Systemordner *Controller* verfügbar sind.

Die Ansicht *Konfiguration-&gt;Inventar* bietet die Möglichkeit, ein einzelnes Objekt zurückzuziehen und Objekte aus Ordnern zurückzuziehen, siehe [Konfiguration - Inventar - Operationen - Ordner zurückziehen](/configuration-inventory-operations-revoke-folder).

Wenn Sie ein einzelnes Objekt mit der Operation *Zurückziehen* vom Controller entfernen, die Sie über das 3-Punkte Aktionsmenü des Objekts im Navigationsbereich aufrufen können, wird ein Popup-Fenster wie das folgende angezeigt:

<img src="revoke-workflow.png" alt="Revoke Workflow" width="600" height="460" />

## Objekt von Controller zurückziehen

Das Eingabefeld akzeptiert einen oder mehrere Controller, von denen das Objekt zurückgezogen werden soll.

Standardmäßig wird der aktuell ausgewählte Controller angezeigt.

## Aktualisieren des Tagesplans

Das Zurückziehen von Objekten wie Arbeitsabläufen und Job-Ressourcen wirkt sich auf die [Tagesplan](/daily-plan) aus. 

Bestehende Aufträge für entsprechende Arbeitsabläufe werden vom Controller zurückgezogen und aus dem Tagesplan entfernt.

## Abhängigkeiten einbeziehen

Inventarobjekte sind durch Abhängigkeiten miteinander verbunden, siehe [Abhängigkeitsmatrix](/dependencies-matrix). Zum Beispiel ein Arbeitsablauf, der eine Job-Ressource und eine Ressourcen-Sperre referenziert; ein Tagesplan, der einen Kalender und einen oder mehrere Arbeitsabläufe referenziert.

Beim Zurückziehen von Objekten wird die Konsistenz des Inventars berücksichtigt, zum Beispiel:

- Wenn eine Job-Ressource von einem Arbeitsablauf referenziert wird, dann beinhaltet das Zurückziehen der Job-Ressource auch das Zurückziehen des Arbeitsablaufs.
- Wenn ein Arbeitsablauf zurückgezogen wird, dann wird ein Zeitplan, der auf den Arbeitsablauf verweist, zurückgezogen und die zugehörigen Aufträge werden zurückgenommen und aus dem Tagesplan entfernt.

Benutzer steuern das konsistente Zurückziehen von Objekten über die folgenden Optionen:

- **Abhängigkeiten einbeziehen**
  - wenn diese Option aktiviert ist, werden sowohl referenzierende als auch referenzierte Objekte einbezogen.
    - Wenn verwandte Objekte zuvor *ausgerollt* oder *freigegeben* wurden, wird ein gemeinsamer Rückruf angeboten. Er wird erzwungen, wenn die Objektbeziehungen dies erfordern.
    - Dies gilt auch für Objekte im Entwurfsstatus, die zuvor *ausgerollt* oder *freigegeben* wurden.
  - wenn diese Option nicht aktiviert ist, werden Abhängigkeiten nicht berücksichtigt. Die Benutzer müssen überprüfen, ob verwandte Objekte gültig und *ausgerollt*/*freigegeben* sind. Der Controller gibt Fehlermeldungen aus, wenn Objekte aufgrund inkonsistenten Zurückziehens fehlen würden.

## Referenzen

### Kontext-Hilfe

- [Abhängigkeitsmatrix](/dependencies-matrix)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Konfiguration - Inventar - Operationen - Ordner zurückziehen](/configuration-inventory-operations-revoke-folder)
- [Tagesplan](/daily-plan)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
