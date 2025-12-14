# Service d'Identité - Rôles

Les Services d'Identité régissent l'accès au JOC Cockpit par l'authentification et l'autorisation, voir [Services d'Identité](/identity-services).

Pour l'autorisation, le JS7 propose un modèle d'accès basé sur les rôles (RBAC) qui comprend les éléments suivants

- les rôles sont librement configurés à partir des autorisations disponibles,
- les utilisateurs se voient attribuer un ou plusieurs rôles qui sont fusionnés pour les autorisations résultantes.

Le JS7 est livré avec les éléments suivants - [JS7 - Default Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Default+Roles+and+Permissions) qui peuvent être modifiés ou supprimés à la guise de l'utilisateur :

| Rôle | Objet | Permissions |
| ----- | ----- | ----- |
| Il s'agit d'un rôle technique sans aucune responsabilité dans les processus informatiques et commerciaux. | Ce rôle comprend toutes les autorisations pour démarrer, redémarrer, basculer, etc. les composants JS7. |
| api_user | Ce rôle est destiné aux applications telles que les moniteurs de système qui accèdent à JS7 via son API. | Le rôle accorde de préférence des autorisations de visualisation. En outre, il permet de gérer les Ordres et de déployer des Workflows. |
| application_manager | Il s'agit d'un rôle d'ingénieur ayant une connaissance approfondie des workflows, par exemple pour la gestion des changements. Ce rôle n'est pas nécessairement impliqué dans les opérations quotidiennes. | Le rôle comprend des autorisations pour les tâches administratives sur les instances de Contrôleur, la configuration des Clusters, les certificats et les personnalisations. En outre, le rôle comprend des autorisations pour gérer l'inventaire JS7. La gestion des comptes d'utilisateurs n'est pas incluse. |
| Le rôle est destiné aux utilisateurs du back-office qui ne sont pas responsables des opérations informatiques, mais éventuellement du processus commercial et qui souhaitent donc rester informés de l'état d'exécution du Workflow. | Le rôle offre des permissions en lecture seule. |
| Le rôle est basé sur le rôle *application_manager* et ajoute toutes les permissions de Contrôleur et d'Agent requises pour la gestion des incidents, par exemple l'accès aux fichiers journaux. |
| it_operator | Il s'agit du rôle pour les opérations quotidiennes des workflows et du plan Quotidien. | Le rôle accorde de préférence des autorisations de visualisation. En outre, il permet de gérer les Ordres et de déployer les Workflows. |

Les utilisateurs sont encouragés à supprimer les rôles inutilisés et à ajuster les autorisations pour les rôles selon les besoins.

## Étendue des rôles

Les rôles sont spécifiés pour les champs d'application suivants :

- Chaque rôle peut être limité à un ou plusieurs dossiers d'inventaire.
- Chaque rôle se voit attribuer un ensemble de permissions pour les opérations dans le JOC Cockpit.
- Chaque rôle se voit attribuer un jeu de permissions pour les opérations par défaut sur tous les Contrôleurs.
- Chaque rôle peut se voir attribuer des jeux de permissions supplémentaires par Contrôleur.

Les autorisations spécifient l'un des états suivants dans le champ d'application correspondant :

- l'autorisation n'est pas attribuée,
- la permission est accordée,
- la permission est refusée.

Les autorisations sont fusionnées à partir de tous les rôles pour obtenir les autorisations d'un compte d'utilisateur :

- JOC Cockpit
  - Si une autorisation n'est pas attribuée dans le cadre d'un seul rôle, d'autres rôles peuvent l'accorder. Si aucun rôle n'accorde la permission, celle-ci n'est pas accordée dans les autorisations résultantes.
  - Si une autorisation est accordée dans le cadre d'un rôle unique, elle sera accordée pour les autorisations résultantes.
  - Si une autorisation est refusée dans le cadre d'un rôle unique, elle sera refusée dans le cadre des autorisations résultantes. Les autorisations refusées l'emportent sur les autorisations accordées.
- Contrôleur
  - si une autorisation n'est pas attribuée dans le champ d'application par défaut, les champs d'application des Contrôleurs individuels peuvent accorder l'autorisation pour le Contrôleur concerné.
  - si une autorisation est accordée dans la portée par défaut, elle s'applique par défaut à tous les Contrôleurs.
  - si une autorisation est accordée à un Contrôleur donné, les autorisations qui en découlent pour le Contrôleur incluent l'autorisation.
  - Si une autorisation est refusée pour un Contrôleur donné, elle remplace l'autorisation accordée dans le champ d'application par défaut et dans d'autres rôles pour le même Contrôleur.
  - Si une autorisation est refusée dans le champ d'application par défaut, elle annule la même autorisation accordée à n'importe quel Contrôleur.

## Opérations sur les rôles

Les opérations suivantes sont disponibles à partir des boutons connexes situés dans le coin supérieur droit de la vue Secondaire :

- **Compte** limite l'affichage aux rôles attribués au compte sélectionné.
- **Importer** permet d'importer des rôles à partir d'un fichier au format JSON qui a été précédemment créé à partir d'une *exportation* de rôles.
- **Ajouter un Contrôleur** permet d'ajouter le champ d'application d'un Contrôleur spécifique.
- **Ajouter un rôle** permet de créer un nouveau rôle.

### Opérations sur des rôles uniques

À partir de la liste des rôles, les utilisateurs peuvent glisser-déposer un rôle vers une position différente. Cette opération n'a aucun impact sur le traitement des rôles.

Les opérations suivantes sont proposées dans le menu d'action à trois points de chaque rôle :

- **Éditer** permet de modifier le nom du rôle. Les modifications sont prises en compte pour les rôles existants affectés à des comptes d'utilisateurs.
- **Dupliquer** permet de copier le rôle dans un nouveau rôle. L'utilisateur spécifie le nom du nouveau rôle.
- **Supprimer** supprime le rôle de l'inventaire et de tous les comptes d'utilisateurs auxquels il est attribué.

### Opérations en masse sur les rôles

Les opérations en bloc suivantes sont disponibles lorsque vous sélectionnez un ou plusieurs rôles :

- **Export** propose le téléchargement d'un fichier au format JSON contenant la configuration des rôles sélectionnés. Le fichier d'exportation peut être utilisé pour l'importation avec la même instance de JOC Cockpit ou avec une instance différente.
- **Copier** ajoute les rôles au presse-papiers interne pour les coller ultérieurement dans un autre Service d'Identité de la même instance de JOC Cockpit.
- **Supprimer** supprime les rôles sélectionnés de l'inventaire et de tous les comptes d'utilisateurs auxquels ils ont été attribués.

## Références

### Aide contextuelle

- [Service d'Identité - Permissions](/identity-service-permissions)
- [Services d'Identité](/identity-services)

### Product Knowledge Base

- [JS7 - Default Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Default+Roles+and+Permissions)
- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
- [JS7 - Gestion des comptes d'utilisateurs, des rôles et des autorisations](https://kb.sos-berlin.com/display/JS7/JS7+-+Gestion+des+comptes+d'utilisateurs%2C+Rôles+et+Permissions)
