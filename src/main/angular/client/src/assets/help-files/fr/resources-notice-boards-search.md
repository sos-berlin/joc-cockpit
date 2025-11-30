# Recherche de panneaux d'affichage

*La recherche de panneaux d'affichage* est utilisée pour rechercher des panneaux d'affichage sur la base de critères tels que

- **La saisie par l'utilisateur** d'un nom ou d'un titre donné, éventuellement limité par des dossiers.

## Meta Characters

- le méta-caractère **?** remplacera n'importe quel caractère.
- **Caractère méta remplacera zéro ou plusieurs caractères.

La recherche est insensible à la casse et partiellement qualifiée, par exemple

- **test** trouvera les tableaux d'affichage portant le nom "My-**Test**-Board-1" et "**TEST**-Board-2"
- **te?t** trouvera les tableaux d'affichage portant le nom "Global-**Test**-Board-1" et "**TEXT**-Board-2"
- **te\*t** trouvera les tableaux d'affichage portant le nom "My-**tExt**-Board-1" et "My-**Terminat**ing-Board-2"

## Recherche avancée

Cette fonction est disponible en cliquant sur le lien suivant :<br/>**&gt; Recherche avancée**

### Recherche d'attributs

La recherche avancée permet d'effectuer une recherche par attributs d'objets :

- **Nom de l'agent** renvoie aux tableaux d'affichage des Workflows qui incluent des travaux exécutés avec l'agent spécifié.
- **Count Jobs** renvoie aux tableaux d'affichage des Workflows qui utilisent le nombre minimum de Jobs spécifié dans le terme **From**. S'il est utilisé avec le terme **To**, le système renverra les Workflows comprenant un nombre de travaux compris entre *From* et *To*. Si le terme *To* est utilisé seul, les Workflows renvoyés n'incluent pas un nombre de travaux supérieur au terme *To*.
- l'option **Nom du poste** renverra les tableaux d'affichage des Workflows qui comprennent des postes correspondant au nom donné. Si vous utilisez la case à cocher *Correspondance exacte* pour **Nom de l'emploi**, le terme de recherche saisi doit correspondre entièrement au nom de l'emploi, en tenant compte des majuscules et des minuscules.

### Recherche de dépendances

Le méta-caractère de recherche **\*** est utilisé pour spécifier que les dépendances sont recherchées, par exemple vers un verrou de ressource quel que soit le nom qu'il utilise :

- le méta-caractère **\*** pour **Verrouillage de ressources** renverra des tableaux d'affichage pour les Workflows utilisant un verrouillage de ressources,
- **\*** le métacaractère **File Ordre Sources** renverra les tableaux d'affichage des Workflows référencés par une File Ordre Source (source de commande de fichiers).

## Références

- [Resources - Notice Boards](/resources-notice-boards)

