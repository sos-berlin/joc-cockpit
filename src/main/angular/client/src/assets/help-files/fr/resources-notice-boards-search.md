# Recherche de Tableaux de condition

*La recherche de Tabeleaux de condition* est utilisée pour rechercher des Tableaux de condition sur la base de critères tels que

- **Saisie utilisateur** filtrées par nom ou titre, avec possibilité de limiter par dossier.

## Meta Characters

- le méta-caractère **?** remplacera n'importe quel caractère.
- **Caractère méta remplacera zéro ou plusieurs caractères.

La recherche est insensible à la casse et partielle, par exemple

- **test** trouvera les tableaux de condition portant le nom "My-**Test**-Board-1" et "**TEST**-Board-2"
- **te?t** trouvera les tableaux de conditon portant le nom "Global-**Test**-Board-1" et "**TEXT**-Board-2"
- **te\*t** trouvera les tableaux de condition portant le nom "My-**tExt**-Board-1" et "My-**Terminat**ing-Board-2"

## Recherche avancée

Cette fonction est disponible en cliquant sur le lien suivant :<br/>**&gt; Recherche avancée**

### Recherche d'attributs

La recherche avancée permet d'effectuer une recherche par attributs d'objets :

- **Nom de l'agent** renvoie aux tableaux de condition des Workflows qui incluent des travaux exécutés avec l'agent spécifié.
- **Compter les Tâches ** renvoie aux tableaux de condition des Workflows qui utilisent le nombre minimum de Jobs spécifié dans le terme **From**. S'il est utilisé avec le terme **To**, le système renverra les Workflows comprenant un nombre de travaux compris entre *From* et *To*. Si le terme *To* est utilisé seul, les Workflows renvoyés n'incluent pas un nombre de travaux supérieur au terme *To*.
- l'option **Nom de la Tâche** renverra les tableaux de condition des Workflows qui comprennent des postes correspondant au nom donné. Si vous utilisez la case à cocher *Correspondance exacte* pour **Nom de l'emploi**, le terme de recherche saisi doit correspondre entièrement au nom de l'emploi, en tenant compte des majuscules et des minuscules.

### Recherche de dépendances

Le méta-caractère de recherche **\*** est utilisé pour spécifier que les dépendances sont recherchées, par exemple vers un verrou de ressource quel que soit le nom qu'il utilise :

- le méta-caractère **\*** pour **Verrou de ressources** renverra des tableaux de condition pour les Workflows utilisant un verrou de ressources,
- **\*** le métacaractère **Sources D'Ordre de Fichier** renverra les tableaux de condition des Workflows référencés par une Source d'Ordre de Fichiers.

## Références

- [Resources - Notice Boards](/resources-notice-boards)

