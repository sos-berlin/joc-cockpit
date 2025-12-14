# Opération initiale - Cluster de Sous-Agents

L'opération initiale est effectuée après l'installation du Contrôleur JS7, de l'Agent et du JOC Cockpit. L'enregistrement d'un Cluster de Sous-Agents a lieu après l'enregistrement [Opération initiale - Enregistrer Cluster Agents](/initial-operation-register-agent-cluster).

## Cluster de Sous-Agents

La configuration d'un Cluster de Sous-Agents comprend

- la *sélection* des Agents Directeurs et des Sous-Agents dans un Cluster d'Agents
- la *séquence* dans laquelle les Sous-Agents seront utilisés
  - *fixed-priority* : seul le premier Sous-Agent sera utilisé pour l'exécution de la tâche. Si le Sous-Agent n'est pas disponible, le Sous-Agent suivant sera utilisé. Pour plus de détails, voir [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster).
  - *round-robin* : chaque tâche suivant sera exécuté avec le Sous-Agent suivant. Cela signifie que tous les Sous-Agents sélectionnés sont impliqués. Pour plus d'informations, voir [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster).
  - *basé sur les métriques* : sur la base de règles telles que la consommation de CPU et de mémoire, le Sous-Agent suivant sera sélectionné pour l'exécution de la tâche. Pour plus de détails, voir [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster).

### Sélection des Agents

Dans la vue de gauche, les utilisateurs trouvent la liste des Sous-Agents, y compris les Agents Directeurs, qui sont disponibles pour la sélection.

Les Sous-Agents peuvent être glissés et déposés dans la vue de droite, dans la zone de glissement correspondante. Pour désélectionner un Sous-Agent, vous pouvez le faire glisser et le déposer dans la ve de droite dans la zone de glissement indiquée *Déposer ici pour supprimer le Sous-Agent*.

### Séquence des Agents

La séquence des Sous-Agents détermine le type de Cluster :

#### Cluster Sous-Agents fixe-priority

Les Sous-Agents sont glissés et déposés dans la même colonne :

- Les Sous-Agents dans la même colonne spécifient un Cluster fixe-priority dans lequel le premier Sous-Agent sera utilisé pour toutes les tâches tant qu'il est disponible. Ce n'est que lorsque le premier Sous-Agent est indisponible que le Sous-Agent suivant est utilisé.
- Pour plus de détails, consultez [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster).

#### Cluster de Sous-Agents round-robin

Les Sous-Agents sont glissés et déposés sur la même ligne :

- Les Sous-Agents situés sur la même ligne constituent une grappe round-robin dans laquelle chaque tâche suivante sera exécutée avec le Sous-Agent suivant.
- Pour plus de détails, consultez [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster).

#### Cluster de Sous-Agents basé sur des métriques

Les Sous-Agents sont glissés et déposés sur la *même ligne* et se voient attribuer une *priorité basée sur des mesures* :

- Les Sous-Agents d'une même ligne ont une priorité basée sur les métriques :
    - En passant la souris sur le rectangle du Sous-Agent, vous accédez à son menu d'action à 3 points : l'action *Priorité basée sur les métriques* permet de spécifier la priorité à partir d'une expression.
- Pour plus de détails, voir [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster).

Expressions pour les priorités basées sur les métriques :

| Variable d'indicateur | Métrique
| ----- | ----- |
| $js7SubagentProcessCount | Nombre de processus s'exécutant avec le Sous-Agent. |
| $js7ClusterSubagentProcessCount | Nombre de processus pour le Cluster de Sous-Agents donné en cours d'exécution avec le Sous-Agent. |
| Les indicateurs suivants sont disponibles comme expliqué sur https://docs.oracle.com/en/java/javase/17/docs/api/jdk.management/com/sun/management/OperatingSystemMXBean.html
| $js7CpuLoad | Renvoie l'"utilisation récente du processeur" pour l'environnement d'exploitation. Cette valeur est un double dans l'intervalle [0.0,1.0]. Une valeur de 0,0 signifie que tous les processeurs étaient inactifs pendant la période récente observée, tandis qu'une valeur de 1,0 signifie que tous les processeurs fonctionnaient activement 100 % du temps pendant la période récente observée. Toutes les valeurs comprises entre 0,0 et 1,0 sont possibles en fonction des activités en cours. Si l'utilisation récente du processeur n'est pas disponible, la méthode renvoie une valeur négative. Une valeur négative est signalée comme manquante. La charge du processeur n'est pas disponible pour MacOS et est signalée comme manquante. |
| $js7CommittedVirtualMemorySize | Renvoie la quantité de mémoire virtuelle qui est garantie d'être disponible pour le processus en cours d'exécution en octets, ou -1 si cette opération n'est pas prise en charge. Une valeur négative est signalée comme manquante. |
| $js7FreeMemorySize | Renvoie la quantité de mémoire libre en octets. Renvoie la quantité de mémoire libre. |
| $js7TotalMemorySize | Renvoie la quantité totale de mémoire en octets. Renvoie la quantité totale de mémoire

## Références

### Aide contextuelle

- [Opération initiale - Enregistrer Cluster Agents](/initial-operation-register-agent-cluster)
- [Opération initiale - Enregistrer Cluster Sous-Agents](/initial-operation-register-agent-subagent-cluster)

### Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
  - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster)
  - [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster)
  - [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster)
