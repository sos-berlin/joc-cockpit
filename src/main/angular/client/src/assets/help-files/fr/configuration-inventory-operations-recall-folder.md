# Configuration - Inventaire - Opérations - Dossier de rappel

Le rappel d'objets les désactive, par exemple, pour une utilisation avec le site [Daily Plan](/daily-plan). Cela s'applique à des objets tels que les Plannifications et les Calendriers disponibles dans le dossier système *Automation*.

La vue *Configuration-&gt;Inventaire* permet de rappeler un seul objet, voir [Configuration - Inventory - Operations - Recall Object](/configuration-inventory-operations-recall-object), et de rappeler des objets à partir de dossiers.

Lorsque vous rappelez des objets d'un dossier à l'aide de l'opération *Retirer* disponible dans le menu d'action à 3 points du dossier dans le panneau de navigation, une fenêtre contextuelle s'affiche comme suit :

<img src="recall-folder.png" alt="Recall Folder" width="600" height="600" />

## Mise à jour du Plan Quotidien

Le rappel d'objets tels que les Plannifications et les Calendriers a un impact sur la vue [Daily Plan](/daily-plan). 

Les Ordres existants pour les Workflows référencés par les Plannifications associées seront rappelés du Contrôleur et seront supprimés du Plan Quotidien.

## Inclure les dépendances

Les objets d'inventaire sont liés par des dépendances, voir [Dependency Matrix](/dependencies-matrix). Par exemple, un Workflow référençant une ressource de tâche et un Verrou de Ressource ; une Plannification référençant un Calendrier et un ou plusieurs Workflows.

Lors du rappel des objets, la cohérence est prise en compte, par exemple :

- Si une Plannification est créée et fait référence à un Calendrier nouvellement créé, la libération de la Plannification inclut la libération du Calendrier également. Cela inclut également le déploiement d'un projet de Workflow référencé par la Plannification.
- Si un Calendrier est référencé par une Plannification validée et qu'il doit être rappelé ou supprimé, la Plannification doit également être rappelée ou supprimée. Ceci inclut la révocation ou la suppression du Workflow référencé par la Plannification.

Les utilisateurs contrôlent le déploiement cohérent à partir des options suivantes :

- **Inclure les dépendances**
  - lorsque cette option est cochée, elle inclut à la fois les objets référents et les objets référencés.
    - Si les objets liés sont dans un état déployé/libéré, un rappel commun est proposé. Le rappel sera appliqué si les relations entre les objets l'exigent.
    - Si les objets liés sont à l'état de projet, le rappel commun est facultatif. Les utilisateurs peuvent sélectionner les objets liés pour le rappel commun.
  - si la case n'est pas cochée, les dépendances ne sont pas prises en compte. Les utilisateurs doivent vérifier que les objets liés sont valides et déployés/libérés. Le Contrôleur émettra des messages d'erreur en cas d'objets manquants en raison d'un déploiement incohérent.

## Références

### Aide contextuelle

- [Configuration - Inventory - Operations - Recall Object](/configuration-inventory-operations-recall-object)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Dependency Matrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

