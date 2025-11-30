# Einstellungen für Genehmigungsbenachrichtigungen

 [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) wird für Situationen angeboten, in denen Benutzer beabsichtigen, Vorgänge wie das Hinzufügen oder Stornieren von Aufträgen durchzuführen, die die Genehmigung eines zweiten Benutzers erfordern. Dies kann jede Operation umfassen, die ein Planungsobjekt ändert.

Der Genehmigungsprozess umfasst die folgenden Rollen:

- Ein *Requestor* beantragt die Durchführung eines genehmigungspflichtigen Vorgangs.
- Ein *Approver* bestätigt oder verweigert die Genehmigungsanfrage.

Zu den grundlegenden Funktionen des Genehmigungsprozesses gehören:

- die Umsetzung des 4-Augen-Prinzips: ein *Approver* muss den Eingriff eines *Requestors* bestätigen, bevor der Eingriff im Rahmen des Kontos, der Rollen und der Berechtigungen des *Requestors* ausgeführt werden kann. 
- um den Überblick über ausstehende Genehmigungsanfragen zu behalten.
- um einer Reihe von *Antragstellern* eine Ausweichmöglichkeit zu bieten.

## Einstellungen für Genehmigungsbenachrichtigungen

Die Benachrichtigungseinstellungen umfassen Eigenschaften für den Versand von E-Mails an *Genehmigungsempfänger* bei eingehenden [Approval Requests](/approval-requests):

- **Job Resource** enthält Einstellungen für die Verbindung mit dem Mailserver. Einzelheiten finden Sie unter [JS7 - eMailDefault Job Resource](https://kb.sos-berlin.com/display/JS7/JS7+-+eMailDefault+Job+Resource).
- **Inhaltstyp**, **Charset**, **Encoding** sind für jedes System, das E-Mails versendet, gleich.
- **Genehmigungsanfrage E-Mail**
  - **Cc**, **Bcc** geben optional die Empfänger von Kopien und Durchschlägen der Benachrichtigung an.
  - **Subject**, **Body** der E-Mail können Platzhalter enthalten, die beim Versand der E-Mail ersetzt werden. Platzhalter werden mit dem Format $\{Platzhalter\} angegeben.
    - Die folgenden Platzhalter sind verfügbar:
      - $\{RequestStatusDate\}: Datum des Anfragestatus
      - $\{ApprovalStatusDate\}: Datum des Genehmigungsstatus
      - $\{Title\}: Titel der Anfrage
      - $\{Requestor\}: Konto des Antragstellers
      - $\{RequestStatus\}: Anfragestatus, einer von REQUESTED, EXECUTED, WITHDRAWN
      - $\{Approver\}: Konto des Genehmigenden
      - $\{ApprovalStatus\}: Genehmigungsstatus, einer der Werte APPROVED, REJECTED
      - $\{RequestURI\}: Anfrage-URI
      - $\{RequestBody\}: Anfragekörper mit den Details der REST-API-Anfrage
      - $\{Kategorie\}: Kategorie
      - $\{Grund\}: Grund
    - Darüber hinaus können die folgenden Platzhalter verwendet werden, wenn sie von einer Job Resource wie *eMailDefault* angegeben werden.
      - $\{jocURL\}: URL, von der aus das JOC Cockpit zugänglich ist.
      - $\{jocURLReverseProxy\}: dieselbe Funktionalität wie *jocURL*, aber die URL wird als über einen Reverse Proxy verfügbar angegeben

## Referenzen

### Kontexthilfe

- [Approval Notification Settings](/approval-notification-settings)
- [Approval Request](/approval-request)
- [Approval Requests](/approval-requests)
- [Approver Profiles](/approval-profiles)

### Product Knowledge Base

- [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)
- [JS7 - eMailDefault Job Resource](https://kb.sos-berlin.com/display/JS7/JS7+-+eMailDefault+Job+Resource)

