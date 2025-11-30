# Fonctionnement initial - grappe de sous-agents

L'opération initiale est effectuée après l'installation du contrôleur JS7, de l'agent et du cockpit JOC. L'enregistrement d'un cluster de sous-agents a lieu après l'achèvement du site [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster).

## Cluster de sous-agents

La configuration d'un cluster de sous-agents comprend

- la *sélection* des agents directeurs et des sous-agents dans un groupe d'agents
- la *séquence* dans laquelle les sous-agents seront utilisés
  - *actif-passif* : seul le premier sous-agent sera utilisé pour l'exécution du travail. Si le sous-agent n'est pas disponible, le sous-agent suivant sera utilisé. Pour plus de détails, voir [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster).
  - *actif-actif* : chaque travail suivant sera exécuté avec le sous-agent suivant. Cela signifie que tous les sous-agents sélectionnés sont impliqués. Pour plus d'informations, voir [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster).
  - *basé sur les métriques* : sur la base de règles telles que la consommation de CPU et de mémoire, le sous-agent suivant sera sélectionné pour l'exécution du travail. Pour plus de détails, voir [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster).

### Sélection des agents

Dans le panneau de gauche, les utilisateurs trouvent la liste des sous-agents, y compris les agents directeurs, qui sont disponibles pour la sélection.

Les sous-agents peuvent être glissés et déposés dans le panneau de droite, dans la zone de glissement correspondante. Pour désélectionner un sous-agent, vous pouvez le faire glisser et le déposer dans le panneau de droite dans la zone de glissement indiquée *Déposer ici pour supprimer le sous-agent*.

### Séquence des agents

La séquence des sous-agents détermine le type de cluster :

#### Grappe de sous-agents active-passive

Les sous-agents sont glissés et déposés dans la même colonne :

- Les sous-agents dans la même colonne spécifient un cluster actif-passif (priorité fixe) dans lequel le premier sous-agent sera utilisé pour tous les travaux tant qu'il est disponible. Ce n'est que lorsque le premier sous-agent est indisponible que le sous-agent suivant est utilisé.
- Pour plus de détails, consultez [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster).

#### Cluster de sous-agents actif-actif

Les sous-agents sont glissés et déposés sur la même ligne :

- Les sous-agents situés sur la même ligne constituent une grappe active-active (round-robin) dans laquelle chaque tâche suivante sera exécutée avec le sous-agent suivant.
- Pour plus de détails, consultez [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster).

#### Cluster de sous-agents basé sur des métriques

Les sous-agents sont glissés et déposés sur la *même ligne* et se voient attribuer une *priorité basée sur des mesures* :

- Les sous-agents d'une même ligne ont une priorité basée sur les métriques :
    - En passant la souris sur le rectangle du sous-agent, vous accédez à son menu d'action à 3 points : l'action *Priorité basée sur les métriques* permet de spécifier la priorité à partir d'une expression.
- Pour plus de détails, voir [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster).

Expressions pour les priorités basées sur les métriques :

| Variable d'indicateur | Métrique
| ----- | ----- |
| $js7SubagentProcessCount | Nombre de processus s'exécutant avec le sous-agent. |
| $js7ClusterSubagentProcessCount | Nombre de processus pour le cluster de sous-agents donné en cours d'exécution avec le sous-agent. |
| Les indicateurs suivants sont disponibles comme expliqué sur https://docs.oracle.com/en/java/javase/17/docs/api/jdk.management/com/sun/management/OperatingSystemMXBean.html
| $js7CpuLoad | Renvoie l'"utilisation récente du processeur" pour l'environnement d'exploitation. Cette valeur est un double dans l'intervalle [0.0,1.0]. Une valeur de 0,0 signifie que tous les processeurs étaient inactifs pendant la période récente observée, tandis qu'une valeur de 1,0 signifie que tous les processeurs fonctionnaient activement 100 % du temps pendant la période récente observée. Toutes les valeurs comprises entre 0,0 et 1,0 sont possibles en fonction des activités en cours. Si l'utilisation récente du processeur n'est pas disponible, la méthode renvoie une valeur négative. Une valeur négative est signalée comme manquante. La charge du processeur n'est pas disponible pour MacOS et est signalée comme manquante. |
| $js7CommittedVirtualMemorySize | Renvoie la quantité de mémoire virtuelle qui est garantie d'être disponible pour le processus en cours d'exécution en octets, ou -1 si cette opération n'est pas prise en charge. Une valeur négative est signalée comme manquante. |
| $js7FreeMemorySize | Renvoie la quantité de mémoire libre en octets. Renvoie la quantité de mémoire libre. |
| $js7TotalMemorySize | Renvoie la quantité totale de mémoire en octets. Renvoie la quantité totale de mémoire

## Références

### Aide contextuelle

- [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster)
- [Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster)

### Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
  - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster)
  - [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster)
  - [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster)

