# Service d'Identité - LDAP - Paramètres

Les Services d'Identité régissent l'accès au JOC Cockpit par l'authentification et l'autorisation, voir [Services d'Identité](/identity-services).

Les Services d'Identité sont spécifiés à partir de la configuration suivante :

- **General Configuration** qui contient les propriétés disponibles pour tous les Services d'Identité, voir [Service d'Identité - Configuration](/identity-service-configuration).
- **Paramètres** spécifiques au type de Service d'Identité LDAP.

## Paramètres

Pour LDAP, les onglets *Moins d'option* et *Plus d'options* sont proposés.

- *Moins d'options* peut être appliqué si Microsoft Active Directory® ou similaire est utilisé.
- *Plus d'options* permet une configuration fine pour n'importe quel serveur LDAP.

Pour plus de détails, voir
- [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
  - [JS7 - LDAP Identity Service Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service+Configuration)
  - [JS7 - LDAP over TLS using STARTTLS and LDAP over SSL using LDAPS](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+over+TLS+using+STARTTLS+and+LDAP+over+SSL+using+LDAPS)

### Paramètres : Moins d'options

- **LDAP Server Host** attend le nom d'hôte ou l'adresse IP de l'hôte du serveur LDAP. Si les protocoles TLS/SSL sont utilisés, le nom de domaine entièrement qualifié (FQDN) de l'hôte pour lequel le certificat SSL du serveur LDAP est émis doit être utilisé.
- **LDAP Protocol** peut être en texte brut, TLS ou SSL. Le texte brut n'est pas recommandé car le compte d'utilisateur et le mot de passe seront envoyés par le réseau sans cryptage. Les protocoles TLS et SSL sont considérés comme sûrs car ils cryptent le contenu/la connexion au serveur LDAP.
- **LDAP Server Port** est le port sur lequel le serveur LDAP est à l'écoute. Pour les connexions en texte brut et TLS, le port 389 est fréquemment utilisé, tandis que pour les connexions SSL, le port 636 est une option fréquente.
- **LDAP Server est Active Directory** simplifie la configuration si le serveur LDAP est implémenté par Active Directory. Un certain nombre d'attributs pour la recherche d'utilisateurs et de groupes sont automatiquement pris en compte si Active Directory est utilisé.
- **LDAP Server offre l'attribut sAMAccountName** spécifie si l'attribut *samAccountName* est l'identifiant unique d'un compte d'utilisateur. Cet attribut est souvent disponible avec les serveurs LDAP Active Directory.
- **LDAP Server offre l'attribut memberOf** offert par le serveur LDAP simplifie la recherche des groupes de sécurité dont le compte d'utilisateur est membre. Cet attribut est souvent disponible avec les serveurs LDAP de type Active Directory, mais d'autres produits LDAP peuvent également l'implémenter.
- **LDAP User DN Template** est un espace réservé au nom distinctif (DN) qui identifie un compte d'utilisateur. La valeur *{0}* peut être utilisée pour les serveurs LDAP Active Directory et sera remplacée par le compte utilisateur spécifié lors de la connexion.
- **LDAP Search Base** est utilisée pour rechercher des comptes d'utilisateurs dans la hiérarchie des entrées du serveur LDAP, par exemple *OU=Operations, O=IT, O=Users, DC=example, DC=com*.
- **LDAP User Search Filter** spécifie une requête LDAP utilisée pour identifier le compte d'utilisateur dans la hiérarchie des entrées LDAP.

### Paramètres : Plus d'options

#### Paramètres généraux

- **LDAP Server URL** spécifie le protocole, par exemple *ldap://* pour les connexions en texte brut et TLS, *ldaps://* pour les connexions SSL. Le protocole est complété par le nom d'hôte (FQDN) et le port du serveur LDAP.
- **LDAP  Read Timeout** indique la durée en secondes pendant laquelle JOC Cockpit attend les réponses du serveur LDAP lors de l'établissement de la connexion.
- **LDAP Connect Timeout** indique la durée en secondes pendant laquelle JOC Cockpit attend les réponses du serveur LDAP lors de l'établissement de la connexion.
- **LDAP Start TLS** utilisation du protocole TLS de connexion au serveur LDAP.
- **LDAP Host Name Verification** doit être activé pour vérifier si les noms d'hôte figurant dans l'URL du serveur LDAP et dans le certificat du serveur LDAP correspondent.
- **LDAP Truststore Path** indique l'emplacement d'un Truststore si le serveur LDAP est configuré pour les protocoles TLS/SSL. Le Truststore indiqué doit inclure un certificat X.509 spécifié pour l'utilisation de la clé étendue de l'authentification du serveur.
  - Pour les connexions à des fournisseurs d'identité LDAP bien connus tels qu'Azure®, les utilisateurs doivent indiquer le chemin d'accès au fichier Java *cacerts* truststore fourni avec le JDK Java utilisé avec JOC Cockpit.
  - Le fichier de confiance peut contenir un certificat privé signé par une autorité de certification ou un certificat public signé par une autorité de certification. En règle générale, le certificat de l'autorité de certification racine est utilisé car, dans le cas contraire, la chaîne de certificats complète impliquée dans la signature du certificat d'authentification du serveur doit être disponible dans le fichier de confiance.
  - Si le serveur LDAP est utilisé pour des connexions TLS/SSL et que ce paramètre n'est pas spécifié, JOC Cockpit utilise le truststore configuré dans le fichier de configuration *JETTY_BASE/resources/joc/joc.properties*. Cela inclut l'utilisation des paramètres relatifs au mot de passe et au type de magasin fiduciaire.
  - Le chemin d'accès au dépôt fiduciaire est spécifié par rapport au répertoire *JETTY_BASE/resources/joc*. Si le dépôt fiduciaire se trouve dans ce répertoire, indiquez uniquement le nom du fichier, généralement avec une extension .p12. D'autres emplacements relatifs peuvent être spécifiés en utilisant par exemple *../../joc-truststore.p12* si le truststore est situé dans le répertoire *JETTY_BASE*. Aucun chemin absolu ne peut être spécifié et aucun chemin situé avant le répertoire *JETTY_BASE* dans la hiérarchie du système de fichiers ne peut être spécifié.
- **LDAP Truststore Password** spécifie le mot de passe qui protège le LDAP Truststore. Si le Truststore *cacerts* du JDK Java est utilisé, le mot de passe par défaut est *changeit*.
- **LDAP Truststore Type** spécifie le type de Truststore, à savoir *PKCS12* ou *JKS* (obsolète).

#### Paramètres d'authentification

- **LDAP User DN Template** est un espace réservé pour le nom distinctif (DN) qui identifie un compte d'utilisateur. La valeur *{0}* peut être utilisée pour les serveurs LDAP Active Directory et sera remplacée par le compte utilisateur spécifié lors de la connexion. 
- **LDAP System  DN Template** est appliqué si un *compte d'utilisateur du système* est utilisé pour se lier au serveur LDAP et pour vérifier si le compte d'utilisateur qui effectue la connexion existe avec le compte et le mot de passe donnés. L'utilisation d'un *Compte d'utilisateur système* est déconseillée car elle expose le mot de passe du compte. Le paramètre est similaire au *modèle de DN d'utilisateurLDAP* et spécifie l'espace réservé pour le nom distinctif du *compte d'utilisateur système*.
- **LDAP System User Account** spécifie le compte d'utilisateur similaire à la connexion à partir de *samAccountName* ou d'un autre attribut, par exemple à l'aide de *account@domain*.
- **LDAP System User Password** spécifie le mot de passe du *compte d'utilisateur du système*.

#### Paramètres d'autorisation

- **LDAP Search Base** est utilisée pour rechercher des comptes d'utilisateurs dans la hiérarchie des entrées du serveur LDAP, par exemple *OU=Operations, O=IT, O=Users, DC=example,DC=com*.
- **LDAP Group Search Base** est utilisée de la même manière que la base de recherche pour rechercher les groupes de sécurité dont un compte d'utilisateur est membre.
- **LDAP User Search Filter** spécifie une requête LDAP utilisée pour identifier les groupes de sécurité dont le compte d'utilisateur est membre. Le filtre est appliqué aux résultats de recherche fournis à partir de la base de recherche de groupe.
- **LDAP Group Name Attribute** spécifie l'attribut qui fournit le nom du groupe de sécurité dont un compte d'utilisateur est membre, par exemple l'attribut *CN* (Common Name).
- Mappage des groupes/rôles LDAP
  - **Désactiver la recherche par groupes imbriqués** spécifie que les groupes de sécurité ne seront pas recherchés de manière récursive s'ils sont membres de groupes de sécurité.
  - **Le mappage groupe/nom** spécifie le mappage des groupes de sécurité dont le compte d'utilisateur est membre et des rôles JS7. Les groupes de sécurité doivent être spécifiés en fonction de l'attribut *LDAP Group Search Attribute* en tant que noms distinctifs, par exemple *CN=js7_admins, OU=Operations, O=IT, O=Groups, DC=example, DC=com*, ou en tant que noms communs, par exemple *js7_admins*.

## Références

### Aide contextuelle

- [Services d'Identité](/identity-services)
- [Service d'Identité - Configuration](/identity-service-configuration)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
  - [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
    - [JS7 - LDAP Identity Service Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service+Configuration)
    - [JS7 - LDAP over TLS using STARTTLS and LDAP over SSL using LDAPS](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+over+TLS+using+STARTTLS+and+LDAP+over+SSL+using+LDAPS)
