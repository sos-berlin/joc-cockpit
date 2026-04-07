# Reprendre les Ordres

La fenêtre contextuelle *Reprendre les Ordres* s'affiche pour les Ordres *suspendus* et *échoués* qui doivent être repris. Plusieurs sections sont proposées pour la saisie des données par l'utilisateur, selon que la reprise concerne un seul Ordre ou une opération en bloc sur plusieurs Ordres.

- Les **Variables** s'affichent avec les valeurs qui leur étaient attribuées avant la position actuelle dans le Workflow. Par exemple, si une tâche ayant échoué a modifié une *Variable Dynamique*, celle-ci s'affichera alors avec sa valeur historique antérieure à l'exécution de la tâche.
- Les **Options** permettent de modifier le comportement des Ordres reprises.
- Les **Positions** permettent de reprendre des Ordres à partir d'une position antérieure ou postérieure dans le Workflow.

## Opérations sur les Ordres individuelles

### Variables à valeurs constantes

Cette section affiche les *Variables de Workflow* avec leurs valeurs effectives associées à l'Ordre.

Ces variables contiennent des valeurs fixes qui ne peuvent pas être modifiées.

### Variables dont les valeurs sont modifiables

Cette section affiche les *Variables Dynamiques* non déclarées dans le Workflow. Ces variables sont créées dynamiquement par les tâches exécutées par l'Ordre.

Les utilisateurs peuvent modifier les valeurs des *Variables Dynamiques*. 

- **Opérations**
  - **Conserver la valeur** : la variable est transmise à l'instruction suivante du Workflow avec sa valeur actuelle.
  - **Modifier la valeur** : la valeur modifiée de la variable sera utilisée, à condition que la case à cocher correspondante soit *cochée*.
  - **Supprimer la variable** : la valeur d'origine de la variable sera utilisée, telle qu'elle était définie pour la tâche respective à partir de laquelle l'Ordre sera repris.
  - **Ajouter une variable** : permet d'ajouter le nom et la valeur d'une nouvelle *Variable Dynamique*.
- **Variables**
  - **returnCode** : il s'agit d'une variable intégrée qui contient le résultat numérique de l'instruction de Workflow précédente. Par défaut, une valeur *0* indique une réussite, tandis que les valeurs non *0* indiquent un échec.

L'instruction de Workflow suivante est la même ou celle vers laquelle un utilisateur glissera-déposera l'Ordre, y compris les instructions situées avant ou après la position actuelle de l'Ordre.

### Options

#### Forcer la reprise des tâches

La case à cocher **Forcer la reprise** s'applique aux tâches configurées comme *non redémarrables*, voir [Configuration - Inventaire - Workflow - Job Options](/configuration-inventaire-workflow-options-de-tâche.md). Ces tâches ne seront pas réexécutées si elles ont été interrompues par l'Agent ou par le système d'exploitation. Cette option n'affecte pas les Ordres *suspendus* ni les Ordres ayant *échoué* en raison d'erreurs de tâche.

L'objectif est d'empêcher que les tâches non conçues pour être redémarrées ne soient automatiquement relancées après une interruption forcée. Les utilisateurs doivent alors cocher la case correspondante. Parmi les cas d'utilisation typiques, on peut citer par exemple les tâches effectuant des transactions financières dont le résultat doit être vérifié avant de déclencher un redémarrage.

#### Spécification de l'heure de fin de cycle

Le champ de saisie **Heure de fin de cycle** est disponible pour les Ordres ayant démarré au moins un cycle dans une *Instruction Cycle*.

Il est possible de spécifier une durée plus courte ou plus longue que celle configurée dans l'*Instruction Cycle*.
Les durées sont spécifiées en *secondes* ou en *heures:minutes:secondes*. La spécification d’une valeur *0* pour la durée entraînera que l’Ordre

- se poursuive à partir de la position de reprise dans le Workflow,
- exécute les tâches suivantes,
- quitte le cycle la prochaine fois qu’il rencontre l’*Instruction Cycle*.

### Positions pour le glisser-déposer des Ordres

Les Ordres peuvent être repris à partir d'une position antérieure ou postérieure dans le Workflow.
Les utilisateurs peuvent glisser-déposer l'Ordre vers l'instruction du Workflow à partir de laquelle il doit être repris.

- **Positions autorisées**
  - Les Ordres peuvent être repris à partir d'instructions de Workflow ultérieures situées au même niveau de bloc que la position actuelle du Workflow.
  - Les Ordres peuvent être repris à partir d'une position située dans la branche *vrai* ou *faux* d'une *Instruction If*.
  - Les Ordres peuvent être repris à partir d'une position à l'intérieur de l'*Instruction ConsumeNotices*, ce qui permet d'ignorer la vérification de l'existence des Annonces associées.
- **Positions interdites**
  - Les Ordres ne peuvent pas être déplacés vers une position à l'intérieur de la branche d'une *Instruction Fork*. La raison en est que l'*Ordre parent* reste avec l'*Instruction Fork* tandis que les *Ordres enfants* sont créés par branche.
    - Les *Ordres enfants* ne peuvent pas être déplacés entre les branches d'une *Instruction Fork*. La reprise d'un *Ordre enfant* à partir d'une position située dans sa branche est acceptée.
    - Les Ordres peuvent être repris directement à partir d'une *Instruction Fork*.
  - Les Ordres ne peuvent pas être déplacés vers une position à l'intérieur d'une *Instruction Lock*. L'opération est refusée car elle affecte l'état d'un *Verrou de Ressource* en cours d'acquisition. La reprise d'un Ordre à partir du début du bloc de l'*Instruction Lock* est acceptée.

Ce qui précède s'applique de la même manière aux instructions de Workflow imbriquées, par exemple une *Instruction Fork* interne à l'intérieur de la branche d'une *Instruction Fork* externe.

Si la position n'est pas modifiée, l'Ordre reprendra à partir de sa position actuelle dans le Workflow.

## Opérations en bloc sur les Ordres

L'opération en bloc est disponible depuis la vue [Aperçu des Ordres](/orders-overview.md), qui permet de sélectionner plusieurs Ordres issues du même Workflow ou de Workflows différents.

- **Reprendre à partir de la même position** permet de reprendre à partir de l'instruction du Workflow à laquelle l'Ordre a été *suspendue* ou a *échoué*.
- **Reprendre à partir du bloc actuel** permet de reprendre à partir du début de l'instruction de bloc actuelle. Par exemple,
  - si un Ordre se trouve à une instruction située à l'intérieur d'une *Instruction Lock*, elle sera reprise à partir du début de l'*Instruction Lock*.
  - si un Ordre se trouve à une instruction située à l'intérieur d'une branche de l'*Instruction Fork*, elle sera reprise à partir du début de la branche.
- **Reprendre à partir d'un Label** permet de spécifier le nom d'un *Label* commune à tous les Workflows pour lesquels les Ordres doivent être repris. La reprise des Ordres s'effectuera à partir de la position du Workflow indiquée par le *Label*. Si le *Label* n'existe pas dans un Workflow, l'Ordre est alors repris à partir de sa position actuelle.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Workflow - Job Options](/configuration-inventory-workflow-job-options.md)
- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows.md)
- [Aperçu des Ordres](/orders-overview.md)
- [Workflows](/workflows.md)


### Product Knowledge Base

- [JS7 - Workflows - Status Operations on Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows+-+Status+Operations+on+Orders)
