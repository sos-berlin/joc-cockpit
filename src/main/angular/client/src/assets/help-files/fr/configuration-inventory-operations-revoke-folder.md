# Configuration - Inventaire - Opérations - Révoquer le dossier

La révocation d'objets permet de les supprimer du contrôleur et de conserver les objets à l'état de projet dans l'inventaire. Cela s'applique aux objets tels que les Workflows et les ressources de tâche disponibles dans le dossier système *Controller*.

La vue *Configuration-&gt;Inventaire* permet de révoquer un seul objet, voir [Configuration - Inventory - Operations - Revoke Object](/configuration-inventory-operations-revoke-object), et de révoquer des objets à partir de dossiers.

Lorsque vous révoquez des objets d'un dossier en utilisant l'opération *Révoquer* disponible dans le menu d'action à 3 points du dossier dans le vue de navigation, une fenêtre contextuelle s'affiche comme suit :

<img src="revoke-folder.png" alt="Revoke Folder" width="600" height="580" />

## Révoquer les objets des contrôleurs

Le champ de saisie accepte un ou plusieurs contrôleurs à partir desquels les objets seront révoqués.

Par défaut, le contrôleur actuellement sélectionné est indiqué.

## Mise à jour du Plan Quotidien

La révocation d'objets tels que les Workflows et les ressources de tâche a un impact sur la vue [Daily Plan](/daily-plan). 

Les Ordres existants pour les Workflows associés seront rappelés par le contrôleur et seront supprimés du Plan Quotidien.

## Inclure les sous-dossiers

L'option **Gérer de manière récursive** permet de révoquer des objets de sous-dossiers de manière récursive.

## Inclure les dépendances

Les objets de l'inventaire sont liés par des dépendances, voir [Dependency Matrix](/dependencies-matrix). Par exemple, un Workflow référençant une ressource de tâche et un verrou de ressource ; une Plannification référençant un calendrier et un ou plusieurs Workflows.

Lors de la révocation d'objets, la cohérence est prise en compte, par exemple :

- Si une ressource de tâche est référencée par un Workflow, la révocation de la ressource de tâche entraîne également la révocation du Workflow.
- Si un Workflow est révoqué, une Plannification référençant le Workflow sera rappelée et les Ordres associés seront rappelés et supprimés du Plan Quotidien.

Les utilisateurs contrôlent la révocation cohérente des objets à partir des options suivantes :

- **Inclure les dépendances**
  - si cette option est cochée, elle inclura à la fois les objets référents et les objets référencés.
    - Si des objets liés ont été précédemment déployés ou libérés, une révocation commune est proposée. Elle sera appliquée si les relations entre les objets l'exigent.
    - Cela s'applique également aux objets à l'état de projet qui ont été précédemment déployés ou libérés.
  - si la case n'est pas cochée, les dépendances ne sont pas prises en compte. Les utilisateurs doivent vérifier si les objets liés sont valides et déployés/libérés. Le contrôleur émettra des messages d'erreur en cas d'objets manquants en raison d'une révocation incohérente.

## Références

### Aide contextuelle

- [Configuration - Inventory - Operations - Revoke Object](/configuration-inventory-operations-revoke-object)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Dependency Matrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

