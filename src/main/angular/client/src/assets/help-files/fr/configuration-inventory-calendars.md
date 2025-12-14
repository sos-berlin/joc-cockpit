# Configuration - Inventaire - Calendriers

La vue *Calendrier* permet de spécifier des Calendriers basés sur des règles qui sont utilisés par [Configuration - Inventaire - Planifications](/configuration-inventory-schedules) pour créer des Ordres à partir du [Plan Quotidien](/daily-plan). Pour plus de détails, voir [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars).

- Les Calendriers spécifient les jours pour lesquels les Workflows seront exécutés :
  - les **Calendriers des jours ouvrés** spécifient les jours d'exécution des Workflows.
  - les **Calendriers des jours non ouvrés** indiquent les jours pour lesquels les Workflows ne seront pas exécutés.
- Les Planifications 
  - contiennent des références à un nombre quelconque de Calendriers de jours ouvrés et de Calendriers de jours non ouvrés qui sont fusionnés pour recevoir la liste des jours résultants.
  - déterminent le moment où les Ordres d'exécution des Workflows commenceront. 

Les Calendriers sont gérés à partir des panneaux suivants :

- La vue [Configuration - Inventaire - Navigation](/configuration-inventory-navigation), sur le côté gauche de la fenêtre, permet de naviguer dans les dossiers contenant les Calendriers. En outre, ce panneau permet d'effectuer des opérations sur les Calendriers.
- La *vue des Calendriers* sur le côté droit de la fenêtre contient les détails de la configuration des Calendriers.

## Vue Calendrier

Pour un Calendrier, les entrées suivantes sont disponibles :

- **Nom** est l'identifiant unique d'un Calendrier, voir [Règles de Dénomination des Objets](/object-naming-rules).
- **Titre** contient une explication facultative de l'objectif du Calendrier.
- **Type** : Calendrier des jours ouvrés ou Calendrier des jours non ouvrés.
- **Valide du**, **Valide au** spécifient facultativement la période de validité d'un Calendrier. Avant et après la période de validité, un Calendrier ne renverra pas de jours résultants. Si aucune période de validité n'est spécifiée, le Calendrier sera valable pour une période illimitée.

### Fréquences

Les fréquences se présentent sous deux formes qui peuvent être combinées :

- les **Fréquences incluses** spécifient les jours à prendre en compte.
- les **Fréquences exclues** spécifient les jours qui seront retirés de la liste des jours résultants.

Les *fréquences exclues* ont pour effet de refuser l'utilisation des dates spécifiées et d'annuler les *fréquences incluses* pour les jours correspondants.

Prenons l'exemple d'un Calendrier des jours ouvrés :

- Supposez une *fréquence incluse* du lundi au vendredi.
- Supposez une *fréquence exclue* pour les jours fériés nationaux tels que le 1er janvier ou le 1er mai.
- Lorsqu'il est utilisé avec des Planifications spécifiant la propriété **Pendant les jours non ouvrés** avec la valeur
  - **avant un jour non ouvré** 
    - si le 1er janvier est un lundi, l'Ordre sera créé pour le dimanche précédent qui ne fait pas partie des *Fréquences incluses* et ne fait pas partie des *Fréquences exclues*. 
    - si le 1er janvier est un samedi, aucun Ordre ne sera créé car le jour férié précédent est le vendredi pour lequel un Ordre est créé à partir des *fréquences incluses*.
  - **après un jour non ouvré**
    - si le 1er janvier est un samedi, l'Ordre sera créé pour le dimanche suivant qui ne fait pas partie des *fréquences incluses* et qui ne fait pas partie des *fréquences exclues*. 
    - si le 1er janvier est un dimanche, aucun Ordre ne sera créé car le prochain jour non ouvré est le lundi pour lequel un Ordre est créé à partir des *fréquences incluses*.

Les règles correspondantes s'appliquent aux Calendriers des jours non ouvrés : *Les fréquences incluses* précisent les jours non ouvrés, les fréquences exclues* précisent les jours ouvrés.

Un Calendrier peut contenir un nombre quelconque de *fréquences* qui seront fusionnées. Le bouton *Ajouter une fréquence* est proposé pour chacune des *Fréquences incluses* et des *Fréquences exclues*.

#### Types de Fréquences

Lors de l'ajout de *fréquences*, un certain nombre de types peuvent être sélectionnés :

  - **Jours de semaine** spécifie le jour de la semaine.
  - **Jours de semaine spécifiques** spécifient les jours de semaine relatifs tels que le premier ou le dernier lundi d'un mois.
  - **Jours spécifiques** spécifient les jours de l'année.
  - **Mois Jours** indiquent les jours relatifs d'un mois, par exemple le premier ou le dernier jour du mois.
  - **tous** spécifie des périodes récurrentes, par exemple tous les 2 jours, toutes les 1ères semaines, tous les 3 mois. Pour ce faire, vous devez spécifier la date *Début de validité* à partir de laquelle les jours seront comptés.
  - **Jours fériés nationaux** spécifie les jours fériés connus. Les jours résultants ne font pas autorité et peuvent différer de la législation locale.
  - **Calendriers des jours non ouvrés** exclut les jours concernés des Calendriers des jours non ouvrés pour le Calendrier en cours.

Les *types de fréquence* peuvent être combinés en appliquant de manière répétée le même *Type de fréquence* ou différent.

#### Exemple

Prenons l'exemple d'un Calendrier qui doit être affiché tous les deux jours ouvrés :

- Supposez que les jours ouvrés sont du lundi au vendredi et que les jours non ouvrés sont du samedi au dimanche.
- Supposez des jours fériés nationaux pour le 1er janvier et le 1er mai.

Le comptage d'un jour ouvré sur deux doit exclure les week-ends et les jours fériés :

- Créez un Calendrier des jours ouvrés en utilisant
  - *Fréquences incluses* : Ajoutez le *Type de fréquence **Jours ouvrés** et sélectionnez *Tous les jours*. Le résultat contiendra tous les jours de l'année.
  - en utilisant les *Fréquences exclues* : ajoutez le *Type de fréquence **Tous les jours** et sélectionnez *Chaque jour* : Ajoutez le **Tous** *Type de fréquence* et sélectionnez *2* pour l'intervalle et *Jours* pour l'unité. Spécifiez la date *Début de validité*. Les jours obtenus sont divisés par deux.
  - *Fréquences exclues* : Ajoutez le *Type de fréquence **Jours fériés nationaux** et sélectionnez votre *Pays* et votre *Année*. Cela permet de limiter davantage le nombre de jours obtenus.

Vérifiez les résultats à partir du bouton *Afficher l'aperçu* qui devrait vous donner un jour ouvré sur deux, à l'exclusion des week-ends et des jours fériés.

Une autre solution consiste à spécifier le *Type de fréquence **Tous** à partir de la *Restriction* d'une Planification.

## Opérations sur les Calendriers

Pour les opérations disponibles, voir [Configuration - Inventaire - Navigation](/configuration-inventory-navigation).

## Références

### Aide contextuelle

- [Configuration - Inventaire - Navigation](/configuration-inventory-navigation)
- [Configuration - Inventaire - Plannifications - Temps d'Execution](/configuration-inventory-schedules-run-time)
- [Plan Quotidien](/daily-plan)
- [Règles de Dénomination des Objets](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
