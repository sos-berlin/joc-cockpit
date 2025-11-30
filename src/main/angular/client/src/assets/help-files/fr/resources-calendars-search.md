# Recherche de calendrier

*La recherche de calendrier* est utilisée pour rechercher des calendriers sur la base de critères tels que

- **La recherche d'un nom ou d'un titre donné, éventuellement limité par des dossiers.

## Meta Characters

- le méta-caractère **?** remplacera n'importe quel caractère.
- **Caractère méta remplacera zéro ou plusieurs caractères.

La recherche est insensible à la casse et partiellement qualifiée, par exemple

- **test** trouvera les calendriers portant le nom "My-**Test**-Board-1" et "**TEST**-Board-2"
- **te?t** trouvera les calendriers portant le nom "Global-**Test**-Board-1" et "**TEXT**-Board-2"
- **te\*t** trouvera les calendriers portant le nom "My-**tExt**-Board-1" et "My-**Terminat**ing-Board-2"

## Recherche avancée

Cette fonction est disponible en cliquant sur le lien suivant :<br/>**&gt; Recherche avancée**

### Recherche d'attributs

La recherche avancée permet d'effectuer une recherche par attributs d'objets :

- **Nom de l'agent** renvoie les calendriers des Workflows qui incluent les travaux exécutés avec l'agent spécifié.
- **Count Jobs** renvoie les calendriers des Workflows qui utilisent le nombre minimum de Jobs spécifié avec le terme **From**. S'il est utilisé avec le terme **To**, il renvoie les Workflows qui incluent un nombre de travaux compris entre *From* et *To*. Si le terme *To* est utilisé seul, les Workflows qui ne comprennent pas un nombre de travaux supérieur au terme *To* seront renvoyés.
- **Nom du poste** renvoie les calendriers des Workflows qui comprennent des postes correspondant au nom donné. Si vous utilisez la case à cocher *Correspondance exacte* pour **Nom de l'emploi**, le terme de recherche saisi doit correspondre entièrement au nom de l'emploi, en tenant compte des majuscules et des minuscules.

### Recherche de dépendance

Le méta-caractère de recherche **\*** est utilisé pour spécifier que les dépendances sont recherchées, par exemple vers un verrou de ressource quel que soit le nom qu'il utilise :

- **\*** Le méta-caractère de **Verrouillage des ressources** renverra les calendriers des Workflows utilisant un verrouillage des ressources,
- **\*** Le métacaractère **Resource Locks** renverra les calendriers des Workflows utilisant un Resource Lock, et le métacaractère **File Ordre Sources** renverra les calendriers des Workflows référencés par un File Ordre Source.

## Références

- [Configuration - Inventory - Calendars](/configuration-inventory-calendars)
- [Resources - Calendars](/resources-calendars)
- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)

