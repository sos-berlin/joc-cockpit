# Verrouillage des ressources

La vue *Resource Locks* affiche des informations en temps réel sur l'utilisation des Resource Locks.

Les verrous de ressources sont utilisés pour limiter le parallélisme des Jobs et des instructions de Workflow dans les Workflows.
Les verrous de ressources sont des blocs d'instructions qui peuvent s'étendre sur un certain nombre de travaux et d'instructions de workflow dans le même Workflow.

- les **verrous exclusifs** peuvent être utilisés par un seul travail. L'accès exclusif est configuré soit à partir du verrou de ressource, soit à partir de l'utilisation dans le Workflow.
- les **verrous partagés** peuvent être utilisés par un nombre configurable de travaux.
  - Une *capacité* est attribuée au verrou de ressource, par exemple 6.
  - Chaque utilisation du verrou de ressource par un ensemble de travaux se voit attribuer un *poids*, par exemple 3 et 4 pour l'utilisation dans les Workflows A et B. Cela permet l'exécution en parallèle de deux Ordres pour le Workflow A et interdit l'exécution en parallèle d'Ordres pour les Workflows A et B.

## Panneau de navigation

Le panneau de gauche affiche l'arborescence des dossiers d'inventaire contenant les verrous de ressources.

- Un clic sur le dossier affiche les verrouillages de ressources de ce dossier.
- En cliquant sur l'icône en forme de chevron vers le bas disponible lorsque vous survolez un dossier, vous affichez les verrouillages de ressources du dossier et de tous les sous-dossiers.

L'icône de recherche rapide permet de rechercher les verrouillages de ressources en fonction des données saisies par l'utilisateur :

- Si vous tapez **Test**, vous obtiendrez les verrouillages de ressources portant des noms tels que *test-lock-1* et *TEST-lock-2*. 
- Si vous tapez **Test**, vous obtiendrez des verrous de ressources portant des noms tels que *test-lock-1* et *my-TEST-lock-2*

## Panneau de verrouillage des ressources

### Affichage des verrous de ressources

Les informations suivantes sont affichées :

- **Nom** est le nom unique d'un verrou de ressource.
- **Date de déploiement** est la date à laquelle le verrou de ressource a été déployé.
- **L'état** est l'un des deux suivants : *Synchronisé* et *Non synchronisé* si le verrou de ressource n'a pas été déployé sur le contrôleur.
- **Poids acquis** indique le *poids* cumulé des Ordres parallèles qui ont acquis le verrou.
- **Ordre en attente** indique le nombre d'Ordres qui ont acquis le verrou.
- **Ordres en attente** indique le nombre d'Ordres qui attendent d'acquérir le verrou.
- **Capacité** indique la *capacité* disponible dans l'écluse. *Les écluses exclusives* ont une *capacité* de 1, les *écluses partagées* ont une *capacité* individuelle.

### Affichage des Ordres

En cliquant sur l'icône de la flèche vers le bas, vous développerez le verrou de ressource et afficherez des informations détaillées sur les ordres en attente qui ont acquis le verrou de ressource et sur les ordres en attente du verrou de ressource.

## Recherche

La fonction *Recherche* offre des critères permettant de rechercher des verrouillages de ressources à partir de dépendances. Par exemple, si vous recherchez des Workflows comprenant un nom de travail spécifique, vous obtiendrez les verrouillages de ressources utilisés par le Workflow.

## Références

- [Resources - Resource Locks - Search](/resources-resource-locks-search)
- [JS7 - Resource Locks](https://kb.sos-berlin.com/display/JS7/JS7+-+Resource+Locks)

