# Configuration - Inventaire - Opérations - Déploiement de Dossier

Le déploiement d'objets consiste à les transférer vers un ou plusieurs Contrôleurs. Cela s'applique aux objets tels que les Workflows et les Ressources de Tâche disponibles dans le dossier système *Contrôleur*.

La vue *Configuration-&gt;Inventaire* permet de déployer un seul objet, voir [Configuration - Inventaire - Opérations - Deployer Objet](/configuration-inventory-operations-deploy-object), et de déployer des objets à partir de dossiers.

Lorsque vous déployez des objets à partir de dossiers en utilisant l'opération *Déployer* du menu d'action à 3 points du dossier, une fenêtre contextuelle s'affiche comme suit :

<img src="deploy-folder.png" alt="Deploy Folder" width="600" height="460" />

## Déploiement vers les Contrôleurs

Le champ **Contrôleur** accepte un ou plusieurs Contrôleurs vers lesquels les objets seront déployés.

Par défaut, le Contrôleur actuellement sélectionné sera utilisé.

## Mise à jour du Plan Quotidien

Le déploiement d'objets tels que les Workflows, les Planifications et les Calendriers a un impact sur le [Plan Quotidien](/daily-plan). Il arrive fréquemment que la version mise à jour d'un objet soit utilisée pour les Ordres dans le Plan Quotidien. Les utilisateurs contrôlent le comportement à partir des options suivantes :

- **Mettre à jour le Plan Quotidien**
  - **Maintenant** spécifie la mise à jour du Plan Quotidien pour les Ordres planifiés à un moment donné à partir de maintenant.
  - **À partir de** La sélection de l'option ajoute un champ de saisie pour la date cible à partir de laquelle le Plan Quotidien sera mis à jour.
  - **Non** spécifie que le Plan Quotidien ne sera pas mis à jour. Les Ordres existants s'en tiendront à l'utilisation des versions d'objets précédemment déployées.
- **Inclure les Ordres tardifs d'aujourd'hui** si coché, cela inclura les Ordres qui ont été planifiés pour une heure passée dans la journée en cours, mais qui sont retardés et n'ont pas démarré.

## Déploiement des objets et des modifications

Le **Type de déploiement** vous permet de choisir entre 

- **Les objets individuels** disponibles dans le dossier sélectionné.
- **Changements**: Les utilisateurs sélectionnent le [Change](/changes) souhaité dans la liste des changements disponibles.

## Filtrage des objets

Les objets peuvent être filtrés à partir des options suivantes :

- **Brouillon** spécifie que les objets en état de brouillon doivent être déployés.
- **Déployé** spécifie que les objets à l'état déployé doivent être inclus dans le déploiement.

## Inclure les sous-dossiers

L'option **Gérer Récursivement** permet d'ajouter des objets de sous-dossiers de manière récursive au déploiement.

## Inclut les Dépendances

Les objets de l'inventaire sont liés par des dépendances, voir [Matrice des Dépendances](/dependencies-matrix). Par exemple, un Workflow référençant une Ressource de Tâche et un Verrou de Ressource; une Planification référençant un Calendrier et un ou plusieurs Workflows.

Lors du déploiement des objets, la cohérence est prise en compte, par exemple :

- Si une Ressource de Tâche est créée et est référencée par un Workflow nouvellement créé, alors le déploiement du Workflow inclut le déploiement de la Ressource de Tâche.
- Si une Ressource de Tâche est référencée par un Workflow déployé et qu'elle doit être révoquée ou supprimée, le Workflow doit également être révoqué ou supprimé.

Les utilisateurs contrôlent la cohérence du déploiement à partir des options suivantes :

- **Inclut les Dépendances**
  - si cette option est cochée, elle inclura à la fois les objets référencés et les objets référencés.
    - Si les objets liés sont à l'état de brouillon, un déploiement commun est proposé. Il sera appliqué, si nécessaire, en cas de modification des relations entre les objets.
    - Si les objets liés sont dans l'état déployé/publié, le déploiement commun est facultatif. Les utilisateurs peuvent sélectionner des objets liés pour le déploiement commun.
  - si la case n'est pas cochée, les dépendances ne sont pas prises en compte. Les utilisateurs doivent vérifier si les objets liés sont valides et déployés/publiés. Le Contrôleur émettra des messages d'erreur en cas d'objets manquants en raison d'un déploiement incohérent.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Opérations - Deployer Objet](/configuration-inventory-operations-deploy-object)
- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
- [Matrice des Dépendances](/dependencies-matrix)
- [Plan Quotidien](/daily-plan)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
