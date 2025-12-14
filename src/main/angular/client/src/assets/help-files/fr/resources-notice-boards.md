# Ressources - Tableaux de Condition

La vue *Tableaux de Condition* affiche des informations en temps réel sur l'utilisation des conditions.

Les Tableaux de Condition mettent en œuvre des dépendances entre les Workflows par l'utilisation d'Annonce. Une Annonce est un drapeau qui est attaché à un Tableau de Condition ou qui n'existe pas. Les Tableaux de Condition sont disponibles dans les versions suivantes :

- **Tableau de Condition Global** implément les *Annonces* à l'échelle globale, ce qui rend le même Annonce disponible pour n'importe quel Workflow à n'importe quel moment. 
- **Tableau de Condition Planifiable** met en œuvre des *Annonces* dans le cadre du [Plan Quotidien](/daily-plan). L'Annonce existe ou n'existe pas en fonction de la date du *Plan Quotidien*, par exemple
  - Le Workflow 1 fonctionne du lundi au vendredi.
  - Le Workflow 2 se déroule du lundi au dimanche et dépend de l'exécution précédente du Workflow 1.
  - Le week-end, le Workflow 1 ne démarre pas. Pour permettre le démarrage du Workflow 2 le week-end, la dépendance est mise en correspondance avec le Plan Quotidien en utilisant les *Tableaux de Condition Planifiables* : si aucun Ordre n'est annoncé pour le Workflow 1, la dépendance peut être ignorée.

*Les Tableaux de Condition* sont référencés dans les Workflows à partir des instructions suivantes :

- l'instruction **PostNotices** affiche un ou plusieurs *Annonces*.
- l'instruction **ExpectNotices** attend qu'un ou plusieurs *Annonces* soient présents.
- l'instruction **ConsumeNotices** est une instruction en bloc qui
  - peut couvrir un certain nombre de tâches et d'instructions de Workflow dans le même Workflow,
  - attend la présence d'une ou plusieurs *Annonces* et supprime les *Annonces* à la fin du bloc.

## Panneau de navigation

Le vue de gauche affiche l'arborescence des dossiers d'inventaire contenant les tableaux d'affichage.

- En cliquant sur un dossier, vous affichez les panneaux d'affichage de ce dossier.
- En cliquant sur l'icône en forme de chevron vers le bas lorsque vous survolez un dossier, vous affichez les tableaux d'affichage de ce dossier et de ses éventuels sous-dossiers.

L'icône de recherche rapide permet de rechercher des tableaux d'affichage en fonction des données saisies par l'utilisateur :

- En tapant **Test**, vous obtiendrez des tableaux d'affichage portant des noms tels que *test-board-1* et *TEST-board-2*. 
- Si vous tapez **\*Test**, vous obtiendrez des tableaux d'affichage portant des noms tels que *test-board-1* et *mon-test-board-2*

## Tableau de Condition

L'affichage se concentre sur les *Tableaux de Condition* et les Ordres qui y sont liés.

La vue [Dépendances du Plan Quotidien](/daily-plan-dependencies) est axée sur l'affichage des *Tableaux de Condition*, des *Annonces* et des Ordres liés à une date spécifique du Plan Quotidien.

### Affichage des Tableaux de Condition

Les informations suivantes sont affichées :

- **Nom** est le nom unique du Tableau de Condition.
- **Date de déploiement** est la date à laquelle le Tableau de Condition a été déployé.
- **État** est l'une des valeurs suivantes : *Synchronisé* et *Non synchronisé* si le Tableau de Condition n'a pas été déployé sur le Contrôleur.
- **Nombre d'Annonce** indique le nombre d'*Annonce* pour le Tableau de Condition.
  - **Tableau de Condition Global** contient des *Annonces* uniques.
  - **Tableau de Condition Planifiable** contient des *Annonces* par date du Plan Quotidien.
- **Nombre d'Ordres en attente** indique le nombre d'Ordres qui attendent la publication d'une *Annonce*.

### Affichage des Annonces et des Ordres

En cliquant sur l'icône de la flèche vers le bas, le tableau d'affichage s'agrandit et affiche des informations détaillées sur les *Annonces* qui ont été publiés et les Ordres qui attendent la publication d'une *Annonce*.

### Opérations sur les Tableaux de Condition

Les opérations suivantes sont disponibles :

- **Poster une Annonce** (Afficher l'Annonce) affiche l'Annonce correspondant, comme dans une instruction *PostNotices* (Afficher les Annonce).
- **Supprimer l'Annonce** pour supprimer l'Annonce, comme dans une instruction *ConsumeNotices*.

## Recherche

Le site [Ressources - Tableaux de Condition - Recherche](/resources-notice-boards-search) propose des critères de recherche des tableaux d'affichage à partir des dépendances. Par exemple, si vous recherchez les Workflows comprenant un nom de tâche spécifique, vous obtiendrez les tableaux d'affichage utilisés par le Workflow.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Tableaux de Condition](/configuration-inventory-notice-boards)
- [Dépendances du Plan Quotidien](/daily-plan-dependencies)
- [Plan Quotidien](/daily-plan)
- [Ressources - Tableaux de Condition - Recherche](/resources-notice-boards-search)

### Product Knowledge Base

- [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  - [JS7 - Schedulable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedulable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)  
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)
