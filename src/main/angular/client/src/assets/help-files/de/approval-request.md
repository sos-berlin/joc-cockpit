# Antrag für Autorisierung

 Der [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) wird für Situationen angeboten, in denen Benutzer beabsichtigen, Interventionen wie das Hinzufügen oder Abbrechen von Aufträgen durchzuführen, die die Autorisierung durch einen zweiten Benutzer erfordern. Dies kann jede Operation umfassen, die ein Objekt verändert.

Der Autorisierungsprozess umfasst die folgenden Rollen:

- Ein *Requestor* beantragt die Durchführung einer autorisierungspflichtigen Intervention.
- Ein *Approver* bestätigt oder verweigert die Autorisierung.

Zu den grundlegenden Funktionen des Autorisierungsprozesses gehören:

- die Umsetzung des 4-Augen-Prinzips: ein *Approver* muss die Intervention eines *Requestor* bestätigen, bevor die Intervention im Rahmen des Kontos, der Rollen und der Berechtigungen des *Requestor* ausgeführt werden kann. 
- die Übersicht über ausstehende Autorisierungsanfragen.
- die Möglichkeit, dass aus einer Reihe von *Approvers* jede/r die Autorisierungsanfrage beantworten kann.

## Autorisierungsanfrage

Autorisierungsanfragen werden hinzugefügt, wenn ein Benutzer versucht, eine autorisierungspflichtige Intervention durchzuführen. Zu den Voraussetzungen gehören:

- Dem Benutzer ist die *Requestor* Rolle zugewiesen. Den Namen der Rolle finden Sie unter [Einstellungen - JOC Cockpit](/settings-joc).
- Die angefragte Intervention wird mit den Berechtigungen der *Requestor* Rolle ausgeführt.

Wenn die *Requestor* Rolle z.B. die Berechtigungen für Auträge benennt und der Benutzer versucht, einen Auftrag einem Arbeitsablauf hinzuzufügen, dann wird ein Popup-Fenster angezeigt, in dem die folgenden Informationen abgefragt werden:

- **Titel** ist der Indikator für die Autorisierungsanfrage. Der Benutzer kann den *Titel* frei bestimmen.
- **Autorisierer** wird aus der Liste [Autorisiererprofile](/approval-profiles) ausgewählt. Der angegebene *Approver* wird bevorzugt benachrichtigt. Allerdings kann jeder *Approver* die Autorisierungsanfrage genehmigen oder ablehnen.
- **Begründung** liefert dem *Approver* eine Erklärung für die Notwendigkeit der Intervention.

Wenn die Autorisierungsanfrage eingereicht ist, wird sie in der Ansicht [Autorisierungsanfragen](/approval-requests) sichtbar. Der zugehörige *Approver* erhält eine Benachrichtigung per E-Mail.

## Referenzen

### Kontext-Hilfe

- [Einstellungen für Autorisierungsbenachrichtigungen](/approval-notification-settings)
- [Autorisiererprofile](/approval-profiles)
- [Autorisierungsanfragen](/approval-requests)

### Product Knowledge Base

- [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)

