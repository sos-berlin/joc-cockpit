# Einstellungen für Autorisierungsbenachrichtigungen

 Der [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) wird für Situationen angeboten, in denen Benutzer beabsichtigen, Operatione wie das Hinzufügen oder Abbrechen von Aufträgen durchzuführen, die die Autorisierung eines zweiten Benutzers erfordern. Dies kann jede Operation umfassen, die ein Objekt ändert.

Der Autorisierungsprozess umfasst die folgenden Rollen:

- Ein *Requestor* beantragt die Durchführung einer autorisierungspflichtigen Operation.
- Ein *Approver* bestätigt oder verweigert die Autorisierungsanfrage.

Zu den grundlegenden Funktionen des Autorisierungsprozesses gehören:

- die Umsetzung des 4-Augen-Prinzips: ein *Approver* muss die Intervention eines *Requestors* bestätigen, bevor die Intervention im Rahmen des Kontos, der Rollen und der Berechtigungen des *Requestor* ausgeführt werden kann. 
- die Übersicht über ausstehende Autorisierungsanfragen.
- die Möglichkeit, dass aus einer Reihe von *Approvers* jede/r die Autorisierungsanfrage beantworten kann.

## Einstellungen für Autorisierungsbenachrichtigungen

Die Benachrichtigungseinstellungen umfassen Eigenschaften für den Versand von E-Mail an *Autorisierungsempfänger* bei eingehenden [Autorisierungsanfragen](/approval-requests):

- **Job Resource** enthält Einstellungen für die Verbindung mit dem Mailserver. Einzelheiten finden Sie unter [JS7 - eMailDefault Job Resource](https://kb.sos-berlin.com/display/JS7/JS7+-+eMailDefault+Job+Resource).
- **Inhaltstyp**, **Charset**, **Encoding** sind für jedes System, das E-Mails versendet, gleich.
- **Autorisierungsanfrage E-Mail**
  - **Cc**, **Bcc** geben optional die Empfänger von Kopien und Durchschlägen der Benachrichtigung an.
  - **Subject**, **Body** der E-Mail können Platzhalter enthalten, die beim Versand der E-Mail ersetzt werden. Platzhalter werden mit dem Format $\{Platzhalter\} angegeben.
    - Die folgenden Platzhalter sind verfügbar:
      - $\{RequestStatusDate\}: Datum des Anfragestatus
      - $\{ApprovalStatusDate\}: Datum des Autorisierungsstatus
      - $\{Title\}: Titel der Anfrage
      - $\{Requestor\}: Konto des Antragstellers
      - $\{RequestStatus\}: Anfragestatus, einer von REQUESTED, EXECUTED, WITHDRAWN
      - $\{Approver\}: Konto des Genehmigenden
      - $\{ApprovalStatus\}: Autorisierungsstatus, einer der Werte APPROVED, REJECTED
      - $\{RequestURI\}: Anfrage-URI
      - $\{RequestBody\}: Anfragedaten mit den Details der REST-API-Anfrage
      - $\{Category\}: Kategorie
      - $\{Reason\}: Grund
    - Darüber hinaus können die folgenden Platzhalter verwendet werden, wenn sie von einer Job-Ressource wie *eMailDefault* angegeben werden.
      - $\{jocURL\}: URL, von der JOC Cockpit zugänglich ist.
      - $\{jocURLReverseProxy\}: URL, von der JOC Cockpit zugänglich ist, wenn ein Reverse Proxy verwendet wird.

## Referenzen

### Kontext-Hilfe

- [Einstellungen für Autorisierungsbenachrichtigungen](/approval-notification-settings)
- [Autorisierungsanfrage](/approval-request)
- [Autorisierungsanfragen](/approval-requests)
- [Autorisiererprofile](/approval-profiles)

### Product Knowledge Base

- [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)
- [JS7 - eMailDefault Job Resource](https://kb.sos-berlin.com/display/JS7/JS7+-+eMailDefault+Job+Resource)
