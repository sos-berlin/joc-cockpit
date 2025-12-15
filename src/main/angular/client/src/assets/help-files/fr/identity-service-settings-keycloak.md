# Service d'Identité Keycloak - Paramètres

Les Services d'Identité régissent l'accès au JOC Cockpit par l'authentification et l'autorisation, voir [Services d'Identité](/identity-services).

Les Services d'Identité sont spécifiés à partir de la configuration suivante :

- **General Configuration** qui contient les propriétés disponibles pour tous les Services d'Identité, voir [Service d'Identité - Configuration](/identity-service-configuration).
- **Réglages** spécifiques au type de Service d'Identité Keycloak.

## Paramètres

- **Keycloak URL** est l'URL de base pour laquelle l'API REST Keycloak est disponible
- **Keycloak Compte administratif ** est un compte Keycloak avec un rôle administratif auquel sont attribués les rôles *realm-management.view-clients* et *realm-management.view-users* dans Keycloak. Le compte administratif est utilisé pour récupérer les rôles d'un compte Keycloak et pour renouveler les jetons d'accès.
- **Keycloak mot de passe administrateur** est le mot de passe du *compte d'administration Keycloak*.
- **Chemin d'accès au Keycloak Truststore** indique l'emplacement d'un Truststore si le serveur Keycloak est configuré pour des connexions HTTPS. Le Truststore indiqué doit inclure un certificat X.509 spécifié pour l'utilisation de la clé étendue de l'authentification du serveur.
  - Le truststore peut inclure un certificat signé par une autorité de certification privée ou un certificat signé par une autorité de certification publique. En général, le certificat de l'autorité de certification racine est utilisé car, dans le cas contraire, la chaîne de certificats complète impliquée dans la signature du certificat d'authentification du serveur doit être disponible dans la base de données de confiance.
  - Si le serveur Keycloak est utilisé pour des connexions HTTPS et que ce paramètre n'est pas spécifié, le JOC Cockpit utilisera le truststore configuré dans le fichier de configuration *JETTY_BASE/resources/joc/joc.properties*. Cela inclut l'utilisation des paramètres relatifs au mot de passe et au type de magasin fiduciaire.
- Le chemin d'accès au dépôt fiduciaire est spécifié par rapport au répertoire *JETTY_BASE/resources/joc*. Si le dépôt fiduciaire se trouve dans ce répertoire, seul le nom du fichier est spécifié, généralement avec une extension .p12. D'autres emplacements relatifs peuvent être spécifiés, par exemple *../../joc-truststore.p12* si le truststore se trouve dans le répertoire *JETTY_BASE*. Il n'est pas possible de spécifier un chemin d'accès absolu ni un chemin d'accès situé avant le répertoire *JETTY_BASE* dans la hiérarchie du système de fichiers.
- **Mot de passe du Keycloak Truststore** spécifie le mot de passe qui protège le Truststore si le serveur Keycloak est configuré pour les connexions HTTPS.
- **Type du Keycloak Truststore** est l'un de *PKCS12* ou *JKS* (obsolète). Ce paramètre est utilisé si le serveur Keycloak est configuré pour les connexions HTTPS.
- Les clients Keycloak sont des entités qui demandent à Keycloak d'authentifier un compte utilisateur. Par exemple, une application telle que JOC Cockpit agit en tant que client du serveur Keycloak. Les clients utilisent Keycloak pour s'authentifier et fournir une solution d'authentification unique.
  - **Keycloak Client ID** et le secret du client Keycloak* sont utilisés pour
    - demander un jeton d'accès
      - pour l'authentification de l'utilisateur,
      - pour l'accès administratif,
    - valider un jeton d'accès existant
    - renouveler un jeton d'accès existant.
  - **Keycloak Client Secret** est détenu par le client et doit être connu à la fois par le serveur Keycloak et le JOC Cockpit.
- **Keycloak Realm** gère un ensemble d'utilisateurs, d'informations d'identification, de rôles et de groupes. Un utilisateur appartient à un domaine et effectue une connexion à un domaine. Les domaines sont isolés les uns des autres, ils gèrent et authentifient exclusivement les comptes utilisateurs qu'ils contrôlent.
- **Keycloak Version 16 ou antérieure** est un commutateur de compatibilité pour les versions antérieures de Keycloak.

## Références

### Aide contextuelle

- [Services d'Identité](/identity-services)
- [Service d'Identité - Configuration](/identity-service-configuration)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
- [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)
