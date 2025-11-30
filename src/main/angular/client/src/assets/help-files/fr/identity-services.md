# Services d'identité

Les services d'identité régissent l'accès au JOC Cockpit par l'authentification et l'autorisation.

Les services d'identité mettent en œuvre des méthodes d'authentification et d'accès aux fournisseurs d'identité. Par exemple, des informations d'identification telles que le compte utilisateur/mot de passe sont utilisées comme méthode d'authentification pour accéder à un service d'annuaire LDAP agissant en tant que fournisseur d'identité. Voir [JS7 - Identity and Access Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+and+Access+Management).

- [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
- [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)
- [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
- [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)
- [JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
- [JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)

Pour plus de détails, voir [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services).

Par défaut, les utilisateurs trouvent le service d'identité JOC-INITIAL qui est ajouté lors de l'installation initiale.

- Le service d'identité contient le compte utilisateur unique *root* avec le mot de passe *root*. Les utilisateurs doivent modifier le mot de passe du compte utilisateur *root* lors de la première connexion.
- Les utilisateurs peuvent ajouter [Identity Service - Accounts](/identity-service-accounts) et [Identity Service - Roles](/identity-service-roles) au service d'identité.
- Les utilisateurs peuvent modifier le service d'identité existant ou ajouter de nouveaux services d'identité.

## Déclenchement des services d'identité

Les services d'identité peuvent être rendus facultatifs ou obligatoires. Ils indiquent un Ordre par lequel ils seront déclenchés.

- Les services d'identité seront déclenchés dans l'ordre croissant.
- Si les services d'identité sont qualifiés d'optionnels, la connexion est terminée lorsque la connexion est réussie avec le premier service d'identité. En cas d'échec, le service d'identité suivant est déclenché.
- Si les services d'identité sont qualifiés d'obligatoires, ils seront tous déclenchés lors de la connexion d'un utilisateur.

## Liste des services d'identité

Pour chaque service d'identité, les propriétés suivantes sont affichées :

- **Le nom du service d'identité** peut être choisi librement.
- **Le type de service d'identité** est l'un des suivants : JOC, LDAP, OIDC, CERTIFICATE, FIDO, KEYCLOAK. Pour LDAP, OIDC et KEYCLOAK, les types de service supplémentaires LDAP-JOC, OIDC-JOC et KEYCLOAK-JOC peuvent être utilisés pour stocker l'attribution des rôles avec JOC Cockpit.
- le **système d'authentification** peut être *à un facteur* ou *à deux facteurs*. 
- **Deuxième facteur** indique si un deuxième facteur est activé pour l'authentification *à deux facteurs*.
- **Ordres** indique l'ordre dans lequel le service d'identité est déclenché pour l'authentification.
- **Désactivé** indique si le service d'identité est inactif et n'est pas utilisé pour la connexion.
- **Required** indique que le service d'identité sera déclenché en plus des services d'identité dont l'ordre est antérieur.

## Opérations sur les services d'identité

Les utilisateurs peuvent cliquer sur l'un des services d'identité pour accéder à la vue [Identity Service - Roles](/identity-service-roles) ou [Identity Service - Accounts](/identity-service-accounts) si le service est proposé.

Les utilisateurs peuvent ajouter un service d'identité à partir du bouton correspondant dans le coin supérieur droit de l'écran.

Pour les services d'identité existants, les opérations suivantes sont proposées à partir de leur menu d'action à trois points :

- **Editer** permet de spécifier la configuration générale du service d'identité.
- **Gérer les paramètres** permet de spécifier les paramètres spécifiques à un type de service.
- **Désactiver** désactive le service d'identité, il ne sera pas utilisé pour la connexion.
- **Supprimer** supprime le service d'identité.

## Références

### Aide contextuelle

- [Identity Service - Accounts](/identity-service-accounts)
- [Identity Service - Configuration](/identity-service-configuration)
- [Identity Service - Roles](/identity-service-roles)

### Product Knowledge Base

- [JS7 - Identity and Access Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+and+Access+Management)
  - [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
    - [JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
    - [JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
    - [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
    - [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)
    - [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
    - [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)
  - [JS7 - Authentication](https://kb.sos-berlin.com/display/JS7/JS7+-+Authentication)
  - [JS7 - Authorization](https://kb.sos-berlin.com/display/JS7/JS7+-+Authorization)
  
