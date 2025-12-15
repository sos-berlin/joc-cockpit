# Service de Notification des Journaux

[JS7 - Log Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Management) est proposé avec le JOC Cockpit pour la surveillance de la sortie des journaux et l'envoi des notifications créées par les instances du Contrôleur, de l'Agent et du JOC Cockpit.

Le site [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service) est accessible à partir de l'instance active de JOC Cockpit :

## Service

Le service est utilisé pour collecter les avertissements et les erreurs à partir de la sortie du journal des instances du Contrôleur et de l'Agent et pour créer [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications).

- Les notifications du JOC Cockpit sont créées directement et sans utiliser le service.
- Le service est conforme à la RFC5424, alias le protocole syslog.
- Le service offre des capacités de redémarrage : en cas de défaillance ou de basculement de JOC Cockpit, le service de notification des journaux devient disponible à partir de l'instance active de JOC Cockpit.

## Clients

Les instances de Contrôleur et d'Agent JS7 agissent en tant que clients du service de notification des journaux. Les produits peuvent être configurés pour signaler les avertissements et les erreurs de la sortie des journaux au service de notification des journaux. Pour plus d'informations, consultez le site [JS7 - Log Configuration for use with System Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Configuration+for+use+with+System+Notifications).

Les utilisateurs ont le choix d'activer le transfert de la sortie des journaux par instance de Contrôleur et d'Agent lors de l'installation ou ultérieurement en ajustant la configuration de Log4j2.

## Interface utilisateur

Le JOC Cockpit offre des notifications de système à partir de la vue [Moniteur - Notifications du Système](/monitor-notifications-system).

Le JOC Cockpit propose [Notifications - Configuration](/configuration-notification) pour transférer les notifications par e-mail, à partir d'outils de ligne de commande, etc.

## Paramètres du service de notification des journaux

Pour les paramètres du service de notification des journaux, voir [Réglages - Notifications des Journaux](/settings-log-notification).

## Références

### Aide contextuelle

- [Moniteur - Notifications du Système](/monitor-notifications-system)
- [Notification - Configuration](/configuration-notification)
- [Réglages - Notifications des Journaux](/settings-log-notification)

### Product Knowledge Base

- [JS7 - Log Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Management)
  - [JS7 - Log Configuration for use with System Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Configuration+for+use+with+System+Notifications)
  - [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
