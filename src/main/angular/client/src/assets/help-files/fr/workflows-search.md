# Recherche de Workflow

La recherche de Workflow est utilisée pour rechercher des Workflows sur la base de critères tels que

- **Saisit utilisateur** correspondant à un nom ou à un titre donné, avec possibilité de limitation par dossier,
- Disponibilité du Workflow
  - **Les Workflows synchronisés sont déployés dans un Contrôleur.
  - **Les Workflows suspendus sont gelés, c'est-à-dire qu'ils acceptent les Ordres mais n'autorisent pas le démarrage des Ordres.
  - **Les Workflows en suspens** attendent la confirmation d'un Agent que les Workflows ont été suspendus.
- Disponibilité des tâches
  - **Ignorer** Les tâches ignorés ne seront pas exécutés lors du passage des Ordres .
  - **Arrêter** Les tâches arrêtés suspendront les Ordres entrants.

## Meta Characters

- le métacaractère **?** remplace n'importe quel caractère.
- **Le métacaractère remplace zéro ou plusieurs caractères.

La recherche est insensible à la casse et partielle, par exemple

- **rest** trouvera les Workflows dont le nom est "pdfNon**Rest**artable" et "**REST**-RunningTaskLog"
- **re?t** trouvera les Workflows dont le nom est "ActivePassiveDi**rect**or" et "JITL-JS7**REST**ClientJob"
- **re?t** trouvera les Workflows portant le nom "pdSQLExecuto**rExt**ractJSON" et "pdu**Reset**Subagent"

## Recherche avancée

Cette fonction est disponible en cliquant sur le lien suivant :<br/>**&gt; Advanced**

### Recherche d'attributs

La recherche avancée permet d'effectuer une recherche par attributs d'objets :

- **Nom de l'Agent** renvoie les Workflows qui incluent des tâches exécutés avec l'Agent spécifié.
- **Compter les Tâches** renverra les Workflows qui utilisent le nombre minimum de Jobs spécifié avec le terme **De**. S'il est utilisé avec le terme **à**, les Workflows renvoyés comprennent un nombre de tâches compris entre *From* et *To*. Si le terme *To* est utilisé seul, les Workflows renvoyés n'incluent pas un nombre de tâches supérieur au terme *To*.
- **Nom de la Tâche** renvoie les Workflows qui incluent les tâches correspondant au nom donné. Si vous utilisez la case à cocher *Correspondance exacte* pour **Nom du poste**, le terme de recherche saisi doit correspondre entièrement au nom du poste, en tenant compte des majuscules et des minuscules.

### Recherche de dépendance

Le métacaractère de recherche **\*** est utilisé pour spécifier que les dépendances sont recherchées, par exemple vers un Verrou de Ressource quel que soit le nom qu'il utilise :

- le métacaractère **\*** pour **Verrou** renverra les Workflows utilisant un Verrou,
- **\*** Le métacaractère **Source d'Ordre de Fichier** renverra les Workflows référencés par un Source d'Ordre de Fichier.

