# Configuration - Inventaire - Calendriers

Le panneau *Calendrier* permet de spécifier des calendriers basés sur des règles qui sont utilisés par [Configuration - Inventory - Schedules](/configuration-inventory-schedules) pour créer des Ordres à partir du site [Daily Plan](/daily-plan). Pour plus de détails, voir [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars).

- Les calendriers spécifient les jours pour lesquels les Workflows seront exécutés.
  - **Les calendriers des jours ouvrables** spécifient les jours d'exécution des Workflows.
  - **Les calendriers des jours non ouvrables** indiquent les jours pour lesquels les Workflows ne seront pas exécutés.
- Les planifications 
  - contiennent des références à un nombre quelconque de calendriers de jours ouvrables et de calendriers de jours non ouvrables qui sont fusionnés pour recevoir la liste des jours résultants.
  - déterminent le moment où les Ordres d'exécution des Workflows commenceront. 

Les calendriers sont gérés à partir des panneaux suivants :

- Le site [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation), sur le côté gauche de la fenêtre, permet de naviguer dans les dossiers contenant les calendriers. En outre, ce panneau permet d'effectuer des opérations sur les calendriers.
- Le *Panneau des calendriers* sur le côté droit de la fenêtre contient les détails de la configuration des calendriers.

## Panneau Calendrier

Pour un calendrier, les entrées suivantes sont disponibles :

- **Nom** est l'identifiant unique d'un calendrier, voir [Object Naming Rules](/object-naming-rules).
- **Titre** contient une explication facultative de l'objectif du calendrier.
- **Type** : calendrier des jours ouvrables ou calendrier des jours non ouvrables.
- **Valide du**, **Valide au** spécifient facultativement la période de validité d'un calendrier. Avant et après la période de validité, un calendrier ne renverra pas de jours résultants. Si aucune période de validité n'est spécifiée, le calendrier sera valable pour une période illimitée.

### Fréquences

Les fréquences se présentent sous deux formes qui peuvent être combinées :

- les **fréquences incluses** spécifient les jours positifs.
- les **fréquences exclues** spécifient les jours qui seront retirés de la liste des jours résultants.

Les *fréquences exclues* ont pour effet de refuser l'utilisation des dates spécifiées et d'annuler les *fréquences incluses* pour les jours correspondants.

Prenons l'exemple d'un calendrier des jours ouvrables :

- Supposez une *fréquence incluse* du lundi au vendredi.
- Supposez une *fréquence exclue* pour les jours fériés nationaux tels que le 1er janvier ou le 1er mai.
- Lorsqu'il est utilisé avec des Plannifications spécifiant la propriété **On Non-working Day** avec la valeur
  - **avant le jour férié** 
    - si le 1er janvier est un lundi, l'Ordre sera créé pour le dimanche précédent qui ne fait pas partie des *Fréquences incluses* et ne fait pas partie des *Fréquences exclues*. 
    - si le 1er janvier est un samedi, aucun Ordre ne sera créé car le jour férié précédent est le vendredi pour lequel un Ordre est créé à partir des *fréquences incluses*.
  - **après un jour non ouvrable**
    - si le 1er janvier est un samedi, l'Ordre sera créé pour le dimanche suivant qui ne fait pas partie des *fréquences incluses* et qui ne fait pas partie des *fréquences exclues*. 
    - si le 1er janvier est un dimanche, aucun Ordre ne sera créé car le prochain jour non ouvrable est le lundi pour lequel un Ordre est créé à partir des *fréquences incluses*.

Les règles correspondantes s'appliquent aux calendriers des jours non ouvrables : *Les fréquences incluses* précisent les jours non ouvrables, les fréquences exclues* précisent les jours ouvrables.

Un calendrier peut contenir un nombre quelconque de *fréquences* qui seront fusionnées. Le bouton *Ajouter une fréquence* est proposé pour chacune des *Fréquences incluses* et des *Fréquences exclues*.

#### Types de fréquences

Lors de l'ajout de *fréquences*, un certain nombre de types peuvent être sélectionnés :

  - **Jours de semaine** spécifie le jour de la semaine.
  - **Jours de semaine spécifiques** spécifient les jours de semaine relatifs tels que le premier ou le dernier lundi d'un mois.
  - **Jours spécifiques** spécifient les jours de l'année.
  - **Les jours du mois** indiquent les jours relatifs d'un mois, par exemple le premier ou le dernier jour du mois.
  - **Chaque** spécifie des périodes récurrentes, par exemple tous les 2 jours, toutes les 1ères semaines, tous les 3 mois. Pour ce faire, vous devez spécifier la date *Début de validité* à partir de laquelle les jours seront comptés.
  - **Jours fériés nationaux** spécifie les jours fériés connus. Les jours résultants ne font pas autorité et peuvent différer de la législation locale.
  - **Calendriers des jours chômés** exclut les jours concernés des calendriers des jours chômés pour le calendrier en cours.

*Les *Types de fréquence* peuvent être combinés en appliquant de manière répétée le même *Type de fréquence* ou un *Type de fréquence* différent.

#### Exemple

Prenons l'exemple d'un calendrier qui doit être affiché tous les deux jours ouvrables :

- Supposez que les jours ouvrables sont du lundi au vendredi et que les jours non ouvrables sont du samedi au dimanche.
- Supposez des jours fériés nationaux pour le 1er janvier et le 1er mai.

Le comptage d'un jour ouvrable sur deux doit exclure les week-ends et les jours fériés :

- Créez un calendrier des jours ouvrables en utilisant
  - *Fréquences incluses* : Ajoutez le *Type de fréquence **Jours ouvrables** et sélectionnez *Tous les jours*. Le résultat contiendra tous les jours de l'année.
  - en utilisant les *Fréquences exclues* : ajoutez le *Type de fréquence **Tous les jours** et sélectionnez *Chaque jour* : Ajoutez le **Tous** *Type de fréquence* et sélectionnez *2* pour l'intervalle et *Jours* pour l'unité. Spécifiez la date *Début de validité*. Les jours obtenus sont divisés par deux.
  - *Fréquences exclues* : Ajoutez le *Type de fréquence **Fêtes nationales** et sélectionnez votre *Pays* et votre *Année*. Cela permet de limiter davantage le nombre de jours obtenus.

Vérifiez les résultats à partir du bouton *Afficher l'aperçu* qui devrait vous donner un jour ouvrable sur deux, à l'exclusion des week-ends et des jours fériés.

Une autre solution consiste à spécifier le *Type de fréquence **Tous** à partir de la *Restriction* d'une Plannification.

## Opérations sur les calendriers

Pour les opérations disponibles, voir [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

## Références

### Aide contextuelle

- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Configuration - Inventory - Schedules - Run-time](/configuration-inventory-schedules-run-time)
- [Daily Plan](/daily-plan)
- [Object Naming Rules](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)

