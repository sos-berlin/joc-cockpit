# Configuration - Inventaire - Opérations - Renommer Dossier

Les objets de l'inventaire peuvent être renommés ou déplacés. Cela s'applique aux objets, aux dossiers ou aux deux. Pour renommer des objets, voir [Configuration - Inventaire - Opérations - Renommer Objet](/configuration-inventory-operations-rename-object). 

Pour renommer des dossiers, [Règles de Dénomination des Objets](/object-naming-rules) s'applique.

L'opération *Renommer* est disponible à partir du panneau *Navigation* et est proposée pour les objets et les dossiers à partir de leur menu d'action à 3 points.

Lorsque vous renommez un dossier utilisateur, vous avez la possibilité de modifier le nom du dossier et de modifier les noms des objets inclus de manière récursive.

## Renommer un dossier

<img src="rename-folder.png" alt="Renommer Dossier" width="400" height="150" />

Les utilisateurs peuvent modifier l'emplacement et le nom d'un dossier. Ce qui suit suppose que le dossier **myWorkflows** se trouve dans la hiérarchie des dossiers **/Test/Users** :

- Si le nom du dossier est modifié, le dossier reste dans la hiérarchie de dossiers donnée.
- Pour le nouveau nom, les utilisateurs peuvent spécifier une hiérarchie de dossiers différente à partir d'un chemin d'accès absolu précédé d'une barre oblique, tel que **/Test/yourWorklows** :
  - si le dossier **/Test/yourWorkflows** n'existe pas, il sera créé.
  - le dossier est renommé **myWorkflows** en **yourWorkflows**.
- Un chemin relatif peut être spécifié comme dans **Workflows/yourWorkflows** :
  - le dossier **yourWorkflows** sera créé dans le dossier actuel.
  - le dossier sera renommé et se trouvera dans **/Test/Users/Workflows/yourWorkflows**.

Les modifications apportées au nom ou à l'emplacement des dossiers laissent les objets inclus dans l'état déployé/publié.

## Renommer des objets de manière récursive

<img src="rename-folder-object.png" alt="Renommer objets du dossier de manière récursive" width="400" height="180" />

Les utilisateurs peuvent modifier les noms des objets inclus dans un dossier et dans les sous-dossiers de manière récursive.

- **Recherche** attend une chaîne qui sera recherchée dans les noms d'objets.
- **Remplacement** attend une chaîne qui remplacera la chaîne recherchée.

Les modifications apportées aux noms d'objets font passer les objets inclus à l'état de brouillon.

## Dépendances

Les objets de l'inventaire sont liés par des dépendances, voir [Matrice des Dépendances](/dependencies-matrix). Par exemple, un Workflow référençant une Ressource de Tâche et un Verrou de Ressource; une Planification référençant un Calendrier et un ou plusieurs Workflows.

Lorsque vous renommez des objets, la cohérence est prise en compte et les objets référents sont mis à jour et mis à l'état de brouillon, par exemple :

- Si une Ressource de Tâche référencée par un Workflow est renommée, alors 
  - le Workflow sera mis à jour pour refléter le nouveau nom,
  - le Workflow sera mis à l'état de brouillon,
  - une opération *Déployer* ultérieure permettra d'assurer le déploiement commun des deux objets.
- Si un Workflow référencé par une Planification est renommé, alors
  - la Planification sera mise à jour pour refléter le nouveau nom,
  - la Planification sera mise à l'état de brouillon,
  - une opération *Deployer* ultérieure sur le Workflow inclura une opération *Publier* sur la Planification et vice versa.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Opérations - Renommer Objet](/configuration-inventory-operations-rename-object)
- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
- [Matrice des Dépendances](/dependencies-matrix)
- [Plan Quotidien](/daily-plan)
- [Règles de Dénomination des Objets](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
