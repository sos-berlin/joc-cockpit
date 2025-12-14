# Verrous de Ressource

La vue *Verrous de Ressource* affiche des informations en temps réel sur l'utilisation des Verrous de Ressource.

Les Verrous de Ressource sont utilisés pour limiter le parallélisme des tâches et des instructions dans les Workflows.
Les Verrous de Ressource sont des blocs d'instructions qui peuvent s'étendre sur un certain nombre de tâches et d'instructions dans le même Workflow.

- Les **verrous exclusifs** peuvent être utilisés par une seula tâche. L'accès exclusif est configuré soit à partir du Verrou de Ressource, soit à partir de l'utilisation dans le Workflow.
- Les **verrous partagés** peuvent être utilisés par un nombre configurable de tâches.
  - Une *capacité* est attribuée au Verrou de Ressource, par exemple 6.
  - Chaque utilisation du Verrou de Ressource par un ensemble de tâches se voit attribuer un *poids*, par exemple 3 et 4 pour l'utilisation dans les Workflows A et B. Cela permet l'exécution en parallèle de deux Ordres pour le Workflow A et interdit l'exécution en parallèle d'Ordres pour les Workflows A et B.

## Vue de navigation

La vue de gauche affiche l'arborescence des dossiers d'inventaire contenant les Verrous de Ressource.

- Un clic sur le dossier affiche les Verrous de Ressource de ce dossier.
- En cliquant sur l'icône en forme de chevron vers le bas disponible lorsque vous survolez un dossier, vous affichez les Verrous de Ressource du dossier et de tous les sous-dossiers.

L'icône de recherche rapide permet de rechercher les Verrous de Ressource en fonction des données saisies par l'utilisateur :

- Si vous tapez **Test**, vous obtiendrez les Verrous de Ressource portant des noms tels que *test-lock-1* et *TEST-lock-2*. 
- Si vous tapez **\*Test**, vous obtiendrez des Verrous de Ressource portant des noms tels que *test-lock-1* et *my-TEST-lock-2*

## Panneau de Verrou de Ressource

### Affichage des Verrous de Ressource

Les informations suivantes sont affichées :

- **Nom** est le nom unique d'un Verrou de Ressource.
- **Date de déploiement** est la date à laquelle le Verrou de Ressource a été déployé.
- **État** est l'un des deux suivants : *Synchronisé* et *Non synchronisé* si le Verrou de Ressource n'a pas été déployé sur le Contrôleur.
- **Nombre acquis** indique le *poids* cumulé des Ordres parallèles qui ont acquis le verrou.
- **Ordre vérouillés** indique le nombre d'Ordres qui ont acquis le verrou.
- **Ordres en attente** indique le nombre d'Ordres qui attendent d'acquérir le verrou.
- **Limite** indique la *limite* disponible dans le verrou. Les *verrous exclusives* ont une *limite* de 1, les *verrous partagées* ont une *limite* individuelle.

### Affichage des Ordres

En cliquant sur l'icône de la flèche vers le bas, vous développerez le Verrou de Ressource et afficherez des informations détaillées sur les Ordres en attente qui ont acquis le Verrou de Ressource et sur les Ordres en attente du Verrou de Ressource.

## Recherche

La fonction *Recherche* offre des critères permettant de rechercher des Verrous de Ressource à partir de dépendances. Par exemple, si vous recherchez des Workflows comprenant un nom d'une tâche spécifique, vous obtiendrez les Verrous de Ressource utilisés par le Workflow.

## Références

- [Ressources - Verrou de Ressource - Recherche](/resources-resource-locks-search)
- [JS7 - Resource Locks](https://kb.sos-berlin.com/display/JS7/JS7+-+Resource+Locks)
