# Exécution des tâches de l'agent

La vue *Exécution des travaux des agents* résume les travaux exécutés par les agents au cours d'une période donnée.

Les agents se présentent sous les formes suivantes :

- **Les agents standalins** exécutent des tâches sur des machines distantes sur site et à partir de conteneurs. Ils fonctionnent individuellement et sont gérés par le contrôleur.
- **Cluster d'agents**
  - les **Agents Directeurs** orchestrent les *Sous-Agents* dans un Cluster d'Agents. En outre, ils peuvent être utilisés pour exécuter des tâches.
  - les **Subagents** exécutent des Jobs sur des machines distantes sur site et à partir de conteneurs. Ils peuvent être considérés comme des nœuds de travail dans un cluster d'agents et sont gérés par des *Agents Directeurs*.

## Panneau d'exécution des tâches des agents

Les informations suivantes sont affichées :

- **Nom de l'agent** est le nom unique d'un agent.
- **L'URL** est l'URL qui permet d'accéder à l'agent à partir du contrôleur.
- **Nombre de tâches exécutées avec succès** correspond à ce que le titre suggère.
- **Le nombre de tâches exécutées** comprend les tâches exécutées avec succès et celles qui ont échoué.

## Exportation des tâches exécutées par les agents

Les utilisateurs peuvent exporter les informations récapitulatives affichées dans un fichier Excel au format .xlsx. Les filtres actifs et l'ordre de tri seront appliqués à l'exportation.

## Filtres

L'utilisateur peut appliquer les filtres disponibles en haut de la fenêtre pour limiter le résumé des exécutions de tâches :

- les boutons de filtrage **Date Range** permettent de choisir la plage de dates pour le résumé des exécutions de tâches.
- la case à cocher **Contrôleur actuel** limite les exécutions de tâches aux agents enregistrés auprès du contrôleur actuellement sélectionné.

## Filtre avancé

Le *Filtre avancé* offre des critères de filtrage pour une plage de dates plus large, pour des instances d'agents et de contrôleurs spécifiques.

Le *filtre avancé* permet d'exporter des données en fonction des critères spécifiés.

## Références

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)

