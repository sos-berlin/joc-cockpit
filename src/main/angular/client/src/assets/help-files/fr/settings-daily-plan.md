# Réglages - Plan Quotidien

Les paramètres suivants sont appliqués au [Plan Quotidien](/daily-plan). Les modifications prennent effet immédiatement.

La page *Réglages* est accessible à partir de l'icône ![wheel icon](assets/images/wheel.png) dans la barre de menu.

## Paramètres du Plan Quotidien

### Paramètre : *time\_zone*, Défaut : *UTC*

Spécifie le fuseau horaire appliqué à l'heure de début du [Service du Plan Qutotidien](/service-daily-plan) et à la période du Plan Quotidien.

### Paramètre : *period\_begin*, Défaut : *00:00*

Spécifie le début de la période de 24 heures du Plan Quotidien dans le fuseau horaire indiqué.

### Paramètre : *start\_time*, Défaut : *30 minutes avant le début de la période

Spécifie l'heure de début de l'exécution du Plan Quotidien sur une base quotidienne avec le fuseau horaire indiqué. Sans ce paramètre, le Plan Quotidien sera exécuté 30 minutes avant le moment spécifié par le paramètre *période_début*. Ce paramètre accepte une valeur temporelle, par exemple 23:00:00.

### Paramètre : *days\_ahead\_plan*, Défaut : *7*

Indique le nombre de jours à l'avance pour lesquels les Ordres sont générés et mis à disposition avec le statut *planifié*. Une valeur de *0* indique qu'aucun Ordre ne doit être généré et désactive la fonctionnalité.

### Paramètre : *days\_ahead\_submit*, Défaut : *3*

Spécifie le nombre de jours à l'avance pour lesquels les Ordres *planifiés* sont soumis aux Contrôleurs et sont rendus disponibles avec l'état *soumis*. Une valeur de *0* indique qu'aucun Ordre ne doit être soumis et désactive la fonctionnalité.

### Paramètre : *submit\_orders\_individually*, Défaut : *false*

Par défaut, le service du Plan Quotidien soumet les Ordres à partir d'une transaction unique qui est annulée en cas d'échec de la soumission d'un Ordre. Lorsque ce paramètre est activé, les Ordres sont soumis individuellement et indépendamment de tout échec de soumission d'autres Ordres. Le service Plan Quotidien nécessitera plus de temps pour soumettre les Ordres individuellement.

### Paramètre : *age\_of\_plans\_to\_be\_closed\_automatically*, Défaut : *1*

Spécifie le nombre de jours après lequel le Plan Quotidien sera fermé et ne permettra pas d'ajouter des Ordres qui résolvent des dépendances pour [Ressources - Tableaux de Condition](/resources-notice-boards) pour la date d'origine.

### Paramètre : *projections\_month\_ahead*, Défaut : *6*

Spécifie le nombre de mois à l'avance pour lequel [Projection du Plan Quotidien](/daily-plan-projections) est calculé et qui indique l'exécution future de l'Ordre.

## Références

### Aide contextuelle

- [Plan Quotidien](/daily-plan)
- [Projection du Plan Quotidien](/daily-plan-projections)
- [Réglages](/settings)
- [Ressources - Tableaux de Condition](/resources-notice-boards)
- [Service du Plan Qutotidien](/service-daily-plan)

### Product Knowledge Base

- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
