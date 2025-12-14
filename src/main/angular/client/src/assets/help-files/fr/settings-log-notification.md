# Réglages - Service de Notification des Journaux

Le [Service de Notification des Journaux](/service-log-notification) implémente un serveur syslog qui reçoit les avertissements et les erreurs des produits JS7 tels que les Contrôleurs et les Agents. Le service peut être configuré pour envoyer des notifications, par exemple, par courrier électronique.

Les notifications sont affichées sur la page [Moniteur - Notifications du Système](/monitor-notifications-system).

La page *Réglages* est accessible à partir de l'icône ![wheel icon](assets/images/wheel.png) dans la barre de menu.

Les paramètres suivants s'appliquent au service de notification des journaux. Les modifications prennent effet immédiatement.

## Paramètres du service de notification des journaux

### Paramètre : *log\_server\_active*, Défaut : *false*

Spécifie que le service de notification des journaux est démarré avec JOC Cockpit.

### Paramètre : *log\_server\_port*, Défaut : *4245*

Spécifie le port UDP sur lequel le service de notification des journaux écoutera.

### Paramètre : *log\_server\_max\_messages\_per\_second*, Défaut : *1000*

Indique le nombre maximum de messages par seconde que le service de notification des journaux traitera.

## Références

### Aide contextuelle

- [Moniteur - Notifications du Système](/monitor-notifications-system)
- [Réglages](/settings)
- [Service de Notification des Journaux](/service-log-notification)

### Product Knowledge Base

- [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
