# Dépendances du Plan Quotidien

Les dépendances du Workflow peuvent être appliquées pour tous les jours et pour des dates spécifiques du Plan Quotidien, par exemple :

- Le Workflow 1 s'exécute du lundi au vendredi.
- Le Workflow 2 s'exécute du lundi au dimanche et dépend de l'exécution précédente du Workflow 1.
- Le week-end, le Workflow 1 ne démarre pas. Pour permettre le démarrage du Workflow 2 le week-end, la dépendance est mise en correspondance avec le Plan Quotidien par l'utilisation de *Panneaux d'affichage programmables* : si aucun Ordre n'est annoncé pour le Workflow 1, la dépendance sera ignorée.

## Calendrier

Le widget Calendrier permet de sélectionner une date du Plan Quotidien pour laquelle les dépendances seront affichées.

- **Couleur rouge clair** : Les dates de plan passées qui sont fermées et qui ne permettront pas d'ajouter des Ordres.
- **Couleur verte** : Les dates de plan passées et futures qui sont ouvertes et qui permettront d'ajouter des Ordres.

Les opérations sur les dates de plan sont les suivantes :

- **Ouvrir le plan** : Cela se produit automatiquement si de nouveaux Ordres sont ajoutés pour une date de plan. Les utilisateurs peuvent rouvrir un plan fermé.
- **Fermer le plan** : Un plan ouvert est fermé et ne permet pas l'ajout d'Ordres. Cela se produit automatiquement pour les dates de plan passées avec un délai d'un jour. Les utilisateurs peuvent ajuster le paramètre correspondant à partir de la page [Réglages - Plan Quotidien](/settings-daily-plan). Les utilisateurs peuvent fermer un plan ouvert plus tôt pour empêcher l'ajout d'Ordres.

## Affichage des dépendances

Les objets suivants sont affichés :

- **Workflow d'envoi** : Sur le côté gauche s'affiche le Workflow qui affiche les Annonces.
- **Annonce** : Dans la partie centrale s'affiche le nom du Tableau de Condition qui crée l'Annonce.
- **Workflow en attente** : Sur le côté droit s'affiche le Workflow qui attend ou consomme l'Annonce.

Les relations suivantes sont indiquées :

- **Workflow 'envoi** : Crée un ou plusieurs Annonces qui sont attendus/consommés par un ou plusieurs *Workflows en attente*.
- **Workflow en attente** : Attend/consomme un ou plusieurs Annonces provenant du même ou de différents *Workflows d'envoi*.

L'état de réalisation des dépendances est indiqué par des lignes :

- **Ligne de couleur bleue** : Un Annonce est indiqué pour un moment futur où l'Ordre du *Workflow d'envoi* commencera et créera l'Annonce.
- **Ligne de couleur verdâtre** : La dépendance n'est pas résolue, un Annonce a été publié mais n'est pas encore traité par tous les *Workflows en attente*.
  - **Workflow en attente en couleur verte** : Le *Workflow en attente* a été démarrée mais n'a pas encore été traité. L'Ordre du *Workflow en attente* est lancé mais n'a pas procédé à l'instruction qui vérifie les Annonces.
  - **Workflow en attente de couleur bleue** : L'Ordre du *Workflow en attente* est planifié pour démarrer à un moment ultérieur de la journée.
- **Ligne en couleur grise** : La dépendance est résolue, l'Annonce a été posté et a été consommé par un *Workflow en attente*.

## Filtres

Les filtres permettent de limiter l'affichage des Workflows et des dépendances :

- **Annonce prévues** : Affiche les Workflows pour lesquels des Annonces sont prévues, c'est-à-dire que les Ordres sont planifiés mais n'ont pas encore démarré et n'ont pas encore publié l'Annonce. Lorsqu'un Annonce est publié, son Annonce est abandonnée.
- **Annonce présents** : Affiche les Workflows pour lesquels des Annonces ont été publiés et peuvent être traités. Si un Annonce est consommé par un Workflow, il sera abandonné et ne sera plus présent.

Si les deux boutons de filtrage sont actifs, les Annonce annoncés et publiés sont inclus, mais les dépendances qui ont été résolues et pour lesquelles les Annonce ont été consommés et ne sont plus présents sont exclues.

Si les deux boutons de filtrage sont inactifs, tous les Workflows et dépendances seront affichés, y compris les Annonce qui ont été annoncés, qui sont présents ou qui ont été consommés.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Tableaux de Condition](/configuration-inventory-notice-boards)
- [Plan Quotidien](/daily-plan)
- [Réglages - Plan Quotidien](/settings-daily-plan)
- [Ressources - Tableaux de Condition](/resources-notice-boards)

### Product Knowledge Base

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  - [JS7 - Schedulable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedulable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)  
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)
