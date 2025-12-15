# Service d'Identité - OIDC - Paramètres

Les Services d'Identité régissent l'accès au JOC Cockpit par l'authentification et l'autorisation, voir [Services d'Identité](/identity-services).

Les Services d'Identité sont spécifiés à partir de la configuration suivante :

- **General Configuration** qui contient les propriétés disponibles pour tous les Services d'Identité, voir [Service d'Identité - Configuration](/identity-service-configuration).
- **Réglages** spécifiques au type de Service d'Identité de l'OIDC.

## Paramètres

Les paramètres suivants sont disponibles :

- **OIDC Name** est utilisé par JOC Cockpit pour la légende du bouton de connexion correspondant dans la page de connexion.
- **OIDC Authentication URL** est utilisée par le client pour se connecter au fournisseur d'identité OIDC. L'URL est appelée par le client pour la connexion et renvoie le jeton d'accès du fournisseur d'identité OIDC. Elle est également utilisée lors de la lecture des paramètres du fournisseur d'identité OIDC avec l'URL */.well-known/openid-configuration* et est utilisée comme émetteur lors de la vérification du jeton.
- **Flow Type**
  - **Authorization Code Flow** est le flux le plus couramment utilisé avec une sécurité éprouvée.
  - **Implicit Flow** est un ancien flux considéré comme peu sûr.
  - **Client Credentials Flow** est un flux simplifié pour le traitement par lots sans interaction avec l'utilisateur.
- **OIDC Client ID ** identifie le client auprès du fournisseur d'identité OIDC.
- **OIDC Client Secret** est le mot de passe attribué à l'*OIDC Client ID* dans le fournisseur d'identité OIDC.
- **OIDC User Name Attribute** est le nom de l'attribut utilisé par le Service d'Identité de l'OIDC pour identifier le compte d'utilisateur.
  - La stratégie suivante est appliquée pour identifier l'attribut utilisé pour établir une correspondance avec le compte JOC Cockpit :
    - l'URL *https://\<identity-provider\>/.well-known/openid-configuration* est appelée.
    - la réponse est vérifiée pour l'objet *claims_supported*
      - s'il n'est pas disponible ou vide, l'attribut *email* est utilisé
      - s'il est disponible et s'il comprend l'attribut *preferred_username*, cet attribut sera utilisé.
    - si aucun attribut n'a été identifié, l'attribut *email* est utilisé.
  - Si cela n'aboutit pas à un compte d'utilisateur identifiable, les utilisateurs peuvent spécifier l'attribut name. Les fournisseurs d'identité OIDC prennent souvent en charge des noms d'attribut tels que *username* ou *email*.
- **OIDC Image** peut éventuellement être téléchargée et sera affichée sur la page de connexion. Les utilisateurs peuvent cliquer sur l'image pour se connecter au Service d'Identité OIDC.
- **OIDC Truststore Path** si indiqué doit inclure un certificat X.509 spécifié pour l'utilisation de la clé étendue de l'authentification du serveur pour le fournisseur d'identité.
  - Pour les connexions à des fournisseurs d'identité OIDC bien connus tels qu'Azure®, les utilisateurs doivent indiquer le chemin d'accès au fichier Java *cacerts* truststore fourni avec le JDK Java utilisé avec JOC Cockpit.
  - Le fichier de confiance doit inclure un certificat auto-signé d'une autorité de certification privée ou publique. En règle générale, le certificat CA est utilisé car, dans le cas contraire, la chaîne de certificats complète impliquée dans la signature du certificat d'authentification du serveur doit être disponible dans la base de données de confiance.
  - Si ce paramètre n'est pas spécifié, le JOC Cockpit utilisera le truststore configuré dans le fichier de configuration *JETTY_BASE/resources/joc/joc.properties*. Cela inclut l'utilisation des paramètres *OIDC Truststore Password* et *OIDC Truststore Type*.
  - Le chemin d'accès au Truststore peut être spécifié par rapport au répertoire *JETTY_BASE/resources/joc*. Si le dépôt fiduciaire se trouve dans ce répertoire, seul le nom du fichier est spécifié, généralement avec une extension .p12 ou .pfx. D'autres emplacements relatifs peuvent être spécifiés en utilisant par exemple *../../joc-truststore.p12* si le truststore est situé dans le répertoire *JETTY_BASE*.
  - Un chemin absolu peut être spécifié.
- **OIDC Truststore Password** spécifie le mot de passe qui protège le Truststore. Pour le Truststore *cacerts* du JDK Java, le mot de passe par défaut est *changeit*.
- **OIDC Truststore Type** est soit PKCS12, soit JKS (obsolète).
- **OIDC Scopes** spécifient l'étendue pour laquelle les **OIDC Claims** seront renvoyées par le fournisseur de Services d'Identité OIDC. Les *OIDC Scopes* par défaut incluent *roles*, *groups*, *profile*
- **OIDC Group/Roles Mapping** permet d'attribuer des rôles aux comptes.
  - Une liste de revendications contenant les groupes configurés dans le fournisseur de Services d'Identité OIDC peut être spécifiée. Les revendications disponibles peuvent être mises à disposition en vérifiant le *JSON Web Token* lors de l'enregistrement.
 - Lors de l'affectation, les groupes disponibles auprès du fournisseur de Services d'Identité OIDC sont affectés aux rôles configurés avec le Service d'Identité. Un nombre quelconque de rôles peut être attribué à chaque groupe.

## Références

### Aide contextuelle

- [Services d'Identité](/identity-services)
- [Service d'Identité - Configuration](/identity-service-configuration)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
- [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)
