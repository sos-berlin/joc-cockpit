# Sources d'Ordres

Les ordres peuvent être ajoutés à partir des sources suivantes :

- Ordres ajoutés par l'administrateur du site [Daily Plan](/daily-plan)
- Ordres ajoutés à la demande par les utilisateurs à partir de la vue [Workflows](/workflows) 
- Ordres ajoutés à partir de sources d'ordres de fichiers qui surveillent les répertoires pour les fichiers entrants

## États des ordres

Les *États d'Ordres* suivants sont disponibles :

- **En attente** Les ordres ont été ajoutés aux Workflows sans spécifier d'heure de début, une heure de début peut leur être attribuée ultérieurement.
- **Les Ordres ont été ajoutés aux Workflows et sont planifiés pour être exécutés à une date et une heure ultérieures.
- **En cours** Les ordres sont traités par des instructions de Workflow mais ne sont pas en cours d'exécution. 
- **En cours d'exécution** Les ordres sont en cours d'exécution d'une tâche. 
- **Suspendu** Les ordres ont été interrompus par une intervention de l'utilisateur et peuvent être repris.
- **Les Ordres ont terminé un Workflow mais n'ont pas été supprimés, par exemple si une Source d'Ordre de Fichier est utilisée pour l'observation de fichiers et que le Workflow n'a pas (re)déplacé les fichiers entrants. Dans ce cas, l'Ordre restera en place tant que le fichier existera dans le répertoire d'arrivée.
- **Les Ordres sont mis en attente par l'instruction *Prompt* dans un Workflow et nécessitent la confirmation de l'utilisateur pour continuer l'exécution du Workflow.
- **En attente** Les ordres attendent une ressource telle qu'un *verrouillage de ressource*, un *avis*, une *réponse* ou un *cyclage* ou un processus si l'agent utilisé spécifie une limite de processus qui est dépassée.
- les Ordres **Bloqués** ne peuvent pas démarrer, par exemple si l'Agent n'est pas joignable depuis l'ajout de l'Ordre.
- **Les Ordres échoués** indiquent qu'un travail a échoué ou qu'une *instruction d'échec* empêche la poursuite de l'Ordre. 

En cliquant sur le nombre d'Ordres indiqué, vous accédez au site [Orders Overview](/orders-overview) qui affiche les Ordres en détail.

## Références

- [Daily Plan](/daily-plan)
- [Orders Overview](/orders-overview)
- [Workflows](/workflows)
- [JS7 - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Orders)
- [JS7 - Order State Transitions](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+State+Transitions)

