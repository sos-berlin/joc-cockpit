# Recherche d'inventaire

La recherche d'inventaire est utilisée pour limiter les résultats par type d'objet, par exemple :

- retourner les objets correspondant à un nom ou à un titre donné, éventuellement limité par des dossiers
- retourner les objets déployés ou validés, les projets d'objets, les objets non valides

## Méta-caractères

- le métacaractère **?** remplace n'importe quel caractère.
- **Le métacaractère remplace zéro ou plusieurs caractères.

La recherche est insensible à la casse et partiellement qualifiée, par exemple :

- **rest** trouvera les objets portant le nom "pdfNon**Rest**artable" et "**REST**-RunningTaskLog"
- **re?t** trouvera les objets portant le nom "ActivePassiveDi**rect**or" et "JITL-JS7**REST**ClientJob"
- **re?t** trouvera les objets portant le nom "pdSQLExecuto**rExt**ractJSON" et "pdu**Reset**Subagent"

## Recherche avancée

La fonction est disponible en cliquant sur le lien : **&gt; Recherche avancée

### Recherche d'attributs

La recherche avancée permet d'effectuer une recherche par attributs d'objets :

- **Nom de l'agent** renvoie les résultats qui incluent les travaux exécutés avec l'agent spécifié.
- **Count Jobs** limitera les résultats de la recherche aux Workflows qui utilisent le nombre minimum de Jobs spécifié avec le terme **From**. S'il est utilisé avec le terme **To**, il renverra les Workflows qui comprennent un nombre de travaux compris entre *From* et *To*. Si le terme *To* est utilisé seul, les Workflows renvoyés n'incluent pas un nombre de travaux supérieur au terme *To*.
- **Nom du travail** renvoie les Workflows qui incluent les travaux correspondant au nom donné

Si vous utilisez la case à cocher *Correspondance exacte* pour **Nom du travail**, le terme de recherche saisi doit correspondre entièrement au nom du travail, en tenant compte des majuscules et des minuscules. La recherche par nom de poste permet d'effectuer des opérations en masse sur les postes pour les Workflows qui en résultent.

### Recherche de dépendances

Le méta-caractère de recherche **\*** est utilisé pour spécifier que les dépendances sont recherchées, par exemple vers un verrou de ressource quel que soit le nom qu'il utilise :

- une recherche utilisant le méta-caractère **\*** pour **Resource Locks** renverra les Workflows utilisant un Resource Lock
- une recherche utilisant le méta-caractère **\*** pour **File Ordre Sources** renverra les Workflows référencés par un File Ordre Source

## Références

[JS7 - Inventory Search](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Search)

