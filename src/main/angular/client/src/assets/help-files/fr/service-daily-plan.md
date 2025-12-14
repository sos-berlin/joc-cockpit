# Service Plan Quotidien

Le service [JS7 - Daily Plan Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan+Service) est utilisé pour créer et soumettre aux Contrôleurs des Ordres pour le site [Plan Quotidien](/daily-plan). Le service fonctionne en arrière-plan et agit quotidiennement pour planifier et soumettre des Ordres quelques jours à l'avance.

Le service Plan Quotidien exécute les [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules) existants et génère des Ordres pour les heures de début données. Cela s'applique à la fois aux Planifications qui spécifient une heure de début unique pour un Ordre et aux Planifications qui spécifient des heures de début cycliques. Un Ordre individuel est créé pour chaque heure de début d'un cycle. Lors d'une étape ultérieure, ces Ordres sont soumis aux Contrôleurs concernés.

Une fonctionnalité similaire est disponible dans la vue du Plan Quotidien pour les utilisateurs. Toutefois, le service Plan Quotidien exécute cette tâche automatiquement.

Le Service Plan Quotidien est lancé en fonction de ses paramètres et il peut être lancé dans la vue du tableau de bord à partir du rectangle des instances actives du JOC Cockpit en proposant l'opération *Démarrer Service - Service Plan Quotidien*. Il n'y a aucun inconvénient à lancer le service de plan journalier plusieurs fois par jour.

<img src="dashboard-run-daily-plan-service.png" alt="Démarrer Service Plan Quotidien" width="750" height="280" />

## Paramètres du Service Plan Quotidien

Pour les réglages du Service Plan Quotidien, voir [Réglages - Plan Quotidien](/settings-daily-plan).

## Références

### Aide contextuelle

- [Plan Quotidien](/daily-plan)
- [Réglages - Plan Quotidien](/settings-daily-plan)

### Product Knowledge Base

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - Daily Plan Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan+Service)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
