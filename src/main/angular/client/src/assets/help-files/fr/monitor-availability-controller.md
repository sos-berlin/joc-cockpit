# Moniteur - Disponibilité de Contrôleur

La vue affiche les indicateurs de disponibilité des Contrôleurs.

Si un Cluster de Contrôleurs est utilisé, la disponibilité du Cluster est prise en compte. Par exemple, si une instance de Contrôleur dans un Cluster est arrêtée à des fins de maintenance et que l'instance restante reprend la charge, cela ne réduit pas la disponibilité.

Dans le coin supérieur droit de l'écran, vous pouvez cocher la case *Contrôleur actuel* : si cette case n'est pas cochée, la disponibilité sera affichée pour tous les Contrôleurs connectés; dans le cas contraire, les informations ne seront affichées que pour le Contrôleur actuellement sélectionné.

Les utilisateurs doivent savoir que les données historiques relatives à la disponibilité des Contrôleurs sont susceptibles d'être purgées par le [Service d'Assainissement](/service-cleanup).

## Filtres de date

Le coin supérieur droit du panneau permet de sélectionner une plage de dates pour l'affichage de la disponibilité :

- **Semaine** fait basculer le curseur de date sur une période d'une semaine.
- **Mois** fait basculer la barre de défilement de la date sur une période d'un mois.
- L'option **Plage** permet de spécifier la date de début et la date de fin.

## Temps d'exécution

Indique le pourcentage de disponibilité confirmée du Contrôleur pour la période donnée.

## Statistiques

Affiche la disponibilité à partir d'un diagramme à barres sur une base quotidienne dans la période donnée.

## Vue d'ensemble

Affiche la disponibilité par Contrôleur et par jour dans la période donnée.

- Le graphique indique en vert les heures pour lesquelles la disponibilité du Contrôleur est confirmée. 
- La couleur rouge indique une indisponibilité.
- La couleur grise indique des données manquantes.

## Références

- [Moniteur - Disponibilité de l'Agent](/monitor-availability-agent)
- [Service d'Assainissement](/service-cleanup)
- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
