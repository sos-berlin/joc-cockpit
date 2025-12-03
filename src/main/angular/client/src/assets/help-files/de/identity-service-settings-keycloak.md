# Keycloak Identity Service Einstellungen

Identitätsdienste regeln den Zugriff auf JOC Cockpit durch Authentifizierung und Autorisierung, siehe [Identity Services](/identity-services).

Identitätsdienste werden in der folgenden Konfiguration festgelegt:

- **Allgemeine Konfiguration**, die Eigenschaften enthält, die für alle Identitätsdienste verfügbar sind, siehe [Identity Service - Configuration](/identity-service-configuration).
- **Einstellungen**, die spezifisch für den Keycloak Identity Service Typ sind.

## Einstellungen

- **Keycloak URL** ist die Basis-URL, für die die Keycloak REST API verfügbar ist
- **Keycloak Administrative Account** ist ein Keycloak-Konto mit einer administrativen Rolle, dem die Rollen *realm-management.view-clients* und *realm-management.view-users* in Keycloak zugewiesen sind. Das administrative Konto wird verwendet, um die Rollen für ein Keycloak-Konto abzurufen und um Zugangstoken zu erneuern.
- **Keycloak Administrative Password** ist das Passwort für das *Keycloak Administration Account*.
- **Keycloak Truststore Path** gibt den Ort eines Truststores an, wenn der Keycloak Server für HTTPS-Verbindungen konfiguriert ist. Der angegebene Truststore muss ein X.509-Zertifikat enthalten, das für die erweiterte Schlüsselverwendung der Server-Authentifizierung angegeben ist.
  - Der Truststore kann ein von einer privaten CA signiertes Zertifikat oder ein von einer öffentlichen CA signiertes Zertifikat enthalten. In der Regel wird das Root-CA-Zertifikat verwendet, da sonst die gesamte Zertifikatskette, die zum Signieren des Server-Authentifizierungszertifikats erforderlich ist, im Truststore verfügbar sein muss.
  - Wenn der Keycloak Server für HTTPS-Verbindungen betrieben wird und diese Einstellung nicht angegeben ist, dann verwendet das JOC Cockpit den Truststore, der in der Konfigurationsdatei *JETTY_BASE/resources/joc/joc.properties* konfiguriert ist. Dies schließt die Verwendung der Einstellungen für das Truststore-Passwort und den Truststore-Typ ein.
- Der Pfad zum Truststore wird relativ zum Verzeichnis *JETTY_BASE/resources/joc* angegeben. Wenn sich der Truststore in diesem Verzeichnis befindet, wird nur der Dateiname angegeben, normalerweise mit der Erweiterung .p12. Andere relative Speicherorte können angegeben werden, zum Beispiel *../../joc-truststore.p12*, wenn sich der Truststore im Verzeichnis *JETTY_BASE* befindet. Ein absoluter Pfad kann nicht angegeben werden und es kann kein Pfad angegeben werden, der in der Dateisystemhierarchie vor dem Verzeichnis *JETTY_BASE* liegt.
- **Keycloak Truststore Password** gibt das Passwort an, das den Truststore schützt, wenn der Keycloak Server für HTTPS-Verbindungen konfiguriert ist.
- **Keycloak Truststore Type** s eine von *PKCS12* oder *JKS* (veraltet). Die Einstellung wird verwendet, wenn der Keycloak Server für HTTPS-Verbindungen konfiguriert ist.
- Keycloak Clients sind Entitäten, die Keycloak zur Authentifizierung eines Benutzerkontos auffordern. Eine Anwendung wie z.B. JOC Cockpit fungiert als Client für den Keycloak Server. Clients verwenden Keycloak zur Authentifizierung und zur Bereitstellung einer Single Sign-On-Lösung.
  - **Keycloak Client ID** und *Keycloak Client Secret* werden verwendet für
    - das Anfordern eines Zugangstokens
      - für die Benutzerauthentifizierung,
      - für den administrativen Zugriff,
    - zur Validierung eines bestehenden Zugangstokens,
    - erneuerung eines bestehenden Zugangstokens.
  - **Keycloak Client Secret** ist Eigentum des Clients und muss sowohl dem Keycloak Server als auch dem JOC Cockpit bekannt sein.
- **Keycloak Realm** verwaltet eine Reihe von Benutzern, Anmeldeinformationen, Rollen und Gruppen. Ein Benutzer gehört zu einem Realm und führt eine Anmeldung in einem Realm durch. Realms sind voneinander isoliert, sie verwalten und authentifizieren ausschließlich Benutzerkonten, die sie kontrollieren.
- **Keycloak Version 16 oder früher** ist ein Kompatibilitätsschalter für frühere Keycloak-Versionen.

## Referenzen

### Kontext-Hilfe

- [Identity Service - Configuration](/identity-service-configuration)
- [Identity Services](/identity-services)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
- [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)

