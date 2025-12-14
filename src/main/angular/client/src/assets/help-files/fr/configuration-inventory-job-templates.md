# Configuration - Inventaire - Modèles de Tâche

La vue *Modèle de Tâche* permet de spécifier des modèles gérés de manière centralisée pour les tâches utilisés dans les Workflows. Ils sont appliqués si la même implémentation de tâche est utilisée pour un certain nombre de tâches.

- Les tâches contiennent une référence à un Modèle de Tâche qui est appliqué lors de la création de la tâche. 
- Les tâches peuvent être mises à jour lorsque les Modèles de Tâche sont modifiés.
- Les Modèles de Tâche peuvent être créés pour n'importe quelle classe de tâches, telles que les tâches Shell et les tâches JVM exécutées dans la machine virtuelle Java de l'Agent.

Les Modèles de Tâche sont gérés à partir des vues suivants :

- La page [Configuration - Inventaire - Navigation](/configuration-inventory-navigation), situé sur le côté gauche de la fenêtre, permet de naviguer dans les dossiers contenant les Modèles de Tâche. En outre, cette vue permet d'effectuer des opérations sur les Modèles de Tâche.
- Le Vue *Modèle de Tâche* sur le côté droit de la fenêtre contient les détails de la configuration de la Planification.

## Vue des Modèles de Tâche

Pour un Modèle de Tâche, les entrées suivantes sont disponibles :

- **Nom** est l'identifiant unique d'un modèle de poste, voir [Règles de Dénomination des Objets](/object-naming-rules).
- Les autres entrées correspondent aux entrées d'une tâche :
  - [Job Properties](/configuration-inventory-workflow-job-properties)
  - [Job Options](/configuration-inventory-workflow-job-options)
  - [Job Node Properties](/configuration-inventory-workflow-job-node-properties)
  - [Job Notifications](/configuration-inventory-workflow-job-notifications)
  - [Job Tags](/configuration-inventory-workflow-job-tags)
- les **Arguments** sont utilisés pour les tâches de la JVM. 
  - **Requis** spécifie si l'argument est requis ou s'il peut être supprimé lorsqu'il est utilisé dans une tâche.
  - **Description** ajoute une explication à l'argument, qui peut inclure des Tags HTML.

## Opérations sur les Modèles de Tâche

Pour les opérations générales, voir [Configuration - Inventaire - Navigation](/configuration-inventory-navigation).

Les Modèles de Tâchee offrent les opérations suivantes pour mettre à jour les tâches :

- le bouton **Appliquer le Modèle aux Tâches** est disponible lorsqu'un Modèle de Tâche est validé.
  - Une fenêtre contextuelle s'affiche et indique les Workflows et les Tâches qui utilisent le Modèle de Tâche.
  - Les utilisateurs peuvent sélectionner les Workflows et les Jobs qui doivent être mis à jour.
  - **Filtre** permet de limiter les mises à jour aux Workflows en état *brouillon* et/ou en état *déployé*.
  - **Mettre à jour la Notification** spécifie que les paramètres de notification des tâches doivent être mis à jour à partir du Modèle de Tâche.
  - **Mettre à jour les Heures d'Admission** spécifie que les Heures d'admission des tâches doivent être mis à jour à partir du Modèle de Tâche.
  - **Mettre à jour de paramètres requis** spécifie que les arguments du Modèle de Tâche qui sont qualifiés d'obligatoires doivent être mis à jour dans les Jobs sélectionnés.
  - **Mettre à jour les paramètres facultatifs** spécifie que les arguments du Modèle de Tâche qui sont qualifiés d'optionnels doivent être mis à jour dans les Workflows sélectionnées.
- **Mettre à jour les Tâches à partir du Modèle** est disponible à partir du *vue de navigation* et mettra à jour les tâches dans les Workflows situés dans le *Dossier d'inventaire* sélectionné à partir des Modèle de Tâche situés dans n'importe quel dossier.
- **Comme Modèle de Tâche** est disponible à partir du *vue de navigation* et mettra à jour les tâches dans les Workflows situés dans n'importe quel dossier qui contient des références à des Modèles de Tâche inclus dans le *Dossier d'inventaire* sélectionné ou dans n'importe quel sous-dossier.

Après avoir mis à jour les tâches à partir des Modèles de Tâche, les Workflows associés seront mis à l'état de *brouillon* et devront être déployés pour que les changements soient effectifs.

## Utilisation avec les tâches

Les Modèles de Tâche peuvent être créés à partir de tâches existantes. Dans la vue *Configuration-&gt;Inventaire* d'un Workflow donné, les utilisateurs peuvent cliquer sur la tâche associée pour trouver son menu d'action offrant l'opération *Faire un Modèle de Tâche*.

Pour attribuer un Modèle de Tâche à une tâche, les utilisateurs peuvent procéder comme suit :

- Dans le coin supérieur droit de la fenêtre, invoquez l'assistant.
- Cela fait apparaître une fenêtre contextuelle qui permet de choisir l'onglet *Modèles de Tâche de l'utilisateur*.
  - Naviguez jusqu'au Modèle de Tâche souhaité ou tapez une partie de son nom.
  - Sélectionnez le Modèle de Tâche et ajoutez éventuellement des arguments si le Modèle de Tâche le prévoit.
  
Lorsqu'un Modèle de Tâche est assigné à une tâche, cela est indiqué dans le coin supérieur droit de la fenêtre :

- Les utilisateurs trouvent la *Référence du Modèle de Tâche*,
- suivi d'une icône pour l'indicateur d'état de synchronisation : 
  - la couleur verte indique que la tâche et le Modèle de Tâche sont synchronisés. 
  - la couleur orange indique que le Modèle de Tâche a été modifié et que la tâche n'est pas synchronisé.
- En cliquant sur l'indicateur d'état de synchronisation orange, vous mettez à jour la tâche à partir de son Modèle de Tâche.

Pour supprimer une référence de Modèle de Tâche, les utilisateurs peuvent cliquer sur l'icône de la corbeille dans le coin supérieur droit après le nom du Modèle de Tâche. L'opération laissera les propriétés de la tâche intactes et publiera le lien vers le Modèle de Tâche. 

Les tâches qui font référence à des Modèles de Tâche ne permettent pas de modifier des parties importantes de la tâche. Les modifications doivent être appliquées au Modèle de Tâche. Ceci ne s'applique pas aux entrées suivantes qui peuvent être choisies librement :

- **Nom**
- **Tag**
- **Agent**
- **Heures d'Admission**
- **Notification**

Pour attribuer dynamiquement des valeurs aux **Arguments pour les tâches JVM** ou aux **Variables d'environnement pour les tâches Shell**, les utilisateurs peuvent procéder comme suit :

- Le Modèle de Tâche utilise une Variable de Workflow pour la valeur attribuée à l'*Argument* ou à la *Variable d'Environnement*.
- Le Workflow contenant la tâche qui fait référence au Modèle de Tâche déclare la Variable de Workflow qui peut être remplie à partir d'une valeur par défaut et des Ordres entrants.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Navigation](/configuration-inventory-navigation)
- [Job Node Properties](/configuration-inventory-workflow-job-node-properties)
- [Job Notifications](/configuration-inventory-workflow-job-notifications)
- [Job Options](/configuration-inventory-workflow-job-options)
- [Job Properties](/configuration-inventory-workflow-job-properties)
- [Job Tags](/configuration-inventory-workflow-job-tags)
- [Règles de Dénomination des Objets](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates)
  - [JS7 - JITL Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+JITL+Integration+Job+Templates)
  - [JS7 - User Defined Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+User+Defined+Job+Templates)
