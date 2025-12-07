# Profil - Verwaltung SSL Schlüssel

Die Registerkarte *Profil - Verwaltung SSL-Schlüssel* bietet eine integrierte Zertifizierungsstelle (CA), mit der Sie Server-Authentifizierungszertifikate und Client-Authentifizierungszertifikate für TLS/SSL-Verbindungen zwischen JS7 Produkten erstellen können.

Einzelheiten finden Sie unter [JS7 - Profiles - SSL Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+SSL+Key+Management).

<img src="profile-ssl-key-management.png" alt="SSL Key Management" width="800" height="75" />

## SSL CA Zertifikat

JS7 wird mit einem Standard SSL CA-Zertifikat ausgeliefert. Benutzer sollten die Gültigkeitsdauer des Zertifikats beachten. Neuere Zertifikate werden mit JS7 Versionen ca. sechs Monate vor Ablauf des Zertifikats ausgeliefert. Anstatt JS7 zu aktualisieren, können Benutzer ein neueres Zertifikat hochladen.

Benutzer können ihr eigenes SSL CA-Zertifikat erstellen:

- von einer privaten Zertifizierungsstelle (CA) oder einer öffentlichen CA. Die Verwendung einer privaten CA wird unter [JS7 - How to create X.509 SSL TLS Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+SSL+TLS+Certificates) erklärt.
- von der eingebauten SSL CA, die mit JOC Cockpit geliefert wird.

## Operationen für SSL CA-Zertifikate

Die folgenden Operationen werden angeboten:

- **Zeigen** ist verfügbar, wenn Sie auf das Symbol rechts neben der Gültigkeitsdauer klicken. Dadurch werden der private Schlüssel und das SSL CA-Zertifikat angezeigt.
- **Aktualisieren** ruft ein Popup-Fenster auf, in das Sie einen aktualisierten privaten Schlüssel und ein SSL CA-Zertifikat einfügen können.
- **Importieren** ruft ein Popup-Fenster auf, das den Upload des privaten Schlüssels und des SSL-CA-Zertifikats anbietet.
- **Generieren** ruft ein Popup-Fenster auf, um den privaten Schlüssel und das selbst ausgestellte SSL CA-Zertifikat zu generieren.

## Referenzen

### Kontext-Hilfe

- [Profil](/profile)
- [Profil - Verwaltung SSL Schlüssel](/profile-ssl-key-management)

### Product Knowledge Base

- [JS7 - Certificate Authority](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Authority)
  - [JS7 - Certificate Authority - Manage Certificates with JOC Cockpit](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Authority+-+Manage+Certificates+with+JOC+Cockpit)
  - [JS7 - Certificate Authority - Rollout Certificates for HTTPS Connections](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Authority+-+Rollout+Certificates+for+HTTPS+Connections)
- [JS7 - How to create X.509 SSL TLS Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+SSL+TLS+Certificates)
- [JS7 - Profiles - SSL Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+SSL+Key+Management)

