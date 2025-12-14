# Historique des Ordres

La vue *Historique des Ordres* résume l'historique de l'exécution des Ordres. Cela inclut l'historique d'exécution des tâches utilisés dans les Workflows déclenchés par les Ordres associés.

L'Historique des Ordres est sujet à une purge de la base de données effectuée par le [Service d'Assainissement](/service-cleanup).

Pour l'Historique des Tâches, voir [Historique des Tâches](/history-tasks).

## Vue de navigation

La vue de gauche permet de filtrer les Tags des Workflows et des Ordres.

- les **Tags de Workflow** sont attribuées à partir de la vue [Configuration - Inventaire - Workflows](/configuration-inventory-workflows).
- les **Tags d'Ordres** sont attribuées à partir de la vue [Configuration - Inventaire - Planifications](/configuration-inventory-schedules).

Les Tags sont sélectionnées à partir des icônes + et - et peuvent être recherchées à l'aide de l'icône Recherche rapide. L'affichage des Tags doit être activé à partir de la page [Réglages - JOC Cockpit](/settings-joc).

## Vue Historique

L'affichage est limité à un maximum de 5000 entrées, sauf indication contraire sur la page [Profil - Préférences](/profile-preferences).

### Historique des Ordres

- **L'ID de l'Ordre** est l'identifiant unique attribué à un Ordre. En cliquant sur l'icône flèche vers le bas, vous afficherez les variables de l'Ordre et les tâches passés par l'Ordre. 
- **Workflow** indique le Workflow passé par l'Ordre.
  - En cliquant sur le nom du Workflow, vous accédez à la vue [Workflows](/workflows).
  - En cliquant sur l'icône en forme de crayon, vous accédez à la vue [Configuration - Inventaire - Workflows](/configuration-inventory-workflows).
- **Label** indique la dernière position de l'Ordre dans le Workflow. Les utilisateurs peuvent attribuer des *Labels* aux instructions du Workflow qui seront affichées, sinon la position technique sera indiquée.
- **Historique** indique l'état de l'historique qui est le dernier résultat dans la vie de l'Ordre.
  - Si les Ordres sont terminés, le *Statut de l'historique* sera *succès* ou *échec*.
  - Si les Ordres ne sont pas terminés, le *Statut de l'Historique* sera *en cours*.
- **Ordre State** indique le dernier état de l'Ordre, voir [États d'Ordre](/order-states).
  - Si les Ordres sont terminés, l'*état de l'Ordre* sera *réussi* ou *échec*.
  - Si les Ordres ne sont pas terminés, l'état de l'Ordre sera *en cours de traitement*.

### Accès à la sortie du journal

- **ID Ordre ** : En cliquant sur l'ID de l'Ordre, vous afficherez le journal de sortie de l'Ordre à partir de [Affichage du Journal d'Ordre](/order-log). Le journal comprend les données de sortie créées par tous les tâches exécutés avec le Workflow.
- **Icône de téléchargement** : cliquez sur l'icône pour télécharger le journal de l'Ordre dans un fichier.

Par défaut, l'affichage des journaux de l'Ordre est limité à une taille de 10 Mo et, dans le cas contraire, les journaux sont téléchargés dans des fichiers. Les utilisateurs peuvent ajuster la limite à partir de la page [Réglages - JOC Cockpit](/settings-joc).

### Opérations sur l'Historique des tâches

Les utilisateurs trouvent un menu d'action par tâche qui offre les opérations suivantes :

- **Ajouter le Workflow à la liste d'ignorés** masque définitivement l'affichage des Ordres du Workflow. Cette opération peut s'avérer utile pour les Workflows cycliques qui alimentent l'Historique des Ordres.

La *Liste d'ignorés* est gérée à partir du bouton correspondant dans le coin supérieur droit de la fenêtre :

- **Editer la liste d'ignorés** affiche les Jobs et les Workflows dans la *Liste d'ignorés* et propose de supprimer individuellement des entrées de la *Liste d'ignorance*. 
- **Activer la liste d'ignorés** active le filtrage pour masquer les Jobs qui ont été ajoutées individuellement à la liste d'ignorés ou qui sont incluses dans un Workflow qui a été ajouté. Une *Liste d'ignorés* active est indiquée par le bouton correspondant.
- **Désactiver la liste d'ignorés** désactive le filtrage des tâches et des Workflows. L'opération est disponible pour une *Liste d'ignorés* active.
- **Réinitialiser la liste d'ignorés** supprime les Tâches et les Workflows de la liste d'ignorés, ce qui permet d'afficher toutes les Tâches.

## Filtres

L'utilisateur peut appliquer les filtres disponibles en haut de la fenêtre pour limiter l'affichage des Ordres.

- les boutons de filtrage **Succès**, **Echoué**, **En Progression** limitent l'affichage aux Ordres ayant le *l'Etat* correspondant.
- les boutons de filtrage **Démarrage plage de dates** permettent de choisir la plage de dates pour l'affichage des Ordres.
- la case à cocher **Contrôleur actuel** limite l'affichage des Ordres au Contrôleur actuellement sélectionné.

## Références

### Aide contextuelle

- [Affichage du Journal d'Ordre](/order-log)
- [Configuration - Inventaire - Planifications](/configuration-inventory-schedules)
- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
- [États d'Ordre](/order-states)
- [Historique des Tâches](/history-tasks)
- [Profil - Préférences](/profile-preferences)
- [Réglages - JOC Cockpit](/settings-joc)
- [Service d'Assainissement](/service-cleanup)
- [Workflows](/workflows)

### Product Knowledge Base

- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Task History](https://kb.sos-berlin.com/display/JS7/JS7+-+Task+History)
