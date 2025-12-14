# Maquettes de Rapports

## Maquette de Rapport : Top n Workflows avec le plus grand/le plus petit nombre d'échecs d'exécution

Ce Maquette de Rapport comptabilise les échecs d'exécution des Workflows :

- Une exécution de Workflow est considérée comme ayant échoué si l'Ordre quitte le Workflow avec un résultat négatif, par exemple si un Ordre est annulé ou si un [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction) est utilisé indiquant un résultat négatif.
- L'exécution d'un Workflow n'est pas considérée comme un échec simplement parce qu'une tâche a échoué, par exemple si un [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction) est utilisé, une nouvelle tentative ultérieure d'une tâche peut être couronnée de succès. C'est plutôt l'état de l'historique d'un Ordre qui est pris en compte.

## Maquette de Rapport : Top n Jobs avec le plus grand/le plus petit nombre d'exécutions échouées

Le Maquette de Rapport compte les échecs d'exécution des tâches.

- L'exécution d'une tâche Shell est considérée comme ayant échoué en fonction du code de sortie de la tâche et éventuellement de la sortie sur le canal stderr.
- L'exécution d'une tâche JVM est considérée comme un échec sur la base du résultat de la tâche qui peut contenir des exceptions.

## Maquette de Rapport : Top n Agents avec le plus grand/le plus petit nombre d'exécutions parallèles de Tâches

Le Maquette de Rapport compte les exécutions de tâches parallèles avec les Agents. Un Job1 est considéré comme parallèle à un Job2 si

- Le Job1 commence après le Job2 et avant que le Job2 ne se termine ou
- Le Job1 se termine après le démarrage du Job2 et avant la fin du Job2.

## Maquette de Rapport : Les n premiers tâches à haute criticité avec le plus grand/le plus petit nombre d'exécutions échouées

Le Maquette de Rapport comptabilise les échecs d'exécution des tâches dont la criticité est élevée. La criticité est un attribut de la tâche, voir JS7 - Job Instruction.

Le comptage s'effectue de la même manière que pour le Maquette de Rapport : Top n Tâches avec le plus grand/le plus petit nombre d'échecs d'exécution.

## Maquette de Rapport : Top n Workflows avec le plus grand/le plus petit nombre d'échecs d'exécution pour les Ordres annulés

Le Maquette de Rapport comptabilise les échecs d'exécution de Workflow dus à des Ordres qui ont été annulés.

L'opération *annulation* est appliquée à un Ordre par l'intervention de l'utilisateur .

## Maquette de Rapport : Top n Workflows avec le plus grand/le plus petit besoin de temps d'exécution

Le Maquette de Rapport prend en compte la durée des exécutions réussies du Workflow. Les exécutions de Workflow qui ont échoué ne sont pas prises en compte.

## Maquette de Rapport : Top n Tâches avec le plus grand/le plus petit besoin de temps d'exécution

Le Maquette de Rapport prend en compte la durée d'exécution des tâches réussies. Les échecs ne sont pas pris en compte.

## Maquette de Rapport : Top n périodes avec le plus grand/le plus petit nombre d'exécutions de tâches

Le Maquette de Rapport divise la période de référence en étapes. La durée d'une étape est déterminée par le paramètre *Durée de l'étape* sur le site [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration). Le début de l'étape suivante est déterminé par le paramètre "Chevauchement d'étapes" dans la configuration du rapport.

Exemple : 

- Durée de l'étape : 5m
- Chevauchement d'étapes : 2m
  - 00:00-00:05
  - 00:02-00:07
  - 00:04-00:09

Le nombre de tâches en cours d'exécution est compté par étape.

## Maquette de Rapport : Top n périodes avec le plus grand/le plus petit nombre d'exécutions de Workflows

Le Maquette de Rapport divise la *période de rapport* en étapes. La durée d'une étape est déterminée par le paramètre *Durée de l'étape* dans le site [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration). Le début de l'étape suivante est déterminé par le paramètre *Chevauchement d'étape* dans la configuration du rapport.

Le nombre d'Ordres en cours d'exécution est compté par étape.

## Maquette de Rapport : Top n Jobs avec le plus grand/le plus petit nombre d'exécutions réussies

Le Maquette de Rapport compte les tâches qui ont été exécutées avec succès. Les tâches qui ont échoué ne sont pas pris en compte.

Pour connaître les raisons possibles de l'échec d'une tâche, reportez-vous au Maquette de Rapport : Top n Jobs avec le plus grand/le plus petit nombre d'échecs d'exécution.

## Maquette de Rapport : Top n Workflows avec le plus grand/le plus petit nombre d'exécutions réussies

Le Maquette de Rapport comptabilise les Workflows qui se sont terminés avec succès. Les exécutions de Workflow qui ont échoué ne sont pas prises en compte.

Pour connaître les raisons de l'échec d'un Workflow, reportez-vous au *Maquette de Rapport : Top n Workflows avec le plus grand/le plus petit nombre d'échecs d'exécution*.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Maquettes de Rapport](/configuration-inventory-reports)
- [Création des Rapports](/report-creation)
- [Historique d'Exécution des Rapports](/report-run-history)
- [Rapports](/reports)

### Product Knowledge Base

- Rapports
  - [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration)
  - [JS7 - Reports - Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Templates)
- Instructions Workflow
  - [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction)
  - [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction)
