# Ressources - Panneaux d'affichage

La vue *Panneaux d'affichage* affiche des informations en temps réel sur l'utilisation des panneaux d'affichage.

Les tableaux d'affichage mettent en œuvre des dépendances entre les Workflows par l'utilisation d'avis. Un avis est un drapeau qui est attaché à un tableau d'affichage ou qui n'existe pas. Les tableaux d'affichage sont disponibles dans les versions suivantes :

- **Les tableaux d'affichage globaux** implémentent les avis* à l'échelle globale, ce qui rend le même avis disponible pour n'importe quel Workflow à n'importe quel moment. 
- **Les tableaux d'affichage programmables** mettent en œuvre des avis dans le cadre de la Plannification [Daily Plan](/daily-plan). L'avis existe ou n'existe pas en fonction de la date du *Plan Quotidien*, par exemple
  - Le Workflow 1 fonctionne du lundi au vendredi.
  - Le Workflow 2 se déroule du lundi au dimanche et dépend de l'exécution précédente du Workflow 1.
  - Le week-end, le Workflow 1 ne démarre pas. Pour permettre le démarrage du Workflow 2 le week-end, la dépendance est mise en correspondance avec le Plan Quotidien en utilisant les *Panneaux d'Annonces Programmables* : si aucun Ordre n'est annoncé pour le Workflow 1, la dépendance peut être ignorée.

*Les tableaux d'affichage* sont référencés dans les Workflows à partir des instructions suivantes :

- **PostNotices Instruction** affiche un ou plusieurs *Avis*.
- instruction **ExpectNotices** attend qu'un ou plusieurs *Avis* soient présents.
- l'instruction **ConsumeNotices** est une instruction en bloc qui
  - peut couvrir un certain nombre de Jobs et d'instructions de Workflow dans le même Workflow,
  - attend la présence d'un ou plusieurs *Avis* et supprime les *Avis* à la fin du bloc.

## Panneau de navigation

Le panneau de gauche affiche l'arborescence des dossiers d'inventaire contenant les tableaux d'affichage.

- En cliquant sur un dossier, vous affichez les panneaux d'affichage de ce dossier.
- En cliquant sur l'icône en forme de chevron vers le bas lorsque vous survolez un dossier, vous affichez les tableaux d'affichage de ce dossier et de ses éventuels sous-dossiers.

L'icône de recherche rapide permet de rechercher des tableaux d'affichage en fonction des données saisies par l'utilisateur :

- En tapant **Test**, vous obtiendrez des tableaux d'affichage portant des noms tels que *test-board-1* et *TEST-board-2*. 
- Si vous tapez **Test**, vous obtiendrez des tableaux d'affichage portant des noms tels que *test-board-1* et *mon-test-board-2*

## Panneau d'affichage

L'affichage se concentre sur les *Panneaux d'affichage*, les *Avis* et les Ordres qui y sont liés.

La vue [Daily Plan - Dependencies](/daily-plan-dependencies) est axée sur l'affichage des *Panneaux d'affichage*, des *Avis* et des Ordres liés à une date spécifique du Plan Quotidien.

### Affichage des panneaux d'affichage

Les informations suivantes sont affichées :

- **Nom** est le nom unique du panneau d'affichage.
- **Date de déploiement** est la date à laquelle le panneau d'affichage a été déployé.
- **État** est l'une des valeurs suivantes : *Synchronisé* et *Non synchronisé* si le panneau d'affichage n'a pas été déployé sur le contrôleur.
- **Nombre d'avis** indique le nombre d'"avis" pour le panneau d'affichage.
  - **Les tableaux d'affichage globaux** contiennent des *avis* uniques.
  - **Les tableaux d'affichage programmables** contiennent des *avis* par date du Plan Quotidien.
- **Le nombre d'Ordres en attente** indique le nombre d'Ordres qui attendent la publication d'un *Avis*.

### Affichage des avis et des ordres

En cliquant sur l'icône de la flèche vers le bas, le tableau d'affichage s'agrandit et affiche des informations détaillées sur les *avis* qui ont été publiés et les ordres qui attendent la publication d'un *avis*.

### Opérations sur les tableaux d'affichage

Les opérations suivantes sont disponibles :

- **Poster Notice** (Afficher l'avis) affiche l'avis* correspondant, comme dans une instruction *PostNotices* (Afficher les avis).
- **Supprimez l'avis** pour supprimer l'avis*, comme dans une instruction de consommation d'avis.

## Recherche

Le site [Resources - Notice Boards - Search](/resources-notice-boards-search) propose des critères de recherche des tableaux d'affichage à partir des dépendances. Par exemple, si vous recherchez les Workflows comprenant un nom de travail spécifique, vous obtiendrez les tableaux d'affichage utilisés par le Workflow.

## Références

### Aide contextuelle

- [Configuration - Inventory - Notice Boards](/configuration-inventory-notice-boards)
- [Daily Plan](/daily-plan)
- [Daily Plan - Dependencies](/daily-plan-dependencies)
- [Resources - Notice Boards - Search](/resources-notice-boards-search)

### Product Knowledge Base

- [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  - [JS7 - Schedulable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedulable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)  
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)

