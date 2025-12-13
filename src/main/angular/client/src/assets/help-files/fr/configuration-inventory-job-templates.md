# Configuration - Inventaire - Modèles de tâche

La vue *Modele de Tâche* permet de spécifier des modèles gérés de manière centralisée pour les travaux utilisés dans les Workflows. Ils sont appliqués si la même implémentation de tâche est utilisée pour un certain nombre de travaux.

- Les tâches contiennent une référence à un modèle de tâche qui est appliqué lors de la création de la tâche. 
- Les tâches peuvent être mises à jour lorsque les modèles de tâches sont modifiés.
- Les modèles de tâches peuvent être créés pour n'importe quelle classe de tâches, telles que les tâches Shell et les tâches JVM exécutées dans la machine virtuelle Java de l'Agent.

Les modèles de tâches sont gérés à partir des vues suivants :

- La page [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation), situé sur le côté gauche de la fenêtre, permet de naviguer dans les dossiers contenant les modèles de tâches. En outre, cette vue permet d'effectuer des opérations sur les modèles de tâches.
- Le Vue *Modele de Tâche* sur le côté droit de la fenêtre contient les détails de la configuration de la Plannification.

## Vue des modèles de tâches

Pour un modèle de tâche, les entrées suivantes sont disponibles :

- **Nom** est l'identifiant unique d'un modèle de poste, voir [Object Naming Rules](/object-naming-rules).
- Les autres entrées correspondent aux entrées d'un tâche :
  - [Job Properties](/configuration-inventory-workflow-job-properties)
  - [Job Options](/configuration-inventory-workflow-job-options)
  - [Job Node Properties](/configuration-inventory-workflow-job-node-properties)
  - [Job Notifications](/configuration-inventory-workflow-job-notifications)
  - [Job Tags](/configuration-inventory-workflow-job-Tags)
- les **Arguments** sont utilisés pour les travaux de la JVM. 
  - **Requis** spécifie si l'argument est requis ou s'il peut être supprimé lorsqu'il est utilisé dans un tâche.
  - **La description ajoute une explication à l'argument, qui peut inclure des Tags HTML.

## Opérations sur les modèles de tâches

Pour les opérations générales, voir [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

Les modèles d'emploi offrent les opérations suivantes pour mettre à jour les emplois :

- le bouton **Appliquer le Modèle aux  Tâches** est disponible lorsqu'un modele de tâche est validé.
  - Une fenêtre contextuelle s'affiche et indique les Workflows et les Tâches qui utilisent le Modèle de Tâche.
  - Les utilisateurs peuvent sélectionner les Workflows et les Jobs qui doivent être mis à jour.
  - **Le filtre** permet de limiter les mises à jour aux Workflows en statut *Draft* et/ou en statut *Deployed*.
  - **Mettre à jour la Notification** spécifie que les paramètres de notification des travaux doivent être mis à jour à partir du modèle de tâche.
  - **Mettre à jour les Heures d'admission** spécifie que les Heures d'admission des travaux doivent être mis à jour à partir du modèle de tâche.
  - **Mettre à jour de paramètres requis** spécifie que les arguments du Modèle de tâche qui sont qualifiés d'obligatoires doivent être mis à jour dans les Jobs sélectionnés.
  - **Mettre à jour les paramètres facultatifs** spécifie que les arguments du Modèle de tâche  qui sont qualifiés d'optionnels doivent être mis à jour dans les offres d'emploi sélectionnées.
- **Mettre à jour les Tâches à partir du Modèle** est disponible à partir du *vue de navigation* et mettra à jour les tâches dans les Workflows situés dans le *Dossier d'inventaire* sélectionné à partir des Modèle de Tâche situés dans n'importe quel dossier.
- **Comme Modèle de Tâche** est disponible à partir du *vue de navigation* et mettra à jour les tâches dans les Workflows situés dans n'importe quel dossier qui contient des références à des modèles de travaux inclus dans le *Dossier d'inventaire* sélectionné ou dans n'importe quel sous-dossier.

Après avoir mis à jour les tâches à partir des modèles de tâches, les Workflows associés seront mis à l'état de *Draft* et devront être déployés pour que les changements soient effectifs.

## Utilisation avec les tâches

Les modèles de tâches peuvent être créés à partir de tâches existantes. Dans la vue *Configuration-&gt;Inventaire* d'un Workflow donné, les utilisateurs peuvent cliquer sur la tâche associée pour trouver son menu d'action offrant l'opération *Faire un Modèle de Tâche*.

Pour attribuer un modèle de tâche à un tâche, les utilisateurs peuvent procéder comme suit :

- Dans le coin supérieur droit de la fenêtre, invoquez l'assistant.
- Cela fait apparaître une fenêtre contextuelle qui permet de choisir l'onglet *Modèles de tâches de l'utilisateur*.
  - Naviguez jusqu'au Modèle de Tâche souhaité ou tapez une partie de son nom.
  - Sélectionnez le Modèle de Tâche et ajoutez éventuellement des arguments si le Modèle de Tâche le prévoit.
  
Lorsqu'un Modèle de Tâche est assigné à une tâche, cela est indiqué dans le coin supérieur droit de la fenêtre :

- Les utilisateurs trouvent la *Référence du Modèle de Tâche*,
- suivi d'une icône pour l'indicateur d'état de synchronisation (*Synchronization Status Indicator*) : 
  - la couleur verte indique que le tâche et le modèle de tâche sont synchronisés. 
  - la couleur orange indique que le Modele de  Tâche a été modifié et que la tâche n'est pas synchronisé.
- En cliquant sur l'indicateur d'état de synchronisation orange, vous mettez à jour la tâche à partir de son modèle de tâche.

Pour supprimer une référence de Modèle de Tâche, les utilisateurs peuvent cliquer sur l'icône de la corbeille dans le coin supérieur droit après le nom du Job Template. L'opération laissera les propriétés du tâche intactes et libérera le lien vers le Job Template. 

Les tâches qui font référence à des modèles de tâches ne permettent pas de modifier des parties importantes de la tâche. Les modifications doivent être appliquées au Job Template. Ceci ne s'applique pas aux entrées suivantes qui peuvent être choisies librement :

- **Nom**
- **Tag**
- **Agent**
- **Temps d'admission à l'emploi**
- **Notification**

Pour attribuer dynamiquement des valeurs aux **Arguments pour les tâches JVM** ou aux **Variables d'environnement pour les tâches Shell**, les utilisateurs peuvent procéder comme suit :

- Le Modele de Tâche utilise une Variable de Workflow pour la valeur attribuée à l'*Argument* ou à la *Variable d'Environnement*.
- Le Workflow contenant la tâche qui fait référence au Modèle de Tâche déclare la Variable de Workflow qui peut être remplie à partir d'une valeur par défaut et des Ordres entrants.

## Références

### Aide contextuelle

- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Job Node Properties](/configuration-inventory-workflow-tâche-node-properties)
- [Job Notifications](/configuration-inventory-workflow-tâche-notifications)
- [Job Options](/configuration-inventory-workflow-tâche-options)
- [Job Properties](/configuration-inventory-workflow-tâche-properties)
- [Job Tags](/configuration-inventory-workflow-tâche-Tags)
- [Object Naming Rules](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates)
  - [JS7 - JITL Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+JITL+Integration+Job+Templates)
  - [JS7 - User Defined Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+User+Defined+Job+Templates)

