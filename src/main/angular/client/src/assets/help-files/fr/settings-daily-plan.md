# Paramètres - Plan Quotidien

Les paramètres suivants sont appliqués au site [Daily Plan](/daily-plan). Les modifications prennent effet immédiatement.

La page *Réglages* est accessible à partir de l'icône ![wheel icon](assets/images/wheel.png) dans la barre de menu.

## Paramètres du Plan Quotidien

### Paramètre : *time_zone*, Défaut : *UTC*

Spécifie le fuseau horaire appliqué à l'heure de début du site [Daily Plan Service](/service-daily-plan) et à la période du Plan Quotidien.

### Paramètre : *period_begin*, Valeur par défaut : *00:00*

Spécifie le début de la période de 24 heures du Plan Quotidien dans le fuseau horaire indiqué.

### Réglage : *start_time*, Défaut : *30 minutes avant le début de la période

Spécifie l'heure de début de l'exécution du Plan Quotidien sur une base quotidienne avec le fuseau horaire indiqué. Sans ce paramètre, le Plan Quotidien sera exécuté 30 minutes avant le moment spécifié par le paramètre *période_début*. Ce paramètre accepte une valeur temporelle, par exemple 23:00:00.

### Paramètre : *days\_ahead\_plan*, Défaut : *7*

Indique le nombre de jours à l'avance pour lesquels les Ordres sont générés et mis à disposition avec le statut *planifié*. Une valeur de *0* indique qu'aucun Ordre ne doit être généré et désactive la fonctionnalité.

### Paramètre : *days_ahead\_submit*, Valeur par défaut : *3*

Spécifie le nombre de jours à l'avance pour lesquels les Ordres *planifiés* sont soumis aux contrôleurs et sont rendus disponibles avec l'état *soumis*. Une valeur de *0* indique qu'aucun Ordre ne doit être soumis et désactive la fonctionnalité.

### Setting : *submit_orders\_individually*, Défaut : *false*

Par défaut, le service du Plan Quotidien soumet les Ordres à partir d'une transaction unique qui est annulée en cas d'échec de la soumission d'un Ordre. Lorsque ce paramètre est activé, les Ordres sont soumis individuellement et indépendamment de tout échec de soumission d'autres Ordres. Le service Plan Quotidien nécessitera plus de temps pour soumettre les Ordres individuellement.

### Setting : *age_of\_plans\_to\_be\_closed\_automatically*, Défaut : *1*

Spécifie le nombre de jours après lequel le Plan Quotidien sera fermé et ne permettra pas d'ajouter des Ordres qui résolvent des dépendances pour [Resources - Notice Boards](/resources-notice-boards) pour la date d'origine.

### Paramètre : *projections_month\_ahead*, Valeur par défaut : *6*

Spécifie le nombre de mois à l'avance pour lequel [Daily Plan - Projections](/daily-plan-projections) est calculé et qui indique l'exécution future de l'Ordre.

## Références

### Aide contextuelle

- [Daily Plan](/daily-plan)
- [Daily Plan - Projections](/daily-plan-projections)
- [Daily Plan Service](/service-daily-plan)
- [Resources - Notice Boards](/resources-notice-boards)
- [Settings](/settings)

### Product Knowledge Base

- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)

