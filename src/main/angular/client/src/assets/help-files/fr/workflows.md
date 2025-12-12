# Workflow

La vue *Workflows* permet de surveiller et de contrôler les Workflows.

- Les utilisateurs peuvent identifier les Ordres en cours de traitement pour des Workflows spécifiques.
- Les utilisateurs peuvent ajouter des Ordres à des Workflows sur demande. Ces Ordres ne sont pas ajoutés au site [Daily Plan](/daily-plan), mais sont ajoutés de manière ad hoc.

## Panneau de navigation

Le menu de gauche est organisé en onglets qui permettent de naviguer à partir de dossiers et de filtrer par Tags pour les Workflows et les Ordres.

- **La navigation par dossier** offre l'icône chevron vers le bas lorsque vous survolez le nom d'un dossier. Cela permet d'afficher les Workflows du dossier en cours et de tous les sous-dossiers. L'utilisation de l'icône de chevron vers le haut réinitialise la sélection au dossier actuel.
- Le filtrage par tag est proposé à partir des onglets suivants :
  - **Les tags de Workflow** sont attribuées à partir de la vue [Configuration - Inventory - Workflows](/configuration-inventory-workflows).
  - les **tags d'ordres** sont attribuées à partir de la vue [Configuration - Inventory - Schedules](/configuration-inventory-schedules).

Les tags sont sélectionnées à partir des icônes + et - et peuvent être recherchées à l'aide de l'icône Recherche rapide. L'affichage des tags doit être activé à partir de la page [Settings - JOC Cockpit](/settings-joc).

## Panneau Workflow

### Résumé de l'Ordre

La partie supérieure de la fenêtre contient le récapitulatif des Ordres, comme sur le site [Dashboard - Orders](/dashboard-orders). Les utilisateurs peuvent cliquer sur le nombre d'Ordres indiqué pour un état donné afin d'ouvrir une fenêtre contextuelle qui affichera la liste des Ordres.

Le résumé de l'Ordre est indiqué pour les Ordres liés aux Workflows affichés pour les dossiers ou les tags sélectionnés.

### Affichage des Workflows

- **Le *Nom du Workflow** est le nom unique attribué à un Workflow.
  - En cliquant sur le *Nom du Workflow*, vous ferez apparaître le panneau *Historique* dans la partie inférieure de la fenêtre qui affiche l'historique récent de l'exécution du Workflow.
  - En cliquant sur la grande icône de flèche vers le bas, vous afficherez tous les travaux et toutes les instructions de Workflow.
  - En cliquant sur la petite icône flèche vers le bas, vous afficherez les travaux et les instructions de Workflow de niveau supérieur.
  - En cliquant sur l'icône en forme de crayon, vous accédez à la vue [Configuration - Inventory - Workflows](/configuration-inventory-workflows).
  - En cliquant sur l'icône +, une fenêtre contextuelle s'ouvre sur [Add Orders](/workflows-orders-add).
- les icônes **Vue tabulaire**, **Vue graphique** sont disponibles pour afficher les Workflows
  - en format tabulaire qui se concentre sur une structure concise et économise de l'espace dans la fenêtre.
  - en format graphique qui est plus parlant pour un certain nombre d'utilisateurs.
- **Date de déploiement** indique la date à laquelle le Workflow a été déployé.
- **Le statut du déploiement** indique si le Workflow est déployé dans le contrôleur et les agents.
  - **Synchronisé** Les Workflows sont déployés et sont disponibles auprès du contrôleur et des agents.
  - **Non synchronisé** Les Workflows ne sont pas déployés vers le contrôleur et les agents mais sont disponibles uniquement à partir de l'inventaire.
  - **Les Workflows suspendus** sont gelés, ils acceptent les Ordres mais n'autorisent pas le démarrage des Ordres jusqu'à ce que les Workflows reprennent.
  - **Les Workflows en attente** attendent la confirmation par un ou plusieurs agents que le Workflow est suspendu ou repris.
- **No. d'Ordres** indique le nombre d'Ordres assignés au Workflow. 
  - Jusqu'à trois Ordres sont affichés directement avec le Workflow. Ils offrent un menu d'action pour les opérations de l'Ordre.
    - Les utilisateurs peuvent cliquer sur l'ID de l'Ordre indiqué pour afficher le journal de sortie de l'Ordre à partir de [Order Log View](/order-log). Le journal comprend la sortie créée par tous les tâches exécutés avec le Workflow.
  - En cliquant sur le *No. d'Ordres*, une fenêtre contextuelle s'ouvre, affichant tous les Ordres associés et proposant des opérations sur des Ordres individuels et des opérations en masse sur des Ordres sélectionnés.

### Affichage des travaux et des instructions de Workflow

Lorsqu'un Workflow est développé à l'aide de l'icône flèche vers le bas disponible pour un Workflow, ses tâches et Instructions de Workflow seront affichés.

## L'Affichage Historique

Cette vue s'affiche dans la partie inférieure de la fenêtre lorsque les utilisateurs cliquent sur le nom du Workflow ou ajoutent un Ordre.

### Historique de l'Ordre

- **L'ID de l'Ordre** est l'identifiant unique attribué à un Ordre. En cliquant sur l'icône de la flèche vers le bas, les variables de l'Ordre et les Ordres passés par l'Ordre s'affichent. 
- **Tag** indique la dernière position d'un Ordre dans le Workflow. Les utilisateurs peuvent assigner des *tags* aux instructions de Workflow qui seront affichées et sinon la position technique sera indiquée.
- **État** indique le dernier résultat dans la vie de l'Ordre.
  - Si les Ordres sont terminés, le *Statut de l'historique* sera *succès* ou *échec*.
  - Si les Ordres ne sont pas terminés, l'état de l'historique sera *en cours*.
- **État de l'Ordre** indique le dernier état de l'Ordre, voir [Order States](/order-states).
  - Si les ordres sont terminés, l'*état de l'ordre* sera *réussi* ou *échec*.
  - Si les Ordres ne sont pas terminés, l'état de l'Ordre sera *en cours de traitement*.

Les options suivantes sont disponibles pour l'accès à la sortie du journal :

- **Identification de l'Ordre** : en cliquant sur l'ID de l'Ordre, vous afficherez le journal de l'Ordre à partir du site [Order Log View](/order-log). Le journal comprend les données créées par tous les tâches exécutés avec le Workflow.
- **Icône de téléchargement** : cliquez sur l'icône pour télécharger le journal de l'Ordre dans un fichier.

Par défaut, l'affichage des journaux de l'Ordre est limité à une taille de 10 Mo et, dans le cas contraire, les journaux sont téléchargés dans des fichiers. Les utilisateurs peuvent ajuster la limite à partir de la page [Settings - JOC Cockpit](/settings-joc).

### Historique des Processus

- **Tâches** indique le nom de la tâche.
- **Tag** indique la position de la tâche dans le Workflow.
- **Status** est le résultat de l'exécution du tâche indiqué par *en progression*, *succès* ou *échoué*.
- **Heure de démarrage**, **Heure de fin** indiquent le début et la fin de l'exécution du tâche.
- la **criticité** est spécifiée à l'adresse [Configuration - Inventory - Workflows - Job Options](/configuration-inventory-workflow-tâche-options) et indique la pertinence d'une tâche :
  - *Mineur*
  - *Normal*
  - *Majeur*
  - *Critique*
- **Code de retour** est le code de sortie d'un tâche Shell ou le code de retour d'un tâche JVM. Le panneau [Configuration - Inventory - Workflows - Job Properties](/configuration-inventory-workflow-tâche-properties) permet de configurer les codes de retour en cas de succès ou d'échec de l'exécution d'un tâche.

Pour accéder à la sortie du journal, l'action suivante est disponible :

- **Tâches** : en cliquant sur le *nom de tâche*, vous afficherez le journal de sortie de la taĉhe à partir du site [Task Log View](/task-log). 

Par défaut, l'affichage des journaux de tâches est limité à une taille de 10 Mo et, dans le cas contraire, les journaux sont téléchargés dans des fichiers. Les utilisateurs peuvent ajuster la limite à partir de la page [Settings - JOC Cockpit](/settings-joc).

### Journal d'audit

Cette vue affiche les mêmes informations que le site [Audit Log](/audit-log) en se concentrant sur le Workflow en cours.

Le nombre d'entrées du journal d'audit affichées peut être modifié à partir du paramètre *Nombre maximum d'entrées du journal d'audit par objet* dans le site de l'utilisateur [Profile - Preferences](/profile-preferences).

## Opérations

### Opérations sur les Workflows

En haut de la fenêtre, les boutons suivants sont proposés pour les opérations sur les Workflows :

- **Suspendre tout** agit comme un *arrêt d'urgence* et suspend tous les Workflows, quelle que soit la sélection de Workflows actuellement affichée. Les Workflows suspendus sont gelés, ils acceptent les Ordres mais ne démarrent pas d'Ordres à moins que le Workflow ne soit repris. Les Ordres en cours d'exécution poursuivent le tâche en cours ou une autre instruction avant d'être suspendus.
- **Reprendre tout** reprend tous les Workflows suspendus, quelle que soit la sélection de Workflows actuellement affichée.

### Opérations sur les tâches et les instructions de Workflow

Les opérations suivantes sont disponibles pour les tâches à partir du menu d'action correspondant :

- **Ignorer** empêche un Ordre d'exécuter le tâche associé et le fait passer à l'instruction de Workflow suivante.
- **Inclure ** rétablit un taĉhe précédemment ignoré.
- **Arrêter** suspend les Ordres arrivant à la tâche. Les ordres peuvent être poursuivis à partir d'une opération *Reprise* qui permet de continuer le traitement à partir d'un autre noeud de Workflow ou de forcer le traitement de la taĉhe arrêté.
- **Debloquer ** rétablit une tâche précédemment arrêté.

### Opérations sur les Ordres

Les utilisateurs disposent d'un menu d'action par Ordre qui propose les opérations suivantes :

- **Annuler** met fin à l'Ordre. *Les Ordres en cours d'exécution* termineront la taĉhe ou l'instruction de Workflow en cours et quitteront le Workflow avec un *état d'historique* *échec*.
- **Annuler et tuer la tâche** Les Ordres en cours d'exécution termineront le tâche ou l'instruction en cours et quitteront avec un *état de l'historique* *Annuler/terminer la tâche** mettra fin de force aux Ordres en cours d'exécution. Les Ordres quitteront le Workflow avec un *état d'historique* *échec*.
- **Suspendre** suspend l'Ordre. Les Ordres en cours d'exécution seront suspendus une fois qu'ils auront terminé la tâche ou l'instruction de Workflow en cours.
- **Suspendre/terminer la tâche** mettra fin de force aux Ordres *en cours* et suspendra les Ordres.
- **Suspendre/réinitialiser** réinitialise immédiatement l'instruction de Workflow en cours et remet l'Ordre à l'état *suspendu*. Cette option peut être combinée avec l'arrêt forcé des tâches pour les Ordres en cours d'exécution.
- **Reprendre** poursuivra un Ordre *suspendu* ou *échec* pouvant être repris.

D'autres opérations spécifiques à l'état de l'Ordre peuvent être disponibles.

## Filtres

Les utilisateurs peuvent appliquer des filtres pour limiter l'affichage des Workflows. Des boutons de filtrage sont disponibles en haut de la fenêtre :

- **Agents** permet de filtrer les Workflows contenant des tâches affectés à un ou plusieurs Agents sélectionnés.
- **Synchronisés** Les Workflows sont déployés et sont disponibles avec le contrôleur et les agents.
- **Non synchronisés** Les Workflows ne sont pas déployés auprès du contrôleur et des agents, mais sont uniquement disponibles à partir de l'inventaire.
- **Les Workflows suspendus** sont gelés, ils acceptent les Ordres mais n'autorisent pas le démarrage des Ordres jusqu'à ce que les Workflows reprennent.
- **Les Workflows en suspens** attendent la confirmation par un ou plusieurs agents que le Workflow est suspendu.
- **Filtre d'Ordres** permet de spécifier la plage de dates pour laquelle les Ordres *plannifiés* seront affichés pour les Workflows sélectionnés.

Le *Filtre avancé* offre des critères plus détaillés pour le filtrage des Workflows.

## Recherche

Le site [Workflows - Search](/workflows-search) offre des critères pour rechercher des Workflows à partir de dépendances, par exemple rechercher des Workflows incluant un nom de tâche spécifique, ou utilisant des tableaux d'affichage spécifiques.

## Références

### Aide contextuelle

- [Configuration - Inventory - Schedules](/configuration-inventory-schedules)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  - [Configuration - Inventory - Workflows - Job Properties](/configuration-inventory-workflow-tâche-properties)
  - [Configuration - Inventory - Workflows - Job Options](/configuration-inventory-workflow-tâche-options)
- [Daily Plan](/daily-plan)
- [Order Log View](/order-log)
- [Order States](/order-states)
- [Profile - Preferences](/profile-preferences)
- [Settings - JOC Cockpit](/settings-joc)
- [Workflows - Add Orders](/workflows-orders-add)
- [Workflows - Search](/workflows-search)

### Product Knowledge Base

- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
- [JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows)

