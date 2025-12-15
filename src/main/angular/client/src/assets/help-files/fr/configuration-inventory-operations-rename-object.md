# Configuration - Inventaire - Opérations - Renommer Objet

Les objets de l'inventaire peuvent être renommés ou déplacés. Cela s'applique aux objets, aux dossiers d'utilisateurs ou aux deux. Pour renommer des dossiers d'utilisateurs, voir [Configuration - Inventaire - Opérations - Renommer Dossier](/configuration-inventory-operations-rename-folder). 

Lorsque vous renommez des objets, [Règles de Dénomination des Objets](/object-naming-rules) s'applique.

L'opération *Renommer* est disponible à partir de la vue *Navigation* et est proposée pour les objets et les dossiers d'utilisateurs à partir de leur menu d'action à 3 points.

<img src="rename-object.png" alt="Renommer Objet" width="400" height="125" />

## Renommer un objet

Les utilisateurs peuvent modifier l'emplacement et le nom d'un objet. Ce qui suit suppose un objet situé dans le dossier **/Test/Users** avec le nom **myWorkflow** :

- Si le nom de l'objet est modifié, l'objet reste dans le dossier donné et passe à l'état de brouillon.
- Pour le nouveau nom, les utilisateurs peuvent spécifier une hiérarchie de dossiers et un nom d'objet différents à partir d'un chemin d'accès absolu précédé d'une barre oblique, tel que **/Test/Workflows/yourWorkflow** :
  - si le dossier **/Test/Workflows** n'existe pas, il sera créé.
  - le Workflow est renommé de **myWorkflow** en **yourWorkflow**.
- Un chemin relatif peut être spécifié comme dans **Workflows/yourWorkflow** :
  - le dossier **Workflows** sera créé dans le dossier courant.
  - l'objet sera renommé et se trouvera dans **/Test/Users/Workflows/yourWorkflow**.
- Si le dossier de l'objet est modifié mais pas le nom de l'objet, l'objet reste dans le état déployé/publié.

## Dépendances

Les objets de l'inventaire sont liés par des dépendances, voir [Matrice des Dépendances](/dependencies-matrix). Par exemple, un Workflow référençant une Ressource de Tâche et un Verrou de Ressource; une Planification référençant un Calendrier et un ou plusieurs Workflows.

Lorsque vous renommez des objets, la cohérence est prise en compte et les objets référents sont mis à jour et mis à l'état de brouillon, par exemple :

- Si une Ressource de Tâche référencée par un Workflow est renommée, alors 
  - le Workflow sera mis à jour pour refléter le nouveau nom,
  - le Workflow sera mis à l'état de brouillon,
  - une opération *Deployer* ultérieure permettra d'assurer le déploiement commun des deux objets.
- Si un Workflow référencé par une Planification est renommé, alors
  - la Planification sera mise à jour pour refléter le nouveau nom,
  - la Planification sera mise à l'état de brouillon,
  - une opération *Deployer* ultérieure sur le Workflow inclura une opération *Publier* sur la Planification et vice versa.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Opérations - Renommer Dossier](/configuration-inventory-operations-rename-folder)
- [Matrice des Dépendances](/dependencies-matrix)
- [Règles de Dénomination des Objets](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
