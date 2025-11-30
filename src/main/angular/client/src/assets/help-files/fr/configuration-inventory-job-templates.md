# Configuration - Inventaire - Modèles de travail

Le panneau *Job Template* permet de spécifier des modèles gérés de manière centralisée pour les travaux utilisés dans les Workflows. Ils sont appliqués si la même implémentation de travail est utilisée pour un certain nombre de travaux.

- Les tâches contiennent une référence à un modèle de tâche qui est appliqué lors de la création de la tâche. 
- Les tâches peuvent être mises à jour lorsque les modèles de tâches sont modifiés.
- Les modèles de tâches peuvent être créés pour n'importe quelle classe de tâches, telles que les tâches Shell et les tâches JVM exécutées dans la machine virtuelle Java de l'agent.

Les modèles de tâches sont gérés à partir des panneaux suivants :

- Le site [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation), situé sur le côté gauche de la fenêtre, permet de naviguer dans les dossiers contenant les modèles de jobs. En outre, ce panneau permet d'effectuer des opérations sur les modèles de tâches.
- Le panneau *Job Template Panel* sur le côté droit de la fenêtre contient les détails de la configuration de la Plannification.

## Panneau des modèles de tâches

Pour un modèle de travail, les entrées suivantes sont disponibles :

- **Nom** est l'identifiant unique d'un modèle de poste, voir [Object Naming Rules](/object-naming-rules).
- Les autres entrées correspondent aux entrées d'un travail :
  - [Job Properties](/configuration-inventory-workflow-job-properties)
  - [Job Options](/configuration-inventory-workflow-job-options)
  - [Job Node Properties](/configuration-inventory-workflow-job-node-properties)
  - [Job Notifications](/configuration-inventory-workflow-job-notifications)
  - [Job Tags](/configuration-inventory-workflow-job-tags)
- les **Arguments** sont utilisés pour les travaux de la JVM. 
  - **Required** spécifie si l'argument est requis ou s'il peut être supprimé lorsqu'il est utilisé dans un job.
  - **La description ajoute une explication à l'argument, qui peut inclure des balises HTML.

## Opérations sur les modèles de jobs

Pour les opérations générales, voir [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

Les modèles d'emploi offrent les opérations suivantes pour mettre à jour les emplois :

- le bouton **Apply Template to Jobs** est disponible lorsqu'un Job Template est validé.
  - Une fenêtre contextuelle s'affiche et indique les Workflows et les Jobs qui utilisent le Job Template.
  - Les utilisateurs peuvent sélectionner les Workflows et les Jobs qui doivent être mis à jour.
  - **Le filtre** permet de limiter les mises à jour aux Workflows en statut *Draft* et/ou en statut *Deployed*.
  - **Mettre à jour la notification** spécifie que les paramètres de notification des travaux doivent être mis à jour à partir du modèle de travail.
  - **Mettre à jour les délais d'admission** spécifie que les délais d'admission des travaux doivent être mis à jour à partir du modèle de travail.
  - **Mettre à jour les arguments obligatoires** spécifie que les arguments du Job Template qui sont qualifiés d'obligatoires doivent être mis à jour dans les Jobs sélectionnés.
  - **Mettre à jour les arguments optionnels** spécifie que les arguments du Job Template qui sont qualifiés d'optionnels doivent être mis à jour dans les offres d'emploi sélectionnées.
- **Mettre à jour les Jobs à partir des modèles** est disponible à partir du *Panneau de navigation* et mettra à jour les Jobs dans les Workflows situés dans le *Dossier d'inventaire* sélectionné à partir des Job Templates situés dans n'importe quel dossier.
- **Appliquer le modèle aux travaux** est disponible à partir du *Panneau de navigation* et mettra à jour les travaux dans les Workflows situés dans n'importe quel dossier qui contient des références à des modèles de travaux inclus dans le *Dossier d'inventaire* sélectionné ou dans n'importe quel sous-dossier.

Après avoir mis à jour les travaux à partir des modèles de travaux, les Workflows associés seront mis à l'état de *Draft* et devront être déployés pour que les changements soient effectifs.

## Utilisation avec les travaux

Les modèles de tâches peuvent être créés à partir de tâches existantes. Dans la vue *Configuration-&gt;Inventaire* d'un Workflow donné, les utilisateurs peuvent cliquer sur le Job associé pour trouver son menu d'action offrant l'opération *Faire un Job Modèle*.

Pour attribuer un modèle de travail à un travail, les utilisateurs peuvent procéder comme suit :

- Dans le coin supérieur droit de la fenêtre, invoquez l'assistant.
- Cela fait apparaître une fenêtre contextuelle qui permet de choisir l'onglet *Modèles de tâches de l'utilisateur*.
  - Naviguez jusqu'au Job Template souhaité ou tapez une partie de son nom.
  - Sélectionnez le Job Template et ajoutez éventuellement des arguments si le Job Template le prévoit.
  
Lorsqu'un Job Template est assigné à un Job, cela est indiqué dans le coin supérieur droit de la fenêtre :

- Les utilisateurs trouvent la *Référence du Job Template*,
- suivi d'une icône pour l'indicateur d'état de synchronisation (*Synchronization Status Indicator*) : 
  - la couleur verte indique que le travail et le modèle de travail sont synchronisés. 
  - la couleur orange indique que le Job Template a été modifié et que le Job n'est pas synchronisé.
- En cliquant sur l'indicateur d'état de synchronisation orange, vous mettez à jour la tâche à partir de son modèle de tâche.

Pour supprimer une référence de Job Template d'un Job, les utilisateurs peuvent cliquer sur l'icône de la corbeille dans le coin supérieur droit après le nom du Job Template. L'opération laissera les propriétés du job intactes et libérera le lien vers le Job Template. 

Les tâches qui font référence à des modèles de tâches ne permettent pas de modifier des parties importantes de la tâche. Les modifications doivent être appliquées au Job Template. Ceci ne s'applique pas aux entrées suivantes qui peuvent être choisies librement :

- **Nom du travail**
- nom de l'emploi** **Etiquette**
- **Agent**
- **Temps d'admission à l'emploi**
- **Notification d'emploi

Pour attribuer dynamiquement des valeurs aux **Arguments pour les Jobs JVM** ou aux **Variables d'environnement pour les Jobs Shell**, les utilisateurs peuvent procéder comme suit :

- Le Job Template utilise une Variable de Workflow pour la valeur attribuée à l'*Argument* ou à la *Variable d'Environnement*.
- Le Workflow contenant le Job qui fait référence au Job Template déclare la Variable de Workflow qui peut être remplie à partir d'une valeur par défaut et des Ordres entrants.

## Références

### Aide contextuelle

- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Job Node Properties](/configuration-inventory-workflow-job-node-properties)
- [Job Notifications](/configuration-inventory-workflow-job-notifications)
- [Job Options](/configuration-inventory-workflow-job-options)
- [Job Properties](/configuration-inventory-workflow-job-properties)
- [Job Tags](/configuration-inventory-workflow-job-tags)
- [Object Naming Rules](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates)
  - [JS7 - JITL Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+JITL+Integration+Job+Templates)
  - [JS7 - User Defined Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+User+Defined+Job+Templates)

