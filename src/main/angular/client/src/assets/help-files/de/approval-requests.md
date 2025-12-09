# Autorisierungsanfragen

 Der [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) wird für Situationen angeboten, in denen Benutzer beabsichtigen, Interventionen wie das Hinzufügen oder Abbrechen von Aufträgen durchzuführen, die die Autorisierung durch einen zweiten Benutzer erfordern. Dies kann jede Operation umfassen, die ein Objekt verändert.

Der Autorisierungsprozess umfasst die folgenden Rollen:

- Ein *Requestor* beantragt die Durchführung einer autorisierungspflichtigen Intervention.
- Ein *Approver* bestätigt oder verweigert die Autorisierung.

Zu den grundlegenden Funktionen des Autorisierungsprozesses gehören:

- die Umsetzung des 4-Augen-Prinzips: ein *Approver* muss die Intervention eines *Requestor* bestätigen, bevor die Intervention im Rahmen des Kontos, der Rollen und der Berechtigungen des *Requestor* ausgeführt werden kann. 
- die Übersicht über ausstehende Autorisierungsanfragen.
- die Möglichkeit, dass aus einer Reihe von *Approvers* jede/r die Autorisierungsanfrage beantworten kann.

## Liste der Autorisierungsanfragen

Autorisierungsanfragen werden von Benutzern hinzugefügt, die eine Bestätigung für eine geplante Intervenion anfordern, siehe [Autorisierungsanfrage](/approval-request).

Die Liste der Autorisierungsanfragen wird mit den folgenden Eigenschaften angeboten:

- **Statusdatum Anfrage** ist der Zeitpunkt, zu dem ein [Autorisierungsanfrage](/approval-request) hinzugefügt wurde.
- **Titel** wird vom *Antragsteller* beim Hinzufügen der Autorisierungsanfrage angegeben.
- **Anfrager** gibt das Benutzerkonto an, das die Autorisierungsanfrage gestellt hat.
- **Status Anfrage** ist einer der folgenden: *eingereicht*, *genehmigt*, *zurückgezogen*, *erledigt*.
- **Autorisierer** ist der *Vorname* und *Nachname* des bevorzugten *Approver*.
- **Status Autorisierung** ist einer der Werte *anstehend*, *genehmigt*, *abgelehnt*.
- **Statusdatum Autorisierung** ist der letzte Zeitpunkt, zu dem der *Autorisierer* auf die Autorisierungsanfrage reagiert hat, z.B. indem er/sie die Anfrage genehmigt oder abgelehnt hat.
- **Anfrage URL** ist der [REST Web Service API](/rest-api) Endpunkt, den der *Requestor* verwenden möchte.
- **Kategorie** gibt den Umfang der Anfrage an, z.B. für einen Controller, für den Tagesplan usw.
- **Begründung** gibt die Erklärung des *Requestor* über den Zweck der Autorisierungsanfrage an.

## Referenzen

### Kontext-Hilfe

- [Einstellungen für Autorisierungsbenachrichtigungen](/approval-notification-settings)
- [Autorisiererprofile](/approval-profiles)
- [Autorisierungsanfrage](/approval-request)
- [REST Web Service API](/rest-api)

### Product Knowledge Base

- [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)

