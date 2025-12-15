# Tableau de Bord - Ordres

L'affichage *Ordres* fournit des informations sur les Ordres provenant des sources suivantes :

- Ordres ajoutés par le [Plan Quotidien](/daily-plan)
- Ordres ajoutés à la demande par les utilisateurs de la vue [Workflows](/workflows) 
- Ordres ajoutés à partir de [Sources d'Ordres de Fichiers](/configuration-inventory-file-order-sources) qui surveillent les répertoires pour les fichiers entrants

<img src="dashboard-orders-fr.png" alt="Ordres" width="330" height="140" />

## États de l'Ordre

L'affichage *Ordres* fournit des informations sur l'état actuel des Ordres. L'affichage est mis à jour lorsque l'état des Ordres change.

- **À venir**: Les Ordres ont été ajoutés aux Workflows sans spécifier d'heure de début. Une heure de début peut leur être attribuée ultérieurement.
- **Prévu**: Les Ordres ont été ajoutés aux Workflows et sont programmés pour être exécutés à une date et une heure ultérieures.
- **En progression**: Les Ordres sont traités par des instructions de Workflow mais ne sont pas en cours d'exécution. 
- **En exécution**: Les Ordres sont en cours d'exécution d'une tâche. 
- **Suspendu**: Les Ordres ont été interrompus par une intervention de l'utilisateur et peuvent être repris.
- **Complété** Les Ordres ont terminé un Workflow mais n'ont pas été supprimés, par exemple si une Source d'Ordre de Fichier est utilisée pour l'observation de fichiers et que le Workflow n'a pas (re)déplacé les fichiers entrants. Dans ce cas, l'Ordre restera en place tant que le fichier existera dans le répertoire d'arrivée.
- **À confirmer**: Les Ordres sont mis en attente par l'instruction *Prompt* dans un Workflow et nécessitent la confirmation de l'utilisateur pour continuer l'exécution du Workflow.
- **En attente**: Les Ordres attendent une ressource telle qu'un *Verrou de Ressource*, une *Annonce* ou un *Cycle* ou un processus si l'Agent utilisé spécifie une limite de processus qui est dépassée.
- **Bloqué**: Les Ordres ne peuvent pas démarrer, par exemple si l'Agent n'est pas joignable depuis l'ajout de l'Ordre.
- **Échoué**: Les Ordres indiquent qu'une tâche a échoué ou qu'une *instruction Fail* empêche la poursuite de l'Ordre. 

En cliquant sur le nombre d'Ordres indiqué, vous accédez [Aperçu des Ordres](/orders-overview) qui affiche les Ordres en détail.

## Filtres

Le bouton déroulant situé dans le coin supérieur droit de l'affichage permet de sélectionner des Ordres dans une fourchette de dates :

- **Tous** affiche tous les Ordres disponibles auprès du Contrôleur et des Agents.
- **Aujourd'hui** Les Ordres sont liés à la journée en cours qui est calculée à partir du fuseau horaire de l'utilisateur [Profil - Préférences](/profile-preferences).
  - **Ordres à venir** Ordres sans heure de début,
  - **Ordres prévus** avec une heure de début pour le jour en cours,
  - **Ordres en progression** à partir de n'importe quelle date antérieure,
  - **Ordres en exécution** à partir de n'importe quelle date antérieure,
  - **Ordres suspendus** à partir de n'importe quelle date antérieure,
  - **Ordres complétés** à partir de n'importe quelle date antérieure,
  - **Ordres à confirmer** à partir de n'importe quelle date antérieure,
  - **Ordres en attente** à partir de n'importe quelle date passée,
  - **Ordres bloqués** à partir de n'importe quelle date antérieure,
  - **Ordres échoués** à partir de n'importe quelle date antérieure.
- **L'heure suivante** comprend les Ordres *Planifiés* pour l'heure suivante.
- **Les 12 prochaines heures** comprennent les Ordres *programmés* pour les 12 prochaines heures.
- **Les 24 heures suivantes** comprennent les Ordres *programmés* pour les 24 heures suivantes.
- **Prochain jour** comprend les Ordres *programmés* jusqu'à la fin du jour suivant.
- **Les 7 prochains jours** comprennent les Ordres *programmés* jusqu'à la fin des 7 prochains jours.

## Références

### Aide contextuelle

- [Aperçu des Ordres](/orders-overview)
- [Plan Quotidien](/daily-plan)
- [Profil - Préférences](/profile-preferences)
- [Sources d'Ordres de Fichiers](/configuration-inventory-file-order-sources)
- [Workflows](/workflows)

### Product Knowledge Base

- [JS7 - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Orders)
- [JS7 - Order State Transitions](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+State+Transitions)
