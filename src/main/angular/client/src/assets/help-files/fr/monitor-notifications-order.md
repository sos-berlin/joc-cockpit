# Moniteur - Notifications d'Ordres

La vue affiche les notifications émises par les Workflows.

Les notifications sont configurées à partir de la page [Configuration - Notification](/configuration-notification) et peuvent être émises en cas de succès, d'avertissement ou d'erreur dans l'exécution d'un Ordre ou d'une tâche.

- Le fragment *notify_on_failure_gui* spécifie si les notifications deviennent visibles dans cette vue.
- En plus d'être affichées dans cette vue, les notifications peuvent être transmises par courrier électronique et à partir de la ligne de commande, par exemple à des produits System Monitor tiers. Pour plus de détails, consultez [Configuration - Notification ](/configuration-notification).

Les utilisateurs doivent savoir que les notifications peuvent être purgées par le [Service d'Assainissement](/service-cleanup). Par défaut, les notifications sont purgées si elles datent de plus d'un jour.

## Affichage des notifications

Les notifications sont affichées à partir des éléments d'information suivants :

- **Workflow** spécifie le nom d'un Workflow. 
  - En cliquant sur le nom du Workflow, vous accédez à la vue [Workflows](/workflows).
  - En cliquant sur l'icône représentant un crayon à gauche du nom du Workflow, vous accédez à la vue [Configuration - Inventaire - Workflows](/configuration-inventory-workflows).
- **ID Ordre** spécifie l'identifiant unique d'un Ordre.
- **Tâche** est indiqué si l'avertissement ou l'erreur a été causé par une tâche.
- **Type** est l'un des éléments suivants
  - **Succès** qui indique que l'Ordre a été exécuté avec succès, à condition que les notifications soient configurées pour signaler cet état.
  - **Avertissement** qui est déclenché par des tâches Shell pour lesquels des codes de retour spécifiques sont configurés pour être des *Avertissements* qui n'affecteront pas le flux d'un Ordre mais qui déclencheront la Notification correspondante.
  - **Erreur** qui peut être levée par des Jobs ou d'autres instructions de Workflow. La notification est déclenchée indépendamment du fait qu'un Workflow puisse appliquer une gestion d'erreur comme dans l'instruction *Try/Catch* ou *Retry* qui permettra à un Ordre de continuer dans le Workflow.
  - **Rétabli** qui indique qu'un Ordre précédemment *échoué* s'est rétabli et a été traité avec succès dans le Workflow.
- **Code de retour** indique le code de sortie des Jobs Shell ou le code de retour des Jobs JVM qui ont émis la Notification.
- **Message** contient le message d'erreur ou d'avertissement.
- **Crée** indique la date à laquelle la notification a été émise.

Un avertissement ou une erreur peut donner lieu à un certain nombre de notifications en fonction de la configuration correspondante, par exemple l'affichage de la notification avec cette vue et la transmission de la notification par courrier électronique. 

Une entrée distincte est affichée pour chaque canal configuré pour la notification. Les entrées pour les notifications par courrier ou à partir de la ligne de commande offrent une icône *flèche vers le bas* qui montre des détails sur l'utilisation réussie/non réussie du canal correspondant.

## Opérations sur les notifications

Pour chaque notification d'avertissement et d'erreur, le menu d'action à 3 points permet d'effectuer l'opération suivante :

- **Acquitter** indique que l'utilisateur a pris connaissance de la notification et qu'il prend des mesures. L'opération fait apparaître une fenêtre contextuelle qui permet de spécifier un commentaire sur le traitement de la notification. <br/><br/>Par défaut, les notifications ayant fait l'objet d'un accusé de réception ne sont pas affichées. Elles peuvent être rendues visibles en sélectionnant le bouton de filtre *Accusé de réception*.

## Filtres

Le haut de la page propose un certain nombre de boutons de filtrage qui peuvent être appliqués individuellement ou en combinaison :

- **Succès** limite l'affichage aux notifications relatives à l'exécution réussie d'un Ordre.
- **Erreur** limite l'affichage des notifications aux Ordres qui ont *échoué*.
- **Avertissement** limite l'affichage des notifications aux Ordres qui ont provoqué des avertissements.
- **Rétabli** limite l'affichage des notifications aux Ordres qui ont d'abord échoué, puis se sont rétablis en poursuivant avec succès le Workflow.
- **Reconnu** limite l'affichage aux notifications qui ont déjà fait l'objet d'un accusé de réception dans le cadre de l'opération concernée.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
- [Configuration - Notification](/configuration-notification)
- [Moniteur - Notifications du Système](/monitor-notifications-system)
- [Service d'Assainissement](/service-cleanup)
- [Workflows](/workflows)

### Product Knowledge Base

- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
