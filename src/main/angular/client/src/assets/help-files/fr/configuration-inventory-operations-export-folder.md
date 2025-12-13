# Configuration - Inventaire - Opérations - Dossier d'exportation

L'exportation d'objets consiste à les ajouter à un fichier d'archive .zip ou .tar.gz proposé au téléchargement. Cela s'applique aux objets des dossiers système *Contrôleur* et *Automatisation* ainsi qu'aux objets des dossiers utilisateur. Les fichiers d'archive peuvent être utilisés pour une importation ultérieure dans la même instance de JOC Cockpit ou dans une instance différente.

Lorsque vous exportez des objets à partir de dossiers à l'aide de l'opération *Exporter* du menu d'action à 3 points du dossier, une fenêtre contextuelle s'affiche et vous propose 

- **Nom du fichier** spécifie le nom du fichier d'archive.
- **Format de fichier** spécifie soit .zip soit .tar.gz pour le type de compression.
- **Type d'Export** est l'une des options suivantes
  - exportation d'*Objets individuels*
  - exportation de *Dossiers*
  - exportation de *Changements*
- **Type d'Objets**
  - **Contrôleur** considère les objets tels que les Workflows et les Job Resources stockés dans les dossiers système du *Contrôleur*.
  - **Automatisation** prend en compte les objets tels que les planifications et les Calendriers stockés dans les dossiers système *Automatisation*.
- **Filtre
  - **Valide uniquement** limite l'exportation aux objets valides.
  - **Brouillon** inclut les objets à l'état de brouillon.
  - **Déployé** inclut les objets tels que les Workflows et les Job Resources en statut déployé.
  - **Publié** inclut les objets tels que les planifications et les Calendriers en statut libéré. 
  - **Utiliser le chemin relatif** spécifie si le fichier d'exportation inclura la hiérarchie des dossiers à partir d'un chemin absolu ou d'un chemin relatif indiqué par le dernier dossier de la hiérarchie pour lequel l'exportation est effectuée.
- **Gérer Récursivement** permet d'ajouter des objets de sous-dossiers de manière récursive à l'archive d'exportation.

## Types d'exportation

Le **Type d'Export** permet de sélectionner des objets individuels, des objets provenant de dossiers et des objets provenant de modifications.

### Exportation d'objets individuels

Le *Type d'Export* permet de sélectionner des objets individuels dans la liste des objets affichés.

<img src="export-object.png" alt="Export Object" width="600" height="580" />

### Exportation d'objets à partir de dossiers

Le *Type d'Export* permet de limiter l'exportation à certains types d'objets de planification tels que les Workflows ou les Planifications. Les utilisateurs peuvent sélectionner les types d'objets souhaités qui seront ajoutés au fichier d'archive d'exportation.

<img src="export-folder.png" alt="Export Folder" width="600" height="580" />

### Exportation d'objets à partir de modifications

Le *Type d'Export* permet de sélectionner une modification dans la liste [Changes](/changes). L'exportation sera limitée aux objets liés à la modification.

<img src="export-change.png" alt="Export Change" width="600" height="320" />

## Inclure les dépendances

Les objets de l'inventaire sont liés par des dépendances, voir [Dependency Matrix](/dependencies-matrix). Par exemple, un Workflow référençant une ressource de tâche et un Verrou de Ressource ; une Planification référençant un Calendrier et un ou plusieurs Workflows.

Lors de l'exportation d'objets, la cohérence est prise en compte, par exemple :

- Si un Workflow fait référence à une ressource de tâche, le Workflow et la ressource de tâche peuvent être exportés, même s'ils sont stockés dans des dossiers sans rapport avec le dossier sélectionné.
- Si une Planification fait référence à un Calendrier et doit être exportée, la Planification et le Calendrier peuvent tous deux être exportés.

Les utilisateurs contrôlent la cohérence de l'exportation à partir des options suivantes :

- **Inclure les dépendances**
  - si cette option est cochée, elle inclura à la fois les objets référents et les objets référencés situés dans n'importe quel dossier.
  - si la case n'est pas cochée, les dépendances ne sont pas prises en compte. Les utilisateurs doivent vérifier si les objets liés sont valides et déployés/libérés. Le Contrôleur émettra des messages d'erreur en cas d'objets manquants en raison d'un déploiement incohérent.
  
## Références

### Aide contextuelle

- [Changes](/changes)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Dependency Matrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
