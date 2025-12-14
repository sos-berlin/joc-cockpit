# Configuration - Inventaire - Planifications

La vue *Planification* permet de spécifier des règles pour la création d'Ordres à partir de la page [Plan Quotidien](/daily-plan). Pour plus de détails, voir [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules).

- Les Planifications déterminent le moment où les Ordres pour l'exécution du Workflow commenceront. Un ou plusieurs Workflows leur sont attribués et, en option, des variables utilisées par les tâches dans les Workflows donnés :
  - les **dates de démarrage** sont spécifiées par [Configuration - Inventaire - Calendriers](/configuration-inventory-calendars) et limitent les jours d'exécution des Workflows.
  - les **heures de démarrage** sont spécifiées par les Planifications qui indiquent un ou plusieurs moments de la journée. Elles peuvent également limiter les jours d'exécution des Workflows.
- Les Planifications créent des Ordres sur une base quotidienne
  - pour l'exécution ponctuelle des Workflows. Cela inclut les Workflows démarrant à un certain nombre d'heures par jour.
  - pour l'exécution cyclique de Workflows. Ceci spécifie l'exécution répétée des Workflows sur la base d'intervalles configurables.
- Les Planifications sont appliquées par le [Plan Quotidien](/daily-plan) afin de créer des Ordres pour les dates et heures résultantes.
  - Les Planifications peuvent être appliquées manuellement à partir de la vue du Plan Quotidien.
  - Les Planifications sont appliquées automatiquement par [Service du Plan Qutotidien](/service-daily-plan).

Les Planifications sont gérées à partir des panneaux suivants :

- La page [Configuration - Inventaire - Navigation](/configuration-inventory-navigation), situé sur le côté gauche de la fenêtre, permet de naviguer dans les dossiers contenant les Planifications. En outre, ce panneau permet d'effectuer des opérations sur les Planifications.
- La *vue des Planifications* sur le côté droit de la fenêtre contient les détails de la configuration de la Planification.

## Vue Planification

Pour une Planification, les entrées suivantes sont disponibles :

- **Nom** est l'identifiant unique d'une Planification, voir [Règles de Dénomination des Objets](/object-naming-rules).
- **Titre** contient une explication facultative de l'objectif de la Planification.
- **Noms des Workflows** contient la liste des Workflows qui doivent être lancés.
- **Planifier l'Ordre automatiquement** spécifie que la Planification sera prise en compte par le [Service du Plan Qutotidien](/service-daily-plan).
- **Soumettre l'Ordre au Contrôleur lorsqu'il est planifié** spécifie que les Ordres seront soumis immédiatement à un Contrôleur lorsqu'ils sont planifiés. Sans cette option, le service Plan Quotidien soumettra des Ordres *planifiés* basés sur [Réglages - Plan Quotidien](/settings-daily-plan).

### Paramétrage de l'Ordre

- **Nom de l'Ordre** : Un nom optionnel qui peut être utilisé pour filtrer les Ordres dans un certain nombre de vues.
- **Nom Tags** : Il est possible de spécifier un nombre quelconque de Tags qui seront ajoutées à l'Ordre. Les Tags de l'Ordre sont affichées dans un certain nombre de vues si elles sont spécifiées à partir de la page [Réglages - JOC Cockpit](/settings-joc).
- **Ignorer si la période d'heures d'admission  ne corrrespond pas à la date de l'Ordre** : Les commandes peuvent être limitées à certains jours et/ou à certains créneaux horaires. Les Ordres qui arrivent en dehors d'un créneau horaire doivent attendre le prochain créneau disponible. Cette option force les tâches à démarrer indépendamment de ces limitations.

### Position de l'Ordre

Si un Ordre ne doit pas démarrer à partir du premier nœud du Workflow, une position peut être spécifiée.

- **Position de Bloc** : Pour les Workflows contenant des instructions de bloc telles que Try/Catch, Lock, Fork/Join, l'instruction correspondante peut être sélectionnée.
- **Position de Départ avant Instruction** : Si aucune *Position de départ* n'est spécifiée, l'Ordre commencera à partir du premier nœud.
  - Si aucune *position de bloc* n'est spécifiée, il est possible de sélectionner n'importe quelle instruction de niveau supérieur dans le Workflow à partir de laquelle l'Ordre commencera.
  - Si une *position de bloc* est spécifiée, la *position de départ* est un nœud de même niveau à l'intérieur du bloc.
- **Positions de Fin avant Instructions** :
  - Si aucune *position de bloc* n'est spécifiée, il est possible de sélectionner n'importe quelle instruction de niveau supérieur dans le Workflow avant laquelle l'Ordre se terminera.
  - Si une *position de bloc* est spécifiée, n'importe quel nœud de même niveau à l'intérieur du bloc peut être spécifié avant que l'Ordre ne se termine.
  - Il est possible de spécifier plus d'une *position finale*.
- **Priorité** :
  - Si l'Ordre doit répondre à une *instruction Lock* dans le Workflow qui limite le parallélisme, sa *Priorité* détermine la position dans la file d'attente des Ordres en attente.
  - les *Priorités* sont spécifiées à partir de nombres entiers négatifs, nuls et positifs ou à partir des raccourcis proposés. Une *Priorité* plus élevée est prioritaire. Les raccourcis offrent les valeurs suivantes :
    - **Basse** : -20000
    - **Inférieur à la normale** : -10000
    - **Normal** : 0
    - **Au-dessus de la normale** : 10000
    - **Haut** : 20000

### Variables d'Ordre

Les variables d'Ordre sont spécifiées si un Workflow déclare des variables pour paramétrer l'exécution des Ordres :

- Les variables obligatoires sont déclarées par un Workflow sans valeur par défaut. Elles sont mises automatiquement à la disposition de la Planification et doivent être associées à des valeurs connexes.
- Les variables optionnelles sont déclarées par un Workflow avec une valeur par défaut. Elles peuvent être appelées en utilisant les liens suivants :
  - **Modifier une variable** permet de sélectionner des variables spécifiques dans la liste des variables du Workflow. Les variables sont remplies à partir de leur valeur par défaut.
  - **Modifier les variables** permet d'ajouter des entrées pour toutes les variables de Workflow. Les variables sont remplies à partir de leur valeur par défaut.

L'attribution de valeurs aux variables comprend la spécification de chaînes de caractères et de nombres. Une chaîne vide peut être attribuée à partir de deux guillemets simples.

## Temps d'exécution

Le bouton *Temps d'exécution* permet de spécifier les heures de début des Ordres à partir d'une fenêtre contextuelle. Pour plus de détails, voir [Configuration - Inventaire - Plannifications - Temps d'Execution](/configuration-inventory-schedules-run-time).

## Opérations sur les Planifications

Pour les opérations disponibles, voir [Configuration - Inventaire - Navigation](/configuration-inventory-navigation).

## Références

### Aide contextuelle

- [Configuration - Inventaire - Calendriers](/configuration-inventory-calendars)
- [Configuration - Inventaire - Navigation](/configuration-inventory-navigation)
- [Configuration - Inventaire - Plannifications - Temps d'Execution](/configuration-inventory-schedules-run-time)
- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
- [Historique des Ordres](/history-orders)
- [Historique des Tâches](/history-tasks)
- [Plan Quotidien](/daily-plan)
- [Profil - Préférences](/profile-preferences)
- [Réglages - Plan Quotidien](/settings-daily-plan)
- [Règles de Dénomination des Objets](/object-naming-rules)
- [Service du Plan Qutotidien](/service-daily-plan)

### Product Knowledge Base

- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
- [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
- [Liste des fuseaux horaires de la base de données tz](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
