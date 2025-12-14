# Ressources - Recherche Verrou de Ressource

La vue *Recherche Verrou de Resource* est utilisé pour rechercher des Verrous de Ressources sur la base de critères tels que

- **Entrées utilisateur** filtrées par nom ou titre, avec possibilité de limiter par dossier.

## Metacaractères

- le métacaractère **?** remplacera n'importe quel caractère.
- **Caractère méta remplacera zéro ou plusieurs caractères.

La recherche est insensible à la casse et partielle, par exemple

- **test** trouvera les Verrous de Ressources portant le nom "My-**Test**-Board-1" et "**TEST**-Board-2"
- **te?t** trouvera les Verrous de Ressources portant le nom "Global-**Test**-Board-1" et "**TEXT**-Board-2"
- **te\*t** trouvera des Verrous de Ressources avec le nom "My-**tExt**-Board-1" et "My-**Terminat**ing-Board-2"

## Recherche avancée

Cette fonction est disponible en cliquant sur le lien suivant :<br/>**&gt; Advanced** (Recherche avancée)

### Recherche d'attributs

La recherche avancée permet d'effectuer une recherche par attributs d'objets :

- **Nom de l'Agent** renvoie les Verrous de Ressources pour les Workflows qui incluent des tâches exécutés avec l'Agent spécifié.
- **Compter les Tâches** renvoie les Verrous de Ressources pour les Workflows qui utilisent le nombre minimum de Jobs spécifié avec le terme **De**. S'il est utilisé avec le terme **à**, il renvoie les Workflows qui comprennent un nombre de tâches compris entre *From* et *To*. Si le terme *To* est utilisé seul, les Workflows renvoyés n'incluent pas un nombre de tâches supérieur au terme *To*.
- **Nom de la Tâche** renverra les Verrous de Ressources pour les Workflows qui incluent des Tâches correspondant au nom donné. Si vous utilisez la case à cocher *Correspondance exacte* pour **Nom de la Tâche**, le terme de recherche saisi doit correspondre entièrement au nom de la tâche, en tenant compte des majuscules et des minuscules.

### Recherche de dépendance

Le métacaractère de recherche **\*** est utilisé pour spécifier que les dépendances sont recherchées, par exemple vers un Verrou de Ressource quel que soit le nom qu'il utilise :

- le métacaractère **\*** pour **Condition** renverra les Verrous de Ressources pour les Workflows utilisant un Tableau de Condition,
- **\*** Le métacaractère **Source d'Ordre de Fichier** renverra les Verrous de Ressources pour les Workflows référencés par une Source d'Ordre de Fichier.

## Références

- [Ressources - Verrous de Ressource](/resources-resource-locks)
