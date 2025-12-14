# Services d'Identité

Les Services d'Identité régissent l'accès au JOC Cockpit par l'authentification et l'autorisation.

Les Services d'Identité mettent en œuvre des méthodes d'authentification et d'accès aux fournisseurs d'identité. Par exemple, des informations d'identification telles que le compte utilisateur/mot de passe sont utilisées comme méthode d'authentification pour accéder à un service d'annuaire LDAP agissant en tant que fournisseur d'identité. Voir [JS7 - Identity and Access Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+and+Access+Management).

- [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
- [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)
- [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
- [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)
- [JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
- [JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)

Pour plus de détails, voir [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services).

Par défaut, les utilisateurs trouvent le Service d'Identité JOC-INITIAL qui est ajouté lors de l'installation initiale.

- Le Service d'Identité contient le compte utilisateur unique *root* avec le mot de passe *root*. Les utilisateurs doivent modifier le mot de passe du compte utilisateur *root* lors de la première connexion.
- Les utilisateurs peuvent ajouter [Service d'Identité - Comptes](/identity-service-accounts) et [Service d'Identité - Rôles](/identity-service-roles) au Service d'Identité.
- Les utilisateurs peuvent modifier le Service d'Identité existant ou ajouter de nouveaux Services d'Identité.

## Utilisation des Services d'Identité

Les Services d'Identité peuvent être rendus facultatifs ou obligatoires. Ils indiquent un Ordre par lequel ils seront déclenchés.

- Les Services d'Identité seront déclenchés dans l'Ordre croissant.
- Si les Services d'Identité sont qualifiés d'optionnels, la connexion est terminée lorsque la connexion est réussie avec le premier Service d'Identité. En cas d'échec, le Service d'Identité suivant est déclenché.
- Si les Services d'Identité sont qualifiés d'obligatoires, ils seront tous déclenchés lors de la connexion d'un utilisateur.

## Liste des Services d'Identité

Pour chaque Service d'Identité, les propriétés suivantes sont affichées :

- Le **Nom du Service d'Identité** peut être choisi librement.
- Le **Type de Service d'Identité** est l'un des suivants : JOC, LDAP, OIDC, CERTIFICATE, FIDO, KEYCLOAK. Pour LDAP, OIDC et KEYCLOAK, les types de service supplémentaires LDAP-JOC, OIDC-JOC et KEYCLOAK-JOC peuvent être utilisés pour stocker l'attribution des rôles avec JOC Cockpit.
- Le **Schema d'authentification** peut être *à un facteur* ou *à deux facteurs*. 
- **Deuxième facteur** indique si un deuxième facteur est activé pour l'authentification *à deux facteurs*.
- **Séquence** indique l'Ordre dans lequel le Service d'Identité est déclenché pour l'authentification.
- **Désactivé** indique si le Service d'Identité est inactif et n'est pas utilisé pour la connexion.
- **Requis** indique que le Service d'Identité sera déclenché en plus des Services d'Identité dont l'Ordre est antérieur.

## Opérations sur les Services d'Identité

Les utilisateurs peuvent cliquer sur l'un des Services d'Identité pour accéder à la vue [Service d'Identité - Rôles](/identity-service-roles) ou [Service d'Identité - Comptes](/identity-service-accounts) si le service est proposé.

Les utilisateurs peuvent ajouter un Service d'Identité à partir du bouton correspondant dans le coin supérieur droit de l'écran.

Pour les Services d'Identité existants, les opérations suivantes sont proposées à partir de leur menu d'action à trois points :

- **Editer** permet de spécifier la configuration générale du Service d'Identité.
- **Gérer les paramètres** permet de spécifier les paramètres spécifiques à un type de service.
- **Désactiver** désactive le Service d'Identité, il ne sera pas utilisé pour la connexion.
- **Supprimer** supprime le Service d'Identité.

## Références

### Aide contextuelle

- [Service d'Identité - Comptes](/identity-service-accounts)
- [Service d'Identité - Configuration](/identity-service-configuration)
- [Service d'Identité - Rôles](/identity-service-roles)

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
  