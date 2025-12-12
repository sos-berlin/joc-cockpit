# Recherche d'un verrou de ressource

*Resource Lock Search* est utilisé pour rechercher des verrous de ressources sur la base de critères tels que

- **Entrées utilisateur** filtrées par nom ou titre, avec possibilité de limiter par dossier.

## Meta Characters

- le méta-caractère **?** remplacera n'importe quel caractère.
- **Caractère méta remplacera zéro ou plusieurs caractères.

La recherche est insensible à la casse et partielle, par exemple

- **test** trouvera les verrous de ressources portant le nom "My-**Test**-Board-1" et "**TEST**-Board-2"
- **te?t** trouvera les verrous de ressources portant le nom "Global-**Test**-Board-1" et "**TEXT**-Board-2"
- **te\*t** trouvera des verrous de ressources avec le nom "My-**tExt**-Board-1" et "My-**Terminat**ing-Board-2"

## Recherche avancée

Cette fonction est disponible en cliquant sur le lien suivant :<br/>**&gt; Advanced** (Recherche avancée)

### Recherche d'attributs

La recherche avancée permet d'effectuer une recherche par attributs d'objets :

- **Nom de l'agent** renvoie les verrous de ressources pour les Workflows qui incluent des travaux exécutés avec l'agent spécifié.
- **Compter les Tâches** renvoie les verrous de ressources pour les Workflows qui utilisent le nombre minimum de Jobs spécifié avec le terme **De**. S'il est utilisé avec le terme **à**, il renvoie les Workflows qui comprennent un nombre de travaux compris entre *From* et *To*. Si le terme *To* est utilisé seul, les Workflows renvoyés n'incluent pas un nombre de travaux supérieur au terme *To*.
- l'option **Nom de la Tâche** renverra les verrous de ressources pour les Workflows qui incluent des emplois correspondant au nom donné. Si vous utilisez la case à cocher *Correspondance exacte* pour **Nom de la Tâche**, le terme de recherche saisi doit correspondre entièrement au nom du poste, en tenant compte des majuscules et des minuscules.

### Recherche de dépendance

Le méta-caractère de recherche **\*** est utilisé pour spécifier que les dépendances sont recherchées, par exemple vers un verrou de ressource quel que soit le nom qu'il utilise :

- le méta-caractère **\*** pour **Condition** renverra les verrous de ressources pour les Workflows utilisant un Tableau de Condition,
- **\*** Le méta-caractère **Source d'Ordre de Fichier** renverra les verrous de ressources pour les Workflows référencés par une source d'ordre de fichier.

## Références

- [Resources - Resource Locks](/resources-resource-locks)

