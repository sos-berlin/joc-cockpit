# Aperçu des Ordres

La vue *Aperçu des Ordres* permet de surveiller et de contrôler les Ordres pour les Workflows.

- Les utilisateurs peuvent identifier les Ordres en cours de traitement sur [État d'Ordre](/order-states).
- Les utilisateurs peuvent assurer la transition des Ordres, par exemple en annulant des Ordres *en exécution*.
- La vue contient les Ordres qui sont ajoutés par [Plan Quotidien](/daily-plan) et les Ordres qui ont été ajoutés sur demande.

## Vue de sélection de l'état de l'Ordre

Le vue de gauche indique le nombre d'Ordres disponibles par état. Si vous cliquez sur l'État ou le numéro correspondant, les Ordres correspondants s'affichent dans le panneau des Ordres.

## Vue des Tags

La vue central est organisé en onglets qui permettent de filtrer les Ordres par Tags.

- **Tags de Workflow** sont attribuées à partir de la vue [Configuration - Inventaire - Workflows](/configuration-inventory-workflows).
- **Tags d'Ordres** sont attribuées à partir de la vue [Configuration - Inventaire - Planifications](/configuration-inventory-schedules).

Les Tags sont sélectionnées à partir des icônes + et - et peuvent être recherchées à l'aide de l'icône de recherche rapide. L'affichage des Tags doit être activé à partir de la page [Réglages - JOC Cockpit](/settings-joc).

## Vue Ordre

Cette vue présente la liste des Ordres pour l'état donné :

- **ID Ordre** est l'identifiant unique attribué à un Ordre.
  - En cliquant sur l'icône de la flèche vers le bas, vous afficherez les variables de l'Ordre.
- **Workflow** est le nom unique attribué à un Workflow.
  - En cliquant sur le *Workflow*, vous accédez à la vue [Workflows](/workflows).
  - En cliquant sur l'icône en forme de crayon, vous accédez à la vue [Configuration - Inventaire - Workflows](/configuration-inventory-workflows).
- **Label** indique la position de l'Ordre à partir du *Label* de l'instruction de Workflow. En l'absence de *Label*, la position technique est indiquée.
- **État** indique le [État d'Ordre](/order-states).
  - Le passage de la souris sur l'indicateur d'état permet d'afficher des détails s'ils sont disponibles. Par exemple, les Ordres *en attente* indiquent des raisons telles que *en attente d'un processus*, *en attente d'une condition*, etc.
- **Prévu pour** indique la date de démarrage de l'Ordre.

## Vue Historique

Cette vue s'affiche sur la partie inférieure de la fenêtre lorsque l'utilisateur clique sur l'identifiant de l'Ordre. La vue contient des sous-onglets pour *Historique des Ordres* et *le Journal d'Audit*.

### Historique de l'Ordre

- **ID Ordre** est l'identifiant unique attribué à un Ordre. Cliquez sur l'icône de la flèche vers le bas pour afficher les variables de l'Ordre.
- **Label** indique la dernière position d'un Ordre dans le Workflow. Les utilisateurs peuvent assigner des *Labels* aux instructions de Workflow qui seront affichées et sinon la position technique sera indiquée.
- **État** indique le dernier résultat dans la vie de l'Ordre.
  - Si les Ordres sont terminés, le *Statut de l'historique* sera *succès* ou *échec*.
  - Si les Ordres ne sont pas terminés, le *Statut de l'Historique* sera *en cours*.
- **Heure prévue** indique la date et l'heure initiales pour lesquelles l'Ordre a été planifié.
- **Heure de démarrage** indique la date et l'heure effectives de démarrage de l'Ordre.
- **Heure de fin** indique la date et l'heure auxquelles l'Ordre s'est achevé.

#### Accès à la sortie du journal

- **ID Ordre** : En cliquant sur le *ID Ordre* dans la vue *Historique*, vous afficherez le journal de sortie de l'Ordre à partir de la vue [Affichage du Journal d'Ordre](/order-log). Le journal comprend les données de sortie créées par toutes les tâches exécutées avec le Workflow.
- **Icône de téléchargement** : cliquez sur l'icône pour télécharger le journal de l'Ordre dans un fichier.

Par défaut, l'affichage des journaux de l'Ordre est limité à une taille de 10 Mo et, dans le cas contraire, les journaux sont téléchargés dans des fichiers. Les utilisateurs peuvent ajuster la limite à partir de la page [Réglages - JOC Cockpit](/settings-joc).

### Journal d'Audit

Le *Journal d'Audit* indique les opérations de modification effectuées sur l'Ordre.

- **Créé** indique la date à laquelle l'opération a été effectuée.
- **Compte** indique le compte d'utilisateur qui a effectué l'opération.
- **Demande** indique le point de terminaison de l'API REST qui a été appelé.
- **Catégorie** précise la classification de l'opération telle que CONTROLLER lors de l'annulation d'Ordres ou DAILYPLAN lors de la création d'Ordres à partir du [Plan Quotidien](/daily-plan).
- **Raison** explique pourquoi un Ordre a été modifié. Le JOC Cockpit peut être configuré pour imposer la spécification des raisons lors de la modification d'objets.
  - Ce paramètre est disponible à l'adresse [Profil - Préférences](/profile-preferences).
  - Le paramètre peut être appliqué à partir de la page [Réglages - JOC Cockpit](/settings-joc).
- **Temps passé** similaire à la spécification des *motifs*, le temps passé sur une opération peut être ajouté lors de la modification des Ordres.
- **Lien vers le ticket** similaire à la spécification de *Raison* une référence à un système de tickets peut être ajoutée lors de la modification des Ordres.

## Opérations

### Opérations sur les Ordres

Les utilisateurs trouvent un menu d'action par Ordre qui propose les opérations disponibles pour l'état donné de l'Ordre.

Pour les Ordres en *attente*, *planifié*, *en cours*, *en exécution*, *suspendu*, *à confirmer*, *en attente*, *échoué*, les opérations suivantes sont proposées :

- **Modifier la priorité** 
  - Si un Ordre rencontre une *instruction Lock* dans le Workflow qui limite le parallélisme, alors sa *Priorité* détermine la position dans la file d'attente des *Ordres en attente*.
  - les *priorités* sont spécifiées à partir d'entiers négatifs, nuls et positifs ou à partir des raccourcis proposés. Une *priorité* plus élevée est prioritaire. Les raccourcis offrent les valeurs suivantes :
    - **Basse** : -20000
    - **Inférieur à la normale** : -10000
    - **Normal** : 0
    - **Au-dessus de la normale** : 10000
    - **Haut** : 20000
- **Annuler** met fin à l'Ordre. Les Ordres en cours d'exécution termineront la tâche ou l'instruction de Workflow en cours et quitteront le Workflow avec un statut d'historique d'échec.
- **Annuler/terminer tâche** mettra fin de force aux Ordres en cours d'exécution d'une tâche. Les Ordres quitteront le Workflow avec un statut d'historique d'échec.
- **Annuler/réinitialiser** mettra fin de force aux Ordres exécutant une instruction. Les Ordres quitteront le Workflow avec un statut d'historique d'échec.
- **Suspendre** suspend l'Ordre. Les Ordres en cours d'exécution seront suspendus après avoir terminé la tâche ou l'instruction de Workflow en cours.
- **Suspendre/terminer tâche** mettra fin de force aux Ordres en cours d'exécution d'une tâche et suspendra les Ordres.
- **Suspendre/réinitialiser** réinitialise immédiatement l'instruction de Workflow en cours et remet l'Ordre dans l'état *suspendu*. Cette option peut être combinée avec l'arrêt forcé des tâches pour les Ordres en cours d'exécution.
- **Reprendre** poursuivra un Ordre *suspendu* ou *échoué* pouvant être repris.

Les opérations suivantes sont proposées pour les Ordres dans l'état *complété* et pour les Ordres perturbés dans l'état *échoué* :

- **Quitter le Workflow** mettra fin à l'Ordre. 
  - les Ordres *complétés* quitteront le Workflow avec un statut historique *succès*.
  - les Ordres *échoué/perturbés* quitteront le Workflow avec un statut historique *échoué*.

D'autres opérations spécifiques à l'état de l'Ordre peuvent être disponibles.

### Opérations en masse

Les opérations en bloc sont disponibles lors de la sélection d'Ordres à partir de cases à cocher connexes. Elles offrent les mêmes opérations que pour les Ordres individuels.

Lorsque vous sélectionnez des Ordres, les boutons relatifs aux opérations groupées deviennent visibles dans la partie supérieure de la fenêtre, avec des légendes similaires à celles des opérations expliquées ci-dessus.

## Filtres

Les utilisateurs peuvent appliquer des filtres pour limiter l'affichage des Ordres. Les boutons de filtre sont disponibles en haut de la fenêtre.

### Bouton de filtrage de la plage de dates

Ce bouton déroulant permet de sélectionner des Ordres à partir d'une plage de dates :

- **Tous** spécifie les Ordres planifiés pour n'importe quelle date passée et future qui sont affichés.
- **Aujourd'hui** Les Ordres sont liés à la journée en cours qui est calculée à partir du fuseau horaire dans [Profil - Préférences](/profile-preferences).
- **Prochaine heure** inclut les Ordres qui devraient commencer dans l'heure qui suit.
- **12 prochaines heures** comprennent les Ordres qui devraient commencer dans les 12 prochaines heures.
- **24 heures suivantes** comprennent les Ordres qui devraient commencer dans les 24 heures suivantes.
- **Prochain jour** comprend les Ordres qui devraient commencer jusqu'à la fin du jour suivant.
- **7 Prochains jours** comprennent les Ordres qui devraient commencer dans les 7 prochains jours.

### Boutons de filtrage de l'État

Comme pour la *vue de sélection de l'état de l'Ordre*, un bouton de filtrage est disponible pour chaque état de l'Ordre afin de filtrer l'affichage des Ordres.

### Filtre de saisie de la date du ... au

Pour les Ordres dans les états *en progression*, *en exécution*, *échoué*, *complété*, des champs de saisie sont disponibles pour spécifier la date et l'heure à laquelle un Ordre est dans l'état correspondant.

Les utilisateurs peuvent spécifier des dates et heures absolues ou relatives.

### Filtre de résultats

Le filtre limite l'affichage aux *Identifiants d'Ordres* et aux *Noms de Workflow* correspondants. Le filtre est appliqué aux Ordres visibles et ne tient pas compte des majuscules et minuscules.

## Références

### Aide contextuelle

- [Affichage du Journal d'Ordre](/order-log)
- [Configuration - Inventaire - Planifications](/configuration-inventory-schedules)
- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
- [État d'Ordre](/order-states)
- [Plan Quotidien](/daily-plan)
- [Profil - Préférences](/profile-preferences)
- [Réglages - JOC Cockpit](/settings-joc)
- [Workflows - Ajouter des Ordres](/workflows-orders-add)

### Product Knowledge Base

- [JS7 - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Orders)
