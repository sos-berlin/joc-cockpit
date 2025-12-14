# Service d'Identité - Séances actives

Les Services d'Identité régissent l'accès au JOC Cockpit par l'authentification et l'autorisation, voir [Services d'Identité](/identity-services).

Les utilisateurs peuvent identifier les comptes détenant des séances actives lorsqu'ils invoquent la vue *Gérer les Services d'Identité* à partir de l'icône de la roue dans la barre de menu.

Les séances actives sont affichées à partir du compte utilisé, du Service d'Identité utilisé pour la connexion et du temps de séance restant.

- JOC Cockpit ne limite pas le nombre de séances par compte.
- Le temps de séance restant est limité par les facteurs suivants :
  - Le paramètre *session_idle_timeout* configuré sur la page [Réglages - Service d'Identité](/settings-identity-service) limite la durée maximale pendant laquelle une séance peut rester active sans activité de l'utilisateur.
  - Les fournisseurs de Services d'Identité tels que OIDC et Keycloak peuvent limiter la durée maximale d'une séance utilisateur.

## Opérations sur les séances actives

Les utilisateurs peuvent effectuer les opérations suivantes sur les séances actives :

- **Ajouter à la Liste de Blocage** ajoute le compte concerné à la liste [Service d'Identité - Liste de Blocage](/identity-service-blocklist) qui interdit toute connexion ultérieure. Cette opération ne met pas fin à la séance en cours du compte.
- **Annuler la séance** met fin de force à la séance en cours du compte. Cela n'empêchera pas le compte d'effectuer une nouvelle opération de connexion.
- **Annuler toutes les séances du compte**, similaire à *Annuler la séance*, met fin à toutes les séances du compte donné.

Si vous sélectionnez une ou plusieurs séances, l'opération *Annuler la séance* est disponible en bloc à l'aide du bouton correspondant dans le coin supérieur droit de la vue Secondaire.

## Références

### Aide contextuelle

- [Réglages - Service d'Identité](/settings-identity-service)
- [Services d'Identité](/identity-services)
- [Service d'Identité - Liste de Blocage](/identity-service-blocklist)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
