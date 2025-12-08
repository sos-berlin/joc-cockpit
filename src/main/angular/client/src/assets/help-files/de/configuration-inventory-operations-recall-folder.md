# Konfiguration - Inventar - Operationen - Ordner zurücknehmen

Durch das *Zurücknehmen* von Objekten werden diese deaktiviert, z.B. für die Verwendung mit dem [Tagesplan](/daily-plan). Dies gilt für Objekte wie Zeitpläne und Kalender, die im Systemordner *Automation* verfügbar sind.

Die Ansicht *Konfiguration-&gt;Inventar* bietet die Möglichkeit, ein einzelnes Objekt zurückzunehmen, siehe [Konfiguration - Inventar - Operationen - Objekt zurücknehmen](/configuration-inventory-operations-recall-object), und Objekte aus Ordnern zurückzunehmen.

Wenn Sie für Objekte aus einem Ordner die Operation *Zurücknehmen* ausführen, die Sie über das 3-Punkte Aktionsmenü im Navigationsbereich des Ordners erreichen, wird ein Popup-Fenster wie das folgende angezeigt:

<img src="recall-folder.png" alt="Recall Folder" width="600" height="600" />

## Aktualisieren des Tagesplans

Das *Zurücknehmen* von Objekten wie Zeitplänen und Kalendern wirkt sich auf den [Tagesplan](/daily-plan) aus. 

Bestehende Aufträge für Arbeitsabläufe, auf die von zugehörigen Zeitplänen verwiesen wird, werden vom Controller zurückgezogen und aus dem Tagesplan entfernt.

## Abhängigkeiten einbeziehen

Inventarobjekte sind durch Abhängigkeiten miteinander verbunden, siehe [Abhängigkeitsmatrix](/dependencies-matrix). Zum Beispiel ein Arbeitsablauf, der auf eine Job-Ressource und eine Ressourcen-Sperre verweist; ein Zeitplan, der auf einen Kalender und einen oder mehrere Arbeitsabläufe verweist.

Beim *Zurücknehmen* von Objekten wird die Konsistenz des Inventars berücksichtigt, zum Beispiel:

- Wenn ein Zeitplan erstellt wird und auf einen neu erstellten Kalender verweist, dann beinhaltet die Freigabe des Zeitplans auch die Freigabe des Kalenders. Dazu gehört auch das Ausrollen eines Arbeitsablaufs im Entwurfsstatus, auf den der Zeitplan verweist.
- Wenn ein Kalender von einem freigegebenen Zeitplan referenziert wird und zurückgenommen oder entfernt werden soll, dann muss auch der Zeitplan zurückgenommen oder entfernt werden. Dazu gehört auch, dass Sie den Arbeitsablauf, auf den der Zeitplan verweist, zurückziehen oder entfernen.

Die Benutzer steuern das konsistente *Zurücknehmen* über die folgenden Optionen:

- **Abhängigkeiten einbeziehen**
  - wenn diese Option aktiviert ist, werden sowohl referenzierende als auch referenzierte Objekte einbezogen.
    - Wenn sich verwandte Objekte im Status *Ausgerollt*/*Freigegeben* befinden, wird ein gemeinsamer Rückruf angeboten. Der Rückruf wird erzwungen, wenn die Objektbeziehungen dies erfordern.
    - Wenn sich verwandte Objekte im Entwurfsstatus befinden, ist der gemeinsame Rückruf optional. Benutzer können verwandte Objekte für den gemeinsamen Rückruf auswählen.
  - wenn diese Option nicht markiert ist, werden Abhängigkeiten nicht berücksichtigt. Die Benutzer müssen überprüfen, ob die verknüpften Objekte gültig und *ausgerollt*/*freigegeben* sind. Der Controller gibt Fehlermeldungen aus, wenn Objekte aufgrund inkonsistenten *Zurücknehmens* fehlen.

## Referenzen

### Kontext-Hilfe

- [Abhängigkeitsmatrix](/dependencies-matrix)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Konfiguration - Inventar - Operationen - Objekt zurücknehmen](/configuration-inventory-operations-recall-object)
- [Tagesplan](/daily-plan)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
