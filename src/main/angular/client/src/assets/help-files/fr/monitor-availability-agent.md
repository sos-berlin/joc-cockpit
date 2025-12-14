# Moniteur - Disponibilité de l'Agent

La vue affiche des indicateurs de disponibilité des Agents.

Si un Cluster d'Agents est utilisée, la disponibilité de du Cluster est prise en compte. Par exemple, si un Agent dans un Cluster est arrêtée à des fins de maintenance et que l'instance restante reprend la charge, cela ne réduit pas la disponibilité.

Le coin supérieur droit de l'écran propose la case à cocher *Contrôleur actuel* : si elle n'est pas cochée, la disponibilité sera affichée pour les Agents de tous les Contrôleurs connectés ; dans le cas contraire, l'information est affichée pour les Agents enregistrés auprès du Contrôleur actuellement sélectionné uniquement.

Les utilisateurs doivent savoir que les données historiques relatives à la disponibilité des Agents sont susceptibles d'être supprimées par le [Service d'Assainissement](/service-cleanup).

## Filtres de date

Le coin supérieur droit du panneau permet de sélectionner une plage de dates pour l'affichage de la disponibilité :

- **Semaine** fait basculer le curseur de date sur une période d'une semaine.
- **Mois** fait basculer la barre de défilement de la date sur une période d'un mois.
- L'option **Plage** permet de spécifier la date de début et la date de fin.

## Temps d'exécution

Donne le pourcentage pour lequel les Agents sont confirmés comme étant disponibles dans la période donnée.

## Statistiques

Montre la disponibilité à partir d'un diagramme à barres sur une base quotidienne dans la période donnée. Chaque Agent est indiqué individuellement par jour. 

## Vue d'ensemble

Montre la disponibilité par Agent et par jour dans la période donnée.

- Le graphique indique en vert les heures pour lesquelles la disponibilité de l'Agent est confirmée. 
- La couleur rouge indique une indisponibilité.
- La couleur grise indique des données manquantes.

## Références

- [Service d'Assainissement](/service-cleanup)
- [Moniteur - Disponibilité de Contrôleur](/monitor-availability-controller)
- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
