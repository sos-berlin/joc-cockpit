# Service d'Assainissement

Le Service d'Assainissement purgera le site [JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database) des enregistrements périmés.

Cela inclut les données provenant des sources suivantes :

- [Historique des Ordres](/history-orders)
- [Historique des Tâches](/history-tasks)
- [Historique des Transferts de Fichiers](/history-file-transfers)
- [Plan Quotidien](/daily-plan)
- [Journal d'Audit](/audit-log)

Pour chaque tâche exécutée au cours de la journée, une entrée dans l'"Historique des tâches" sera créée, de même pour l'"Historique des Ordres". En fonction du nombre de tâches quotidiens, cela peut représenter un nombre considérable.

- Les utilisateurs doivent tenir compte des politiques de conservation des journaux applicables, c'est-à-dire de la période pendant laquelle l'historique de l'exécution des tâches et les journaux doivent être conservés en vertu d'exigences légales et d'exigences de conformité.
- Une base de données ne peut pas croître indéfiniment. L'utilisation d'un SGBD performant peut permettre d'avoir 100 millions d'enregistrements dans une table *Historique des tâches*. Toutefois, cela tend à nuire aux performances et n'est pas forcément nécessaire. La purge de la base de données est une mesure raisonnable pour assurer le bon déroulement des opérations. Les mesures supplémentaires de maintenance de la base de données, telles que la recréation d'index, relèvent de la responsabilité de l'utilisateur.

Le Service d'Assainissement est lancé en fonction de ses paramètres et il peut être lancé dans la vue du tableau de bord à partir du rectangle des instances actives du JOC Cockpit en proposant l'opération *Démarrer Service - Service d'Assainissement*.

<img src="dashboard-run-cleanup-service.png" alt="Run Cleanup Service" width="750" height="280" />

## Paramètres du Service d'Assainissement

Pour plus de détails sur la configuration du Service d'Assainissement, voir [Réglages - Cleanup](/settings-cleanup).

## Références

### Aide contextuelle

- [Journal d'Audit](/audit-log)
- [Historique des Ordres](/history-orders)
- [Historique des Tâches](/history-tasks)
- [Historique des Transferts de Fichiers](/history-file-transfers)
- [Plan Quotidien](/daily-plan)
- [Réglages - Cleanup](/settings-cleanup)

### Product Knowledge Base

- [JS7 - Cleanup Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Cleanup+Service)
- [JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database)
