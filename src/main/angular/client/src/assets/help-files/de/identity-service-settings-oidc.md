# OIDC Identity Service Einstellungen

Identitätsdienste regeln den Zugriff auf JOC Cockpit durch Authentifizierung und Autorisierung, siehe [Identity Services](/identity-services).

Identitätsdienste werden in der folgenden Konfiguration festgelegt:

- **Allgemeine Konfiguration**, die Eigenschaften enthält, die für alle Identitätsdienste verfügbar sind, siehe [Identity Service - Configuration](/identity-service-configuration).
- **Einstellungen**, die für den OIDC-Identitätsdiensttyp spezifisch sind.

## Einstellungen

Die folgenden Einstellungen sind verfügbar:

- **OIDC Name** wird von JOC Cockpit für die Beschriftung der entsprechenden Login-Schaltfläche auf der Login-Seite verwendet.
- **OIDC Authentifizierungs-URL** wird vom Client für die Anmeldung beim OIDC Identity Provider verwendet. Die URL wird vom Client für die Anmeldung aufgerufen und gibt das Access Token vom OIDC Identity Provider zurück. Sie wird ebenfalls beim Lesen der Einstellungen des OIDC Identity Providers mit der URL */.well-known/openid-configuration* verwendet und dient als Aussteller bei der Token-Verifizierung.
- **Flow-Typ**
  - **Authorization Code Flow** ist der am häufigsten verwendete Flow mit bewährter Sicherheit.
  - **Implicit Flow** ist ein früherer Flow, der als unsicher gilt.
  - **Client Credentials Flow** íst ein vereinfachter Flow für die Stapelverarbeitung ohne Benutzerinteraktion.
- **OIDC Client ID** identifiziert den Client mit dem OIDC Identity Provider.
- **OIDC Client Secret** ist das Passwort, das der *OIDC Client ID* im OIDC Identity Provider zugeordnet ist.
- **OIDC-Benutzername-Attribut** ist der Name des Attributs, das vom OIDC-Identitätsdienst zur Identifizierung des Benutzerkontos verwendet wird.
  - Die folgende Strategie wird angewendet, um das Attribut zu identifizieren, das für die Zuordnung zum JOC Cockpit-Konto verwendet wird:
    - die URL *https://\<identity-provider\>/.well-known/openid-configuration* wird aufgerufen.
    - die Antwort wird auf das Objekt *claims_supported* geprüft
      - falls nicht vorhanden oder leer, wird das Attribut *email* verwendet
      - wenn vorhanden und wenn es das Attribut *preferred_username* enthält, wird dieses Attribut verwendet.
    - wenn kein Attribut identifiziert wurde, wird das Attribut *email* verwendet.
  - Sollte dies nicht zu einem identifizierbaren Benutzerkonto führen, können Benutzer das Attribut name angeben. Häufig unterstützen OIDC Identity Provider Attributnamen wie *username* oder *email*.
- das **OIDC-Bild** kann optional hochgeladen werden und wird auf der Anmeldeseite angezeigt. Benutzer können auf das Bild klicken, um sich beim OIDC-Identitätsdienst anzumelden.
- **OIDC Truststore Path** muss, falls angegeben, ein X.509-Zertifikat enthalten, das für die erweiterte Schlüsselverwendung der Serverauthentifizierung für den Identitätsanbieter angegeben ist.
  - Für Verbindungen zu bekannten OIDC-Identitätsanbietern wie Azure® sollten Sie den Pfad zu der Java *cacerts* Truststore-Datei angeben, die mit dem Java JDK geliefert wird, das mit JOC Cockpit verwendet wird.
  - Der Truststore muss ein selbstsigniertes Zertifikat von einer privaten oder öffentlichen Zertifizierungsstelle enthalten. Normalerweise wird das CA-Zertifikat verwendet, da andernfalls die gesamte Zertifikatskette, die zum Signieren des Server-Authentifizierungszertifikats erforderlich ist, im Truststore verfügbar sein muss.
  - Wenn diese Einstellung nicht angegeben wird, verwendet das JOC Cockpit den Truststore, der in der Konfigurationsdatei *JETTY_BASE/resources/joc/joc.properties* konfiguriert ist. Dies beinhaltet die Verwendung der Einstellungen für *OIDC Truststore Password* und *OIDC Truststore Type*.
  - Der Pfad zum Truststore kann relativ zum Verzeichnis *JETTY_BASE/resources/joc* angegeben werden. Wenn sich der Truststore in diesem Verzeichnis befindet, wird nur der Dateiname angegeben, normalerweise mit der Erweiterung .p12 oder .pfx. Andere relative Speicherorte können angegeben werden, zum Beispiel *../../joc-truststore.p12*, wenn sich der Truststore im Verzeichnis *JETTY_BASE* befindet.
  - Ein absoluter Pfad kann angegeben werden.
- **OIDC Truststore Password** gibt das Passwort an, das den Truststore schützt. Für den Truststore *cacerts* des Java JDK lautet das Standardpasswort *changeit*.
- **OIDC Truststore Type** ist entweder PKCS12 oder JKS (veraltet).
- **OIDC Claims** geben OIDC *Rollen* oder *Gruppen* an, die für die Zuordnung zu JS7-Rollen verwendet werden. Standardmäßige *OIDC-Claims* umfassen *Rollen*, *Gruppen*.
- **OIDC-Bereiche** geben den Bereich an, für den *OIDC-Ansprüche* vom OIDC Identity Service Provider zurückgegeben werden. Standardmäßige *OIDC-Bereiche* umfassen *Rollen*, *Gruppen*, *Profile*
- **OIDC Group/Roles Mapping** enthält, um Konten Rollen zuzuweisen.
  - Es kann eine Liste von Ansprüchen angegeben werden, die die im OIDC Identity Service Provider konfigurierten Gruppen enthalten. Verfügbare Ansprüche können durch Überprüfung des *JSON Web Token* während der Registrierung verfügbar gemacht werden.
 - Bei der Zuweisung werden die vom OIDC Identity Service Provider verfügbaren Gruppen den mit dem Identity Service konfigurierten Rollen zugewiesen. Jeder Gruppe kann eine beliebige Anzahl von Rollen zugewiesen werden.

## Referenzen

### Kontext-Hilfe

- [Identity Service - Configuration](/identity-service-configuration)
- [Identity Services](/identity-services)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
- [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)

