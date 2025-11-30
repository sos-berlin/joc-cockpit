# Configuration - Inventaire - Plannifications

Le panneau *Plannification* permet de spécifier des règles pour la création d'Ordres à partir du site [Daily Plan](/daily-plan). Pour plus de détails, voir [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules).

- Les planifications déterminent le moment où les Ordres pour l'exécution du Workflow commenceront. Un ou plusieurs Workflows leur sont attribués et, en option, des variables utilisées par les Jobs dans les Workflows donnés.
  - les **dates de démarrage** sont spécifiées par [Configuration - Inventory - Calendars](/configuration-inventory-calendars) et limitent les jours d'exécution des Workflows.
  - les **Heures de démarrage** sont spécifiées par les Plannifications qui indiquent un ou plusieurs moments de la journée. Elles peuvent également limiter les jours d'exécution des Workflows.
- Les Plannifications créent des Ordres sur une base quotidienne
  - pour l'exécution ponctuelle des Workflows. Cela inclut les Workflows démarrant à un certain nombre d'heures par jour.
  - pour l'exécution cyclique de Workflows. Ceci spécifie l'exécution répétée des Workflows sur la base d'intervalles configurables.
- Les planifications sont appliquées par le site [Daily Plan](/daily-plan) afin de créer des Ordres pour les dates et heures résultantes.
  - Les planifications peuvent être appliquées manuellement à partir de la vue du Plan Quotidien.
  - Les planifications sont appliquées automatiquement par [Daily Plan Service](/service-daily-plan).

Les planifications sont gérées à partir des panneaux suivants :

- Le site [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation), situé sur le côté gauche de la fenêtre, permet de naviguer dans les dossiers contenant les planifications. En outre, ce panneau permet d'effectuer des opérations sur les planifications.
- Le *Panneau des planifications* sur le côté droit de la fenêtre contient les détails de la configuration de la Plannification.

## Panneau Plannification

Pour une Plannification, les entrées suivantes sont disponibles :

- **Name** est l'identifiant unique d'une Plannification, voir [Object Naming Rules](/object-naming-rules).
- **Titre** contient une explication facultative de l'objectif de la Plannification.
- **Noms des Workflows** contient la liste des Workflows qui doivent être lancés.
- **Planifier l'Ordre automatiquement** spécifie que la Plannification sera prise en compte par le [Daily Plan Service](/service-daily-plan).
- **Soumettre l'Ordre au Contrôleur lorsqu'il est planifié** spécifie que les Ordres seront soumis immédiatement à un Contrôleur lorsqu'ils sont planifiés. Sans cette option, le service Plan Quotidien soumettra des Ordres *planifiés* basés sur [Settings - Daily Plan](/settings-daily-plan).

### Paramétrage de l'ordre

- **Nom de l'Ordre** : Un nom optionnel qui peut être utilisé pour filtrer les Ordres dans un certain nombre de vues.
- **Nom de l'étiquette** : Il est possible de spécifier un nombre quelconque d'étiquettes qui seront ajoutées à l'Ordre. Les étiquettes de l'Ordre sont affichées dans un certain nombre de vues si elles sont spécifiées à partir de la page [Settings - JOC Cockpit](/settings-joc).
- **Ignorer les heures d'admission des travaux** : Les commandes peuvent être limitées à certains jours et/ou à certains créneaux horaires. Les ordres qui arrivent en dehors d'un créneau horaire doivent attendre le prochain créneau disponible. Cette option force les travaux à démarrer indépendamment de ces limitations.

### Position de l'Ordre

Si un Ordre ne doit pas démarrer à partir du premier nœud du Workflow, une position peut être spécifiée.

- **Position de blocage** : Pour les Workflows contenant des instructions de blocage telles que Try/Catch, ResourceLock, Fork/Join, l'instruction correspondante peut être sélectionnée.
- **Position de départ** : Si aucune *Position de départ* n'est spécifiée, l'Ordre commencera à partir du premier nœud.
  - Si aucune *position de blocage* n'est spécifiée, il est possible de sélectionner n'importe quelle instruction de niveau supérieur dans le Workflow à partir de laquelle l'Ordre commencera.
  - Si une *position de bloc* est spécifiée, la *position de départ* est un nœud de même niveau à l'intérieur du bloc.
- **Positions finales** :
  - Si aucune *position de bloc* n'est spécifiée, il est possible de sélectionner n'importe quelle instruction de niveau supérieur dans le Workflow avant laquelle l'Ordre se terminera.
  - Si une *position de bloc* est spécifiée, n'importe quel nœud de même niveau à l'intérieur du bloc peut être spécifié avant que l'Ordre ne se termine.
  - Il est possible de spécifier plus d'une *position finale*.
- **Priorité** :
  - Si l'Ordre doit répondre à une instruction de verrouillage des ressources dans le Workflow qui limite le parallélisme, sa *Priorité* détermine la position dans la file d'attente des Ordres en attente.
  - les *priorités* sont spécifiées à partir de nombres entiers négatifs, nuls et positifs ou à partir des raccourcis proposés. Une *priorité* plus élevée est prioritaire. Les raccourcis offrent les valeurs suivantes :
    - **Basse** : -20000
    - **Inférieur à la normale** : -10000
    - **Normal** : 0
    - **Au-dessus de la normale** : 10000
    - **Haut** : 20000

### Variables d'Ordre

Les variables d'Ordre sont spécifiées si un Workflow déclare des variables pour paramétrer l'exécution des Ordres :

- Les variables obligatoires sont déclarées par un Workflow sans valeur par défaut. Elles sont mises automatiquement à la disposition de la Plannification et doivent être associées à des valeurs connexes.
- Les variables optionnelles sont déclarées par un Workflow avec une valeur par défaut. Elles peuvent être appelées en utilisant les liens suivants :
  - **Modifier une variable** permet de sélectionner des variables spécifiques dans la liste des variables du Workflow. Les variables sont remplies à partir de leur valeur par défaut.
  - **Modifier les variables** permet d'ajouter des entrées pour toutes les variables de Workflow. Les variables sont remplies à partir de leur valeur par défaut.

L'attribution de valeurs aux variables comprend la spécification de chaînes de caractères et de nombres. Une chaîne vide peut être attribuée à partir de deux guillemets simples.

## Temps d'exécution

Le bouton *Heure d'exécution* permet de spécifier les heures de début des Ordres à partir d'une fenêtre contextuelle. Pour plus de détails, voir [Configuration - Inventory - Schedules - Run-time](/configuration-inventory-schedules-run-time).

## Opérations sur les planifications

Pour les opérations disponibles, voir [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

## Références

### Aide contextuelle

- [Configuration - Inventory - Calendars](/configuration-inventory-calendars)
- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Configuration - Inventory - Schedules - Run-time](/configuration-inventory-schedules-run-time)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Daily Plan Service](/service-daily-plan)
- [Object Naming Rules](/object-naming-rules)
- [Order History](/history-orders)
- [Profile - Preferences](/profile-preferences)
- [Settings - Daily Plan](/settings-daily-plan)
- [Task History](/history-tasks)

### Product Knowledge Base

- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
- [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
- [Liste des fuseaux horaires de la base de données tz](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

