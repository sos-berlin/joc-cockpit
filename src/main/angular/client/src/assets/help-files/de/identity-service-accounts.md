# Identitätsdienste - Benutzerkonten

Identitätsdienste regeln den Zugriff auf JOC Cockpit durch Authentifizierung und Autorisierung, siehe [Identitätsdienste](/identity-services).

Benutzerkonten werden mit JOC Cockpit für die folgenden Identitätsdiensttypen verwaltet und gespeichert:

| Typ Identitätsdienst | Dokumentation |
| ----- | ----- |
| *JOC* | [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service) |
| *KEYCLOAK-JOC* | [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service) |
| *LDAP-JOC* | [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service) |
| *OIDC-JOC* | [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service) |
| *ZERTIFIKAT* | [JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service) |
| *FIDO* | [JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service) |

Für die folgenden Typen von Identitätsdiensten werden die Benutzerkonten nicht mit JOC Cockpit, sondern mit dem Identitätsdienstanbieter verwaltet:

| Typ Identitätsdienst | Dokumentation |
| ----- | ----- |
| *KEYCLOAK* | [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service) |
| *LDAP* | [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service) |
| *OIDC* | [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service) |

## Liste der Konten

Für jedes Konto werden die folgenden Eigenschaften angezeigt:

- **Konto** gibt das Konto an, das bei der Anmeldung angegeben wird.
- **Rollen** zeigt die Liste der [Identitätsdienste - Rollen](/identity-service-roles) an, die dem Konto zugewiesen sind.
- **Kennwortänderung erzwingen** zeigt an, ob das Benutzerkonto sein Kennwort bei der nächsten Anmeldung ändern muss.
- **Blockiert** zeigt an, dass das Konto zu einer [Identitätsdienste - Sperrliste](/identity-service-blocklist) hinzugefügt wurde und der Zugriff verweigert wird.
- **Deaktiviert** zeigt an, dass das Konto inaktiv ist und der Zugriff verweigert wird.

## Operationen für Konten

Benutzer können ein Konto hinzufügen, indem sie die entsprechende Schaltfläche in der oberen rechten Ecke der Ansicht verwenden.

### Operationen für einzelne Konten

Die folgenden Operationen sind über das 3-Punkte Aktionsmenü eines jeden Kontos verfügbar:

- **Editireren** erlaubt [Identitätsdienste - Konfiguration Benutzerkonten](/identity-service-account-configuration).
- **Duplizieren** kopiert das ausgewählte Konto in ein neues Konto. Der Benutzer muss den Namen des neuen Kontos angeben.
- **Kennwort zurücksetzen** löscht das Kennwort des Kontos und weist das Kennwort zu, das mit der Einstellung *initial_password* auf der Seite [Einstellungen - Identitätsdienste](/settings-identity-service) festgelegt wurde. Das zugehörige Benutzerkonto muss sich mit dem *initial_password* anmelden und sein Kennwort bei der nächsten Anmeldung ändern.
- **Kennwortänderung erzwingen** zwingt das Konto, sein Kennwort bei der nächsten Anmeldung zu ändern.
- **Konto zur Sperrliste hinzufügen** verweigert den Zugriff auf das Konto für die Dauer, in der das Konto der [Identitätsdienste - Sperrliste](/identity-service-blocklist) hinzugefügt ist.
- **Deaktivieren** deaktiviert das Konto und verweigert die Anmeldung durch dieses Konto.
- **Löschen** löscht das Konto aus dem Identitätsdienst.
- **Berechtigungen anzeigen** zeigt die Liste der Berechtigungen an, die sich aus den zusammengeführten Rollen des Kontos ergeben.

### Massenoperationen für Konten

Benutzer finden die folgenden Massenoperationen über Schaltflächen am oberen Bildschirmrand:

- **Exportieren** fügt ausgewählte Konten zu einer Exportdatei im JSON-Format hinzu, die für den Import von Konten in einen anderen Identitätsdienst in derselben oder einer anderen JOC Cockpit Instanz verwendet werden kann.
- **Kopieren** kopiert die ausgewählten Konten in eine interne Zwischenablage, aus der sie in einen anderen Identitätsdienst in derselben JOC Cockpit Instanz eingefügt werden können.

Benutzer können ein oder mehrere *Konten* auswählen, um die oben genannten Operationen für die ausgewählten *Konten* im Ganzen durchzuführen.

- **Kennwort zurücksetzen** löscht das Kennwort der ausgewählten Konten und weist das Kennwort zu, das mit der Einstellung *initial_password* auf der Seite [Einstellungen - Identitätsdienste](/settings-identity-service) festgelegt wurde. Die betreffenden Benutzerkonten müssen sich mit dem *initial_password* anmelden und ihr Kennwort bei der nächsten Anmeldung ändern.
- **Kennwortänderung erzwingen** zwingt die ausgewählten Konten, ihr Kennwort bei der nächsten Anmeldung zu ändern.
- **Deaktivieren** deaktiviert ausgewählte Konten und verweigert die Anmeldung durch die angegebenen Konten.
- **Aktivieren** aktiviert die ausgewählten, deaktivierten Konten.
- **Löschen** löscht ausgewählte Konten aus dem Identitätsdienst.

## Referenzen

### Kontext-Hilfe

- [Einstellungen - Identitätsdienste](/settings-identity-service)
- [Einstellungen - JOC Cockpit](/settings-joc)
- [Identitätsdienste](/identity-services)
- [Identitätsdienste - Konfiguration](/identity-service-configuration)
- [Identitätsdienste - Konfiguration Benutzerkonten](/identity-service-account-configuration)
- [Identitätsdienste - Rollen](/identity-service-roles) 
- [Identitätsdienste - Sperrliste](/identity-service-blocklist)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
