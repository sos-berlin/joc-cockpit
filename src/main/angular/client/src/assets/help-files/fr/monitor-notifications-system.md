# Moniteur - Notifications du Système

Cette vue affiche les notifications émises par les produits JS7.

- Les notifications système nécessitent la configuration du *Service de notification de journal* à partir de la page [Réglages](/settings) section [Réglages - Notifications des Journaux](/settings-log-notification). S'il est configuré, le JOC Cockpit agit comme un service syslog qui reçoit les avertissements et les erreurs des Contrôleurs et des Agents enregistrés dans le JOC Cockpit.
- Outre l'affichage des notifications dans cette vue, celles-ci peuvent être transmises par courrier et à partir de la ligne de commande, par exemple à des produits System Monitor tiers. Pour plus d'informations, consultez le site [Configuration - Notification ](/configuration-notification).

Les utilisateurs doivent savoir que les notifications peuvent être purgées par le [Service d'Assainissement](/service-cleanup). Par défaut, les notifications sont purgées si elles datent de plus d'un jour.

## Affichage des notifications

Les notifications sont affichées à partir des éléments d'information suivants :

- **ID JOC Cockpit** spécifie l'identifiant unique de l'instance du JOC Cockpit. 
  - **Le préfixe** est généralement *joc* pour une instance du JOC Cockpit qui offre un accès à l'interface graphique.
  - **Le numéro de série** est le numéro attribué à l'instance du JOC Cockpit lors de l'installation.
- **Catégorie** indique le produit JS7 qui a émis la notification, parmi *JOC*, *CONTROLLER*, *AGENT*.
- **Source** indique la source de la notification 
  - **LogNotification** indique que le message a été reçu de l'interface syslog.
  - **Deployment** indique une opération de déploiement dans l'instance actuelle du JOC Cockpit.
- **Notificateur** est l'un des éléments suivants
  - **<*Controller-ID*>** indique l'identifiant unique d'un Contrôleur si la *Catégorie CONTROLLER* est spécifiée.
  - **<*Agent-Name*>(<*Director-Agent*>)** indique le nom de l'Agent si la *Catégorie AGENT* est spécifiée.
  - **<*Java-class*>** indique le nom de la classe Java qui a émis la notification.
- **Type** est l'un des suivants
  - **WARNING** qui indique un avertissement dans le journal du produit JS7.
  - **ERROR** qui indique une erreur dans le journal du produit JS7.
- **Message** contient le message d'erreur ou d'avertissement.
- **Exception** indique l'exception à l'origine de la notification.
- **Creé** indique la date à laquelle la notification a été émise.

Un avertissement ou une erreur peut donner lieu à un certain nombre de notifications en fonction de la configuration correspondante, par exemple l'affichage de la notification avec cette vue et la transmission de la notification par courrier électronique. 

Une entrée distincte est affichée pour chaque canal configuré pour la notification. Les entrées pour les notifications par courrier ou à partir de la ligne de commande offrent une icône *flèche vers le bas* qui montre des détails sur l'utilisation réussie/non réussie du canal correspondant.

## Opérations sur les notifications

Pour chaque notification d'avertissement et d'erreur, le menu d'action à 3 points est proposé avec l'opération suivante :

- **Accuser réception** indique que l'utilisateur a pris connaissance de la notification et qu'il prend des mesures. L'opération fait apparaître une fenêtre contextuelle qui permet de spécifier un commentaire sur le traitement de la notification. <br/><br/>Par défaut, les notifications ayant fait l'objet d'un accusé de réception sont exclues de l'affichage. Elles peuvent être rendues visibles en sélectionnant le bouton de filtre *Accusé de réception*.

## Filtres

Le haut de la page propose un certain nombre de boutons de filtre qui peuvent être appliqués individuellement ou en combinaison.

Les boutons suivants filtrent la source des notifications :

- **Tous** affiche les notifications de tous les produits JS7.
- **Système** limite les notifications aux problèmes survenus dans le système d'exploitation.
- **JOC** limite l'affichage des notifications aux Ordres *échoués*. 
- **Contrôleur** limite l'affichage des notifications aux Ordres qui ont provoqué des avertissements.
- **Agent** limite l'affichage des notifications aux Ordres qui ont d'abord échoué, puis se sont rétablis en poursuivant avec succès le Workflow.

Les boutons suivants permettent de filtrer le type de notifications :

- **Erreur** spécifie que les notifications de *Type* ERREUR doivent être affichées.
- **Avertissement** spécifie que les notifications de type *Avertissement* doivent être affichées.
- **Reconnu** limite l'affichage aux notifications qui ont déjà fait l'objet d'un accusé de réception dans le cadre de l'opération concernée.

## Références

### Aide contextuelle

- [Configuration - Notification ](/configuration-notification)
- [Moniteur - Notifications d'Ordre](/monitor-notifications-order)
- [Réglages](/settings)
- [Réglages - Notifications des Journaux](/settings-log-notification)
- [Service d'Assainissement](/service-cleanup)
- [Workflows](/workflows)

### Product Knowledge Base

- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
