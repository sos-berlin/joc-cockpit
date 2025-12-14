# Projection du Plan Quotidien

Le Plan Quotidien contient les Ordres qui sont soumis au Contrôleur et aux Agents quelques jours à l'avance à des fins de résilience. En outre, il offre la projection des heures de début des Ordres qui sont calculées pour les six mois à venir.

Les utilisateurs qui souhaitent disposer d'une période de projection plus longue peuvent modifier le paramètre correspondant sur la page [Réglages - Plan Quotidien](/settings-daily-plan).

### Dates, périodes et fuseaux horaires

La projection sont liées aux dates du Plan Quotidien, et non aux dates du Calendrier. 

- Périodes
  - Si la période de 24 heures du Plan Quotidien commence à minuit, elle correspondra au jour civil.
  - Pour les périodes du Plan Quotidien commençant pendant la journée, la période de 24 heures chevauchera deux jours calendaires.
- Fuseaux horaires
  - Si les Planifications utilisent des fuseaux horaires différents de ceux du Plan Quotidien, les heures de début des Ordres peuvent chevaucher le jour précédent ou le jour suivant. Ces Ordres sont affichés avec la date du Plan Quotidien correspondante mais indiquent des heures de début pour une date différente.
  - L'utilisation de fuseaux horaires peut entraîner des heures de début de -14 heures et de +12 heures en plus de la période de 24 heures du Plan Quotidien. Le plus surprenant pour certains utilisateurs est qu'un jour ne dure pas 24 heures, mais peut s'étendre jusqu'à 50 heures. La période d'un jour est toujours de 24 heures, car elle dépend de la rotation de la Terre. Cependant, pour un fuseau horaire donné, il y a une couverture de 50 heures pour inclure toutes les heures possibles autour de la planète.

Toutes les dates et heures sont affichées dans le fuseau horaire spécifié par le profil de l'utilisateur.

### Options d'affichage

Les utilisateurs peuvent passer de l'affichage *mensuel* à l'affichage *annuel* des Ordres projetés en utilisant les liens correspondants dans le coin supérieur gauche de la fenêtre.

Pour chaque jour, le numéro du jour dans le mois et le nombre d'Ordres projetés sont affichés :

- **Ordres Verts** : Ils représentent les Ordres qui ont été soumis au Contrôleur et aux Agents.
- **Ordres Orange** : Ils indiquent les Ordres projetés qui sont calculés sur la base des règles d'heure de début.
- **Projection inversée** :
  - *Non coché* : La projection indique les jours pour lesquels les Ordres sont calculés et le nombre d'Ordres. Les utilisateurs peuvent cliquer sur un jour individuel pour identifier les heures de début des Ordres.
  - *Coché* : Lorsque la projection est inversée, les jours pour lesquels les Ordres sont calculés et le nombre d'Ordres sont indiqués : Lorsque vous inversez la projection, les jours pour lesquels il existe des Planifications qui ne créeront pas d'Ordres sont mis en évidence. Lorsque vous cliquez sur le jour concerné, les Planifications sans Ordres s'affichent.

### Filtre avancé

Le filtre permet de limiter l'affichage des Ordres à certains dossiers contenant des Workflows ou des Planifications.

## Opérations sur la projection

### Création de projection

- La projection est calculées par le service du Plan Quotidien au cours de son exécution quotidienne. Les modifications apportées au Plan Quotidien au cours de la journée ne sont pas prises en compte.
- Les utilisateurs peuvent recréer la projection sur demande à partir du bouton correspondant.
- La *Date d'enquête* indique la date de création de la projection actuelle du Plan Quotidien.

### Exportation de la projection

La projection peut être exportées vers un fichier .xlsx avec la date du Plan Quotidien sur l'axe des x et le Workflow et la Planification sur l'axe des y.

- Le raccourci *Exporter* permet d'exporter les Ordres visibles dans la fenêtre. 
- Le bouton *Exporter* permet de sélectionner les Ordres à exporter :
  - **Date de début**, **Date de fin** : Première et dernière date du Plan Quotidien pour lesquelles les Ordres seront exportés.
  - **Workflows**, **Planifications** : Les utilisateurs peuvent limiter l'exportation à certaines Planifications et à certains Workflow, éventuellement limités par des dossiers.
  - **Projection inversée** : 
    - *Décoché* : Exporte les dates pour lesquelles les Ordres sont calculés.
    - *Coché* : exporte les dates pour lesquelles les commandes sont calculées : Exporte les dates pour lesquelles aucun Ordre n'est calculé. Ceci peut être utilisé pour vérifier si les jours non ouvrables sont pris en compte.

## Références

- [Plan Quotidien](/daily-plan)
- [Réglages - Plan Quotidien](/settings-daily-plan)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
