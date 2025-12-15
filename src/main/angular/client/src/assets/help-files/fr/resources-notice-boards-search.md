# Recherche de Tableaux de Condition

*La recherche de Tabeleaux de condition* est utilisée pour rechercher des Tableaux de Condition sur la base de critères tels que

- **Saisie utilisateur** filtrées par nom ou titre, avec possibilité de limiter par dossier.

## Meta Characters

- le métacaractère **?** remplacera n'importe quel caractère.
- **Caractère méta remplacera zéro ou plusieurs caractères.

La recherche est insensible à la casse et partielle, par exemple

- **test** trouvera les Tableaux de Condition portant le nom "My-**Test**-Board-1" et "**TEST**-Board-2"
- **te?t** trouvera les Tableaux de Condition portant le nom "Global-**Test**-Board-1" et "**TEXT**-Board-2"
- **te\*t** trouvera les Tableaux de Condition portant le nom "My-**tExt**-Board-1" et "My-**Terminat**ing-Board-2"

## Recherche avancée

Cette fonction est disponible en cliquant sur le lien suivant :<br/>**&gt; Recherche avancée**

### Recherche d'attributs

La recherche avancée permet d'effectuer une recherche par attributs d'objets :

- **Nom de l'Agent** renvoie aux Tableaux de Condition des Workflows qui incluent des tâches exécutés avec l'Agent spécifié.
- **Compter les Tâches ** renvoie aux Tableaux de Condition des Workflows qui utilisent le nombre minimum de Jobs spécifié dans le terme **From**. S'il est utilisé avec le terme **To**, le système renverra les Workflows comprenant un nombre de tâches compris entre *From* et *To*. Si le terme *To* est utilisé seul, les Workflows renvoyés n'incluent pas un nombre de tâches supérieur au terme *To*.
- l'option **Nom de la Tâche** renverra les Tableaux de Condition des Workflows qui comprennent des postes correspondant au nom donné. Si vous utilisez la case à cocher *Correspondance exacte* pour **Nom de la Tâche**, le terme de recherche saisi doit correspondre entièrement au nom de la tâche, en tenant compte des majuscules et des minuscules.

### Recherche de dépendances

Le métacaractère de recherche **\*** est utilisé pour spécifier que les dépendances sont recherchées, par exemple vers un Verrou de Ressource quel que soit le nom qu'il utilise :

- le métacaractère **\*** pour **Verrou de Ressources** renverra des Tableaux de Condition pour les Workflows utilisant un Verrou de Ressources,
- **\*** le métacaractère **Sources d'Ordres de Fichiers** renverra les Tableaux de Condition des Workflows référencés par une Source d'Ordre de Fichiers.

## Références

- [Ressources - Tableaux de Condition](/resources-notice-boards)
