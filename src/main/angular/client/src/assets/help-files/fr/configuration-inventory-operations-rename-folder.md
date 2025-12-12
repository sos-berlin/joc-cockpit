# Configuration - Inventaire - Opérations - Renommer un dossier

Les objets de l'inventaire peuvent être renommés ou déplacés. Cela s'applique aux objets, aux dossiers ou aux deux. Pour renommer des objets, voir [Configuration - Inventory - Operations - Rename Object](/configuration-inventory-operations-rename-object). 

Pour renommer des dossiers, [Object Naming Rules](/object-naming-rules) s'applique.

L'opération *Renommer* est disponible à partir du panneau *Navigation* et est proposée pour les objets et les dossiers à partir de leur menu d'action à 3 points.

Lorsque vous renommez un dossier utilisateur, vous avez la possibilité de modifier le nom du dossier et de modifier les noms des objets inclus de manière récursive.

## Renommer un dossier

<img src="rename-folder.png" alt="Rename Folder" width="400" height="150" />

Les utilisateurs peuvent modifier l'emplacement et le nom d'un dossier. Ce qui suit suppose que le dossier **myWorkflows** se trouve dans la hiérarchie des dossiers **/Test/Users** :

- Si le nom du dossier est modifié, le dossier reste dans la hiérarchie de dossiers donnée.
- Pour le nouveau nom, les utilisateurs peuvent spécifier une hiérarchie de dossiers différente à partir d'un chemin d'accès absolu précédé d'une barre oblique, tel que **/Test/vosFluxdeTravail** :
  - si le dossier **/Test/vosFluxdeTravail** n'existe pas, il sera créé.
  - le dossier est renommé **myWorkflows** en **yourWorkflows**.
- Un chemin relatif peut être spécifié comme dans **Workflows/vosWorkflows** :
  - le dossier **vosflows** sera créé dans le dossier actuel.
  - le dossier sera renommé et se trouvera dans **/Test/Users/Workflows/yourWorkflows**.

Les modifications apportées au nom ou à l'emplacement des dossiers laissent les objets inclus dans l'état déployé/libéré.

## Renommer des objets de manière récursive

<img src="rename-folder-object.png" alt="Rename Folder Objects Recursively" width="400" height="180" />

Les utilisateurs peuvent modifier les noms des objets inclus dans un dossier et dans les sous-dossiers de manière récursive.

- **Recherche** attend une chaîne qui sera recherchée dans les noms d'objets.
- **Replace** attend une chaîne qui remplacera la chaîne recherchée.

Les modifications apportées aux noms d'objets font passer les objets inclus à l'état de brouillon.

## Dépendances

Les objets de l'inventaire sont liés par des dépendances, voir [Dependency Matrix](/dependencies-matrix). Par exemple, un Workflow référençant une ressource de tâche et un verrou de ressource ; une Plannification référençant un calendrier et un ou plusieurs Workflows.

Lorsque vous renommez des objets, la cohérence est prise en compte et les objets référents sont mis à jour et mis à l'état de projet, par exemple :

- Si une ressource de tâche référencée par un Workflow est renommée, alors 
  - le Workflow sera mis à jour pour refléter le nouveau nom,
  - le Workflow sera mis à l'état de brouillon,
  - une opération *Déployer* ultérieure permettra d'assurer le déploiement commun des deux objets.
- Si un Workflow référencé par une Plannification est renommé, alors
  - la Plannification sera mise à jour pour refléter le nouveau nom,
  - la Plannification sera mise à l'état de brouillon,
  - une opération *Deployer* ultérieure sur le Workflow inclura une opération *Release* sur la Plannification et vice versa.

## Références

### Aide contextuelle

- [Configuration - Inventory - Operations - Rename Object](/configuration-inventory-operations-rename-object)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Dependency Matrix](/dependencies-matrix)
- [Object Naming Rules](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

