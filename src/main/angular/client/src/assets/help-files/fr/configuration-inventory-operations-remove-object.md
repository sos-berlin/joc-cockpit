# Configuration - Inventaire - Opérations - Supprimer un objet

La suppression d'objets consiste à les supprimer des Contrôleurs et de l'inventaire. Cela s'applique aux objets tels que les Workflows et les Planifications disponibles dans les dossiers système *Contrôleur* et *Automatisation*.

Les objets supprimés restent disponibles dans la corbeille de l'inventaire.

La vue *Configuration-&gt;Inventaire* permet de supprimer un seul objet et de supprimer des objets de dossiers, voir [Configuration - Inventaire - Opérations - Supprimer Dossier](/configuration-inventory-operations-remove-folder).

Lorsque vous supprimez un objet unique en utilisant l'opération *Supprimer* disponible dans le menu d'action à 3 points de l'objet dans la vue de navigation, une fenêtre contextuelle s'affiche comme suit :

<img src="remove-workflow.png" alt="Remove Workflow" width="600" height="140" />

## Supprimer des objets des Contrôleurs

Lors de la suppression d'un objet, celui-ci sera supprimé de tous les Contrôleurs dans lesquels il a été déployé.

## Mise à jour du Plan Quotidien

La suppression d'objets tels que les Workflows et les Planifications a un impact sur la vue [Plan Quotidien](/daily-plan). 

Les Ordres existants pour les Workflows associés seront annulés à partir des Contrôleurs et seront supprimés du Plan Quotidien.

## Inclut les Dépendances

Les objets d'inventaire sont liés par des dépendances, voir [Matrice des Dépendances](/dependencies-matrix). Par exemple, un Workflow référençant une Ressource de Tâche et un Verrou de Ressource ; une Planification référençant un Calendrier et un ou plusieurs Workflows.

Lors de la suppression d'objets, la cohérence est prise en compte, par exemple :

- Si une Ressource de Tâche est référencée par un Workflow, alors la suppression de la Ressource de Tâche inclut la révocation du Workflow.
- Si un Workflow est supprimé, la Planification faisant référence à ce Workflow sera raetirée et les Ordres associés seront annulés et supprimés du Plan Quotidien.

Les utilisateurs contrôlent la suppression cohérente des objets à partir des options suivantes :

- **Inclut les Dépendances**
  - si cette option est cochée, elle inclura à la fois les objets référents et les objets référencés.
    - Si des objets liés ont été précédemment déployés ou publiés, une suppression/révocation commune est proposée : l'objet pour lequel l'opération *Remove* est effectuée sera supprimé, tandis que la révocation des objets liés est proposée. La révocation des objets apparentés sera appliquée, si les relations entre les objets l'exigent.
    - Ceci s'applique également aux objets en statut de brouillon qui ont été précédemment déployés ou publiés.
  - si la case n'est pas cochée, les dépendances ne sont pas prises en compte. Les utilisateurs doivent vérifier si les objets liés sont valides et déployés/publiés. Le Contrôleur émettra des messages d'erreur en cas d'objets manquants en raison d'une révocation incohérente.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Opérations - Supprimer Dossier](/configuration-inventory-operations-remove-folder)
- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
- [Matrice des Dépendances](/dependencies-matrix)
- [Plan Quotidien](/daily-plan)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

