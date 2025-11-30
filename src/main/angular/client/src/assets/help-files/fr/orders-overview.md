# Vue d'ensemble des Ordres

La vue *Aperçu des Ordres* permet de surveiller et de contrôler les Ordres pour les Workflows.

- Les utilisateurs peuvent identifier les Ordres en cours de traitement sur [Order State](/order-states).
- Les utilisateurs peuvent assurer la transition des Ordres, par exemple en annulant des Ordres *en cours d'exécution*.
- La vue contient les Ordres qui sont ajoutés par [Daily Plan](/daily-plan) et les Ordres qui ont été ajoutés sur demande.

## Panneau de sélection de l'état de l'Ordre

Le panneau de gauche indique le nombre d'Ordres disponibles par état. Si vous cliquez sur l'État ou le numéro correspondant, les Ordres correspondants s'affichent dans le panneau des Ordres.

## Panneau des étiquettes

Le panneau central est organisé en onglets qui permettent de filtrer les Ordres par étiquettes.

- les **étiquettes de Workflow** sont attribuées à partir de la vue [Configuration - Inventory - Workflows](/configuration-inventory-workflows).
- les **étiquettes d'ordres** sont attribuées à partir de la vue [Configuration - Inventory - Schedules](/configuration-inventory-schedules).

Les étiquettes sont sélectionnées à partir des icônes + et - et peuvent être recherchées à l'aide de l'icône de recherche rapide. L'affichage des étiquettes doit être activé à partir de la page [Settings - JOC Cockpit](/settings-joc).

## Panneau Ordre

Ce panneau présente la liste des Ordres pour l'état donné :

- **Ordre ID** est l'identifiant unique attribué à un Ordre.
  - En cliquant sur l'icône de la flèche vers le bas, vous afficherez les variables de l'Ordre.
- **Nom du Workflow** est le nom unique attribué à un Workflow.
  - En cliquant sur le *Nom du Workflow*, vous accédez à la vue [Workflows](/workflows).
  - En cliquant sur l'icône en forme de crayon, vous accédez à la vue [Configuration - Inventory - Workflows](/configuration-inventory-workflows).
- **Étiquette** indique la position de l'Ordre à partir de l'étiquette de l'instruction de Workflow. En l'absence d'étiquettes, la position technique est indiquée.
- **État** indique l'adresse [Order State](/order-states).
  - Le passage de la souris sur l'indicateur d'état permet d'afficher des détails s'ils sont disponibles. Par exemple, les Ordres *en attente* indiquent des raisons telles que *en attente d'un processus*, *en attente d'un tableau d'affichage*, etc.
- **Planifié pour** indique la date de début de l'Ordre.

## Panneau Historique

Ce panneau s'affiche dans la partie inférieure de la fenêtre lorsque l'utilisateur clique sur l'identifiant de l'ordre. Le panneau contient des sous-onglets pour *l'Historique de l'Ordre* et *le Journal d'Audit*.

### Historique de l'Ordre

- **L'ID de l'Ordre** est l'identifiant unique attribué à un Ordre. Cliquez sur l'icône de la flèche vers le bas pour afficher les variables de l'Ordre.
- **L'étiquette** indique la dernière position d'un Ordre dans le Workflow. Les utilisateurs peuvent assigner des *étiquettes* aux instructions de Workflow qui seront affichées et sinon la position technique sera indiquée.
- **L'Historique** indique le dernier résultat dans la vie de l'Ordre.
  - Si les Ordres sont terminés, le *Statut de l'historique* sera *succès* ou *échec*.
  - Si les Ordres ne sont pas terminés, le *Statut de l'Historique* sera *en cours*.
- **Heure planifiée** indique la date et l'heure initiales pour lesquelles l'Ordre a été planifié.
- **L'heure de début** indique la date et l'heure effectives de début de l'Ordre.
- **L'heure de fin** indique la date et l'heure auxquelles l'Ordre s'est achevé.

#### Accès à la sortie du journal

- **ID de l'Ordre** : En cliquant sur le *Ordre ID* dans le panneau *Historique*, vous afficherez le journal de sortie de l'Ordre à partir du site [Order Log View](/order-log). Le journal comprend les données de sortie créées par tous les Jobs exécutés avec le Workflow.
- **Icône de téléchargement** : cliquez sur l'icône pour télécharger le journal de l'Ordre dans un fichier.

Par défaut, l'affichage des journaux de l'Ordre est limité à une taille de 10 Mo et, dans le cas contraire, les journaux sont téléchargés dans des fichiers. Les utilisateurs peuvent ajuster la limite à partir de la page [Settings - JOC Cockpit](/settings-joc).

### Journal d'audit

Le *Journal d'audit* indique les opérations de modification effectuées sur l'Ordre.

- **Créé** indique la date à laquelle l'opération a été effectuée.
- **Compte** indique le compte d'utilisateur qui a effectué l'opération.
- **Request** indique le point de terminaison de l'API REST qui a été appelé.
- **Category** précise la classification de l'opération telle que CONTROLLER lors de l'annulation d'Ordres ou DAILYPLAN lors de la création d'Ordres à partir du site [Daily Plan](/daily-plan).
- **Raison** explique pourquoi un Ordre a été modifié. Le JOC Cockpit peut être configuré pour imposer la spécification des raisons lors de la modification d'objets.
  - Ce paramètre est disponible à l'adresse [Profile - Preferences](/profile-preferences).
  - Le paramètre peut être appliqué à partir de la page [Settings - JOC Cockpit](/settings-joc).
- **Temps passé** similaire à la spécification des *motifs*, le temps passé sur une opération peut être ajouté lors de la modification des Ordres.
- **Ticket Link** similaire à la spécification de *Reasons* une référence à un système de tickets peut être ajoutée lors de la modification des Ordres.

## Opérations

### Opérations sur les Ordres

Les utilisateurs trouvent un menu d'action par Ordre qui propose les opérations disponibles pour l'état donné de l'Ordre.

Pour les Ordres en *attente*, *planifié*, *en cours*, *en cours d'exécution*, *suspendu*, *prompte*, *en attente*, *échec*, les opérations suivantes sont proposées :

- **Modifier la priorité** 
  - Si un Ordre rencontre une instruction de *verrouillage de ressources* dans le Workflow qui limite le parallélisme, alors sa *Priorité* détermine la position dans la file d'attente des *Ordres en attente*.
  - les *priorités* sont spécifiées à partir d'entiers négatifs, nuls et positifs ou à partir des raccourcis proposés. Une *priorité* plus élevée est prioritaire. Les raccourcis offrent les valeurs suivantes :
    - **Basse** : -20000
    - **Inférieur à la normale** : -10000
    - **Normal** : 0
    - **Au-dessus de la normale** : 10000
    - **Haut** : 20000
- **Annuler** met fin à l'Ordre. Les Ordres en cours d'exécution termineront le travail ou l'instruction de Workflow en cours et quitteront le Workflow avec un statut d'historique d'échec.
- **Annuler/terminer la tâche** mettra fin de force aux Ordres en cours d'exécution d'une tâche. Les Ordres quitteront le Workflow avec un statut d'historique d'échec.
- **L'annulation/réinitialisation** mettra fin de force aux Ordres exécutant une tâche. Les Ordres quitteront le Workflow avec un statut d'historique d'échec.
- **Suspendre** suspend l'Ordre. Les Ordres en cours d'exécution seront suspendus après avoir terminé la tâche ou l'instruction de Workflow en cours.
- **Suspendre/terminer la tâche** mettra fin de force aux Ordres en cours et suspendra les Ordres.
- **Suspendre/réinitialiser** réinitialise immédiatement l'instruction de Workflow en cours et remet l'Ordre dans l'état *suspendu*. Cette option peut être combinée avec l'arrêt forcé des tâches pour les Ordres en cours d'exécution.
- **Reprendre** poursuivra un Ordre *suspendu* ou *échec* pouvant être repris.

Les opérations suivantes sont proposées pour les Ordres dans l'état *achevé* et pour les Ordres perturbés dans l'état *échec* :

- **Laisser le Workflow** mettra fin à l'Ordre. 
  - les Ordres *complétés* quitteront le Workflow avec un statut historique *successful*.
  - les Ordres *échec/perturbés* quitteront le Workflow avec un statut historique *échec*.

D'autres opérations spécifiques à l'état de l'Ordre peuvent être disponibles.

### Opérations en masse

Les opérations en bloc sont disponibles lors de la sélection d'Ordres à partir de cases à cocher connexes. Elles offrent les mêmes opérations que pour les Ordres individuels.

Lorsque vous sélectionnez des Ordres, les boutons relatifs aux opérations groupées deviennent visibles dans la partie supérieure de la fenêtre, avec des légendes similaires à celles des opérations expliquées ci-dessus.

## Filtres

Les utilisateurs peuvent appliquer des filtres pour limiter l'affichage des Ordres. Les boutons de filtre sont disponibles en haut de la fenêtre.

### Bouton de filtrage de la plage de dates

Ce bouton déroulant permet de sélectionner des Ordres à partir d'une plage de dates :

- **Tous** spécifie les Ordres planifiés pour n'importe quelle date passée et future qui sont affichés.
- **Today** Les Ordres sont liés à la journée en cours qui est calculée à partir du fuseau horaire dans le site [Profile - Preferences](/profile-preferences).
- **Prochaine heure** inclut les Ordres qui devraient commencer dans l'heure qui suit.
- **Les 12 prochaines heures** comprennent les Ordres qui devraient commencer dans les 12 prochaines heures.
- **Les 24 heures suivantes** comprennent les Ordres qui devraient commencer dans les 24 heures suivantes.
- **Le jour suivant** comprend les Ordres qui devraient commencer jusqu'à la fin du jour suivant.
- **Les 7 prochains jours** comprennent les Ordres qui devraient commencer dans les 7 prochains jours.

### Boutons de filtrage de l'État

Comme pour le *Panneau de sélection de l'état de l'Ordre*, un bouton de filtrage est disponible pour chaque état de l'Ordre afin de filtrer l'affichage des Ordres.

### Filtre de saisie de la date du ... au

Pour les Ordres dans les états *en cours*, *en cours d'exécution*, *échec*, *achevé*, des champs de saisie sont disponibles pour spécifier la date et l'heure à laquelle un Ordre est dans l'état correspondant.

Les utilisateurs peuvent spécifier des dates et heures absolues ou relatives.

### Filtre de résultats

Le filtre limite l'affichage aux *Identifiants d'ordres* et aux *Noms de Workflow* correspondants. Le filtre est appliqué aux Ordres visibles et ne tient pas compte des majuscules et minuscules.

## Références

### Aide contextuelle

- [Configuration - Inventory - Schedules](/configuration-inventory-schedules)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Order Log View](/order-log)
- [Order State](/order-states)
- [Profile - Preferences](/profile-preferences)
- [Settings - JOC Cockpit](/settings-joc)
- [Workflows - Add Orders](/workflows-orders-add)

### Product Knowledge Base

- [JS7 - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Orders)

