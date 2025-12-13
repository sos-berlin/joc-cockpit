# Paramètres - Cleanup

Les paramètres suivants sont appliqués au site [Cleanup Service](/service-cleanup). Les changements sont effectifs immédiatement.

La page *Réglages* est accessible à partir de l'icône ![wheel icon](assets/images/wheel.png) dans la barre de menu.

## Paramètres de l'heure de démarrage

### Setting : *time_zone*, Défaut : *UTC*

Spécifie le fuseau horaire appliqué à l'heure de début et à la période du Service d'Assainissement.

### Paramètre : *période*

Indique les jours de la semaine pendant lesquels le service de nettoyage est effectué. Le premier jour de la semaine est supposé être le lundi. Lors de l'installation initiale du JS7, les valeurs par défaut sont les suivantes : 1, 2, 3, 4, 5, 6, 7 pour le nettoyage quotidien : 1,2,3,4,5,6,7 pour le nettoyage quotidien. Si aucun jour de la semaine n'est spécifié, le Service d'Assainissement ne démarrera pas.

Dans la plupart des cas, il est recommandé d'exécuter le service de nettoyage tous les jours, car cela permet de limiter le nombre d'enregistrements à purger. Il peut y avoir des exceptions si l'exécution quotidienne des tâches est très dense pendant 24 heures et si des périodes creuses sont disponibles le week-end, par exemple.

### Paramètre : *period_begin*, Valeur par défaut : *01:00:00*

Spécifie l'heure de début du service de nettoyage dans le *fuseau horaire* correspondant.

### Réglage : *period_end*, Valeur par défaut : *04:00:00*

Spécifie la fin de la période pendant laquelle le service de nettoyage est autorisé à fonctionner dans le *fuseau horaire* correspondant. Le Service de nettoyage achèvera probablement la purge de la base de données avant l'heure indiquée. Toutefois, s'il détecte une activité du *Service Historique*, le Service d'Assainissement s'arrêtera et redémarrera plus tard. Le Service d'Assainissemente ne continuera pas à fonctionner au-delà de la *Fin de période* indiquée.

### Setting : *force_cleanup*, Défaut : *false*

Si ce paramètre vaut *true*, il spécifie que le service de nettoyage sera exécuté de force à la *début de la période* donnée. Par défaut, le service de nettoyage s'arrête s'il détecte une activité du service Historique. Ce paramètre permet au Service de nettoyage de mettre en pause le Service Historique pour une durée configurable.

S'il est défini sur *vrai*, les paramètres suivants sont pris en compte :

- **history\_pause\_duration** : période pendant laquelle le Service Historique sera mis en pause.
- **history\_pause\_delay** : délai après la reprise du Service Historique à partir d'une pause et pendant lequel le Service de Nettoyage attendra jusqu'à ce qu'il redémarre.

Les utilisateurs qui exécutent des travaux 24 heures sur 24, 7 jours sur 7, sans que le Service Historique ne soit suffisamment inactif pour permettre au Service de nettoyage de s'activer, doivent activer le paramètre pour forcer l'exécution du Service de nettoyage. L'absence de purge de la base de données se traduira par une baisse des performances et une augmentation de la consommation de ressources de la base de données.

### Paramètre : *history_pause\duration*, Défaut : *60*s

Si le paramètre *force\_cleanup* est défini sur *true*, le service Historique sera mis en pause pendant la durée indiquée ou jusqu'à la fin du nettoyage, selon ce qui se produit en premier. Lorsque le service Historique est en pause, aucune nouvelle entrée d'historique relative à l'exécution des Ordres et des tâches n'est disponible dans le JOC Cockpit. À l'issue de la pause du service Historique, toutes les entrées d'historique en attente sont traitées.

### Setting : *history_pause\_delay*, Défaut : *30*s

Si le paramètre *force\_cleanup* est défini sur *true* et que la pause du service Historique est terminée, le service de nettoyage attendra le délai indiqué et redémarrera si une purge supplémentaire de la base de données est nécessaire.

## Paramètres de connexion à la base de données

### Paramètre : *taille_du_lot*, Valeur par défaut : *1000*

Spécifie le nombre d'enregistrements purgés au cours d'une seule transaction. L'augmentation de cette valeur peut améliorer les performances, mais elle augmente en même temps le risque de conflits avec des transactions concurrentes si des services fonctionnent en parallèle sur la base de données.

### Paramètre : *max_pool\_size*, Valeur par défaut : *8*

Spécifie le nombre maximum de connexions parallèles à la base de données utilisées par le service.

## Paramètres de la période de rétention

### Paramètre : *order_history\_age*, Valeur par défaut : *90*d

Spécifie la période de conservation pour les historiques [Order History](/history-orders) et [Task History](/history-tasks). Toutes les entrées de l'historique plus anciennes que la valeur spécifiée seront purgées.

### Paramètre : *order_history\_logs\_age*, Ordre : *90*d

Spécifie la période de conservation des journaux des Ordres et des tâches. Tous les journaux plus anciens que la valeur spécifiée seront purgés. Notez que cette valeur ne doit pas dépasser la valeur du paramètre *cleanup\_order\_history\_age*, sinon la navigation dans les journaux ne pourra pas être assurée par l'interface graphique du JOC Cockpit.

### Paramètre : *file_transfer\_history\_age*, Valeur par défaut : *90*d

Spécifie la période de conservation pour [File Transfer History](/history-file-transfers). Toutes les entrées plus anciennes que la valeur spécifiée seront supprimées.

### Paramètre : *audit_log\_age*, Valeur par défaut : *90*d

Spécifie la période de conservation du Journal d'Audit [Audit Log](/audit-log). Toutes les entrées du Journal d'Audit plus anciennes que la valeur spécifiée seront supprimées.

### Paramètre : *daily_plan\_history\_age*, Valeur par défaut : *30*d

Spécifie la période de conservation de l'historique des soumissions à l'adresse [Daily Plan](/daily-plan). Toutes les entrées de l'historique antérieures à la valeur spécifiée seront supprimées.

### Paramètre : *monitoring_history\_age*, Valeur par défaut : *1*d

Spécifie la période de rétention des entrées dans la vue *Moniteur*. Comme il s'agit d'une vue tactique, il n'est pas recommandé de prévoir des périodes de rétention plus longues.

### Paramètre : *notification_history\_age*, Valeur par défaut : *1*d

Spécifie la durée de conservation des notifications, par exemple pour les erreurs et les avertissements relatifs aux travaux. Les notifications étant généralement traitées le jour même, il n'est pas recommandé de prévoir des périodes de conservation plus longues.

### Paramètre : *profile_age*, Valeur par défaut : *365*d

Spécifie la période de rétention pour les [Profiles](/profile) inutilisés, c'est-à-dire les profils des comptes d'utilisateurs qui ne se sont pas connectés pendant la période donnée.

### Paramètre : *failed_login\history\_age*, Valeur par défaut : *90*d

Spécifie la période de conservation de l'historique des connexions échouées. Les connexions infructueuses qui se sont produites avant la période indiquée seront supprimées.

### Paramètre : *reporting_age*, Valeur par défaut : *365*d

Spécifie la période de rétention pour [Reports](/reports).

### Paramètre : *deployment_history\_versions*, Valeur par défaut : *10*

Indique le nombre de versions à conserver pour chaque objet déployé. Les versions peuvent être utilisées pour redéployer un objet à partir d'un état antérieur. Toutes les versions antérieures des objets déployés sont supprimées.

## Références

### Aide contextuelle

- [Audit Log](/audit-log)
- [Daily Plan](/daily-plan)
- [Daily Plan - Projections](/daily-plan-projections)
- [Profile](/profile)
- [Reports](/reports)
- [Resources - Notice Boards](/resources-notice-boards)
- [Cleanup Service](/service-cleanup)
- [Settings](/settings)

### Product Knowledge Base

- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)

