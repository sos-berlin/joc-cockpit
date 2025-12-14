# Service d'Identité - Configuration

Les Services d'Identité régissent l'accès au JOC Cockpit par l'authentification et l'autorisation, voir [Services d'Identité](/identity-services).

Les Services d'Identité sont spécifiés à partir de la configuration suivante :

- **Configuration générale** qui contient les propriétés disponibles pour tous les Services d'Identité.
- **Réglages** spécifiques au type de Service d'Identité, voir [Réglages - Service d'Identité](/settings-identity-service).

## Configuration générale

Pour tout Service d'Identité, les propriétés suivantes sont affichées :

- **Nom du Service d'Identité** peut être choisi librement.
- **Type du Service d'Identité** est l'un des suivants : JOC, LDAP, OIDC, CERTIFICATE, FIDO, KEYCLOAK. Pour LDAP, OIDC et KEYCLOAK, les types de service supplémentaires LDAP-JOC, OIDC-JOC et KEYCLOAK-JOC peuvent être utilisés pour stocker l'attribution des rôles avec JOC Cockpit.
- **Séquence** indique l'Ordre dans lequel le Service d'Identité sera déclenché pour l'authentification.
  - Les utilisateurs peuvent spécifier une valeur entière pour indiquer l'Ordre.
  - Les utilisateurs peuvent modifier l'Ordre en déplaçant le service dans la liste de [Services d'Identité](/identity-services).
- **Requis** indique que le Service d'Identité sera déclenché en plus des Services d'Identité dont l'Ordre est antérieur.
- **Désactivée** indique que le Service d'Identité est inactif et ne sera pas utilisé pour la connexion.
- **Schéma d'Authentification** est l'un des deux suivants : *single-factor* ou *two-factor*. 
  - si *deux facteurs* est choisi, l'utilisateur doit sélectionner le deuxième facteur dans l'un des Services d'Identité de type FIDO ou CERTIFICATE.

## Références

### Aide contextuelle

- [Réglages - Service d'Identité](/settings-identity-service)
- [Services d'Identité](/identity-services)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
