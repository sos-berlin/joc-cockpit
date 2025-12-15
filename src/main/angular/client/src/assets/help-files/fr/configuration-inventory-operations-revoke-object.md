# Configuration - Inventaire - Opérations - Révoquer Objet

La révocation d'objets permet de les supprimer du Contrôleur et de conserver les objets à l'état de brouillon dans l'inventaire. Cela s'applique aux objets tels que les Workflows et les Ressources de Tâche disponibles dans le dossier système *Controller*.

La vue *Configuration-&gt;Inventaire* permet de révoquer un seul objet et de révoquer des objets à partir de dossiers, voir [Configuration - Inventaire - Opérations - Révoquer Dossier](/configuration-inventory-operations-revoke-folder).

Lorsque vous révoquez un objet unique à partir de l'opération *Revoquer* disponible dans le menu d'action à 3 points de l'objet dans le panneau de navigation, une fenêtre contextuelle s'affiche comme suit :

<img src="revoke-workflow.png" alt="Revoquer Workflow" width="600" height="460" />

## Révoquer un objet auprès des Contrôleurs

Le champ de saisie accepte un ou plusieurs Contrôleurs à partir desquels l'objet sera révoqué.

Par défaut, le Contrôleur actuellement sélectionné est indiqué.

## Mise à jour du Plan Quotidien

La révocation d'objets tels que les Workflows et les Ressources de Tâche a un impact sur le [Plan Quotidien](/daily-plan). 

Les Ordres existants pour les Workflows associés seront retirés par le Contrôleur et seront supprimés du Plan Quotidien.

## Inclut les Dépendances

Les objets d'inventaire sont liés par des dépendances, voir [Matrice des Dépendances](/dependencies-matrix). Par exemple, un Workflow référençant une Ressource de Tâche et un Verrou de Ressource; une Planification référençant un Calendrier et un ou plusieurs Workflows.

Lors de la révocation d'objets, la cohérence est prise en compte, par exemple :

- Si une Ressource de Tâche est référencée par un Workflow, la révocation de la Ressource de Tâche entraîne également la révocation du Workflow.
- Si un Workflow est révoqué, une Planification référençant le Workflow sera revoquée et les Ordres associés seront retirés et supprimés du Plan Quotidien.

Les utilisateurs contrôlent la révocation cohérente des objets à partir des options suivantes :

- **Inclut les Dépendances**
  - si cette option est cochée, elle inclura à la fois les objets référents et les objets référencés.
    - Si des objets liés ont été précédemment déployés ou publiés, une révocation commune est proposée. Elle sera appliquée si les relations entre les objets l'exigent.
    - Cela s'applique également aux objets à l'état de brouillon qui ont été précédemment déployés ou publiés.
  - si la case n'est pas cochée, les dépendances ne sont pas prises en compte. Les utilisateurs doivent vérifier si les objets liés sont valides et déployés/publiés. Le Contrôleur émettra des messages d'erreur en cas d'objets manquants en raison d'une révocation incohérente.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Opérations - Révoquer Dossier](/configuration-inventory-operations-revoke-folder)
- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
- [Matrice des Dépendances](/dependencies-matrix)
- [Plan Quotidien](/daily-plan)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
