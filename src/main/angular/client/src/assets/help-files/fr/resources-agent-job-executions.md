# Ressources - Exécution des Tâches de l'Agent

La vue *Exécution des Tâches des Agents* résume les tâches exécutés par les Agents au cours d'une période donnée.

Les Agents se présentent sous les formes suivantes :

- **Agents Autonomes** exécutent des tâches sur des machines distantes ou à partir de conteneurs. Ils fonctionnent individuellement et sont gérés par le Contrôleur.
- **Cluster d'Agents**
  - les **Agents Directeurs** orchestrent les *Sous-Agents* dans un Cluster d'Agents. En outre, ils peuvent être utilisés pour exécuter des tâches.
  - les **Sous-Agents** exécutent des Jobs sur des machines distantes sur site et à partir de conteneurs. Ils peuvent être considérés comme des nœuds de tâche dans un Cluster d'Agents et sont gérés par des *Agents Directeurs*.

## Vue d'exécution des tâches 

Les informations suivantes sont affichées :

- **ID Agent** est le nom unique d'un Agent.
- **URL** est l'URL qui permet d'accéder à l'Agent à partir du Contrôleur.
- **Nombre d'exécutions de tâches réussis** correspond à ce que le titre suggère.
- **Le nombre de tâches exécutées** comprend les tâches exécutées avec succès et celles qui ont échoué.

## Exportation des tâches exécutées par les Agents

Les utilisateurs peuvent exporter les informations récapitulatives affichées dans un fichier Excel au format .xlsx. Les filtres actifs et l'Ordre de tri seront appliqués à l'exportation.

## Filtres

L'utilisateur peut appliquer les filtres disponibles en haut de la fenêtre pour limiter le résumé des exécutions de tâches :

- les boutons de filtrage **Plage de Date** permettent de choisir la plage de dates pour le résumé des exécutions de tâches.
- la case à cocher **Contrôleur actuel** limite les exécutions de tâches aux Agents enregistrés auprès du Contrôleur actuellement sélectionné.

## Filtre avancé

Le *Filtre avancé* offre des critères de filtrage pour une plage de dates plus large, pour des instances d'Agents et de Contrôleurs spécifiques.

Le *filtre avancé* permet d'exporter des données en fonction des critères spécifiés.

## Références

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
