# Service de Surveillance

Le service Surveillance est utilisé pour signaler l'état de santé des produits JS7 et pour signaler les problèmes d'exécution du Workflow. Le service de Surveillance alimente les sous-vues *Moniteur* dans JOC Cockpit :

- vérifier la disponibilité des produits JS7 et signaler dans les sous-vues [Moniteur - Disponibilité de Contrôleur](/monitor-availability-controller) et [Moniteur - Disponibilité de l'Agent](/monitor-availability-agent).
- vérifier les Contrôleurs et les Agents connectés pour détecter les avertissements et les erreurs survenus pendant le fonctionnement des produits. Les résultats sont ajoutés à la sous-vue [Moniteur - Notifications du Système](/monitor-notifications-system).
- vérifier les résultats de l'exécution du Workflow et de l'exécution du Job à partir de tous les Contrôleurs connectés et ajouter des notifications à la vue [Moniteur - Notifications d'Ordre](/monitor-notifications-order).

Par conséquent, les erreurs et les avertissements qui se produisent pendant l'exécution du Workflow deviendront visibles dans les sous-vues *Monitor* de l'interface graphique et peuvent être transmis par [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications). En raison de la nature asynchrone des produits JS7, cette tâche est exécutée par un service d'arrière-plan.

Le service de Surveillance est lancé automatiquement au démarrage de JOC Cockpit. Il peut être redémarré dans la vue Dashboard à partir du rectangle des instances actives de JOC Cockpit en utilisant l'opération *Rédemmarer Service - Service de Surveillance*.

<img src="dashboard-restart-monitor-service.png" alt="Restart Monitor Service" width="750" height="280" />

## Références

### Aide contextuelle

- [Moniteur - Disponibilité de l'Agent](/monitor-availability-agent)
- [Moniteur - Disponibilité de Contrôleur](/monitor-availability-controller)
- [Moniteur - Notifications d'Ordre](/monitor-notifications-order)
- [Moniteur - Notifications du Système](/monitor-notifications-system)

### Product Knowledge Base

- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Monitor Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor+Service)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)

