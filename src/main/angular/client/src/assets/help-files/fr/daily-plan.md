# Plan Quotidien

La vue *Plan Quotidien* donne un aperçu des Ordres programmés pour une exécution future et permet aux utilisateurs de gérer le *Plan Quotidien*. 

Le site [Daily Plan Service](/service-daily-plan) est utilisé pour créer et soumettre aux contrôleurs les Ordres du Plan Quotidien. Le service fonctionne en arrière-plan et agit quotidiennement pour planifier et soumettre des Ordres quelques jours à l'avance.

Le Plan Quotidien est soumis à une purge de la base de données effectuée par [Cleanup Service](/service-cleanup).

Pour les opérations liées au *Panneau du calendrier*, voir [Daily Plan - Calendar](/daily-plan-calendar).

## Ordres

Le Plan Quotidien comprend les Ordres ayant l'un des états suivants :

- **Planifié** : Les ordres ont été créés mais n'ont pas été *soumis* au contrôleur et aux agents.
- **Soumis** : Les ordres ont été transmis au contrôleur et aux agents qui lanceront les ordres de manière autonome. Ce statut s'applique aux Ordres planifiés pour une exécution future et aux Ordres en cours d'exécution.
- **Terminé** : Les ordres ont été exécutés. La vue [Order History](/history-orders) explique si l'exécution a réussi ou échoué.

## Transitions de l'état des ordres

Le Plan Quotidien offre les transitions d'état suivantes :

<pre>
      ┌──────────────────┐
      ▼ ▲
   Créer │
      │ │
      ▼ │
  ┌───├──────┐ Supprimer ▲
  │ Prévu │───────────┘
  │ Ordres │───────────┐
  ┖───┌──────┘ ▲
      │ │
   Submit │
      │ │
      ▼ │
  ┌───├───────┐ │
  │ Submitted │ │ │
  │ Ordres │ │
  ┖───┌───────┘ │
      │ │
      ▼ Cancel ▲
      ├──────────────────┘
      │ ▲
   Execute / Let Run │
      │ │
      ▼ │
  ┌───├───────┐ │
  │ Finished │ │ │
  │ Ordres │ │
  ┖───┌───────┘ │
      │ │
      ▼ Cancel ▲
      ┖──────────────────┘
</pre>

## Vue Plan Quotidien 

### Opérations sur l'état des ordres

Les opérations sont disponibles individuellement à partir du menu d'action d'un Ordre et à partir d'opérations groupées.

Les boutons de filtrage suivants limitent la portée des opérations : 

- **Tous** : L'opération sera appliquée aux Ordres ayant n'importe quel statut.
- **Planifié** : Les opérations *soumettre* et *supprimer* peuvent être appliquées aux Ordres *planifiés* qui ne sont pas *soumises* au contrôleur.
- **Soumis** : Les opérations *laisser exécuter* et *annuler* peuvent être appliquées aux Ordres *soumis* au contrôleur et aux agents.
- **Terminé** : L'opération *cancel* peut être appliquée aux ordres *soumis* au contrôleur et aux agents : L'opération *annuler* peut être appliquée aux Ordres qui se sont terminés.
- **En Retard** est un filtre supplémentaire qui s'ajoute aux états des ordres et qui indique que les ordres ont été lancés plus tard que prévu.

#### Opérations du cycle de vie

- **Laisser courir l'Ordre**
  - Lorsqu'il est appliqué à des Ordres *soumis*, ceux-ci démarrent immédiatement. Les Ordres faisant l'objet d'une opération groupée démarreront simultanément.
- **Soumettre des Ordres**
  - Lorsqu'il s'agit d'Ordres *planifiés*, ils passent à l'état *soumis* et sont transmis au contrôleur et aux agents.
- **Annuler les Ordres**
  - Lorsqu'il s'agit d'ordres *soumis*, les ordres sont rappelés par le contrôleur et les agents et passent à l'état *planifié*.
- **Suppression d'Ordres**
  - Lorsqu'il s'agit d'ordres *planifiés*, les ordres sont retirés du Plan Quotidien. Une exécution ultérieure du service Plan Quotidien n'essaiera pas d'ajouter des Ordres à la date donnée.
- **Copier les Ordres**
  - **Heure de début** : Copie les Ordres à une date future du Plan Quotidien. La saisie de la date et de l'heure est similaire à la modification de l'heure de début d'un Ordre.
  - **Conserver l'affectation du Plan Quotidien** : Les dépendances basées sur le calendrier des tableaux d'affichage seront résolues à la date du Plan Quotidien d'origine.
  - **Ignorer les heures d'admission des tâches** : Les tâches peuvent être limités à certains jours et/ou à certains créneaux horaires. Les ordres qui arrivent doivent attendre le prochain créneau horaire disponible. Cette option permet de forcer les travaux à démarrer indépendamment de ces limitations.

#### Modifier l'heure de début

- **Maintenant** : Les ordres commencent immédiatement.
- **Date spécifique** : Les ordres commenceront à la date et à l'heure indiquées. Les ordres se verront attribuer la date du Plan Quotidien correspondante lorsqu'il s'agit de résoudre des dépendances basées sur le calendrier.
- **Par rapport à l'heure actuelle** : Les ordres commenceront avec un décalage par rapport à l'heure actuelle en secondes ou en heures, minutes, secondes, par exemple *15* pour commencer dans 15 secondes ou *01:30:15* pour commencer 1 heure, 30 minutes et 15 secondes plus tard.
- **Relatif à l'heure de début** : Les ordres commenceront avec un décalage positif ou négatif par rapport à leur heure de départ initiale en secondes ou en heures, 
minutes, secondes, par exemple *-04:00:00* pour commencer 4 heures plus tôt ou *+12:00:00* pour commencer 12 heures plus tard. L'affectation des Ordres à la date originale du Plan Quotidien reste en place lorsqu'il s'agit de résoudre des dépendances basées sur le calendrier.

#### Modifier le paramétrage

Pour les Workflows associés spécifiant des variables, les valeurs peuvent être modifiées. Lorsqu'ils sont utilisés avec des opérations en masse, tous les Ordres porteront les mêmes valeurs pour les variables.

- **Modifiez la variable** : 
  - Si le Workflow spécifie des variables sans valeurs par défaut, l'Ordre doit spécifier les valeurs correspondantes.
  - Si le Workflow spécifie des variables avec des valeurs par défaut, leur spécification dans un Ordre est facultative.

Une position peut être spécifiée si les Ordres ne doivent pas commencer au premier nœud du Workflow mais à un nœud ultérieur.

- **Position de bloc** : Pour les Workflows contenant des instructions de blocage telles que *Try/Catch*, *Resource Lock*, *Fork/Join*, l'instruction correspondante peut être sélectionnée.
- **Position de départ** : Si aucune *Position de départ* n'est spécifiée, l'Ordre commencera à partir du premier nœud du Workflow ou de la *Position de blocage*
  - Si aucune *position de blocage* n'est spécifiée, il est possible de sélectionner n'importe quelle instruction de niveau supérieur dans le Workflow à partir de laquelle l'Ordre commencera.
  - Si une *position de bloc* est spécifiée, la position de départ est un nœud de même niveau à l'intérieur du bloc.
- **Positions finales** :
  - Si aucune *position de bloc* n'est spécifiée, il est possible de sélectionner n'importe quelle instruction de niveau supérieur dans le Workflow avant laquelle l'Ordre se terminera.
  - Si une *position de bloc* est spécifiée, n'importe quel nœud de même niveau à l'intérieur du bloc peut être spécifié avant que l'Ordre ne se termine.
  - Il est possible de spécifier plus d'une *position de fin*.

#### Modifier la priorité

- **Priorité** :
  - Si un Ordre doit répondre à une instruction de *verrouillage des ressources* dans le Workflow qui limite le parallélisme, alors sa *Priorité* détermine la position dans la file d'attente des *Ordres en attente.
  - les *priorités* sont spécifiées à partir d'entiers négatifs, nuls et positifs ou à partir des raccourcis proposés. Une *priorité* plus élevée est prioritaire. Les raccourcis offrent les valeurs suivantes :
    - **Basse** : -20000
    - **Inférieur à la normale** : -10000
    - **Normal** : 0
    - **Au-dessus de la normale** : 10000
    - **Haut** : 20000

## Références

### Aide contextuelle

- [Cleanup Service](/service-cleanup)
- [Daily Plan - Calendar](/daily-plan-calendar)
- [Daily Plan Service](/service-daily-plan)
- [Order History](/history-orders)
- [Settings - Daily Plan](/settings-daily-plan)

### Product Knowledge Base

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)

