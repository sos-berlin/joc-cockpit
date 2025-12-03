# Identitätsdienste

Identity Services regeln den Zugang zu JOC Cockpit durch Authentifizierung und Autorisierung.

Identitätsdienste implementieren Authentifizierungsmethoden und den Zugang zu Identitätsprovidern. Beispielsweise werden Anmeldedaten wie Benutzerkonto/Passwort als Authentifizierungsmethode für den Zugriff auf einen LDAP-Verzeichnisdienst verwendet, der als Identity Provider fungiert. Siehe [JS7 - Identity and Access Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+and+Access+Management).

- [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
- [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)
- [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
- [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)
- [JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
- [JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)

Einzelheiten finden Sie unter [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services).

Standardmäßig finden Benutzer den JOC-INITIAL Identity Service, der bei der Erstinstallation hinzugefügt wird.

- Der Identitätsdienst enthält das einzelne Benutzerkonto *root* mit dem Passwort *root*. Die Benutzer müssen das Kennwort des *root*-Benutzerkontos bei der ersten Anmeldung ändern.
- Benutzer können [Identity Service - Accounts](/identity-service-accounts) und [Identity Service - Roles](/identity-service-roles) zum Identitätsdienst hinzufügen.
- Benutzer können den bestehenden Identitätsdienst ändern oder neue Identitätsdienste hinzufügen.

## Auslösen von Identitätsdiensten

Identitätsdienste können als optional oder obligatorisch eingestuft werden. Sie geben einen Auftrag an, durch den sie ausgelöst werden.

- Die Identitätsdienste werden in aufsteigender Reihenfolge ausgelöst.
- Wenn die Identitätsdienste als optional eingestuft sind, wird die Anmeldung bei erfolgreicher Anmeldung mit dem ersten Identitätsdienst abgeschlossen. Im Falle einer fehlgeschlagenen Anmeldung wird der nächste Identitätsdienst ausgelöst.
- Wenn die Identitätsdienste als obligatorisch eingestuft sind, werden alle Identitätsdienste bei der Anmeldung eines Benutzers ausgelöst.

## Liste der Identitätsdienste

Für jeden Identitätsdienst werden die folgenden Eigenschaften angezeigt:

- **Der Name des Identitätsdienstes** kann frei gewählt werden.
- **Identitätsdiensttyp** ist einer von JOC, LDAP, OIDC, CERTIFICATE, FIDO, KEYCLOAK. Für LDAP, OIDC und KEYCLOAK können die zusätzlichen Servicetypen LDAP-JOC, OIDC-JOC und KEYCLOAK-JOC verwendet werden, die die Rollenzuweisung mit JOC Cockpit speichern.
- **Authentifizierungsschema** kann entweder *Ein-Faktor* oder *Zwei-Faktor* sein. 
- **Zweiter Faktor** gibt an, ob ein zweiter Faktor für die *Zwei-Faktor*-Authentifizierung aktiviert ist.
- **Auftrag** gibt die Reihenfolge an, in der der Identitätsdienst für die Authentifizierung ausgelöst wird.
- **Deaktiviert** zeigt an, ob der Identitätsdienst inaktiv ist und nicht für die Anmeldung verwendet wird.
- **Erforderlich** zeigt an, dass der Identitätsdienst zusätzlich zu Identitätsdiensten mit einer früheren Bestellung ausgelöst wird.

## Operationen mit Identitätsdiensten

Benutzer können auf einen der Identitätsdienste klicken, um zur Ansicht [Identity Service - Roles](/identity-service-roles) oder [Identity Service - Accounts](/identity-service-accounts) zu navigieren, falls dies für den Dienst angeboten wird.

Benutzer können einen Identitätsdienst über die entsprechende Schaltfläche in der oberen rechten Ecke des Bildschirms hinzufügen.

Für bestehende Identitätsdienste werden die folgenden Operationen über das 3-Punkte-Aktionsmenü angeboten:

- **Bearbeiten** bietet die Möglichkeit, die allgemeine Konfiguration des Identitätsdienstes festzulegen.
- **Einstellungen verwalten** bietet die Möglichkeit, spezifische Einstellungen für einen Diensttyp festzulegen.
- **Deaktivieren** deaktiviert den Identitätsdienst, er wird nicht für die Anmeldung verwendet.
- **Löschen** entfernt den Identitätsdienst.

## Referenzen

### Kontext-Hilfe

- [Identity Service - Accounts](/identity-service-accounts)
- [Identity Service - Configuration](/identity-service-configuration)
- [Identity Service - Roles](/identity-service-roles)

### Product Knowledge Base

- [JS7 - Identity and Access Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+and+Access+Management)
  - [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
    - [JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
    - [JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
    - [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
    - [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)
    - [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
    - [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)
  - [JS7 - Authentication](https://kb.sos-berlin.com/display/JS7/JS7+-+Authentication)
  - [JS7 - Authorization](https://kb.sos-berlin.com/display/JS7/JS7+-+Authorization)
  
