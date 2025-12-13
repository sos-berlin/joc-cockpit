# Sources d'Ordres

Les Ordres peuvent être ajoutés à partir des sources suivantes :

- Ordres ajoutés depuis la vue [Daily Plan](/daily-plan)
- Ordres ajoutés à la demande par les utilisateurs à partir de la vue [Workflows](/workflows) 
- Ordres ajoutés à partir de sources d'Ordres de fichier qui surveillent les répertoires pour les fichiers entrants

## États des Ordres

Les *États d'Ordres* suivants sont disponibles :

- **En attente** Les Ordres ont été ajoutés aux Workflows sans spécifier d'heure de début, une heure de début peut leur être attribuée ultérieurement.
- **Planifiés** Les Ordres ont été ajoutés aux Workflows et sont planifiés pour être exécutés à une date et une heure ultérieures.
- **En Prgression** Les Ordres sont traités par des instructions de Workflow mais ne sont pas en cours d'exécution. 
- **En cours d'exécution** Les Ordres sont en cours d'exécution d'une tâche. 
- **Suspendu** Les Ordres ont été interrompus par une intervention de l'utilisateur et peuvent être repris.
- **Complet** Les Ordres sont terminés un Workflow mais n'ont pas été supprimés, par exemple si une Source d'Ordre de Fichier est utilisée pour l'observation de fichiers et que le Workflow n'a pas (re)déplacé les fichiers entrants. Dans ce cas, l'Ordre restera en place tant que le fichier existera dans le répertoire d'arrivée.
- **A Confirmer** Les Ordres sont mis en attente par l'instruction *Prompt* dans un Workflow et nécessitent la confirmation de l'utilisateur pour continuer l'exécution du Workflow.
- **En attente** Les Ordres attendent une ressource telle qu'un *Verrou de Ressource*, une *condition*, une *réponse* ou un *cycle* ou un processus si l'Agent utilisé spécifie une limite de processus qui est dépassée.
- **Bloqué** Les Ordres Bloqués ne peuvent pas démarrer, par exemple si l'Agent n'est pas joignable depuis l'ajout de l'Ordre.
- **Echoués** Les Ordreséchoués indiquent qu'une tâche a échoué ou qu'une *instruction d'échec* empêche la poursuite de l'Ordre. 

En cliquant sur le nombre d'Ordres indiqué, vous accédez à la vue [Orders Overview](/orders-overview) qui affiche les détails des Ordres.

## Références

- [Daily Plan](/daily-plan)
- [Orders Overview](/orders-overview)
- [Workflows](/workflows)
- [JS7 - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Orders)
- [JS7 - Order State Transitions](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+State+Transitions)

