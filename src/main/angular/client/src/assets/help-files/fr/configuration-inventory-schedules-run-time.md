# Configuration - Inventaire - Plannifications - Exécution

Le panneau *Plannification* permet de spécifier des règles pour la création d'Ordres à partir du site [Daily Plan](/daily-plan).

Le bouton *Temps d'exécution* permet de spécifier les heures de début des Ordres à partir d'une fenêtre contextuelle : un calendrier est d'abord attribué, puis des périodes sont spécifiées et, en option, des restrictions s'appliquent.

## Fuseau horaire

Les heures d'exécution sont spécifiées à partir d'un **fuseau horaire** qui est alimenté par le site [Profile - Preferences](/profile-preferences) de l'utilisateur. Les identifiants de fuseaux horaires sont acceptés comme *UTC*, *Europe/Londres*, etc. Pour une liste complète des identificateurs de fuseaux horaires, voir [Liste des fuseaux horaires de la base de données tz] (https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

- Les heures de début des Ordres sont considérées dans le fuseau horaire spécifié.
- Il est possible d'utiliser un fuseau horaire différent de celui de [Settings - Daily Plan](/settings-daily-plan) et pour les heures d'exécution des Ordres. Les utilisateurs doivent tenir compte du fait que 
  - Les Ordres se voient attribuer une date de Plan Quotidien.
  - Les heures de début sont calculées à partir du fuseau horaire de la Plannification.
- Par conséquent, le Plan Quotidien peut contenir des Ordres pour une date donnée qui se chevauchent avec un jour précédent ou ultérieur. Par exemple,
  - supposez que le fuseau horaire du Plan Quotidien est UTC,
  - supposons que le fuseau horaire de la Plannification soit Asia/Calcutta (UTC+05:30) et que l'heure de début soit *23:00*,
  - si un Ordre est créé pour le Plan Quotidien de mardi, il indiquera une heure de début pour mercredi *04:30* UTC. Le résultat est correct mais peut être considéré comme déroutant par les utilisateurs qui sont perdus dans les fuseaux horaires.

Ce qui est le plus surprenant pour certains utilisateurs, c'est qu'un jour ne dure pas 24 heures, mais peut s'étendre jusqu'à 50 heures. La durée d'un jour est toujours de 24 heures car elle dépend de la rotation de la terre. Cependant, pour un fuseau horaire donné, il y a une couverture de 50 heures pour inclure toutes les heures possibles autour de la planète.

## Calendrier

Il convient tout d'abord d'attribuer un calendrier :

- **Working Day Calendar** est disponible à partir d'un bouton portant le même nom et spécifie les jours pour lesquels les Ordres doivent être créés. En cas d'utilisation répétée, il ajoutera des entrées d'exécution avec des périodes par calendrier de jours ouvrables.
- **Le calendrier des jours non ouvrables** est disponible à partir d'un bouton portant le même nom et permet de spécifier les jours pour lesquels aucun Ordre ne doit être créé. Vous pouvez ajouter autant de calendriers de jours non ouvrables que vous le souhaitez et ils seront fusionnés.

## Périodes

Ensuite, il convient de spécifier une ou plusieurs périodes pour les heures de début. L'entrée *Intervalle de répétition* offre les options suivantes :

- **Début unique** est un point unique dans le temps.
  - **L'heure de début** est spécifiée à l'aide de la syntaxe *HH:MM:SS*.
  - l'option **Jour férié** indique ce qui doit se passer si une période correspond à un jour indiqué par un calendrier de jours fériés.
    - **supprimer l'exécution** est le comportement par défaut pour ne pas créer un Ordre.
    - **ignore non-working day** est le comportement par défaut pour ne pas créer d'Ordres.
    - **avant le jour non ouvrable** ajoute un Ordre au prochain jour ouvrable précédant le jour non ouvrable. Par exemple, un calendrier de jours ouvrables spécifie du lundi au jeudi :
      - Un calendrier des jours ouvrables spécifie les jours ouvrables du lundi au jeudi. 
      - Un calendrier de jours non ouvrables indique qu'un lundi spécifique de l'année est un jour non ouvrable.
      - Le jour précédant le jour chômé sera le dimanche précédent. Si les week-ends sont exclus et ajoutés au calendrier des jours non ouvrables, le jour résultant sera le vendredi précédent.
    - **après le jour férié** ajoute un Ordre au jour ouvrable suivant le jour férié. Par exemple :
      - Un calendrier de jours ouvrables indique mar-ven pour les jours ouvrables. 
      - Un calendrier de jours non ouvrables indique un vendredi spécifique de l'année comme jour non ouvrable.
      - Le jour suivant le jour chômé sera le samedi suivant. Si les week-ends sont exclus et ajoutés au calendrier des jours non ouvrables, le jour suivant sera le lundi suivant.        
- **Répétition** spécifie une période répétée pour les Ordres cycliques. La syntaxe suivante est utilisée pour la saisie : *HH:MM:SS*.
  - **L'heure de répétition** est l'intervalle entre les cycles, par exemple *02:00* pour les cycles de 2 heures.
  - **Début** est l'heure de début du premier cycle, par exemple *06:00* pour 6 heures du matin.
  - **Fin** est l'heure de fin du dernier cycle, par exemple *22:00* pour 22 heures.
  - **Jour férié** spécifie ce qui doit se passer si une période correspond à un jour indiqué par un calendrier de jour férié. La configuration est la même que pour les périodes *Début unique*.

## Restrictions

*Les restrictions* sont utilisées pour limiter les jours pour lesquels des Ordres seront créés :

- Les calendriers des jours ouvrables et des jours non ouvrables attribués sont fusionnés pour obtenir des jours pour l'exécution du Workflow par les Ordres.
- Les restrictions appliquent et maintiennent des règles similaires à [Configuration - Inventory - Calendars](/configuration-inventory-calendars):
  - **Jours de semaine** spécifiez le jour de la semaine.
  - **Les jours de la semaine** spécifient les jours de la semaine relatifs tels que le premier ou le dernier lundi d'un mois.
  - **Les jours spécifiques** indiquent les jours de l'année.
  - **Les jours du mois** indiquent les jours relatifs d'un mois, par exemple le premier ou le dernier jour du mois.
  - **Chaque** spécifie des périodes récurrentes, par exemple tous les 2 jours, toutes les 1ères semaines, tous les 3 mois. Pour ce faire, vous devez spécifier la date *Début de validité* à partir de laquelle les jours seront comptés.
  - **Jours fériés nationaux** spécifie les jours fériés connus. Les jours résultants ne font pas autorité et peuvent différer de la législation locale.
  - **Calendriers des jours chômés** exclut les jours concernés des calendriers des jours chômés pour le calendrier en cours.

*Les restrictions* permettent de limiter le nombre de calendriers utilisés. Au lieu de créer des calendriers individuels pour des règles spécifiques telles que le premier jour du mois, les utilisateurs peuvent appliquer un calendrier standard couvrant tous les jours de l'année et appliquer la *restriction* souhaitée.

L'utilisation des calendriers des jours non ouvrables est différente selon qu'il s'agit d'un *temps d'exécution* ou d'une *restriction* :

- Exemple :
  - Supposez un calendrier de jours ouvrables du lundi au vendredi.
  - Supposez une *Restriction* de Plannification pour le *4 du mois*.
  - Les jours résultants sont calculés à partir du calendrier des jours ouvrables et du quatrième jour de la liste des jours résultants.
- Les planifications peuvent également contenir des références à des calendriers de jours non ouvrables.
  - Les calendriers des jours non ouvrables sont appliqués *après* le calcul de la *restriction* de chaque Plannification.
  - Si les utilisateurs souhaitent exclure certains jours non ouvrables du calendrier *avant* d'appliquer la *restriction* du *4e jour du mois*, ils ont la possibilité de
    - de spécifier des jours non ouvrables dans les *fréquences exclues* du calendrier des jours ouvrables.
    - pour spécifier les jours des calendriers des jours non ouvrables auxquels s'ajoute la *restriction*

## Ordres cycliques vs. Workflow cycliques

Les utilisateurs doivent tenir compte des implications des Ordres cycliques : ils créent des instances d'Ordre individuelles par cycle. Pour remplacer les Ordres cycliques créés par des Plannifications utilisant des intervalles de répétition, le site [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction) est disponible pour les Workflows cycliques.

- Exécution
  - Une *Instruction de cycle* générant un Workflow complet est équivalente à l'utilisation d'Ordres cycliques à partir d'une Plannification.
  - Une *Instruction de cycle* peut être utilisée pour exécuter des parties d'un Workflow par cycles.
- Efficacité
  - Les planifications créent un certain nombre d'instances d'Ordres pour chaque période d'un Ordre cyclique. L'exécution d'un seul Workflow toutes les 30 secondes permet d'obtenir 2880 Ordres par jour.
  - les *Instructions de cycle* entraînent l'exécution cyclique d'un Workflow à partir d'un seul Ordre.
  - Le traitement de Workflows cycliques est de loin plus efficace que le traitement d'Ordres cycliques.
- Gestion des erreurs
  - Échec
    - Si une tâche d'un Workflow échoue, cela se produira individuellement pour chaque instance d'un Ordre cyclique.
    - Si une tâche d'une *instruction de cycle* échoue, en fonction de la gestion des erreurs en place, tous les cycles qui se produiraient alors qu'un Ordre est dans un état *défaillant* seront ignorés.
  - Notification
    - Une notification est créée pour chaque instance d'ordre défaillant d'un ordre cyclique.
    - Une notification est créée pour chaque Ordre d'un Workflow cyclique.
  - Intervention
    - Toutes les opérations effectuées sur les Ordres cycliques sont appliquées à toutes les instances d'Ordre incluses, par exemple, la reprise de l'exécution après un échec. Il en résulte une exécution parallèle d'Ordres dont l'exécution était précédemment planifiée par intervalles.
    - Pour les Workflows cycliques, un seul Ordre attend l'intervention de l'utilisateur.
- Journalisation
  - Pour chaque instance d'Ordre d'un Ordre cyclique, une entrée distincte est créée dans [Order History](/history-orders) et dans [Task History](/history-tasks).
  - Pour un Workflow cyclique, il existe une entrée unique dans l'Historique des Ordres qui est ajoutée à la sortie du journal de chaque cycle. Des entrées individuelles par exécution de tâche sont ajoutées à l'Historique des tâches.

## Références

### Aide contextuelle

- [Configuration - Inventory - Calendars](/configuration-inventory-calendars)
- [Configuration - Inventory - Schedules](/configuration-inventory-schedules)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Daily Plan Service](/service-daily-plan)
- [Object Naming Rules](/object-naming-rules)
- [Order History](/history-orders)
- [Profile - Preferences](/profile-preferences)
- [Settings - Daily Plan](/settings-daily-plan)
- [Task History](/history-tasks)

### Product Knowledge Base

- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
- [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
- [Liste des fuseaux horaires de la base de données tz](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

