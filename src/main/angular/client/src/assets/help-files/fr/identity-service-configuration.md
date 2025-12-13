# Configuration du service d'identité

Les services d'identité régissent l'accès au JOC Cockpit par l'authentification et l'autorisation, voir [Identity Services](/identity-services).

Les services d'identité sont spécifiés à partir de la configuration suivante :

- **Configuration générale** qui contient les propriétés disponibles pour tous les services d'identité.
- **Réglages** spécifiques au type de service d'identité, voir [Identity Service - Settings](/identity-service-settings).

## Configuration générale

Pour tout service d'identité, les propriétés suivantes sont affichées :

- **Nom du Service d'Identité** peut être choisi librement.
- **Type du Service d'Identité** est l'un des suivants : JOC, LDAP, OIDC, CERTIFICATE, FIDO, KEYCLOAK. Pour LDAP, OIDC et KEYCLOAK, les types de service supplémentaires LDAP-JOC, OIDC-JOC et KEYCLOAK-JOC peuvent être utilisés pour stocker l'attribution des rôles avec JOC Cockpit.
- **Séquence** indique l'Ordre dans lequel le service d'identité sera déclenché pour l'authentification.
  - Les utilisateurs peuvent spécifier une valeur entière pour indiquer l'Ordre.
  - Les utilisateurs peuvent modifier l'Ordre en déplaçant le service dans la liste de [Identity Services](/identity-services).
- **Requis** indique que le service d'identité sera déclenché en plus des services d'identité dont l'Ordre est antérieur.
- **Désactivée** indique que le service d'identité est inactif et ne sera pas utilisé pour la connexion.
- **Schéma d'Authentification** est l'un des deux suivants : *single-factor* ou *two-factor*. 
  - si *deux facteurs* est choisi, l'utilisateur doit sélectionner le deuxième facteur dans l'un des services d'identité de type FIDO ou CERTIFICATE.

## Références

### Aide contextuelle

- [Identity Service - Settings](/identity-service-settings)
- [Identity Services](/identity-services)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)

