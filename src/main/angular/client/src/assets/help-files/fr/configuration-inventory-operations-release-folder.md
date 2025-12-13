# Configuration - Inventaire - Opérations - Dossier de validation

La libération d'objets permet de les activer, par exemple pour les utiliser avec le site [Daily Plan](/daily-plan). Cela s'applique à des objets tels que les Plannifications et les Calendriers disponibles dans le dossier système *Automation*.

La vue *Configuration-&gt;Inventaire* permet de libérer un seul objet, voir [Configuration - Inventory - Operations - Release Object](/configuration-inventory-operations-release-object) et libérer les objets des dossiers.

Lorsque vous libérez des objets de dossiers en utilisant l'opération *Libérer* du menu d'action à 3 points du dossier, une fenêtre contextuelle s'affiche comme suit :

<img src="release-folder.png" alt="Release Folder" width="592" height="560" />

## Mise à jour du Plan Quotidien

La libération d'objets tels que les Plannifications et les Calendriers a un impact sur le site [Daily Plan](/daily-plan). Il arrive fréquemment que la version mise à jour d'un objet soit utilisée pour les Ordres dans le Plan Quotidien. Les utilisateurs contrôlent le comportement à partir des options suivantes :

- **Mettre à jour le Plan Quotidien**
  - **Maintenant** spécifie la mise à jour du Plan Quotidien pour les Ordres planifiés à un moment donné à partir de maintenant.
  - ** A partir de ** La sélection de l'option ajoute un champ de saisie pour la date cible à partir de laquelle le Plan Quotidien sera mis à jour.
  - **Non** spécifie que le Plan Quotidien ne sera pas mis à jour. Les Ordres existants s'en tiendront à l'utilisation des versions d'objets précédemment déployées.
- **Inclure les Ordres tardifs du jour** si coché, cela inclura les Ordres qui ont été planifiés pour une heure passée dans la journée en cours, mais qui sont retardés et n'ont pas démarré.

## Inclure les sous-dossiers

L'option **Gérer de manière récursive** permet de libérer des objets de sous-dossiers de manière récursive.

## Inclure les dépendances

Les objets de l'inventaire sont liés par des dépendances, voir [Dependency Matrix](/dependencies-matrix). Par exemple, un Workflow référençant une ressource de tâche et un Verrou de Ressource ; une Plannification référençant un Calendrier et un ou plusieurs Workflows.

Lors de la libération des objets, la cohérence est prise en compte, par exemple :

- Si une Plannification est créée et fait référence à un Calendrier nouvellement créé, la libération de la Plannification inclut également la libération du Calendrier. Cela inclut également le déploiement d'un projet de Workflow référencé par la Plannification.
- Si un Calendrier est référencé par une Plannification validée et qu'il doit être rappelé ou supprimé, la Plannification doit également être rappelée ou supprimée. Ceci inclut la révocation ou la suppression du Workflow référencé par la Plannification.

Les utilisateurs contrôlent le déploiement cohérent à partir des options suivantes :

- **Inclure les dépendances**
  - si cette option est cochée, elle inclura à la fois les objets référents et les objets référencés.
    - Si les objets liés sont à l'état de projet, un déploiement commun est proposé. Il sera appliqué, si nécessaire, en cas de modification des relations entre les objets.
    - Si les objets liés sont au statut déployé/publié, le déploiement commun est facultatif. Les utilisateurs peuvent sélectionner des objets liés pour le déploiement commun.
  - si la case n'est pas cochée, les dépendances ne sont pas prises en compte. Les utilisateurs doivent vérifier si les objets liés sont valides et déployés/libérés. Le Contrôleur émettra des messages d'erreur en cas d'objets manquants en raison d'un déploiement incohérent.

## Références

### Aide contextuelle

- [Configuration - Inventory - Operations - Release Object](/configuration-inventory-operations-release-object)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Dependency Matrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

