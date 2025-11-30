# Dépendances du Plan Quotidien

Les dépendances du Workflow peuvent être appliquées pour tous les jours et pour des dates spécifiques du Plan Quotidien, par exemple :

- Le Workflow 1 s'exécute du lundi au vendredi.
- Le Workflow 2 s'exécute du lundi au dimanche et dépend de l'exécution précédente du Workflow 1.
- Le week-end, le Workflow 1 ne démarre pas. Pour permettre le démarrage du Workflow 2 le week-end, la dépendance est mise en correspondance avec le Plan Quotidien par l'utilisation de *Panneaux d'affichage programmables* : si aucun Ordre n'est annoncé pour le Workflow 1, la dépendance sera ignorée.

## Calendrier

Le widget calendrier permet de sélectionner une date du Plan Quotidien pour laquelle les dépendances seront affichées.

- **Couleur rouge clair** : Les dates de plan passées qui sont fermées et qui ne permettront pas d'ajouter des Ordres.
- **Couleur verte** : Les dates de plan passées et futures qui sont ouvertes et qui permettront d'ajouter des Ordres.

Les opérations sur les dates de plan sont les suivantes :

- **Ouvrir le plan** : Cela se produit automatiquement si de nouveaux Ordres sont ajoutés pour une date de plan. Les utilisateurs peuvent rouvrir un plan fermé.
- **Fermer le plan** : Un plan ouvert est fermé et ne permet pas l'ajout d'Ordres. Cela se produit automatiquement pour les dates de plan passées avec un délai d'un jour. Les utilisateurs peuvent ajuster le paramètre correspondant à partir de la page [Settings - Daily Plan](/settings-daily-plan). Les utilisateurs peuvent fermer un plan ouvert plus tôt pour empêcher l'ajout d'Ordres.

## Affichage des dépendances

Les objets suivants sont affichés :

- **Posting Workflow** : Sur le côté gauche s'affiche le Workflow qui affiche les avis.
- **Avis** : Dans la partie centrale s'affiche le nom du panneau d'affichage qui crée l'avis.
- **Workflow de réception** : Sur le côté droit s'affiche le Workflow qui attend ou consomme l'avis.

Les relations suivantes sont indiquées :

- **Posting Workflow** : Crée un ou plusieurs avis qui sont attendus/consommés par un ou plusieurs *Workflows de réception*.
- **Workflow de réception** : Attend/consomme un ou plusieurs avis provenant du même ou de différents *flux de travail d'envoi*.

L'état de réalisation des dépendances est indiqué par des lignes :

- **Ligne de couleur bleue** : Un avis est annoncé pour un moment futur où l'Ordre du *Posting Workflow* commencera et créera l'avis.
- **Ligne de couleur verdâtre** : La dépendance n'est pas résolue, un avis a été publié mais n'est pas encore traité par tous les *Workflows de réception*.
  - **Workflow de réception en couleur verte** : Le Workflow de réception* a été créé mais n'a pas encore été traité par tous les *flux de travail de réception : L'Ordre du *Flux de travail récepteur* est lancé mais n'a pas procédé à l'instruction de flux de travail qui vérifie les avis.
  - **Workflow de réception de couleur bleue** : L'Ordre du *Receiving Workflow* est planifié pour démarrer à un moment ultérieur de la journée.
- **Ligne en couleur grise** : La dépendance est résolue, l'avis a été posté et a été consommé par un *Workflow de réception*.

## Filtres

Les filtres permettent de limiter l'affichage des Workflows et des dépendances :

- **Avis annoncés** : Affiche les Workflows pour lesquels des avis sont annoncés, c'est-à-dire que les Ordres sont planifiés mais n'ont pas encore démarré et n'ont pas encore publié l'avis. Lorsqu'un avis est publié, son annonce est abandonnée.
- **Avis présents** : Affiche les Workflows pour lesquels des avis ont été publiés et peuvent être traités. Si un avis est consommé par un Workflow, il sera abandonné et ne sera plus présent.

Si les deux boutons de filtrage sont actifs, les avis annoncés et publiés sont inclus, mais les dépendances qui ont été résolues et pour lesquelles les avis ont été consommés et ne sont plus présents sont exclues.

Si les deux boutons de filtrage sont inactifs, tous les Workflows et dépendances seront affichés, y compris les avis qui ont été annoncés, qui sont présents ou qui ont été consommés.

## Références

### Aide contextuelle

- [Configuration - Inventory - Notice Boards](/configuration-inventory-notice-boards)
- [Daily Plan](/daily-plan)
- [Resources - Notice Boards](/resources-notice-boards)
- [Settings - Daily Plan](/settings-daily-plan)

### Product Knowledge Base

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  - [JS7 - Schedulable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedulable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)  
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)

