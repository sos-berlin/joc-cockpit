# Configuration - Inventaire - Sources d'Ordres de Fichiers

La vue des *Sources d'Ordres de Fichiers* permet de spécifier des sources pour [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching) avec des Workflows :

- Un répertoire est surveillé par un Agent pour les fichiers entrants.
- Pour chaque fichier entrant, un Ordre est créé qui représente le fichier. 
  - Si le fichier est déplacé ou supprimé par une tâche avant la fin du Workflow, l'Ordre continuera le Workflow et le quittera à la fin.
  - Si le fichier reste en place à la fin du Workflow, l'Ordre restera disponible avec l'état *complété*. Pour que l'Ordre quitte le Workflow, le fichier entrant doit être déplacé ou supprimé.
- Les Ordres contiennent la variable *file* qui contient le chemin d'accès au fichier entrant. La variable *file* doit être déclarée par le Workflow et peut être utilisée par les Jobs.

Les Sources d'Ordres de Fichiers se voient attribuer un Workflow auquel elles ajouteront un Ordre par fichier entrant.

Les Sources d'Ordres de Fichiers sont gérées à partir des vues suivants :

- La page [Configuration - Inventaire - Navigation](/configuration-inventory-navigation), sur le côté gauche de la fenêtre, permet de naviguer dans les dossiers contenant les Sources d'Ordres de Fichiers. En outre, cette vue permet d'effectuer des opérations sur les Sources d'Ordres de Fichiers.
- La vue des *Sources d'Ordres de Fichiers* sur le côté droit de la fenêtre contient les détails de la configuration des Sources d'Ordres de Fichiers.

## Vue des Sources d'Ordres de Fichiers

Pour une Source d'Ordre de Fichiers, les entrées suivantes sont disponibles :

- **Nom** est l'identifiant unique d'une source de commande de fichiers, voir [Règles de Dénomination des Objets](/object-naming-rules).
- **Titre** contient une explication facultative de l'objectif de la source de commande de fichiers.
- **Tag** permet de spécifier un certain nombre de Tags qui seront assignés aux Ordres créés pour les fichiers entrants.
- **Nom du Workflow** spécifie le nom d'un Workflow auquel les Ordres seront ajoutés pour les fichiers entrants.
- **Agent** spécifie l'Agent qui surveillera le répertoire entrant.  Si un Cluster d'Agents est utilisé, la surveillance des fichiers est effectuée par les Agents Director pour des raisons de haute disponibilité : en cas de commutation ou de basculement, l'Agent Directeur en attente se verra attribuer le rôle actif de surveillance des répertoires.
- **Répertoire** spécifie le répertoire qui est surveillé pour les fichiers entrants. Le compte d'exécution de l'Agent doit être autorisé à lire et à écrire (déplacer, supprimer) les fichiers entrants dans le *répertoire*.
- **Pattern** spécifie une [expression régulière] Java (https://en.wikipedia.org/wiki/Regular_expression) qui doit correspondre aux noms des fichiers entrants. Les expressions régulières diffèrent de l'utilisation de caractères génériques. Par exemple, 
  - **.\*** correspond à n'importe quel nom de fichier,
  - **.\*\.csv$** correspond aux noms de fichiers portant l'extension .csv.
- **Fuseau horaire** spécifie le fuseau horaire applicable pour affecter les Ordres des fichiers entrants à la date du Plan Quotidien correspondante, voir [Plan Quotidien](/daily-plan). Les identifiants de fuseaux horaires sont acceptés comme *UTC*, *Europe/London*, etc. Pour une liste complète des identifiants de fuseaux horaires, voir [Liste des fuseaux horaires de la base de données tz] (https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).
- **Délai** spécifie le nombre de secondes pendant lesquelles l'Agent attendra jusqu'à ce que le fichier entrant soit considéré comme stable.
  - Sous Unix, les fichiers peuvent être écrits en même temps que l'Agent les lit. Cela ne s'applique pas aux environnements Windows qui, par défaut, ne permettent pas de lire et d'écrire des fichiers en même temps.
  - Dans un premier temps, l'Agent vérifie la taille du fichier et l'heure de modification. Dans un deuxième temps, l'Agent attendra le *délai* et répétera la vérification. Si la taille du fichier et l'horodatage de la modification sont inchangés, l'Agent créera l'Ordre et, dans le cas contraire, répétera la deuxième étape.
- **Priorité**
  - Si un Ordre rencontre une *instruction *Lock* dans le Workflow qui limite le parallélisme, alors sa *Priorité* détermine la position dans la file d'attente des Ordres en *attente*.
  - les *priorités* sont spécifiées à partir d'entiers négatifs, nuls et positifs ou à partir des raccourcis proposés. Une *priorité* plus élevée est prioritaire. Les raccourcis offrent les valeurs suivantes :
    - **Basse** : -20000
    - **Inférieur à la normale** : -10000
    - **Normal** : 0
    - **Au-dessus de la normale** : 10000
    - **Haut** : 20000

### Opérations sur les Sources d'Ordres de Fichiers

Pour les opérations disponibles, voir [Configuration - Inventaire - Navigation](/configuration-inventory-navigation).

## Références

### Aide contextuelle

- [Configuration - Inventaire - Navigation](/configuration-inventory-navigation)
- [Plan Quotidien](/daily-plan)
- [Règles de Dénomination des Objets](/object-naming-rules)

### Product Knowledge Base

- [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching)
- [Expression régulière] (https://en.wikipedia.org/wiki/Regular_expression)
- [Liste des fuseaux horaires de la base de données tz](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
