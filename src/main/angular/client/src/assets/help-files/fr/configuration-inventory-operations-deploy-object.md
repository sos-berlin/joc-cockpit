# Configuration - Inventaire - Opérations - Déployer un objet

Le déploiement d'objets consiste à les transférer vers un ou plusieurs Contrôleurs. Cela s'applique aux objets tels que les Workflows et les ressources de tâche disponibles dans le dossier système *Contrôleur*.

La vue *Configuration-&gt;Inventaire* permet de déployer un seul objet et de déployer des objets à partir de dossiers, voir [Deploy Folder](/configuration-inventory-operations-deploy-folder).

Lorsque vous déployez un seul objet à partir du bouton *Déployer*, une fenêtre contextuelle s'affiche comme suit :

<img src="deploy-workflow.png" alt="Deploy Workflow" width="600" height="460" />

## Déploiement vers les Contrôleurs

Le champ **Contrôleur** accepte un ou plusieurs Contrôleurs vers lesquels l'objet sera déployé.

Par défaut, c'est le Contrôleur actuellement sélectionné qui sera utilisé.

## Mise à jour du Plan Quotidien

Le déploiement d'objets tels que les Workflows, les Plannifications et les Calendriers a un impact sur le site [Daily Plan](/daily-plan). Il arrive fréquemment que la version mise à jour d'un objet soit utilisée pour les Ordres dans le Plan Quotidien. Les utilisateurs contrôlent le comportement à partir des options suivantes :

- **Mettre à jour le Plan Quotidien**
  - **Maintenant** spécifie la mise à jour du Plan Quotidien pour les Ordres planifiés à un moment donné à partir de maintenant.
  - **A partir de** La sélection de l'option ajoute un champ de saisie pour la date cible à partir de laquelle le Plan Quotidien sera mis à jour.
  - **Non** spécifie que le Plan Quotidien ne sera pas mis à jour. Les Ordres existants s'en tiendront à l'utilisation des versions d'objets précédemment déployées.
- **Inclure les Ordres tardifs d'aujourd'hui** si coché, cela inclura les Ordres qui ont été planifiés pour une heure passée dans la journée en cours, mais qui sont retardés et n'ont pas démarré.

## Inclure les dépendances

Les objets d'inventaire sont liés par des dépendances, voir [Dependency Matrix](/dependencies-matrix). Par exemple, un Workflow référençant une ressource de tâche et un Verrou de Ressource ; une Plannification référençant un Calendrier et un ou plusieurs Workflows.

Lors du déploiement des objets, la cohérence est prise en compte, par exemple :

- Si une ressource d'emploi est créée et est référencée par un Workflow nouvellement créé, alors le déploiement du Workflow inclut le déploiement de la ressource d'emploi.
- Si une ressource d'emploi est référencée par un Workflow déployé et doit être révoquée ou supprimée, le Workflow doit également être révoqué ou supprimé.

Les utilisateurs contrôlent la cohérence du déploiement à partir des options suivantes :

- **Inclure les dépendances**
  - si cette option est cochée, elle inclura à la fois les objets référencés et les objets référencés.
    - Si les objets liés sont à l'état de projet, un déploiement commun est proposé. Il sera appliqué, si nécessaire, en cas de modification des relations entre les objets.
    - Si les objets liés sont au statut déployé/publié, le déploiement commun est facultatif. Les utilisateurs peuvent sélectionner des objets liés pour le déploiement commun.
  - si la case n'est pas cochée, les dépendances ne sont pas prises en compte. Les utilisateurs doivent vérifier si les objets liés sont valides et déployés/libérés. Le Contrôleur émettra des messages d'erreur en cas d'objets manquants en raison d'un déploiement incohérent.

## Références

### Aide contextuelle

- [Configuration - Inventory - Operations - Deploy Folder](/configuration-inventory-operations-deploy-folder)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Dependency Matrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

