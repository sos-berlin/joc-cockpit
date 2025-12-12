# Inventaire des configurations - Navigation

La vue *Configuration - Inventaire* est utilisée pour gérer les objets de l'inventaire tels que les Workflows, les Plannifications, etc. 

- La *vue de navigation* permet de naviguer par balises et par dossiers. En outre, il permet d'effectuer des opérations sur les objets de l'inventaire.
- La *vue Objet* contient la représentation de l'objet associé, par exemple [Configuration - Inventory - Workflows](/configuration-inventory-workflows).

## Vue Navigation

Le vue de gauche est organisé en onglets qui permettent de naviguer à partir des dossiers et des tags pour les Workflows et les Tâches.

- **La navigation par dossier** affiche les objets d'inventaire du dossier sélectionné.
- Le filtrage des tags est proposé à partir des onglets suivants pour sélectionner les Workflows :
  - **Les tags de Workflow** sont attribuées à partir de la vue [Configuration - Inventory - Workflows](/configuration-inventory-workflows) au niveau du Workflow.
  - les **tags de tâche** sont attribuées à partir de la même vue au niveau du tâche.

### Dossiers

Par défaut, les *dossiers d'inventaire* sont affichés par type d'objet de planification. Les utilisateurs peuvent créer leurs propres dossiers à n'importe quel niveau de la hiérarchie. Le même nom de *Dossier utilisateur* peut apparaître plusieurs fois à différents niveaux de la hiérarchie des dossiers.

La hiérarchie des dossiers connaît les types de dossiers suivants :

- **Dossiers d'inventaire** contiennent les types d'objets suivants :
  - les objets **Contrôleur** sont déployés dans un contrôleur et des agents :
    - [Workflows](/configuration-inventory-workflows) incluent les Tâches et autres instructions de Workflow. Pour plus d'informations, consultez le site [JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows).
    - [Sources d'Ordre de Fichier](/configuration-inventory-file-order-sources) sont utilisés pour le File Watching afin de démarrer automatiquement les Workflows en cas d'arrivée d'un fichier dans un répertoire. Pour plus de détails, voir [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching).
    - [Resources de Tâche](/configuration-inventory-tâche-resources) sont utilisés pour centraliser la configuration des variables qui sont réutilisées dans un certain nombre de Jobs. Pour plus de détails, voir [JS7 - Job Resources](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Resources).
    - [Condition](/configuration-inventory-notice-boards) spécifient les dépendances entre les Workflows. Pour plus de détails, voir [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards).
    - [Verrous de Ressource](/configuration-inventory-resource-locks) limitent l'exécution parallèle des tâches et d'autres instructions. Pour plus de détails, voir [JS7 - Resource Locks](https://kb.sos-berlin.com/display/JS7/JS7+-+Resource+Locks).
  - les objets **Automation** sont utilisés pour l'automatisation dans JOC Cockpit :
    - [Blocs Script](/configuration-inventory-script-includes) les objets **Automation** sont des extraits de code qui peuvent être réutilisés dans un certain nombre de Shell Jobs. Pour plus d'informations, voir [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes).
    - [Planifications](/configuration-inventory-schedules) déterminent le moment où les Ordres pour l'exécution du Workflow commenceront. Un ou plusieurs Workflows leur sont attribués et, éventuellement, des variables d'Ordre qui sont utilisées par les Jobs dans le Workflow donné. Ils utilisent un ou plusieurs *calendriers*. Pour plus d'informations, consultez le site [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules).
    - [Calendriers](/configuration-inventory-calendars) les *Calendriers* spécifient les jours au cours desquels les événements de planification peuvent se produire. Ils contiennent des règles pour les jours récurrents et des listes de jours qui sont utilisés par les *Planifications* pour créer des Ordres pour l'exécution du Workflow avec [Daily Plan](/daily-plan). Pour plus de détails, voir [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars).
    - [Modèles de Tâche](/configuration-inventory-tâche-templates) les modèles de Jobs sont fournis par les modèles de Jobs de l'utilisateur ou par des classes Java qui sont livrées avec JS7 et peuvent être utilisées pour toutes les plates-formes OS. Pour plus de détails, voir [JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates).
    - [Repports](/configuration-inventory-reports) résumer les résultats de l'exécution des Workflows et des Jobs pour des périodes données. Pour plus de détails, voir [JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports).
- les **Dossiers utilisateur** sont créés par l'utilisateur à n'importe quel niveau de la hiérarchie. Chaque *dossier utilisateur* contient un ensemble de *dossiers d'inventaire*.

#### Recherche rapide d'objets

À droite du dossier de premier niveau dans la *vue de navigation*, les utilisateurs trouvent une icône de recherche qui peut être utilisée pour rechercher des objets d'inventaire.

- Un minimum de deux caractères doit être saisi pour que la recherche rapide trouve les objets qui commencent par les caractères donnés.
- La recherche rapide ne tient pas compte de la casse et est tronquée à droite.
- La recherche rapide renvoie les objets dont le nom correspond à une catégorie telle que Workflow, Plannification.
- Le méta-caractère \* peut être utilisé comme substitut pour zéro ou plusieurs caractères :
  - **te\*test** trouvera les objets ***test**Initial*, *mon**Test***
  - **te\*st** recherchera les objets ***test**Initial*, ***te**rminate**St**illstand*

#### Corbeille d'objets

Lorsque des objets d'inventaire sont supprimés, ils sont placés dans la corbeille. La Corbeille permet de restaurer les objets et de les supprimer définitivement.

La Corbeille s'ouvre à partir de l'icône de la Corbeille située à droite du dossier de premier niveau dans le *vue de navigation*.

- Un clic sur l'icône de la corbeille permet d'afficher les objets qui s'y trouvent. L'icône de retour permet de revenir de la vue de la corbeille à la vue de l'inventaire.
- La structure des dossiers de la Corbeille est la même que celle des objets de l'inventaire.
- La Corbeille propose des menus d'action par objet et par dossier pour restaurer les objets et les supprimer définitivement.

### Tags

Les tags sont considérées comme un moyen alternatif de naviguer entre les objets de l'inventaire. Lorsque vous activez les onglets *tags Workflow* ou "tags Tâche" dans la *vue de navigation*, la vue affiche la liste des tags disponibles.

Des tags peuvent être ajoutées à partir de l'icône +. Des ordres ascendant et descendant sont disponibles. L'affichage des balises dans d'autres vues doit être activé à partir de la page [Settings - JOC Cockpit](/settings-joc).

- En cliquant sur l'tag correspondante, les Workflows auxquels l'tag est attribuée s'affichent.
- Les tags offrent les opérations suivantes à partir de leur menu d'action à 3 points :
  - **Renommer** permet de modifier le nom de l'tga.
  - **Supprimer** permet de supprimer l'tga et son affectation aux Workflows et aux travaux.

## Opérations

Les opérations sont disponibles au niveau du dossier et au niveau de l'objet à partir du menu d'actions à 3 points affiché dans le *Panneau de navigation*.

### Opérations au niveau du dossier

Des opérations sont disponibles pour les *dossiers d'inventaire* et les *dossiers d'utilisateur*.

Le dossier de premier niveau / (barre oblique) offre les opérations suivantes :

- **Redéployer** est utilisé en cas de perte de journal si la mémoire d'un contrôleur est effacée et que le contrôleur est initialisé. L'opération *déploie* tous les objets qui ont été précédemment déployés sur un contrôleur. 
- **Mettre à jour les dépendances** recrée la représentation interne des dépendances d'objets. Cette opération est automatique et est déclenchée lors de la création ou de la suppression d'objets d'inventaire et en cas de modification des noms d'objets. Si les utilisateurs ont des raisons de penser que les dépendances ne sont pas synchronisées, l'opération peut être effectuée. Les utilisateurs doivent tenir compte du fait que cette opération prendra du temps, environ trois minutes pour un inventaire de 5 000 objets. Cependant, les utilisateurs peuvent continuer à tâcheler avec JOC Cockpit pendant que les dépendances sont mises à jour.

#### Opérations sur les dossiers d'inventaire

Les opérations suivantes sont disponibles pour les *dossiers d'inventaire* :

- Opérations sur les objets du contrôleur
  - *Workflows*
    - **Nouveau** permet de créer un Workflow.
    - **Renomer** permet de renommer un Workflow. Les dépendances d'objets seront prises en compte et les objets d'inventaire référents tels que *Planifications* et *Sources d'Ordre de Fichier* conserveront le nom mis à jour. Le Workflow et les objets qui s'y réfèrent seront mis à l'état de *projet*. Pour plus de détails, voir [Rename Folder](/configuration-inventory-operations-rename-folder).
    - **Gestion des tags** permet d'ajouter et de supprimer des tags vers/depuis les Workflows dans le dossier, voir [Manage Tags](/configuration-inventory-operations-manage-tags).
    - **Export** permet de créer un fichier d'archive d'exportation au format .zip ou .tar.gz qui contient la hiérarchie des dossiers et la représentation JSON des Workflows. Pour plus de détails, voir [Export Folder](/configuration-inventory-operations-export-folder).
    - **Git Repository** offre une intégration avec un serveur Git. Les Workflows peuvent être engagés dans des dépôts Git et peuvent être tirés et poussés. Pour plus de détails, voir [Git - Clone Repository](/configuration-inventory-operations-git-clone).
    - **Changement** offre des opérations pour la gestion des changements des Workflows. Les utilisateurs peuvent ajouter un Workflow en cours de construction à un *Change* qui permet le déploiement commun et l'exportation des objets modifiés. Pour plus de détails, voir [Changes](/changes).
    - **Déployer** mettra les Workflows à la disposition du contrôleur et des agents. Les Workflows seront mis à l'état *deployed*. Pour plus de détails, voir [Deploy Folder](/configuration-inventory-operations-deploy-folder).
    - **Révoquer** annule une opération *Deploy* précédente. Les Workflows passeront à l'état de *projet*. Cela implique que les Ordres pour les Workflows seront supprimés du site [Daily Plan](/daily-plan). Les dépendances sont prises en compte et les objets de référence tels que *Schedules* et *File Ordre Sources* seront également révoqués/rappelés. Pour plus de détails, voir [Revoke Folder](/configuration-inventory-operations-revoke-folder).
    - **Supprimer** déplace les Workflows vers la Corbeille. Les Workflows supprimés peuvent être restaurés ou supprimés définitivement de la Corbeille. Pour plus d'informations, consultez le site [Remove Folder](/configuration-inventory-operations-remove-folder).
    - **Rétablir le brouillon** supprimera la version actuelle du brouillon des Workflows. Si une version précédemment *déployée* existe, elle deviendra la version actuelle du Workflow concerné.
    - **Mettre à jour les Tâches à partir des Modèles** mettra à jour les tâches des Workflows dans le *dossier d'inventaire* sélectionné à partir des *modèles de tâche* situés dans n'importe quel dossier.
  - les *Sources d'ordre de fichier*, *Ressources de tâche*, *vue d'affichage*, *verrous de ressource* offrent des opérations similaires à celles des *Workflows*.
- Opérations sur les objets d'automatisation
  - **La validation** rend les objets *brouillons* disponibles
    - pour une utilisation avec d'autres objets, par exemple les *inclusions de scripts* seront prises en compte pour le prochain déploiement des Workflows, les *modèles d'emploi* peuvent être mis à jour dans le référencement des Workflows.
    - pour une utilisation avec [Daily Plan](/daily-plan), par exemple *Plannifications* sera pris en compte pour la création d'Ordres.
    - pour plus de détails, voir [Release Folder](/configuration-inventory-operations-release-folder).
  - **Retirer** annule une opération *Release* précédente. Les objets d'inventaire seront mis à l'état de *projet*. Cela signifie que les *Plannifications* et *Calendriers* provisoires ne seront pas pris en compte par le site [Daily Plan](/daily-plan). L'opération prend en compte les dépendances entre objets et rappellera/révocera également les objets référents. Pour plus de détails, voir [Recall Folder](/configuration-inventory-operations-recall-folder).
  - **Appliquer un modèle de Tâche** mettra à jour les tâches dans les Workflows situés dans n'importe quel dossier contenant des références à des *Modele de Tâches* inclus dans le *dossier d'inventaire* sélectionné ou dans n'importe quel sous-dossier.
  - D'autres opérations sont disponibles, similaires aux *Opérations sur les objets du contrôleur*.

#### Opérations sur les dossiers d'utilisateurs

*Les dossiers d'utilisateur* sont créés par les utilisateurs et contiennent un ensemble de *dossiers d'inventaire*. Les opérations suivantes sont proposées :

- Opérations sur tous les objets
  - **Nouveau** crée l'objet proposé dans le menu d'action : un dossier ou un objet d'inventaire, voir [Object Naming Rules](/object-naming-rules).
  - **Couper** *découpe* le dossier, les sous-dossiers et les objets d'inventaire pour les coller ultérieurement à un autre endroit de la hiérarchie des dossiers.
  - **Copier** *copie* le dossier, les sous-dossiers et les objets d'inventaire, y compris les objets d'inventaire référencés qui peuvent se trouver dans d'autres dossiers. L'opération est une *copie profonde* qui fonctionne sur tous les objets référencés.
  - la **copie superficielle** *copie* le dossier, tous les sous-dossiers et les objets d'inventaire. Les références aux objets d'inventaire dans d'autres dossiers ne sont pas prises en compte.
  - **Rename** permet de renommer le dossier et éventuellement les objets d'inventaire inclus. Pour plus de détails, voir [Rename Folder](/configuration-inventory-operations-rename-folder).
  - **Gestion des balises** permet d'ajouter et de supprimer des balises aux/depuis les Workflows dans la hiérarchie de dossiers donnée, voir [Manage Tags](/configuration-inventory-operations-manage-tags).
  - **Export** permet de créer un fichier d'archive d'exportation au format .zip ou .tar.gz qui contient la hiérarchie des dossiers et la représentation JSON des objets d'inventaire inclus. Pour plus de détails, voir [Export Folder](/configuration-inventory-operations-export-folder).
  - **Git Repository** offre une intégration avec un serveur Git. Les objets de l'inventaire peuvent être déposés dans des dépôts Git et peuvent être extraits et poussés. Pour plus de détails, voir [Git - Clone Repository](/configuration-inventory-operations-git-clone).
  - **Change** offre des opérations de gestion des modifications des objets de l'inventaire. Les utilisateurs peuvent ajouter des objets tels que des Workflows en cours de construction à un *Change* qui permet le déploiement commun et l'exportation des objets modifiés. Pour plus de détails, voir [Changes](/changes).
- Opérations sur les objets du contrôleur
  - l'opération **Déployer** met les objets à la disposition du contrôleur et des agents. Les objets de l'inventaire seront mis à l'état *déployé*. Pour plus de détails, voir [Deploy Folder](/configuration-inventory-operations-deploy-folder).
  - **Revoke** annule une opération de *Déploiement* précédente. Les objets d'inventaire passeront à l'état de *projet*. Cela signifie que les Ordres pour les Workflows seront supprimés de la base de données [Daily Plan](/daily-plan). Pour plus de détails, voir [Revoke Folder](/configuration-inventory-operations-revoke-folder).
  - **Revalider** vérifie la validité des objets d'inventaire qui peuvent devenir incohérents, par exemple après l'importation d'objets.
  - **Synchroniser** permet de synchroniser l'état des objets de la Plannification avec le Contrôleur et l'inventaire :
    - *Synchroniser avec le contrôleur* *Déploie* ou *Révoque* les objets d'inventaire vers/depuis le contrôleur et les agents en fonction de leur état d'inventaire *déployé* ou *projeté*. Cette opération peut être utilisée en cas de perte de journal lorsque la mémoire d'un contrôleur est effacée et que le contrôleur est initialisé.
    - l'opération *Synchroniser avec l'inventaire* place les objets d'inventaire dans l'état *déployé* ou *projeté* en fonction de la disponibilité de l'objet auprès du contrôleur.
- Opérations sur les objets d'automatisation
  - **Publier** rend les objets *draft* disponibles
    - pour une utilisation avec d'autres objets, par exemple les *inclusions de scripts* seront prises en compte pour le prochain déploiement des Workflows, les *modèles de tâche* peuvent être mis à jour dans le référencement des Workflows.
    - pour une utilisation avec [Daily Plan](/daily-plan), par exemple *Plannifications* sera pris en compte pour la création d'Ordres.
    - pour plus de détails, voir [Release Folder](/configuration-inventory-operations-release-folder).
  - **Retirer** annule une opération *Release* précédente. Les objets d'inventaire seront mis à l'état de *projet*. Cela signifie que les *plannifications* et les *calendriers* provisoires ne seront pas pris en compte par le système [Daily Plan](/daily-plan). Pour plus de détails, voir [Recall Folder](/configuration-inventory-operations-recall-folder).
- Opérations de retrait
  - l'opération **Remove** déplace le dossier, tous les sous-dossiers et les objets inclus dans la Corbeille. Les objets d'inventaire supprimés peuvent être restaurés ou supprimés définitivement de la Corbeille. Pour plus de détails, voir [Remove Folder](/configuration-inventory-operations-remove-folder).
  - la commande **Rétablir le brouillon** supprime la version actuelle des objets du dossier et des sous-dossiers. Si une version *déployée* ou *publiée* existe, elle deviendra la version actuelle de l'objet concerné.
- Opérations sur les modèles de tâche
  - **Mettre à jour les Tâches à partir des Modèles** mettra à jour les travaux dans les Workflows situés dans n'importe quel dossier qui contient des références à des *modèles de travaux* inclus dans le *dossier de l'utilisateur* sélectionné ou dans n'importe quel sous-dossier.
  - **Appliquer le modèle aux travaux** mettra à jour les travaux dans les Workflows situés dans le *Dossier de l'utilisateur* sélectionné à partir des *Modèles de travaux* situés dans n'importe quel dossier.

### Opérations au niveau de l'objet

Les opérations suivantes sont proposées pour les objets d'inventaire individuels :

- Tous les objets
  - **Couper** va *couper* l'objet pour le coller ultérieurement à un autre endroit de la hiérarchie des dossiers.
  - **Copier** permet de *copier* l'objet pour le coller ultérieurement.
  - **Renommer** permet de modifier le nom de l'objet. Les dépendances des objets seront prises en compte et les objets d'inventaire référencés conserveront le nom mis à jour. L'objet renommé et les objets référents seront mis à l'état de *projet*. Pour plus de détails, voir [Rename Object](/configuration-inventory-operations-rename-object).
  - **Change** propose des opérations de gestion des modifications des objets de l'inventaire. Les utilisateurs peuvent ajouter des objets tels que des Workflows en cours de construction à un *Change* qui permet le déploiement commun et l'exportation des objets modifiés. Pour plus de détails, consultez [Changes](/changes).
  - **Afficher les dépendances** affiche la liste des objets référents et des objets référencés. Par exemple, un Workflow peut contenir des références à des ressources de tâche et peut être référencé par des *Planifications* ou des *Sources d'Ordre*.
  - **Nouveau brouillon** crée une version brouillon à partir d'une version précédemment *déployée* ou *publiée* de l'objet.
  - Opérations JSON
    - **Afficher JSON** affiche le format de stockage JSON de l'objet d'inventaire.
    - **Modifier JSON** permet de modifier un objet directement à partir de son format de stockage JSON.
    - **Télécharger JSON** télécharge l'objet au format JSON dans un fichier .json.
    - **Télécharger JSON** permet de télécharger un fichier .json qui remplacera l'objet.
  - Opérations de suppression
    - l'opération **Remove** déplace l'objet dans la Corbeille. Les objets d'inventaire supprimés peuvent être restaurés ou supprimés définitivement de la Corbeille. Pour plus d'informations, consultez le site [Remove Object](/configuration-inventory-operations-remove-object).
    - **Rétablir le brouillon** supprime la version actuelle du brouillon de l'objet. S'il existe une version *déployée* ou *publiée* antérieure, elle deviendra la version actuelle de l'objet.
- Objets du contrôleur
  - **La gestion des Tags** est disponible pour les Workflows et permet d'ajouter ou de supprimer des balises dans le Workflow.
  - **Déployer** rendra l'objet disponible pour le contrôleur et les agents. L'objet sera placé dans l'état *déployé*. Le déploiement prend en compte les dépendances des objets référencés et des objets d'inventaire référençant. Pour plus de détails, voir [Deploy Object](/configuration-inventory-operations-deploy-object).
  - **Révoquer** annule l'opération de *Déploiement* . L'objet sera remis à l'état de *projet*. Dans le cas des Workflows, cela signifie que les Ordres seront retirés du site [Daily Plan](/daily-plan). Pour plus de détails, voir [Revoke Object](/configuration-inventory-operations-revoke-object).
- Objets d'automatisation
  - **Publier** rend les objets *drafts* disponibles
    - pour une utilisation avec d'autres objets, par exemple les *inclusions de scripts* seront prises en compte pour le prochain déploiement des Workflows, les *modèles d'emploi* peuvent être mis à jour dans le référencement des Workflows.
    - pour une utilisation avec [Daily Plan](/daily-plan), par exemple *Plannifications* sera pris en compte pour la création d'Ordres.
    - pour plus de détails, voir [Release Object](/configuration-inventory-operations-release-object).
  - **Retirer** annule l'opération *Publier* . Les objets d'inventaire seront mis à l'état de *projet*. Cela signifie que les *plannifications* et les *calendriers* provisoires ne seront pas pris en compte par le système [Daily Plan](/daily-plan). Pour plus de détails, voir [Recall Object](/configuration-inventory-operations-recall-object).

## Références

### Aide contextuelle

- [Changes](/changes)
- [Daily Plan](/daily-plan)
- [Object Naming Rules](/object-naming-rules)
- Objets du contrôleur
  - [Workflows](/configuration-inventory-workflows)
  - [File Order Sources](/configuration-inventory-file-order-sources)
  - [Job Resources](/configuration-inventory-tâche-resources)
  - [Notice Boards](/configuration-inventory-notice-boards)
    - [Resouroes - Notice Boards](/resources-notice-boards)
  - [Resource Locks](/configuration-inventory-resource-locks)
    - [Resouroes - Resource Locks](/resources-resource-locks)
- Objets d'automatisation
  - [Script Includes](/configuration-inventory-script-includes)
  - [Schedules](/configuration-inventory-schedules)
  - [Calendars](/configuration-inventory-calendars)
  - [Job Templates](/configuration-inventory-tâche-templates)
  - [Reports](/configuration-inventory-reports)
- Opérations sur les objets
  - [Deploy Object](/configuration-inventory-operations-deploy-object)
  - [Revoke Object](/configuration-inventory-operations-revoke-object)
  - [Release Object](/configuration-inventory-operations-release-object)
  - [Recall Object](/configuration-inventory-operations-recall-object)
  - [Remove Object](/configuration-inventory-operations-remove-object)
  - [Rename Object](/configuration-inventory-operations-rename-object)
- Opérations sur les dossiers d'utilisateurs
  - [Deploy Folder](/configuration-inventory-operations-deploy-folder)
  - [Revoke Folder](/configuration-inventory-operations-revoke-folder)
  - [Release Folder](/configuration-inventory-operations-release-folder)
  - [Recall Folder](/configuration-inventory-operations-recall-folder)
  - [Remove Folder](/configuration-inventory-operations-remove-folder)
  - [Rename Folder](/configuration-inventory-operations-rename-folder)
  - [Export Folder](/configuration-inventory-operations-export-folder)
  - [Git - Clone Repository](/configuration-inventory-operations-git-clone)
  - [Manage Tags](/configuration-inventory-operations-manage-tags)

### Product Knowledge Base

- Objets du contrôleur
  - [JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows)
  - [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching)
  - [JS7 - Job Resources](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Resources)
  - [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Resource Locks](https://kb.sos-berlin.com/display/JS7/JS7+-+Resource+Locks)
- Objets d'automatisation
  - [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes)
  - [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
  - [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
    - [JS7 - Management of Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Calendars)
  - [JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates)
  - [JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports)

