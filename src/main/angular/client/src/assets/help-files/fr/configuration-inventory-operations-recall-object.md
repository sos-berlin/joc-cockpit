# Configuration - Inventaire - Opérations - Rappel d'objet

Le rappel d'objets permet de les désactiver, par exemple, dans la vue [Daily Plan](/daily-plan). Cela s'applique aux objets tels que les Planifications et les Calendriers disponibles dans le dossier système *Automatisation*.

La vue *Configuration-&gt;Inventaire* permet de rappeler un seul objet et de rappeler des objets à partir de dossiers, voir [Configuration - Inventory - Operations - Recall Folder](/configuration-inventory-operations-recall-folder).

Lorsque vous rappelez un objet unique à partir de l'opération *Retirer* disponible dans le menu d'action à 3 points de l'objet dans le vue de navigation, une fenêtre contextuelle s'affiche comme suit :

<img src="recall-schedule.png" alt="Recall Schedule" width="600" height="300" />

## Mise à jour du Plan Quotidien

Le rappel d'objets tels que les Planifications et les Calendriers a un impact sur la vue [Daily Plan](/daily-plan). 

Les Ordres existants pour les Workflows référencés par les Planifications associées seront rappelés du Contrôleur et seront supprimés du Plan Quotidien.

## Inclure les dépendances

Les objets d'inventaire sont liés par des dépendances, voir [Dependency Matrix](/dependencies-matrix). Par exemple, un Workflow référençant une ressource de tâche et un Verrou de Ressource ; une Planification référençant un Calendrier et un ou plusieurs Workflows.

Lors du rappel des objets, la cohérence est prise en compte, par exemple :

- Si une Planification est créée et fait référence à un Calendrier nouvellement créé, la libération de la Planification inclut la libération du Calendrier également. Cela inclut également le déploiement d'un projet de Workflow référencé par la Planification.
- Si un Calendrier est référencé par une Planification validée et qu'il doit être rappelé ou supprimé, la Planification doit également être rappelée ou supprimée. Ceci inclut la révocation ou la suppression du Workflow référencé par la Planification.

Les utilisateurs contrôlent le déploiement cohérent à partir des options suivantes :

- **Inclure les dépendances**
  - lorsque cette option est cochée, elle inclut à la fois les objets référents et les objets référencés.
    - Si des objets liés sont dans un état déployé/libéré, un rappel commun est proposé. Il sera appliqué si les relations entre les objets l'exigent.
    - Si les objets liés sont à l'état de projet, le rappel commun est facultatif. Les utilisateurs peuvent sélectionner les objets liés pour le rappel commun.
  - si la case n'est pas cochée, les dépendances ne sont pas prises en compte. Les utilisateurs doivent vérifier que les objets liés sont valides et déployés/libérés. Le Contrôleur émettra des messages d'erreur en cas d'objets manquants en raison d'un déploiement incohérent.

## Références

### Aide contextuelle

- [Configuration - Inventory - Operations - Recall Folder](/configuration-inventory-operations-recall-folder)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Dependency Matrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

