# Recherche d'inventaire

La recherche d'inventaire est utilisée pour limiter les résultats par type d'objet, par exemple :

- retourner les objets correspondant à un nom ou à un titre donné, éventuellement limité par des dossiers
- retourner les objets déployés ou validés, les brouillon d'objets, les objets non valides

## Métacaractères

- le métacaractère **?** remplace n'importe quel caractère.
- Le métacaractère **\*** remplace zéro ou plusieurs caractères.

La recherche est insensible à la casse et partiellement qualifiée, par exemple :

- **rest** trouvera les objets portant le nom "pdfNon**Rest**artable" et "**REST**-RunningTaskLog"
- **re?t** trouvera les objets portant le nom "ActivePassiveDi**rect**or" et "JITL-JS7**REST**ClientJob"
- **re\*t** trouvera les objets portant le nom "pdSQLExecuto**rExt**ractJSON" et "pdu**Reset**Subagent"

## Recherche avancée

La fonction est disponible en cliquant sur le lien : **&gt; Recherche avancée

### Recherche d'attributs

La recherche avancée permet d'effectuer une recherche par attributs d'objets :

- **Nom de l'Agent** renvoie les résultats qui incluent les tâches exécutés avec l'Agent spécifié.
- **Compter Les Tâches** limitera les résultats de la recherche aux Workflows qui utilisent le nombre minimum de Jobs spécifié avec le terme **De**. S'il est utilisé avec le terme **à**, il renverra les Workflows qui comprennent un nombre de tâches compris entre *From* et *To*. Si le terme *To* est utilisé seul, les Workflows renvoyés n'incluent pas un nombre de tâches supérieur au terme *To*.
- **Nom de la Tâche** renvoie les Workflows qui incluent les tâches correspondant au nom donné

Si vous utilisez la case à cocher *Correspondance exacte* pour **Nom de la Tâche**, le terme de recherche saisi doit correspondre entièrement au nom de la tâche, en tenant compte des majuscules et des minuscules. La recherche par nom de poste permet d'effectuer des opérations en masse sur les postes pour les Workflows qui en résultent.

### Recherche de dépendances

Le métacaractère de recherche **\*** est utilisé pour spécifier que les dépendances sont recherchées, par exemple vers un Verrou de Ressource quel que soit le nom qu'il utilise :

- une recherche utilisant le métacaractère **\*** pour **Verrou** renverra les Workflows utilisant un Verrou
- une recherche utilisant le métacaractère **\*** pour **Source d'Ordre de Fichier** renverra les Workflows référencés par un Source d'Ordre de Fichier

## Références

[JS7 - Inventory Search](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Search)
