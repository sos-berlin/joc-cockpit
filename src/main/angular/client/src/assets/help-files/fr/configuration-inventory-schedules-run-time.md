# Configuration - Inventaire - Planifications - Temps d'Exécution

La vue *Planification* permet de spécifier des règles pour la création d'Ordres à partir de la page [Plan Quotidien](/daily-plan).

Le bouton *Temps d'exécution* permet de spécifier les heures de démarrage des Ordres à partir d'une fenêtre contextuelle : un Calendrier est d'abord attribué, puis des périodes sont spécifiées et, en option, des restrictions s'appliquent.

## Fuseau horaire

Les heures d'exécution sont spécifiées à partir d'un **fuseau horaire** qui est alimenté par la page [Profil - Préférences](/profile-preferences) de l'utilisateur. Les identifiants de fuseaux horaires sont acceptés comme *UTC*, *Europe/London*, etc. Pour une liste complète des identificateurs de fuseaux horaires, voir [Liste des fuseaux horaires de la base de données tz] (https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

- Les heures de début des Ordres sont considérées dans le fuseau horaire spécifié.
- Il est possible d'utiliser un fuseau horaire différent de celui de [Réglages - Plan Quotidien](/settings-daily-plan) et pour les heures d'exécution des Ordres. Les utilisateurs doivent tenir compte du fait que 
  - Les Ordres se voient attribuer une date de Plan Quotidien.
  - Les heures de début sont calculées à partir du fuseau horaire de la Planification.
- Par conséquent, le Plan Quotidien peut contenir des Ordres pour une date donnée qui se chevauchent avec un jour précédent ou ultérieur. Par exemple,
  - supposez que le fuseau horaire du Plan Quotidien est UTC,
  - supposons que le fuseau horaire de la Planification soit Asia/Calcutta (UTC+05:30) et que l'heure de démarrage soit *23:00*,
  - si un Ordre est créé pour le Plan Quotidien de mardi, il indiquera une heure de début pour mercredi *04:30* UTC. Le résultat est correct mais peut être considéré comme déroutant par les utilisateurs qui sont perdus dans les fuseaux horaires.

Ce qui est le plus surprenant pour certains utilisateurs, c'est qu'un jour ne dure pas 24 heures, mais peut s'étendre jusqu'à 50 heures. La durée d'un jour est toujours de 24 heures car elle dépend de la rotation de la terre. Cependant, pour un fuseau horaire donné, il y a une couverture de 50 heures pour inclure toutes les heures possibles autour de la planète.

## Calendrier

Il convient tout d'abord d'attribuer un Calendrier :

- **Calendrier des Jours ouvrés** est disponible à partir d'un bouton portant le même nom et spécifie les jours pour lesquels les Ordres doivent être créés. En cas d'utilisation répétée, il ajoutera des entrées d'exécution avec des périodes par Calendrier de jours ouvrés.
- **Calendrier des jours non ouvrés** est disponible à partir d'un bouton portant le même nom et permet de spécifier les jours pour lesquels aucun Ordre ne doit être créé. Vous pouvez ajouter autant de Calendriers de jours non ouvrés que vous le souhaitez et ils seront fusionnés.

## Périodes

Ensuite, il convient de spécifier une ou plusieurs périodes pour les heures de début. L'entrée *Intervalle de répétition* offre les options suivantes :

- **Single Start** est un point unique dans le temps.
  - **Heure de démarrage** est spécifiée à l'aide de la syntaxe *HH:MM:SS*.
  - l'option **Pendant les jours non ouvrés** indique ce qui doit se passer si une période correspond à un jour indiqué par un Calendrier de jours fériés.
    - **supprimer l'exécution** est le comportement par défaut pour ne pas créer un Ordre.
    - **ignore les jours non ouvrés** est le comportement par défaut pour ne pas créer d'Ordres.
    - **avant le jour non ouvré** ajoute un Ordre au prochain jour ouvraé précédant le jour non ouvré. Par exemple, un Calendrier de jours ouvrés spécifie du lundi au jeudi :
      - Un Calendrier des jours ouvrés spécifie les jours ouvrés du lundi au jeudi. 
      - Un Calendrier de jours non ouvrés indique qu'un lundi spécifique de l'année est un jour non ouvré.
      - Le jour précédant le jour chômé sera le dimanche précédent. Si les week-ends sont exclus et ajoutés au Calendrier des jours non ouvrés, le jour résultant sera le vendredi précédent.
    - **après le jour non ouvré** ajoute un Ordre au jour ouvré suivant le jour férié. Par exemple :
      - Un Calendrier de jours ouvrés indique mar-ven pour les jours ouvrés. 
      - Un Calendrier de jours non ouvrés indique un vendredi spécifique de l'année comme jour non ouvré.
      - Le jour suivant le jour chômé sera le samedi suivant. Si les week-ends sont exclus et ajoutés au Calendrier des jours non ouvrés, le jour suivant sera le lundi suivant.        
- **Répétition** spécifie une période répétée pour les Ordres cycliques. La syntaxe suivante est utilisée pour la saisie : *HH:MM:SS*.
  - **Temps de Répétition** est l'intervalle entre les cycles, par exemple *02:00* pour les cycles de 2 heures.
  - **Démarrage** est l'heure de début du premier cycle, par exemple *06:00* pour 6 heures du matin.
  - **Fin** est l'heure de fin du dernier cycle, par exemple *22:00* pour 22 heures.
  - **Pendant les jours non ouvrés** spécifie ce qui doit se passer si une période correspond à un jour indiqué par un Calendrier de jour férié. La configuration est la même que pour les périodes *Début unique*.

## Restrictions

Les *Restrictions* sont utilisées pour limiter les jours pour lesquels des Ordres seront créés :

- Les Calendriers des jours ouvrés et des jours non ouvrés attribués sont fusionnés pour obtenir des jours pour l'exécution du Workflow par les Ordres.
- Les restrictions appliquent et maintiennent des règles similaires à [Configuration - Inventaire - Calendriers](/configuration-inventory-calendars):
  - **Jours de semaine** spécifiez le jour de la semaine.
  - **Jours de semaine spécifiques** spécifient les jours de la semaine relatifs tels que le premier ou le dernier lundi d'un mois.
  - **Jours spécifiques** indiquent les jours de l'année.
  - **Mois Jours** indiquent les jours relatifs d'un mois, par exemple le premier ou le dernier jour du mois.
  - **Tous** spécifie des périodes récurrentes, par exemple tous les 2 jours, toutes les 1ères semaines, tous les 3 mois. Pour ce faire, vous devez spécifier la date *Début de validité* à partir de laquelle les jours seront comptés.
  - **Jours fériés ** spécifie les jours fériés connus. Les jours résultants ne font pas autorité et peuvent différer de la législation locale.
  - **Calendriers Jours non ouvrés** exclut les jours concernés des Calendriers des jours chômés pour le Calendrier en cours.

*Les restrictions* permettent de limiter le nombre de Calendriers utilisés. Au lieu de créer des Calendriers individuels pour des règles spécifiques telles que le premier jour du mois, les utilisateurs peuvent appliquer un Calendrier standard couvrant tous les jours de l'année et appliquer la *Restriction* souhaitée.

L'utilisation des Calendriers des jours non ouvrés est différente selon qu'il s'agit d'un *Temps d'exécution* ou d'une *Restriction* :

- Exemple :
  - Supposez un Calendrier de jours ouvrés du lundi au vendredi.
  - Supposez une *Restriction* de Planification pour le *4 du mois*.
  - Les jours résultants sont calculés à partir du Calendrier des jours ouvrés et du quatrième jour de la liste des jours résultants.
- Les Planifications peuvent également contenir des références à des Calendriers de jours non ouvrés.
  - Les Calendriers des jours non ouvrés sont appliqués *après* le calcul de la *Restriction* de chaque Planification.
  - Si les utilisateurs souhaitent exclure certains jours non ouvrés du Calendrier *avant* d'appliquer la *Restriction* du *4e jour du mois*, ils ont la possibilité
    - de spécifier des jours non ouvrés dans les *fréquences exclues* du Calendrier des jours ouvrés.
    - de spécifier les jours des Calendriers des jours non ouvrés auxquels s'ajoute la *restriction*

## Ordres cycliques vs. Workflow cycliques

Les utilisateurs doivent tenir compte des implications des Ordres cycliques : ils créent des instances d'Ordre individuelles par cycle. Pour remplacer les Ordres cycliques créés par des Planifications utilisant des intervalles de répétition, le site [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction) est disponible pour les Workflows cycliques.

- Exécution
  - Une *instruction Cycle* générant un Workflow complet est équivalente à l'utilisation d'Ordres cycliques à partir d'une Planification.
  - Une *instruction Cycle* peut être utilisée pour exécuter des parties d'un Workflow par cycles.
- Efficacité
  - Les Planifications créent un certain nombre d'instances d'Ordres pour chaque période d'un Ordre cyclique. L'exécution d'un seul Workflow toutes les 30 secondes permet d'obtenir 2880 Ordres par jour.
  - les *instructions Cycle* entraînent l'exécution cyclique d'un Workflow à partir d'un seul Ordre.
  - Le traitement de Workflows cycliques est de loin plus efficace que le traitement d'Ordres cycliques.
- Gestion des erreurs
  - Échec
    - Si une tâche d'un Workflow échoue, cela se produira individuellement pour chaque instance d'un Ordre cyclique.
    - Si une tâche d'une *instruction Cycle* échoue, en fonction de la gestion des erreurs en place, tous les cycles qui se produiraient alors qu'un Ordre est dans un état *échoué* seront ignorés.
  - Notification
    - Une notification est créée pour chaque instance d'Ordre *échoué* d'un Ordre cyclique.
    - Une notification est créée pour chaque Ordre d'un Workflow cyclique.
  - Intervention
    - Toutes les opérations effectuées sur les Ordres cycliques sont appliquées à toutes les instances d'Ordre incluses, par exemple, la reprise de l'exécution après un échec. Il en résulte une exécution parallèle d'Ordres dont l'exécution était précédemment planifiée par intervalles.
    - Pour les Workflows cycliques, un seul Ordre attend l'intervention de l'utilisateur.
- Journalisation
  - Pour chaque instance d'Ordre d'un Ordre cyclique, une entrée distincte est créée dans [Historique des Ordres](/history-orders) et dans [Historique des Tâches](/history-tasks).
  - Pour un Workflow cyclique, il existe une entrée unique dans l'Historique des Ordres qui est ajoutée à la sortie du journal de chaque cycle. Des entrées individuelles par exécution de tâche sont ajoutées à l'Historique des tâches.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Calendriers](/configuration-inventory-calendars)
- [Configuration - Inventaire - Planifications](/configuration-inventory-schedules)
- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
- [Historique des Ordres](/history-orders)
- [Historique des Tâches](/history-tasks)
- [Plan Quotidien](/daily-plan)
- [Profil - Préférences](/profile-preferences)
- [Réglages - Plan Quotidien](/settings-daily-plan)
- [Règles de Dénomination des Objets](/object-naming-rules)
- [Service du Plan Qutotidien](/service-daily-plan)

### Product Knowledge Base

- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
- [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
- [Liste des fuseaux horaires de la base de données tz](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
