# Sessions actives du service d'identité

Les services d'identité régissent l'accès au JOC Cockpit par l'authentification et l'autorisation, voir [Identity Services](/identity-services).

Les utilisateurs peuvent identifier les comptes détenant des sessions actives lorsqu'ils invoquent la vue *Gérer les Services d'Identité* à partir de l'icône de la roue dans la barre de menu.

Les sessions actives sont affichées à partir du compte utilisé, du service d'identité utilisé pour la connexion et du temps de session restant.

- JOC Cockpit ne limite pas le nombre de sessions par compte.
- Le temps de session restant est limité par les facteurs suivants :
  - Le paramètre *session_idle_timeout* configuré sur la page [Settings - Identity Service](/settings-identity-service) limite la durée maximale pendant laquelle une session peut rester active sans activité de l'utilisateur.
  - Les fournisseurs de services d'identité tels que OIDC et Keycloak peuvent limiter la durée maximale d'une session utilisateur.

## Opérations sur les sessions actives

Les utilisateurs peuvent effectuer les opérations suivantes sur les sessions actives :

- **Ajouter à la liste de blocage** ajoute le compte concerné à la liste [Identity Service - Blocklist](/identity-service-blocklist) qui interdit toute connexion ultérieure. Cette opération ne met pas fin à la session en cours du compte.
- **Annuler la session** met fin de force à la session en cours du compte. Cela n'empêchera pas le compte d'effectuer une nouvelle opération de connexion.
- l'opération **Annuler toutes les sessions du compte**, similaire à *Annuler la session*, met fin à toutes les sessions du compte donné.

Si vous sélectionnez une ou plusieurs sessions, l'opération *Annuler la session* est disponible en bloc à l'aide du bouton correspondant dans le coin supérieur droit de la vue secondaire.

## Références

### Aide contextuelle

- [Identity Service - Blocklist](/identity-service-blocklist)
- [Identity Services](/identity-services)
- [Settings - Identity Service](/settings-identity-service)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)

