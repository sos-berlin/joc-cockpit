# Service du Plan Quotidien

Le service [JS7 - Daily Plan Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan+Service) est utilisé pour créer et soumettre aux contrôleurs des Ordres pour le site [Daily Plan](/daily-plan). Le service fonctionne en arrière-plan et agit quotidiennement pour planifier et soumettre des Ordres quelques jours à l'avance.

Le service Plan Quotidien exécute les [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules) existants et génère des Ordres pour les heures de début données. Cela s'applique à la fois aux planifications qui spécifient une heure de début unique pour un ordre et aux planifications qui spécifient des heures de début cycliques. Un Ordre individuel est créé pour chaque heure de début d'un cycle. Lors d'une étape ultérieure, ces Ordres sont soumis aux contrôleurs concernés.

Une fonctionnalité similaire est disponible dans la vue du Plan Quotidien pour les utilisateurs. Toutefois, le service Plan Quotidien exécute cette tâche automatiquement.

Le service de plan quotidien est lancé en fonction de ses paramètres et il peut être lancé dans la vue du tableau de bord à partir du rectangle des instances actives du JOC Cockpit en proposant l'opération *Démarrer Service - Service du Plan Quotidien*. Il n'y a aucun inconvénient à lancer le service de plan journalier plusieurs fois par jour.

<img src="dashboard-run-daily-plan-service.png" alt="Run Daily Plan Service" width="750" height="280" />

## Paramètres du service Plan Quotidien

Pour les réglages du service Plan Quotidien, voir [Settings - Daily Plan](/settings-daily-plan).

## Références

### Aide contextuelle

- [Daily Plan](/daily-plan)
- [Settings - Daily Plan](/settings-daily-plan)

### Product Knowledge Base

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - Daily Plan Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan+Service)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)

