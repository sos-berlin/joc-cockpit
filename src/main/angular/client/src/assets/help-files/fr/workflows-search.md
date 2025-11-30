# Recherche de Workflow

La recherche de Workflow est utilisée pour rechercher des Workflows sur la base de critères tels que

- **L'utilisateur** qui correspond à un nom ou à un titre donné, éventuellement limité par des dossiers,
- Disponibilité du Workflow
  - **Les Workflows synchronisés sont déployés dans un contrôleur.
  - **Les Workflows suspendus sont gelés, c'est-à-dire qu'ils acceptent les Ordres mais n'autorisent pas le démarrage des Ordres.
  - **Les Workflows en suspens** attendent la confirmation d'un agent que les Workflows ont été suspendus.
- Disponibilité des emplois
  - les ordres passés ne sont pas pris en compte pour l'exécution des tâches **Skipped**.
  - **Stopped** Les tâches suspendent l'arrivée des Ordres.

## Meta Characters

- le métacaractère **?** remplace n'importe quel caractère.
- **Le métacaractère remplace zéro ou plusieurs caractères.

La recherche est insensible à la casse et partiellement qualifiée, par exemple

- **rest** trouvera les Workflows dont le nom est "pdfNon**Rest**artable" et "**REST**-RunningTaskLog"
- **re?t** trouvera les Workflows dont le nom est "ActivePassiveDi**rect**or" et "JITL-JS7**REST**ClientJob"
- **re?t** trouvera les Workflows portant le nom "pdSQLExecuto**rExt**ractJSON" et "pdu**Reset**Subagent"

## Recherche avancée

Cette fonction est disponible en cliquant sur le lien suivant :<br/>**&gt; Advanced**

### Recherche d'attributs

La recherche avancée permet d'effectuer une recherche par attributs d'objets :

- **Nom de l'agent** renvoie les Workflows qui incluent des travaux exécutés avec l'agent spécifié.
- **Count Jobs** renverra les Workflows qui utilisent le nombre minimum de Jobs spécifié avec le terme **From**. S'il est utilisé avec le terme **To**, les Workflows renvoyés comprennent un nombre de travaux compris entre *From* et *To*. Si le terme *To* est utilisé seul, les Workflows renvoyés n'incluent pas un nombre de travaux supérieur au terme *To*.
- **Nom du travail** renvoie les Workflows qui incluent les travaux correspondant au nom donné. Si vous utilisez la case à cocher *Correspondance exacte* pour **Nom du poste**, le terme de recherche saisi doit correspondre entièrement au nom du poste, en tenant compte des majuscules et des minuscules.

### Recherche de dépendance

Le méta-caractère de recherche **\*** est utilisé pour spécifier que les dépendances sont recherchées, par exemple vers un verrou de ressource quel que soit le nom qu'il utilise :

- le méta-caractère **\*** pour **Resource Locks** renverra les Workflows utilisant un Resource Lock,
- **\*** Le métacaractère **File Ordre Sources** renverra les Workflows référencés par un File Ordre Source.

