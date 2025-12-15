# Configuration - Inventaire - Opérations - Retirer Dossier

La rétractation d'objets les désactive, par exemple, pour une utilisation avec le [Plan Quotidien](/daily-plan). Cela s'applique à des objets tels que les Planifications et les Calendriers disponibles dans le dossier système *Automatisation*.

La vue *Configuration-&gt;Inventaire* permet de retirer un seul objet, voir [Configuration - Inventaire - Opérations - Retirer Objet](/configuration-inventory-operations-recall-object), et de retirer des objets à partir de dossiers.

Lorsque vous retirer des objets d'un dossier à l'aide de l'opération *Retirer* disponible dans le menu d'action à 3 points du dossier dans le panneau de navigation, une fenêtre contextuelle s'affiche comme suit :

<img src="recall-folder.png" alt="Retirer Dossier" width="600" height="600" />

## Mise à jour du Plan Quotidien

La rétractation d'objets tels que les Planifications et les Calendriers a un impact sur la vue [Plan Quotidien](/daily-plan). 

Les Ordres existants pour les Workflows référencés par les Planifications associées seront retirés du Contrôleur et seront supprimés du Plan Quotidien.

## Inclut les Dépendances

Les objets d'inventaire sont liés par des dépendances, voir [Matrice des Dépendances](/dependencies-matrix). Par exemple, un Workflow référençant une Ressource de Tâche et un Verrou de Ressource; une Planification référençant un Calendrier et un ou plusieurs Workflows.

Lors de la rétractation des objets, la cohérence est prise en compte, par exemple :

- Si une Planification est créée et fait référence à un Calendrier nouvellement créé, la publication de la Planification inclut la publication du Calendrier également. Cela inclut également le déploiement d'un Workflow référencé par la Planification.
- Si un Calendrier est référencé par une Planification validée et qu'il doit être retiré ou supprimé, la Planification doit également être retirée ou supprimée. Ceci inclut la révocation ou la suppression du Workflow référencé par la Planification.

Les utilisateurs contrôlent le déploiement cohérent à partir des options suivantes :

- **Inclut les Dépendances**
  - lorsque cette option est cochée, elle inclut à la fois les objets référents et les objets référencés.
    - Si les objets liés sont dans un état déployé/publié, une rétractation commune est proposé. La rétractation sera appliqué si les relations entre les objets l'exigent.
    - Si les objets liés sont à l'état de brouillon, la rétractation commune est facultatif. Les utilisateurs peuvent sélectionner les objets liés pour la rétractation commun.
  - si la case n'est pas cochée, les dépendances ne sont pas prises en compte. Les utilisateurs doivent vérifier que les objets liés sont valides et déployés/publiés. Le Contrôleur émettra des messages d'erreur en cas d'objets manquants en raison d'un déploiement incohérent.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Opérations - Retirer Objet](/configuration-inventory-operations-recall-object)
- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
- [Matrice des Dépendances](/dependencies-matrix)
- [Plan Quotidien](/daily-plan)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
