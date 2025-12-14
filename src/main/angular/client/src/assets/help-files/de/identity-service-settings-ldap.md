# Identitätsdienste - LDAP Einstellungen

Identitätsdienste regeln den Zugriff auf JOC Cockpit durch Authentifizierung und Autorisierung, siehe [Identitätsdienste](/identity-services).

Identitätsdienste werden in der folgenden Konfiguration festgelegt:

- **Allgemeine Konfiguration**, die Eigenschaften enthält, die für alle Identitätsdienste verfügbar sind, siehe [Identitätsdienste - Konfiguration](/identity-service-configuration).
- **Einstellungen**, die für den LDAP Identitätsdiensttyp spezifisch sind.

## Einstellungen

Für LDAP werden die Registerkarten für *Weniger Optionen* und *Mehr Optionen* angeboten.

- *Wenigere Optionen* kann angewendet werden, wenn Microsoft Active Directory® oder ein ähnliches System verwendet wird.
- *Mehr Optionen* bietet eine fein abgestufte Konfiguration für jeden LDAP Server.

Für Details siehe
- [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
  - [JS7 - LDAP Identity Service Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service+Configuration)
  - [JS7 - LDAP over TLS using STARTTLS and LDAP over SSL using LDAPS](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+over+TLS+using+STARTTLS+and+LDAP+over+SSL+using+LDAPS)

### Einstellungen: Weniger Optionen

- **LDAP Server Host** erwartet den Hostnamen oder die IP-Adresse des LDAP Server Host. Wenn TLS/SSL-Protokolle verwendet werden, muss der Fully Qualified Domain Name (FQDN) des Hosts verwendet werden, für den das LDAP Server SSL-Zertifikat ausgestellt ist.
- **LDAP Protocol** kann Klartext, TLS oder SSL sein. Klartext wird nicht empfohlen, da das Benutzerkonto und das Kennwort unverschlüsselt über das Netzwerk gesendet werden. TLS- und SSL-Protokolle gelten als sicher, da sie den Inhalt/die Verbindung zum LDAP Server verschlüsseln.
- **LDAP Server Port** ist der Port, den der LDAP Server abhört. Für Klartext- und TLS-Verbindungen wird häufig Port 389 verwendet, für SSL-Verbindungen ist Port 636 eine häufige Option.
- **LDAP Server ist Active Directory** vereinfacht die Konfiguration, wenn der LDAP Server von Active Directory implementiert wird. Eine Reihe von Attributen für die Benutzersuche und die Gruppensuche werden automatisch übernommen, wenn Active Directory verwendet wird.
- **LDAP Server bietet samAccountName Attribut** gibt an, ob das Attribut *samAccountName* als eindeutiger Bezeichner eines Benutzerkontos dient. Dieses Attribut ist häufig bei Active Directory LDAP Servern verfügbar.
- **LDAP Server bietet memberOf Attribut** vereinfacht die Suche nach Sicherheitsgruppen, denen das Benutzerkonto angehört. Dieses Attribut ist häufig bei LDAP Servern des Typs Active Directory verfügbar, aber auch andere LDAP Produkte können das Attribut implementieren.
- **LDAP User DN Template** ist ein Platzhalter für den Distinguished Name (DN), der ein Benutzerkonto identifiziert. Der Wert *{0}* kann für Active Directory LDAP Server verwendet werden und wird durch das bei der Anmeldung angegebene Benutzerkonto ersetzt.
- **LDAP Search Base** wird für die Suche nach Benutzerkonten in der Hierarchie der LDAP Server Einträge verwendet, zum Beispiel *OU=Operations, O=IT, O=Users, DC=example, DC=com*.
- **LDAP User Search Filter** gibt eine LDAP Abfrage an, mit der das Benutzerkonto in der Hierarchie der LDAP Einträge identifiziert wird.

### Einstellungen: Weitere Optionen

#### Allgemeine Einstellungen

- **LDAP Server URL** gibt das Protokoll an, zum Beispiel *ldap://* für Klartext- und TLS-Verbindungen, *ldaps://* für SSL-Verbindungen. Das Protokoll wird um den Hostnamen (FQDN) und den Port des LDAP Servers ergänzt.
- **LDAP Read Timeout** gibt die Dauer in Sekunden an, die JOC Cockpit auf Antworten des LDAP Servers wartet, wenn die Verbindung hergestellt ist.
- **LDAP Connect Timeout** gibt die Dauer in Sekunden an, die JOC Cockpit beim Verbindungsaufbau auf die Antworten des LDAP Servers wartet.
- der Schalter **LDAP Start TLS** macht TLS zum Protokoll für die Verbindung zum LDAP Server.
- der Schalter **LDAP Host Name Verification** muss aktiv sein, um zu überprüfen, ob die Hostnamen in der LDAP Server URL und im LDAP Server Zertifikat übereinstimmen.
- **LDAP Truststore Path** gibt den Speicherort eines Truststore an, falls der LDAP Server für TLS/SSL-Protokolle konfiguriert ist. Der angegebene Truststore muss ein X.509-Zertifikat enthalten, das für die erweiterte Schlüsselverwendung der Serverauthentifizierung angegeben ist.
  - Für Verbindungen zu bekannten LDAP Identitätsdienstanbietern wie Azure® sollten Sie den Pfad zur Java *cacerts* Datei angeben, die mit dem mit JOC Cockpit verwendeten Java JDK geliefert wird.
  - Der Truststore kann ein von einer privaten CA signiertes Zertifikat oder ein von einer öffentlichen CA signiertes Zertifikat enthalten. In der Regel wird das Root-CA-Zertifikat verwendet, da sonst die gesamte Zertifikatskette, die zum Signieren des Server-Authentifizierungszertifikats erforderlich ist, im Truststore verfügbar sein muss.
  - Wenn der LDAP Server für TLS/SSL-Verbindungen betrieben wird und diese Einstellung nicht angegeben ist, verwendet JOC Cockpit den Truststore, der in der Konfigurationsdatei *JETTY_BASE/resources/joc/joc.properties* konfiguriert ist. Dies schließt die Verwendung der Einstellungen für das Truststore Kennwort und den Truststore Typ ein.
  - Der Pfad zum Truststore wird relativ zum Verzeichnis *JETTY_BASE/resources/joc* angegeben. Wenn sich der Truststore in diesem Verzeichnis befindet, geben Sie nur den Dateinamen an, normalerweise mit der Erweiterung .p12. Andere relative Speicherorte können z.B. mit *../../joc-truststore.p12* angegeben werden, wenn sich der Truststore im Verzeichnis *JETTY_BASE* befindet. Es kann kein absoluter Pfad angegeben werden und es kann kein Pfad angegeben werden, der sich in der Dateisystemhierarchie vor dem Verzeichnis *JETTY_BASE* befindet.
- **LDAP Truststore Password** gibt das Kennwort an, das den LDAP Truststore schützt. Wenn der Java JDK Truststore *cacerts* verwendet wird, lautet das Standardkennwort *changeit*.
- **LDAP Truststore Type** gibt den Typ des Truststore an, der entweder *PKCS12* oder *JKS* (veraltet) ist.

#### Einstellungen für Authentifizierung

- **LDAP User DN Template** ist ein Platzhalter für den Distinguished Name (DN), der ein Benutzerkonto identifiziert. Der Wert *{0}* kann für Active Directory LDAP Server verwendet werden und wird durch das bei der Anmeldung angegebene Benutzerkonto ersetzt. 
- **LDAP System User DN Template** wird angewandt, wenn ein *Systembenutzerkonto* verwendet wird, um sich mit dem LDAP Server zu verbinden und um zu überprüfen, ob das Benutzerkonto, das die Anmeldung durchführt, mit dem angegebenen Konto und Kennwort existiert. Von der Verwendung eines *Systembenutzerkontos* wird abgeraten, da dadurch das Kennwort des Kontos preisgegeben wird. Die Einstellung ähnelt dem *LDAP User DN Template* und gibt den Platzhalter für den Distinguished Name des *Systembenutzerkontos* an.
- **LDAP System User Account** gibt das Benutzerkonto an, das der Anmeldung über den *samAccountName* oder ein anderes Attribut ähnelt, z.B. mit *account@domain*.
- **LDAP System User Password** gibt das Kennwort für den *LDAP System User Account* an.

#### Einstellungen für Autorisierung

- **LDAP Search Base** wird für die Suche nach Benutzerkonten in der Hierarchie der LDAP Server Einträge verwendet, z.B. *OU=Operations, O=IT, O=Users, DC=example,DC=com*.
- **LDAP Group Search Base** wird ähnlich wie die *LDAP Search Base* verwendet, um nach Sicherheitsgruppen zu suchen, denen ein Benutzerkonto angehört.
- **LDAP Group Search Filter** gibt eine LDAP Abfrage an, mit der Sicherheitsgruppen ermittelt werden, in denen das Benutzerkonto Mitglied ist. Der Filter wird auf die Suchergebnisse angewendet, die ausgehend von der *LDAP Group Search Base* geliefert werden.
- **LDAP Group Name Attribute** gibt das Attribut an, das den Namen der Sicherheitsgruppe angibt, in der ein Benutzerkonto Mitglied ist, z.B. das Attribut *CN* (Common Name).
- LDAP Gruppe/Rollen Abbildung
  - **Suche in verschachtelten Gruppen deaktivieren** gibt an, dass Sicherheitsgruppen nicht rekursiv durchsucht werden, wenn sie Mitglieder von Sicherheitsgruppen sind.
  - **Group/Role Mapping** legt die Zuordnung von Sicherheitsgruppen, in denen das Benutzerkonto Mitglied ist, und JS7 Rollen fest. Sicherheitsgruppen müssen je nach *LDAP Group Search Attribute* als Distinguished Names, zum Beispiel *CN=js7_admins, OU=Operations, O=IT, O=Groups, DC=example, DC=com*, oder als Common Names, zum Beispiel *js7_admins*, angegeben werden.

## Referenzen

### Kontext-Hilfe

- [Identitätsdienste](/identity-services)
- [Identitätsdienste - Konfiguration](/identity-service-configuration)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
  - [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
    - [JS7 - LDAP Identity Service Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service+Configuration)
    - [JS7 - LDAP over TLS using STARTTLS and LDAP over SSL using LDAPS](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+over+TLS+using+STARTTLS+and+LDAP+over+SSL+using+LDAPS)
