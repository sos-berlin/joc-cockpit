# Identitätsdienste - Konfiguration

Identitätsdienste regeln den Zugriff auf JOC Cockpit durch Authentifizierung und Autorisierung, siehe [Identitätsdienste](/identity-services).

Identitätsdienste werden in der folgenden Konfiguration festgelegt:

- **Allgemeine Konfiguration**, die Eigenschaften enthält, die für alle Identitätsdienste verfügbar sind.
- **Einstellungen**, die für den Identitätsdiensttyp spezifisch sind, siehe
  - [Keycloak Identitätsdienst - Einstellungen](/identity-service-settings-keycloak)
  - [LDAP Identitätsdienst - Einstellungen](/identity-service-settings-ldap)
  - [OIDC Identitätsdienst - Einstellungen](/identity-service-settings-oidc)

## Allgemeine Konfiguration

Für jeden Identitätsdienst werden die folgenden Eigenschaften angezeigt:

- **Der Name des Identitätsdienstes** kann frei gewählt werden.
- **Identitätsdienst-Typ** ist einer von JOC, LDAP, OIDC, CERTIFICATE, FIDO, KEYCLOAK. Für LDAP, OIDC und KEYCLOAK können die zusätzlichen Servicetypen LDAP-JOC, OIDC-JOC und KEYCLOAK-JOC verwendet werden, die die Rollenzuweisung mit JOC Cockpit speichern.
- **Ordering** gibt die Reihenfolge an, in der der Identitätsdienst zur Authentifizierung ausgelöst wird.
  - Benutzer können einen ganzzahligen Wert angeben, um die Reihenfolge festzulegen.
  - Benutzer können die Reihenfolge ändern, indem sie den Dienst in der Liste von [Identitätsdienste](/identity-services) verschieben.
- **Erforderlich** gibt an, dass der Identitätsdienst zusätzlich zu den Identitätsdiensten mit einer früheren Reihenfolge ausgelöst wird.
- **Deaktiviert** zeigt an, dass der Identitätsdienst inaktiv ist und nicht für die Anmeldung verwendet wird.
- **Authentifizierungsschema** ist eines von *Einzelfaktor* oder *Zwei-Faktor*. 
  - wenn *zwei-Faktoren* gewählt wird, muss der Benutzer den zweiten Faktor aus einem der Identitätsdienste der Identitätsdiensttypen FIDO oder CERTIFICATE auswählen.

## Referenzen

### Kontext-Hilfe

- [Identitätsdienste](/identity-services)
  - [Keycloak Identitätsdienst - Einstellungen](/identity-service-settings-keycloak)
  - [LDAP Identitätsdienst - Einstellungen](/identity-service-settings-ldap)
  - [OIDC Identitätsdienst - Einstellungen](/identity-service-settings-oidc)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
  - [JS7 - Keycloak Identity Service](/https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)
  - [JS7 - LDAP Identity Service](/https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
  - [JS7 - OIDC Identity Service](/https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)
  