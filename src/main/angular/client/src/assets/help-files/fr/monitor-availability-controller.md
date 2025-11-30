# Disponibilité du moniteur et du contrôleur

La vue affiche les indicateurs de disponibilité d'un contrôleur.

Si un groupe de contrôleurs est utilisé, la disponibilité du groupe est prise en compte. Par exemple, si une instance de contrôleur dans un cluster est arrêtée à des fins de maintenance et que l'instance restante reprend la charge, cela ne réduit pas la disponibilité.

Dans le coin supérieur droit de l'écran, vous pouvez cocher la case *Current Controller* (contrôleur actuel) : si cette case n'est pas cochée, la disponibilité sera affichée pour tous les contrôleurs connectés ; dans le cas contraire, les informations ne seront affichées que pour le contrôleur actuellement sélectionné.

Les utilisateurs doivent savoir que les données historiques relatives à la disponibilité des contrôleurs sont susceptibles d'être purgées par le site [Cleanup Service](/service-cleanup).

## Filtres de date

Le coin supérieur droit du panneau permet de sélectionner une plage de dates pour l'affichage de la disponibilité :

- **Semaine** fait basculer le curseur de date sur une période d'une semaine.
- **Mois** fait basculer la barre de défilement de la date sur une période d'un mois.
- **L'option "Plage" permet de spécifier la date de début et la date de fin.

## Temps d'exécution

Indique le pourcentage de disponibilité confirmée du contrôleur pour la période donnée.

## Statistiques

Affiche la disponibilité à partir d'un diagramme à barres sur une base quotidienne dans la période donnée.

## Vue d'ensemble

Affiche la disponibilité par contrôleur et par jour dans la période donnée.

- Le graphique indique en vert les heures pour lesquelles la disponibilité du contrôleur est confirmée. 
- La couleur rouge indique une indisponibilité.
- La couleur grise indique des données manquantes.

## Références

- [Cleanup Service](/service-cleanup)
- [Monitor - Availability - Agent](/monitor-availability-agent)
- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)

