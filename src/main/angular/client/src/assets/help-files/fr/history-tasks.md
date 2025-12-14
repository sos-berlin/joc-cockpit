# Historique des Tâches

La vue *Historique des Tâches* résume l'historique de l'exécution des tâches qui sont indiqués indépendamment du Workflow et de l'Ordre pour lesquels ils ont été exécutés.

L'Historique des Tâches est sujet à une purge de la base de données effectuée par le [Service d'Assainissement](/service-cleanup).

Pour l'Historique des Ordres, voir [Historique des Ordres](/history-orders).

## Vue de navigation

La vue de gauche permet de filtrer les Tags des Workflows et des Ordres qui ont déclenché l'exécution de la tâche.

- les **Tags de Workflow** sont attribuées à partir de la vue [Configuration - Inventaire - Workflows](/configuration-inventory-workflows).
- les **Tags d'Ordres** sont attribuées à partir de la vue [Configuration - Inventaire - Planifications](/configuration-inventory-schedules).

Les Tags sont sélectionnées à partir des icônes + et - et peuvent être recherchées à l'aide de l'icône de recherche. L'affichage des Tags doit être activé à partir de la page [Réglages - JOC Cockpit](/settings-joc).

## Historique

L'affichage est limité à un maximum de 5000 entrées, sauf indication contraire sur la page [Profil - Préférences](/profile-preferences).

### Historique des Tâches

- **Nom de la Tâche** indique la tâche en question.
- **Workflow** indique le Workflow pour lequel la tâche a été exécuté.
  - En cliquant sur le nom du Workflow, vous accédez à la vue [Workflows](/workflows).
  - En cliquant sur l'icône en forme de crayon, vous accédez à la vue [Configuration - Inventaire - Workflows](/configuration-inventory-workflows).
- **Label** indique la position de la tâche dans le Workflow. Les utilisateurs attribuent des *Labels* aux tâches qui seront affichés. Si la même tâche apparaît plus d'une fois dans un Workflow, il sera indiqué par des *Labels* différentes.
- **Statut Historique** indique le résultat de la tâche.
  - Si les tâches sont terminés, le *Historique Status* sera soit *succès*, soit *échoué*.
  - Si les tâches ne sont pas terminés, l'état de l'historique sera *en cours*.

### Accès à la sortie du journal

- **Nom** : En cliquant sur le *Nom de la tâche*, vous afficherez le journal de sortie de la tâche à partir de [Affichage du Journal de Tâche](/task-log).
- **Icône de téléchargement** : en cliquant sur l'icône, vous téléchargez le journal de la tâche dans un fichier.

Par défaut, l'affichage des journaux de tâches est limité à une taille de 10 Mo et, dans le cas contraire, les journaux sont téléchargés dans des fichiers. Les utilisateurs peuvent ajuster la limite à partir de la page [Réglages - JOC Cockpit](/settings-joc).

### Opérations sur l'Historique de la Tâche

Les utilisateurs trouvent un menu d'action par tâche qui offre les opérations suivantes :

- **Ajouter la tâche à la liste d'ignorés** pour masquer définitivement la tâche à l'écran. Cela peut s'avérer utile pour les tâches exécutées de manière répétée qui alimentent l'Historique des tâches.
- **Ajouter le Workflow à la liste d'ignorés** pour masquer définitivement l'affichage des tâches du Workflow. Cela peut être utile pour les Workflows cycliques qui alimentent l'Historique des tâches.

La *Liste d'ignorés* est gérée à partir du bouton connexe dans le coin supérieur droit de la fenêtre :

- **Editer la liste d'ignorés** affiche les tâches et les Workflows dans la *Liste d'ignorés* et propose de supprimer individuellement des entrées de la *Liste d'ignorés*. 
- **Activer la liste d'ignorés** active le filtrage pour masquer les Tâches qui ont été ajoutées individuellement à la liste d'ignorés ou qui sont incluses dans un Workflow qui a été ajouté. Une *Liste d'ignorés* active est indiquée par le bouton correspondant.
- **Désactiver la liste d'ignorés** désactive le filtrage des tâches et des Workflows. L'opération est disponible pour une *Liste d'ignorés* active.
- **Réinitialiser la liste d'ignorés** supprime les Tâches et les Workflows de la liste d'ignorés, ce qui permet d'afficher toutes les Tâches.

## Filtres

Les utilisateurs peuvent appliquer les filtres disponibles en haut de la fenêtre pour limiter l'affichage des tâches :

- les boutons de filtrage **Succès**, **Echoué**, **En Progression** limitent l'affichage aux tâches ayant le *Historique Status* correspondant.
- les boutons de filtrage **Plage de Dates** permettent de choisir la plage de dates pour l'affichage des tâches.
- la case à cocher **Contrôleur actuel** limite l'affichage des tâches au Contrôleur actuellement sélectionné.

## Références

### Aide contextuelle

- [Affichage du Journal de Tâche](/task-log)
- [Configuration - Inventaire - Planifications](/configuration-inventory-schedules)
- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
- [Historique des Ordres](/history-orders)
- [Profil - Préférences](/profile-preferences)
- [Réglages - JOC Cockpit](/settings-joc)
- [Service d'Assainissement](/service-cleanup)

### Product Knowledge Base

- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Task History](https://kb.sos-berlin.com/display/JS7/JS7+-+Task+History)
