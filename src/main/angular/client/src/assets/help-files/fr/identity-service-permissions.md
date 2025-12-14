# Service d'Identité - Permissions

Les Services d'Identité régissent l'accès au JOC Cockpit par l'authentification et l'autorisation, voir [Services d'Identité](/identity-services).

Pour l'autorisation, le JS7 propose un modèle d'accès basé sur les rôles (RBAC) qui comprend les éléments suivants

- les rôles sont librement configurés à partir des autorisations disponibles,
- les utilisateurs se voient attribuer un ou plusieurs rôles qui sont fusionnés pour les autorisations résultantes.

Les autorisations spécifient l'un des états suivants :

- la permission n'est pas attribuée (couleur de fond blanche),
- la permission est accordée (couleur de fond bleue),
- la permission est refusée (couleur de fond grise).

Les autorisations sont fusionnées à partir de tous les rôles pour obtenir les autorisations d'un compte d'utilisateur.

## Étendue du dossier

L'étendue des autorisations d'un rôle peut être limitée à un ou plusieurs dossiers d'inventaire.

- Les utilisateurs peuvent utiliser le bouton *Ajouter un dossier* dans le coin supérieur droit de la vue pour sélectionner un dossier d'inventaire et spécifier une utilisation récursive.
- Les utilisateurs peuvent ajouter un nombre quelconque de dossiers d'inventaire à un rôle.

## Arboressence des permissions

Les autorisations peuvent être considérées comme une arboressence offrant une hiérarchie . Le fait d'accorder ou de refuser des autorisations à un niveau supérieur entraîne l'attribution récursive d'autorisations à des niveaux bas.

### Octroi et refus de permissions

Les autorisations sont visualisées à partir d'un rectangle semblable à une pile :

- En cliquant sur le pôle situé sur le côté droit d'une pile, vous élargirez/réduirez les autorisations descendantes.
- En cliquant sur l'arrière-plan de la batterie, vous ferez passer la permission de l'état non attribué à l'état accordé :
  - Un rectangle sur fond blanc indique une autorisation non attribuée.
  - Un rectangle sur fond bleu indique une autorisation accordée qui sera transmise aux autorisations descendantes. <br/><img src="identity-service-permissions-granted.png" alt="Granted Permissions" width="600" height="100" />
  - Un rectangle sur fond bleu clair indique une autorisation héritée et accordée. Les modifications apportées à la permission nécessitent non pas d'accorder la permission du parent, mais d'accorder les permissions des enfants individuellement. <br/><img src="identity-service-permissions-inherited.png" alt="Inherited Permissions" width="600" height="100" />
- En cliquant sur l'icône + à l'intérieur du rectangle d'une autorisation, l'autorisation passe au statut refusé, indiqué par la couleur de fond grise. En cliquant sur l'icône - à l'intérieur d'une autorisation refusée, l'autorisation devient une autorisation non attribuée sur fond blanc. <br/><img src="identity-service-permissions-denied.png" alt="Denied Permissions" width="600" height="100" />

### Réduire et développer les autorisations

Les boutons suivants permettent de développer/réduire les autorisations :

- **Développer tout**, **Réduire tout** pour développer ou réduire toutes les autorisations.
- les boutons suivants permettent de développer ou de réduire les autorisations : **Développer tout**, **Réduire tout** permettent de développer ou de réduire toutes les autorisations.
- **Réduire les permissions inactives** réduira les permissions non attribuées.

## Vue graphique et tabulaire

Dans le coin supérieur droit, les boutons suivants permettent d'afficher les autorisations :

- **La vue graphique** affiche les autorisations sous forme d'arbre en utilisant la forme d'une batterie.
- **La vue tabulaire** affiche les autorisations sous forme de texte, les niveaux d'autorisation étant séparés par deux points.

## Références

### Aide contextuelle

- [Service d'Identité - Rôles](/identity-service-roles)
- [Services d'Identité](/identity-services)

### Product Knowledge Base

- [JS7 - Default Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Default+Roles+and+Permissions)
- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
- [JS7 - Management of User Accounts, Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+User+Accounts%2C+Roles+and+Permissions)
