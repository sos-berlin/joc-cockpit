# LDAP-Identitätsdienst-Einstellungen

Identitätsdienste regeln den Zugriff auf JOC Cockpit durch Authentifizierung und Autorisierung, siehe [Identity Services](/identity-services).

Identitätsdienste werden in der folgenden Konfiguration festgelegt:

- **Allgemeine Konfiguration**, die Eigenschaften enthält, die für alle Identitätsdienste verfügbar sind, siehe [Identity Service - Configuration](/identity-service-configuration).
- **Einstellungen**, die für den LDAP-Identitätsdiensttyp spezifisch sind.

## Einstellungen

Für LDAP werden die Registerkarten für *Weniger Optionen* und *Mehr Optionen* angeboten.

- *Wenigere Optionen* kann angewendet werden, wenn Microsoft Active Directory® oder ein ähnliches System verwendet wird.
- *Mehr Optionen* bietet eine fein abgestufte Konfiguration für jeden LDAP-Server.

Für Details siehe
- [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
  - [JS7 - LDAP Identity Service Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service+Configuration)
  - [JS7 - LDAP over TLS using STARTTLS and LDAP over SSL using LDAPS](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+over+TLS+using+STARTTLS+and+LDAP+over+SSL+using+LDAPS)

### Einstellungen: Weniger Optionen

- **LDAP Server Host** erwartet den Hostnamen oder die IP-Adresse des LDAP Server-Hosts. Wenn TLS/SSL-Protokolle verwendet werden, muss der Fully Qualified Domain Name (FQDN) des Hosts verwendet werden, für den das LDAP Server SSL-Zertifikat ausgestellt ist.
- das **LDAP Server Protokoll** kann Klartext, TLS oder SSL sein. Plain Text wird nicht empfohlen, da das Benutzerkonto und das Passwort unverschlüsselt über das Netzwerk gesendet werden. TLS- und SSL-Protokolle gelten als sicher, da sie den Inhalt/die Verbindung zum LDAP-Server verschlüsseln.
- **LDAP-Server-Port** ist der Port, den der LDAP-Server abhört. Für Klartext- und TLS-Verbindungen wird häufig Port 389 verwendet, für SSL-Verbindungen ist Port 636 eine häufige Option.
- **LDAP Server ist Active Directory** vereinfacht die Konfiguration, wenn der LDAP Server von Active Directory implementiert wird. Eine Reihe von Attributen für die Benutzersuche und die Gruppensuche werden automatisch übernommen, wenn Active Directory verwendet wird.
- **LDAP Server bietet samAccountName-Attribut** gibt an, ob das Attribut *samAccountName* als eindeutiger Bezeichner eines Benutzerkontos dient. Dieses Attribut ist häufig bei Active Directory LDAP-Servern verfügbar.
- das Attribut **LDAP Server bietet das Attribut memberOf** und vereinfacht die Suche nach Sicherheitsgruppen, denen das Benutzerkonto angehört. Dieses Attribut ist häufig bei LDAP-Servern des Typs Active Directory verfügbar, aber auch andere LDAP-Produkte können das Attribut implementieren.
- **LDAP User DN Template** ist ein Platzhalter für den Distinguished Name (DN), der ein Benutzerkonto identifiziert. Der Wert *{0}* kann für Active Directory LDAP-Server verwendet werden und wird durch das bei der Anmeldung angegebene Benutzerkonto ersetzt.
- **LDAP Server Search Base** wird für die Suche nach Benutzerkonten in der Hierarchie der LDAP Server-Einträge verwendet, zum Beispiel *OU=Operations, O=IT, O=Users, DC=example, DC=com*.
- **LDAP-Benutzersuchfilter** gibt eine LDAP-Abfrage an, mit der das Benutzerkonto in der Hierarchie der LDAP-Einträge identifiziert wird.

### Einstellungen: Weitere Optionen

#### Allgemeine Einstellungen

- **LDAP Server URL** gibt das Protokoll an, zum Beispiel *ldap://* für Klartext- und TLS-Verbindungen, *ldaps://* für SSL-Verbindungen. Das Protokoll wird um den Hostnamen (FQDN) und den Port des LDAP-Servers ergänzt.
- **LDAP Server Read Timeout** gibt die Dauer in Sekunden an, die JOC Cockpit auf Antworten des LDAP Servers wartet, wenn die Verbindung hergestellt wird.
- **LDAP Server Connect Timeout** gibt die Dauer in Sekunden an, die JOC Cockpit beim Verbindungsaufbau auf die Antworten des LDAP Servers wartet.
- der Schalter **LDAP Start TLS** macht TLS zum Protokoll für die Verbindung zum LDAP Server.
- der Schalter **LDAP Host Name Verification** muss aktiv sein, um zu überprüfen, ob die Hostnamen in der LDAP Server URL und im LDAP Server Zertifikat übereinstimmen.
- **LDAP Truststore Path** gibt den Ort eines Truststores an, falls der LDAP Server für TLS/SSL-Protokolle konfiguriert ist. Der angegebene Truststore muss ein X.509-Zertifikat enthalten, das für die erweiterte Schlüsselverwendung der Serverauthentifizierung angegeben ist.
  - Für Verbindungen zu bekannten LDAP-Identitätsanbietern wie Azure® sollten Sie den Pfad zur Java *cacerts* Truststore-Datei angeben, die mit dem mit JOC Cockpit verwendeten Java JDK geliefert wird.
  - Der Truststore kann ein von einer privaten CA signiertes Zertifikat oder ein von einer öffentlichen CA signiertes Zertifikat enthalten. In der Regel wird das Root-CA-Zertifikat verwendet, da sonst die gesamte Zertifikatskette, die zum Signieren des Server-Authentifizierungszertifikats erforderlich ist, im Truststore verfügbar sein muss.
  - Wenn der LDAP-Server für TLS/SSL-Verbindungen betrieben wird und diese Einstellung nicht angegeben ist, verwendet JOC Cockpit den Truststore, der in der Konfigurationsdatei *JETTY_BASE/resources/joc/joc.properties* konfiguriert ist. Dies schließt die Verwendung der Einstellungen für das Truststore-Passwort und den Truststore-Typ ein.
  - Der Pfad zum Truststore wird relativ zum Verzeichnis *JETTY_BASE/resources/joc* angegeben. Wenn sich der Truststore in diesem Verzeichnis befindet, geben Sie nur den Dateinamen an, normalerweise mit der Erweiterung .p12. Andere relative Speicherorte können z.B. mit *../../joc-truststore.p12* angegeben werden, wenn sich der Truststore im Verzeichnis *JETTY_BASE* befindet. Es kann kein absoluter Pfad angegeben werden und es kann kein Pfad angegeben werden, der sich in der Dateisystemhierarchie vor dem Verzeichnis *JETTY_BASE* befindet.
- **LDAP Truststore Password** gibt das Passwort an, das den LDAP Truststore schützt. Wenn der Java JDK Truststore *cacerts* verwendet wird, lautet das Standardkennwort *changeit*.
- **Typ des LDAP Truststores** gibt den Typ des Truststores an, der entweder *PKCS12* oder *JKS* (veraltet) ist.

#### Authentifizierungseinstellungen

- **LDAP User DN Template** ist ein Platzhalter für den Distinguished Name (DN), der ein Benutzerkonto identifiziert. Der Wert *{0}* kann für Active Directory LDAP-Server verwendet werden und wird durch das bei der Anmeldung angegebene Benutzerkonto ersetzt. 
- die **LDAP-Systembenutzer-DN-Vorlage** wird angewandt, wenn ein *Systembenutzerkonto* verwendet wird, um sich an den LDAP-Server zu binden und um zu überprüfen, ob das Benutzerkonto, das die Anmeldung durchführt, mit dem angegebenen Konto und Passwort existiert. Von der Verwendung eines *Systembenutzerkontos* wird abgeraten, da dadurch das Passwort des Kontos preisgegeben wird. Die Einstellung ähnelt der *LDAP-Benutzer-DN-Vorlage* und gibt den Platzhalter für den Distinguished Name des *Systembenutzerkontos* an.
- **LDAP-Systembenutzerkonto** gibt das Benutzerkonto an, das der Anmeldung über den *samAccountName* oder ein anderes Attribut ähnelt, z.B. mit *account@domain*.
- **LDAP-Systembenutzerkennwort** gibt das Kennwort für das *Systembenutzerkonto* an.

#### Autorisierungseinstellungen

- **LDAP Search Base** wird für die Suche nach Benutzerkonten in der Hierarchie der LDAP-Servereinträge verwendet, z.B. *OU=Operations, O=IT, O=Users, DC=example,DC=com*.
- **LDAP Group Search Base** wird ähnlich wie die *Search Base* verwendet, um nach Sicherheitsgruppen zu suchen, denen ein Benutzerkonto angehört.
- **LDAP-Gruppensuchfilter** gibt eine LDAP-Abfrage an, mit der Sicherheitsgruppen ermittelt werden, in denen das Benutzerkonto Mitglied ist. Der Filter wird auf die Suchergebnisse angewendet, die ausgehend von der Gruppensuchbasis bereitgestellt werden.
- das Attribut **LDAP-Gruppenname** gibt das Attribut an, das den Namen der Sicherheitsgruppe angibt, in der ein Benutzerkonto Mitglied ist, z.B. das Attribut *CN* (Common Name).
- LDAP-Gruppe/Rollen-Zuordnung
  - **Verschachtelte Gruppensuche deaktivieren** gibt an, dass Sicherheitsgruppen nicht rekursiv gesucht werden, wenn sie Mitglieder von Sicherheitsgruppen sind.
  - **Group/Name Mapping** legt die Zuordnung von Sicherheitsgruppen, in denen das Benutzerkonto Mitglied ist, und JS7-Rollen fest. Sicherheitsgruppen müssen je nach *LDAP-Gruppensuchattribut* als Distinguished Names, zum Beispiel *CN=js7_admins, OU=Operations, O=IT, O=Groups, DC=example, DC=com*, oder als Common Names, zum Beispiel *js7_admins*, angegeben werden.

## Referenzen

### Kontext-Hilfe

- [Identity Service - Configuration](/identity-service-configuration)
- [Identity Services](/identity-services)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
  - [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
    - [JS7 - LDAP Identity Service Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service+Configuration)
    - [JS7 - LDAP over TLS using STARTTLS and LDAP over SSL using LDAPS](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+over+TLS+using+STARTTLS+and+LDAP+over+SSL+using+LDAPS)

