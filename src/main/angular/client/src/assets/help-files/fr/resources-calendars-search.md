# Recherche de calendrier

La recherche de calendrier est utilisée pour rechercher des calendrier sur la base de critères tels que

- **La recherche d'un nom ou d'un titre donné, éventuellement limité par des dossiers.

## Meta Characters

- le méta-caractère **?** remplacera n'importe quel caractère.
- **Caractère méta remplacera zéro ou plusieurs caractères.

La recherche est insensible à la casse et partielle, par exemple

- **test** trouvera les calendriers portant le nom "My-**Test**-Board-1" et "**TEST**-Board-2"
- **te?t** trouvera les calendriers portant le nom "Global-**Test**-Board-1" et "**TEXT**-Board-2"
- **te\*t** trouvera les calendriers portant le nom "My-**tExt**-Board-1" et "My-**Terminat**ing-Board-2"

## Recherche avancée

Cette fonction est disponible en cliquant sur le lien suivant :<br/>**&gt; Recherche avancée**

### Recherche d'attributs

La recherche avancée permet d'effectuer une recherche par attributs d'objets :

- **Nom de l'agent** renvoie les calendriers des Workflows qui incluent les travaux exécutés avec l'agent spécifié.
- **Compter les Tâches** renvoie les calendriers des Workflows qui utilisent le nombre minimum de Jobs spécifié avec le terme **De**. S'il est utilisé avec le terme **à**, il renvoie les Workflows qui incluent un nombre de travaux compris entre *De* et *à*. Si le terme *à* est utilisé seul, les Workflows qui ne comprennent pas un nombre de travaux supérieur au terme *à* seront renvoyés.
- **Nom de la Tâche** renvoie les calendriers des Workflows qui correspondent aux tâches au nom indiqué. Si vous utilisez la case à cocher *Correspondance exacte* pour **Nom de la tâche**, le terme de recherche saisi doit correspondre entièrement au nom de la tâche, en tenant compte des majuscules et des minuscules.

### Recherche de dépendance

Le méta-caractère de recherche **\*** est utilisé pour spécifier que les dépendances sont recherchées, par exemple vers un verrou de ressource quel que soit le nom qu'il utilise :

- **\*** Le méta-caractère de **Verrou** renverra les calendriers des Workflows utilisant les verrous des ressources,
- **\*** Le métacaractère **Source D'Ordre de Fichier** renverra les calendriers des Workflows référencés par un Source D'Ordre de Fichier.

## Références

- [Configuration - Inventory - Calendars](/configuration-inventory-calendars)
- [Resources - Calendars](/resources-calendars)
- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)

