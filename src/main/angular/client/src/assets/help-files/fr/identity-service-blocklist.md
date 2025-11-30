# Liste de blocage des services d'identité

Les services d'identité régissent l'accès au JOC Cockpit par l'authentification et l'autorisation, voir [Identity Services](/identity-services).

Les comptes d'utilisateurs administratifs peuvent ajouter des comptes de n'importe quel service d'identité à une liste de blocage :

- Les comptes bloqués se voient refuser l'accès à JOC Cockpit, mais ne sont pas bloqués par le fournisseur de services d'identité (LDAP, OIDC, etc.).
- Les comptes bloqués restent dans la liste de blocage jusqu'à ce qu'ils en soient retirés.

## Ajout de comptes à la liste de blocage

La sous-vue *Blocklist* permet d'ajouter des comptes à la liste de blocage à partir du bouton correspondant dans le coin supérieur droit de la vue.

Les comptes d'utilisateurs peuvent être ajoutés à la liste de blocage à partir des vues secondaires suivantes :

- [Audit Log - Failed Logins](/identity-service-faíled-logins) les comptes d'utilisateurs peuvent être ajoutés à la liste de blocage à partir des vues secondaires suivantes: : si des comptes sont identifiés comme ayant fréquemment échoué à l'ouverture de session, cela peut indiquer une attaque. Ces comptes peuvent être ajoutés à la liste de blocage.
- [Identity Service - Active Sessions](/identity-service-active-sessions) si des comptes dans des sessions actives sont identifiés comme étant indésirables, ils peuvent être ajoutés à la liste de blocage.

Les deux vues secondaires permettent d'ajouter des comptes individuels à la liste de blocage et d'ajouter des comptes sélectionnés à partir d'une opération en bloc.

### Suppression de comptes de la liste de blocage

Dans la sous-vue *Liste de blocage*, pour chaque compte affiché, l'élément de menu d'action *Supprimer de la liste de blocage* est proposé.

Une opération en bloc est possible en utilisant le bouton *Supprimer de la liste de blocage* dans le coin supérieur droit de la sous-vue pour les comptes sélectionnés.

## Références

### Aide contextuelle

- [Audit Log - Failed Logins](/identity-service-faíled-logins)
- [Identity Service - Active Sessions](/identity-service-active-sessions)
- [Identity Services](/identity-services)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)

