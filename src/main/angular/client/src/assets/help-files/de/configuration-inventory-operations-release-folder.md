# Konfiguration - Inventar - Operationen - Ordner freigeben

Durch die Freigabe von Objekten werden diese aktiviert, z.B. für die Verwendung mit dem [Tagesplan](/daily-plan). Dies gilt für Objekte wie Zeitpläne und Kalender, die im Systemordner *Automation* verfügbar sind.

Die Ansicht *Konfiguration-&gt;Inventar* bietet die Möglichkeit, ein einzelnes Objekt freizugeben, siehe [Konfiguration - Inventar - Operationen - Objekt freigeben](/configuration-inventory-operations-release-object) und Freigabe von Objekten aus Ordnern.

Wenn Sie Objekte aus Ordnern freigeben, indem Sie die entsprechende *Freigeben* Operation aus dem 3-Punkte Aktionsmenü des Ordners verwenden, wird ein Popup-Fenster wie dieses angezeigt:

<img src="release-folder.png" alt="Release Folder" width="592" height="560" />

## Aktualisieren des Tagesplans

Das Freigeben von Objekten wie Zeitplänen und Kalendern wirkt sich auf den [Tagesplan](/daily-plan) aus. Häufig soll die aktualisierte Version eines Objekts für Aufträge im Tagesplan verwendet werden. Die Benutzer steuern das Verhalten über die folgenden Optionen:

- **Tagesplan aktualisieren**
  - **Jetzt** legt die Aktualisierung des Tagesplans für Aufträge fest, die für einen Zeitpunkt ab jetzt geplant sind.
  - **Startdatum** öffnet ein Eingabefeld für das Zieldatum, ab dem der Tagesplan aktualisiert werden soll.
  - **Nein** legt fest, dass der Tagesplan nicht aktualisiert werden soll. Bestehende Aufträge bleiben bei der Verwendung der zuvor eingesetzten Versionen von Objekten.
- **Heute verspätete Aufträge einbeziehen** Wenn diese Option aktiviert ist, werden auch Aufträge berücksichtigt, die für einen zurückliegenden Zeitpunkt des aktuellen Tages geplant wurden, aber verspätet sind und nicht gestartet wurden.

## Unterordner einbeziehen

Die Option **Rekursiv behandeln** ermöglicht es, Objekte aus Unterordnern rekursiv freizugeben.

## Abhängigkeiten einbeziehen

Inventarobjekte sind durch Abhängigkeiten miteinander verbunden, siehe [Abhängigkeitsmatrix](/dependencies-matrix). Zum Beispiel ein Arbeitsablauf, der eine Job-Ressource und eine Ressourcen-Sperre referenziert; ein Zeitplan, der einen Kalender und einen oder mehrere Arbeitsabläufe referenziert.

Bei der Freigabe von Objekten wird die Konsistenz des Inventars berücksichtigt, zum Beispiel:

- Wenn ein Zeitplan erstellt wird und auf einen neu erstellten Kalender verweist, dann beinhaltet die Freigabe des Zeitplans auch die Freigabe des Kalenders. Dazu gehört auch das Ausrollen eines Arbeitsablaufs im Entwurfsstatus, auf den der Zeitplan verweist.
- Wenn ein Kalender von einem freigegebenen Zeitplan referenziert wird und zurückgenommen oder entfernt werden soll, dann muss auch der Zeitplan zurückgenommen oder entfernt werden. Dazu gehört optional, dass Sie den Arbeitsablauf, auf den der Zeitplan verweist, zurückziehen oder entfernen.

Die Benutzer steuern die konsistente Freigabe über die folgenden Optionen:

- **Abhängigkeiten einbeziehen**
  - wenn diese Option aktiviert ist, werden sowohl referenzierende als auch referenzierte Objekte einbezogen.
    - Wenn sich verwandte Objekte im Entwurfsstatus befinden, wird eine gemeinsame Freigabe angeboten. Sie wird erzwungen, wenn dies aufgrund von Änderungen an den Objektbeziehungen erforderlich ist.
    - Wenn sich verwandte Objekte im Status *ausgerollt*/*freigegeben* befinden, ist das gemeinsame Ausrollen optional. Benutzer können verwandte Objekte für das gemeinsame Ausrollen auswählen.
  - wenn diese Option nicht markiert ist, werden Abhängigkeiten nicht berücksichtigt. Die Benutzer müssen überprüfen, ob verwandte Objekte gültig und *ausgerollt*/*freigegeben* sind. Der Controller gibt Fehlermeldungen aus, wenn Objekte aufgrund inkonsistenten Ausrollens fehlen.

## Referenzen

### Kontext-Hilfe

- [Abhängigkeitsmatrix](/dependencies-matrix)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Konfiguration - Inventar - Operationen - Objekt freigeben](/configuration-inventory-operations-release-object)
- [Tagesplan](/daily-plan)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
