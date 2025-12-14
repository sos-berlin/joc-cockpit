# Ajouter des Ordres aux Workflow

Les Ordres peuvent être ajoutés à la demande et seront exécutés indépendamment du Plan Quotidien.

Les utilisateurs qui sont satisfaits des valeurs par défaut et qui souhaitent soumettre un Ordre pour une exécution immédiate n'auront pas besoin d'ajouter d'autres données. 

### Attributs de l'Ordre

- **Nom de l'Ordre** : Un nom optionnel qui peut être utilisé pour filtrer les Ordres dans un certain nombre de vues.
- **Tag** : Vous pouvez spécifier un nombre quelconque Tag qui seront ajoutées à l'Ordre. Les Tags sont affichées dans un certain nombre de vues si elles sont spécifiées sur la page [Réglages - JOC Cockpit](/settings-joc).
- **Ignorer les heures d'Admission** : Les tâches peuvent être limités à certains jours et/ou à certains créneaux horaires. Les Ordres qui arrivent en dehors d'un créneau horaire doivent attendre le prochain créneau disponible. Cette option force les tâches à démarrer indépendamment de ces limitations.

### Heure de démarrage

- **Maintenant** : L'Ordre commencera immédiatement.
- **Date spécifique** : L'Ordre commencera à la date et à l'heure spécifiées.
- **Par rapport à l'heure actuelle** : L'Ordre commencera avec un décalage de heures, minutes, secondes par rapport à l'heure actuelle. Exemples :
  - **30s** : 30 secondes plus tard
  - **15m** : 15 minutes plus tard
  - **1h** : 1 heure plus tard
  - **1h 15m 30s** ou **01:15:30** : 1 heure, 15 minutes et 30 secondes plus tard
- **Sans démarrage** : L'Ordre ne démarrera pas mais sera disponible à partir de l'état *à venir* et une heure de démarrage pourra lui être attribuée ultérieurement.

### Dépendances de l'Ordre

- **Clé d'Espace Annonce** : Si le Workflow contient des dépendances basées sur des Annonces, il est possible de spécifier une date du Plan Quotidien à laquelle les dépendances seront résolues. Par défaut, le jour en cours est utilisé.
  - les dates passées pour lesquelles un plan est ouvert sont acceptées.
  - les dates futures sont acceptées.

### Position de l'Ordre

Si un Ordre ne doit pas commencer au premier nœud du Workflow, une position peut être spécifiée.

- **Position de Bloc** : Pour les Workflows contenant des instructions de bloc telles que Try/Catch, Lock, Fork/Join, l'instruction correspondante peut être sélectionnée.
- **Position de Départ** : Si aucune position de départ n'est spécifiée, l'Ordre commencera à partir du premier nœud.
  - Si aucune position de blocage n'est spécifiée, il est possible de sélectionner n'importe quelle instruction de niveau supérieur dans le Workflow à partir de laquelle l'Ordre commencera.
  - Si une position de bloc est spécifiée, la position de départ est un nœud de même niveau à l'intérieur du bloc.
- **Positions de Fin** :
  - Si aucune position de bloc n'est spécifiée, il est possible de sélectionner n'importe quelle instruction de niveau supérieur dans le Workflow avant laquelle l'Ordre se terminera.
  - Si une position de bloc est spécifiée, n'importe quel nœud de même niveau à l'intérieur du bloc peut être spécifié avant lequel l'Ordre se terminera.
  - Il est possible de spécifier plusieurs positions de fin.
- **Priorité** :
  - Si l'Ordre doit répondre à une *instruction Lock* des Ressources dans le Workflow qui limite le parallélisme, sa *Priorité* détermine la position dans la file d'attente des Ordres en attente.
  - les *Priorités* sont spécifiées à partir de nombres entiers négatifs, nuls et positifs ou à partir des raccourcis proposés. Une *Priorité* plus élevée est prioritaire. Les raccourcis offrent les valeurs suivantes :
    - **Basse** : -20000
    - **Inférieur à la normale** : -10000
    - **Normal** : 0
    - **Au-dessus de la normale** : 10000
    - **Haut** : 20000

### Paramétrage de l'Ordre

- **Paramétrage à partir d'une Planification** : Si le Workflow est assigné à une Planification, cette option peut être sélectionnée pour copier son paramétrage, tel que les variables et les Tags, dans l'Ordre actuel.
- **Modifier la variable** : 
  - Si le Workflow spécifie des variables sans valeurs par défaut, l'Ordre actuel doit spécifier les valeurs correspondantes.
  - Si le Workflow spécifie des variables avec des valeurs par défaut, alors le lien permet de sélectionner une variable pour laquelle une nouvelle valeur doit être spécifiée.
- **Modifier les variables** : Se comporte de manière similaire à *Modifier une variable* mais affiche toutes les variables disponibles.

### Ordres supplémentaires

- **Ajouter un Ordre** : Si plusieurs Ordres doivent être ajoutés au Workflow, alors le lien ajoutera le paramétrage pour l'Ordre supplémentaire.
- **Ajouter des Ordres à partir de Planifications** : si le Workflow est assigné à une ou plusieurs Planifications, alors pour chaque Planification un Ordre paramétré à partir d'une Planification sera ajouté.

## Références

- [Réglages - JOC Cockpit](/settings-joc)
- [Workflows](/workflows)
- [JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows)
