# Identitätsdienste - Rollen

Identitätsdienste regeln den Zugriff auf JOC Cockpit durch Authentifizierung und Autorisierung, siehe [Identitätsdienste](/identity-services).

Für die Autorisierung bietet JS7 ein rollenbasiertes Zugriffsmodell (RBAC), das beinhaltet, dass

- Rollen frei aus verfügbaren Berechtigungen konfiguriert werden,
- Benutzern eine oder mehrere Rollen zugewiesen werden, die für die daraus resultierenden Berechtigungen zusammengeführt werden.

JS7 wird mit den folgenden Funktionen ausgeliefert - [JS7 - Default Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Default+Roles+and+Permissions), die vom Benutzer nach Belieben geändert oder gelöscht werden können:

| Rolle | Zweck | Berechtigungen |
| ----- | ----- | ----- |
| Administrator | Dies ist eine technische Rolle ohne jegliche Verantwortlichkeiten im IT-Prozess und Geschäftsprozess. | Die Rolle umfasst alle Berechtigungen zum Starten, Neustarten, Umschalten usw. der JS7 Produkte. |
| api_user | Die Rolle ist für Anwendungen wie Systemmonitore gedacht, die auf JS7 über seine API zugreifen. | Die Rolle gewährt vorzugsweise Ansichtsberechtigungen. Hinzu kommen Berechtigungen zur Verwaltung von Aufträgen und zum Ausrollen von Arbeitsabläufen. |
| application_manager | Dies ist eine Ingenieursrolle mit fundierten Kenntnissen von Arbeitsabläufen, z.B. für das Änderungsmanagement. Diese Rolle ist nicht unbedingt in den täglichen Betrieb eingebunden. | Die Rolle umfasst Berechtigungen für administrative Aufgaben für Controller Instanzen, Cluster-Konfiguration, Zertifikate und Anpassungen. Darüber hinaus umfasst die Rolle die Berechtigung zur Verwaltung des JS7 Inventars. Die Verwaltung von Benutzerkonten ist nicht enthalten. |
| business_user | Die Rolle ist für Back-Office Benutzer gedacht, die nicht für den IT-Betrieb, sondern möglicherweise für den Geschäftsprozess verantwortlich sind und daher daran interessiert sind, über den Status der Ausführung von Arbeitsabläufen informiert zu sein. | Die Rolle bietet Nur-Lese-Berechtigungen. |
| incident_manager |Die Rolle ist für das IT Service Desk gedacht, z.B. 1st und 2nd Level Support, Interventionen und Incident Management | Die Rolle basiert auf der Rolle *application_manager* und fügt volle Berechtigungen für Controller und Agenten hinzu, die für das Incident Management erforderlich sind, z.B. Zugriff auf Protokolldateien. |
| it_operator | Dies ist die Rolle für den täglichen Betrieb von Arbeitsabläufen und Tagesplan. | Die Rolle gewährt vorzugsweise Ansichtsrechte. Hinzu kommen Berechtigungen zur Verwaltung von Aufträgen und zum Ausrollen von Arbeitsabläufen. |

Benutzer werden ermutigt, ungenutzte Rollen zu löschen und die Berechtigungen für Rollen nach Bedarf anzupassen.

## Umfang der Rollen

Rollen werden für die folgenden Geltungsbereiche festgelegt:

- Jede Rolle kann auf einen oder mehrere Inventarordner beschränkt werden.
- Jeder Rolle wird ein Berechtigungssatz für Operationen in JOC Cockpit zugewiesen.
- Jeder Rolle wird ein Berechtigungssatz für Standardoperationen auf allen Controller Instanzen zugewiesen.
- Jeder Rolle können zusätzliche Berechtigungssätze pro Controller zugewiesen werden.

Berechtigungen legen einen der folgenden Zustände im zugehörigen Bereich fest:

- die Berechtigung ist nicht zugewiesen,
- die Berechtigung ist erteilt,
- die Berechtigung ist verweigert.

Berechtigungen werden aus allen Rollen für die resultierenden Berechtigungen eines Benutzerkontos zusammengeführt:

- JOC-Cockpit
  - Wenn eine Berechtigung im Bereich einer einzelnen Rolle nicht zugewiesen ist, können weitere Rollen die Berechtigung erteilen. Wenn keine Rolle die Berechtigung erteilt, wird sie auch nicht in den daraus resultierenden Berechtigungen erteilt.
  - Wenn eine Berechtigung im Geltungsbereich einer einzelnen Rolle gewährt wird, dann wird sie auch für daraus resultierende Berechtigungen gewährt.
  - Wenn eine Berechtigung im Rahmen einer einzelnen Rolle verweigert wird, dann wird sie auch für daraus resultierende Berechtigungen verweigert. Verweigerte Berechtigungen haben Vorrang vor gewährten Berechtigungen.
- Controller
  - wenn eine Berechtigung im Standardbereich nicht zugewiesen ist, können die Bereiche für einzelne Controller die Berechtigung für den entsprechenden Controller gewähren.
  - wenn eine Berechtigung im Standardbereich gewährt wird, gilt sie standardmäßig für alle Controller.
  - wenn eine Berechtigung für einen bestimmten Controller erteilt wird, enthalten die daraus resultierenden Berechtigungen für den Controller diese Berechtigung.
  - Wenn eine Berechtigung für einen bestimmten Controller verweigert wird, hat dies Vorrang vor der gleichen Berechtigung, die im Standardbereich und in anderen Rollen für denselben Controller erteilt wurde.
  - Wenn eine Berechtigung aus dem Standardbereich verweigert wird, hat dies Vorrang vor der gleichen Berechtigung, die für einen beliebigen Controller erteilt wurde.

## Operationen für Rollen

Die folgenden Operationen sind über die entsprechenden Schaltflächen in der oberen rechten Ecke der Unteransicht verfügbar:

- **Konto** schränkt die Anzeige auf Rollen ein, die dem ausgewählten Konto zugewiesen sind.
- **Importieren** ermöglicht den Import von Rollen aus einer Datei im JSON-Format, die zuvor durch einen *Export* von Rollen erstellt wurde.
- **Controller hinzufügen** ermöglicht das Hinzufügen eines bestimmten Controller mit einem separaten Berechtigungssatz.
- **Rolle hinzufügen** erlaubt eine neue Rolle zu erstellen.

### Operationen für einzelne Rollen

Aus der Liste der Rollen können Benutzer eine Rolle per Drag&amp;Drop an eine andere Position ziehen. Die Operation hat keinen Einfluss auf die Bearbeitung der Rollen.

Im 3-Punkte Aktionsmenü jeder Rolle werden die folgenden Operationen angeboten:

- **Bearbeiten** bietet die Möglichkeit, den Namen der Rolle zu ändern. Änderungen werden für bestehende Rollen berücksichtigt, denen beliebige Benutzerkonten zugewiesen sind.
- **Duplizieren** kopiert die Rolle in eine neue Rolle. Der Benutzer gibt den Namen der neuen Rolle an.
- **Löschen** löscht die Rolle aus dem Inventar und aus allen Benutzerkonten, denen die Rolle zugewiesen ist.

### Massenoperationen für Rollen

Die folgenden Massenoperationen sind verfügbar, wenn Sie eine oder mehrere Rollen auswählen:

- **Export** bietet eine Datei im JSON-Format zum Herunterladen an, die die Konfiguration der ausgewählten Rollen enthält. Die Exportdatei kann für den Import mit der gleichen oder einer anderen JOC Cockpit Instanz verwendet werden.
- **Kopieren** fügt die Rollen in die interne Zwischenablage ein, um sie später in einen anderen Identity Service in derselben JOC Cockpit Instanz einzufügen.
- **Löschen** löscht die ausgewählten Rollen aus dem Inventar und aus allen Benutzerkonten, denen die Rollen zugewiesen sind.

## Referenzen

### Kontext-Hilfe

- [Identitätsdienste](/identity-services)
- [Identitätsdienste - Berechtigungen](/identity-service-permissions)

### Product Knowledge Base

- [JS7 - Default Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Default+Roles+and+Permissions)
- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
- [JS7 - Verwaltung von Benutzerkonten, Rollen und Berechtigungen](https://kb.sos-berlin.com/display/JS7/JS7+-+Verwaltung+von+Benutzerkonten+Rollen+und+Berechtigungen)
