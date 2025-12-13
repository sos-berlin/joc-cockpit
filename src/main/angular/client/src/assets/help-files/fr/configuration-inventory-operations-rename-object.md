# Configuration - Inventaire - Opérations - Renommer un objet

Les objets de l'inventaire peuvent être renommés ou déplacés. Cela s'applique aux objets, aux dossiers d'utilisateurs ou aux deux. Pour renommer des dossiers d'utilisateurs, voir [Configuration - Inventory - Operations - Rename Folder](/configuration-inventory-operations-rename-folder). 

Lorsque vous renommez des objets, [Object Naming Rules](/object-naming-rules) s'applique.

L'opération *Renommer* est disponible à partir de la vue *Navigation* et est proposée pour les objets et les dossiers d'utilisateurs à partir de leur menu d'action à 3 points.

<img src="rename-object.png" alt="Rename Object" width="400" height="125" />

## Renommer un objet

Les utilisateurs peuvent modifier l'emplacement et le nom d'un objet. Ce qui suit suppose un objet situé dans le dossier **/Test/Users** avec le nom **myWorkflow** :

- Si le nom de l'objet est modifié, l'objet reste dans le dossier donné et passe à l'état de brouillon.
- Pour le nouveau nom, les utilisateurs peuvent spécifier une hiérarchie de dossiers et un nom d'objet différents à partir d'un chemin d'accès absolu précédé d'une barre oblique, tel que **/Test/Workflows/votreWorkflow** :
  - si le dossier **/Test/Workflows** n'existe pas, il sera créé.
  - le Workflow est renommé de **monWorkflow** en **votreWorkflow**.
- Un chemin relatif peut être spécifié comme dans **Workflows/votreWorkflow** :
  - le dossier **Workflows** sera créé dans le dossier courant.
  - l'objet sera renommé et se trouvera dans **/Test/Users/Workflows/votreWorkflow**.
- Si le dossier de l'objet est modifié mais pas le nom de l'objet, l'objet reste dans le statut déployé/libéré.

## Dépendances

Les objets de l'inventaire sont liés par des dépendances, voir [Dependency Matrix](/dependencies-matrix). Par exemple, un Workflow référençant une ressource de tâche et un Verrou de Ressource ; une Plannification référençant un Calendrier et un ou plusieurs Workflows.

Lorsque vous renommez des objets, la cohérence est prise en compte et les objets référents sont mis à jour et mis à l'état de projet, par exemple :

- Si une ressource d'emploi référencée par un Workflow est renommée, alors 
  - le Workflow sera mis à jour pour refléter le nouveau nom,
  - le Workflow sera mis à l'état de brouillon,
  - une opération *Deployer* ultérieure permettra d'assurer le déploiement commun des deux objets.
- Si un Workflow référencé par une Plannification est renommé, alors
  - la Plannification sera mise à jour pour refléter le nouveau nom,
  - la Plannification sera mise à l'état de brouillon,
  - une opération *Deoloyer* ultérieure sur le Workflow inclura une opération *Publié* sur la Plannification et vice versa.

## Références

### Aide contextuelle

- [Configuration - Inventory - Operations - Rename Folder](/configuration-inventory-operations-rename-folder)
- [Dependency Matrix](/dependencies-matrix)
- [Object Naming Rules](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

