# Identitätsdienst - OIDC Einstellungen

Identitätsdienste regeln den Zugriff auf JOC Cockpit durch Authentifizierung und Autorisierung, siehe [Identitätsdienste](/identity-services).

Identitätsdienste werden in der folgenden Konfiguration festgelegt:

- **Allgemeine Konfiguration**, die Eigenschaften enthält, die für alle Identitätsdienste verfügbar sind, siehe [Identitätsdienste - Konfiguration](/identity-service-configuration).
- **Einstellungen**, die für den OIDC Identitätsdiensttyp spezifisch sind.

## Einstellungen

Die folgenden Einstellungen sind verfügbar:

- **OIDC Name** wird von JOC Cockpit für die Beschriftung der entsprechenden Anmelde-Schaltfläche auf der Anmelde-Seite verwendet.
- **OIDC Authentication URL** wird vom Client für die Anmeldung beim OIDC Identitätsdienstanbieter verwendet. Die URL wird vom Client für die Anmeldung aufgerufen und gibt das Access Token vom OIDC Identitätsdienstanbieter zurück. Sie wird ebenfalls beim Lesen der Einstellungen des OIDC Identitätsdienstanbieter mit der URL */.well-known/openid-configuration* verwendet und dient als Aussteller bei der Token-Verifizierung.
- **Flow Type**
  - **Authorization Code Flow** ist der am häufigsten verwendete Flow mit bewährter Sicherheit.
  - **Implicit Flow** ist ein früherer Flow, der als unsicher gilt.
  - **Client Credentials Flow** íst ein vereinfachter Flow für die Stapelverarbeitung ohne Benutzerinteraktion.
- **OIDC Client ID** identifiziert den Client mit dem OIDC Identitätsdienstanbieter.
- **OIDC Client Secret** ist das Kennwort, das der *OIDC Client ID* beim OIDC Identitätsdienstanbieter zugeordnet ist.
- **OIDC User Name Attribut** ist der Name des Attributs, das vom OIDC Identitätsdienst zur Identifizierung des Benutzerkontos verwendet wird.
  - Die folgende Strategie wird angewendet, um das Attribut zu identifizieren, das für die Zuordnung zum JOC Cockpit Konto verwendet wird:
    - die URL *https://identity-provider/.well-known/openid-configuration* wird aufgerufen.
    - die Antwort wird auf das Objekt *claims_supported* geprüft
      - falls nicht vorhanden oder leer, wird das Attribut *email* verwendet
      - wenn vorhanden und wenn das Attribut *preferred_username* enthalten ist, wird dieses Attribut verwendet.
    - wenn kein Attribut identifiziert wurde, wird das Attribut *email* verwendet.
  - Sollte dies nicht zu einem identifizierbaren Benutzerkonto führen, können Benutzer das *User Name Attribut* angeben. Häufig unterstützen OIDC Identitätsdienstanbieter Attributnamen wie *username* oder *email*.
- **OIDC Claims** geben OIDC *Rollen* oder *Gruppen* an, die für die Zuordnung zu JS7 Rollen verwendet werden. Standardmäßige *OIDC Claims* umfassen *Rollen*, *Gruppen*.
- **OIDC Scopes** geben den Bereich an, für den *OIDC Claims* vom OIDC Identitätsdienstanbieter zurückgegeben werden. Standardmäßige *OIDC Scopes* umfassen *Rollen*, *Gruppen*, *Profile*
- **OIDC Group/Roles Mapping** wird verwendet, um Konten Rollen zuzuweisen.
  - Es kann eine Liste von *OIDC Claims* angegeben werden, die die im OIDC Identitätsdienstanbieter konfigurierten Gruppen enthalten. *OIDC Claims* können durch Überprüfung des *JSON Web Token* während der Registrierung verfügbar gemacht werden.
 - Bei der Zuweisung werden die vom OIDC Identitätsdienstanbieter verfügbaren Gruppen den mit dem Identitätsdienst konfigurierten Rollen zugewiesen. Jeder Gruppe kann eine beliebige Anzahl von Rollen zugewiesen werden.
- das **OIDC Bild** kann optional hochgeladen werden und wird auf der Anmeldeseite angezeigt. Benutzer können auf das Bild klicken, um sich beim OIDC Identitätsdienst anzumelden.
- **OIDC Truststore Path** muss, falls angegeben, ein X.509-Zertifikat enthalten, das für die erweiterte Schlüsselverwendung der Serverauthentifizierung für den Identitätsdienstanbieter angegeben ist.
  - Für Verbindungen zu bekannten OIDC Identitätsdienstanbietern wie Azure® sollten Sie den Pfad zu der Java *cacerts* Datei angeben, die mit dem Java JDK geliefert wird, das mit JOC Cockpit verwendet wird.
  - Der Truststore muss ein selbstsigniertes Zertifikat von einer privaten oder öffentlichen Zertifizierungsstelle enthalten. Normalerweise wird das CA-Zertifikat verwendet, da andernfalls die gesamte Zertifikatskette, die zum Signieren des Server-Authentifizierungszertifikats erforderlich ist, im Truststore verfügbar sein muss.
  - Wenn diese Einstellung nicht angegeben wird, verwendet das JOC Cockpit den Truststore, der in der Konfigurationsdatei *JETTY_BASE/resources/joc/joc.properties* konfiguriert ist. Dies beinhaltet die Verwendung der Einstellungen für *OIDC Truststore Password* und *OIDC Truststore Type*.
  - Der Pfad zum Truststore kann relativ zum Verzeichnis *JETTY_BASE/resources/joc* angegeben werden. Wenn sich der Truststore in diesem Verzeichnis befindet, wird nur der Dateiname angegeben, normalerweise mit der Erweiterung .p12 oder .pfx. Andere relative Speicherorte können angegeben werden, zum Beispiel *../../joc-truststore.p12*, wenn sich der Truststore im Verzeichnis *JETTY_BASE* befindet.
  - Ein absoluter Pfad kann angegeben werden.
- **OIDC Truststore Password** gibt das Kennwort an, das den Truststore schützt. Für den Truststore *cacerts* des Java JDK lautet das Standardpasswort *changeit*.
- **OIDC Truststore Type** ist entweder PKCS12 oder JKS (veraltet).

## Referenzen

### Kontext-Hilfe

- [Identitätsdienste](/identity-services)
- [Identitätsdienste - Konfiguration](/identity-service-configuration)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
- [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)
