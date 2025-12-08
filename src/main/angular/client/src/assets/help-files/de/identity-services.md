# Identitätsdienste

Identitätsdienste regeln den Zugang zu JOC Cockpit durch Authentifizierung und Autorisierung.

Identitätsdienste implementieren Authentifizierungsmethoden und den Zugang zu Identitätsanbietern. Beispielsweise werden Anmeldedaten wie Benutzerkonto/Kennwort als Authentifizierungsmethode für den Zugriff auf einen LDAP-Verzeichnisdienst verwendet, der als Identitätsanbietern fungiert. Siehe [JS7 - Identity and Access Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+and+Access+Management).

| Typ Identitätsdienst | Dokumentation |
| ----- | ----- |
| *JOC* | [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service) |
| *KEYCLOAK-JOC* | [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service) |
| *LDAP-JOC* | [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service) |
| *OIDC-JOC* | [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service) |
| *ZERTIFIKAT* | [JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service) |
| *FIDO* | [JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service) |

Einzelheiten finden Sie unter [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services).

Standardmäßig finden Benutzer den JOC-INITIAL Identitätsdienst, der bei der Erstinstallation hinzugefügt wird.

- Der Identitätsdienst enthält das einzelne Benutzerkonto *root* mit dem Kennwort *root*. Die Benutzer müssen das Kennwort des *root*-Benutzerkontos bei der ersten Anmeldung ändern.
- Benutzer können [Identitätsdienste - Benutzerkonten](/identity-service-accounts) und [Identitätsdienste - Rollen](/identity-service-roles) zum Identitätsdienst hinzufügen.
- Benutzer können den bestehenden Identitätsdienst ändern oder neue Identitätsdienste hinzufügen.

## Verwenden von Identitätsdiensten

Identitätsdienste können als optional oder obligatorisch konfiguriert werden.

- Identitätsdienste werden in aufsteigender Reihenfolge für die Anmeldung eines Benutzerkontos verwendet.
- Wenn Identitätsdienste als optional eingestuft sind, wird der Anmeldevorgang bei erfolgreicher Anmeldung mit dem ersten Identitätsdienst abgeschlossen. Im Falle einer fehlgeschlagenen Anmeldung wird der nächste Identitätsdienst verwendet.
- Wenn Identitätsdienste als obligatorisch eingestuft sind, werden alle Identitätsdienste bei der Anmeldung eines Benutzers nacheinander verwendet.

## Liste der Identitätsdienste

Für jeden Identitätsdienst werden die folgenden Eigenschaften angezeigt:

- **Name des Identitätsdienstes** kann frei gewählt werden.
- **Typ des Identitätsdienstes** ist einer von JOC, LDAP, OIDC, CERTIFICATE, FIDO, KEYCLOAK. Für LDAP, OIDC und KEYCLOAK können die zusätzlichen Servicetypen LDAP-JOC, OIDC-JOC und KEYCLOAK-JOC verwendet werden, die die Rollenzuweisung mit JOC Cockpit speichern.
- **Authentifizierungsschema** kann entweder *Ein-Faktor* oder *Zwei-Faktor* sein. 
- **Zweiter Faktor** gibt an, ob ein zweiter Faktor für die *Zwei-Faktor*-Authentifizierung aktiviert ist.
- **Reihenfolge** gibt die Reihenfolge an, in der der Identitätsdienst für die Authentifizierung verwendet wird.
- **Deaktiviert** zeigt an, ob der Identitätsdienst inaktiv ist und nicht für die Anmeldung verwendet wird.
- **Erforderlich** zeigt an, dass der Identitätsdienst zusätzlich zu Identitätsdiensten anderen Identitätsdiensten verwendet wird.

## Operationen für Identitätsdienste

Benutzer können auf einen der Identitätsdienste klicken, um zur Ansicht [Identitätsdienste - Rollen](/identity-service-roles) oder [Identitätsdienste - Benutzerkonten](/identity-service-accounts) zu navigieren, falls dies für den Dienst angeboten wird.

Benutzer können einen Identitätsdienst über die entsprechende Schaltfläche in der oberen rechten Ecke des Bildschirms hinzufügen.

Für bestehende Identitätsdienste werden die folgenden Operationen über das 3-Punkte Aktionsmenü angeboten:

- **Bearbeiten** bietet die Möglichkeit, die allgemeine Konfiguration des Identitätsdienstes festzulegen.
- **Einstellungen verwalten** bietet die Möglichkeit, spezifische Einstellungen für einen Diensttyp festzulegen.
- **Deaktivieren** deaktiviert den Identitätsdienst, er wird nicht für die Anmeldung verwendet.
- **Löschen** entfernt den Identitätsdienst.

## Referenzen

### Kontext-Hilfe

- [Identitätsdienste - Benutzerkonten](/identity-service-accounts)
- [Identitätsdienste - Konfiguration](/identity-service-configuration)
- [Identitätsdienste - Rollen](/identity-service-roles)

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
  