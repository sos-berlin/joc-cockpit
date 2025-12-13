# Opération initiale - Engregistrement du Cluster de Sous-Agents

L'opération initiale est effectuée après l'installation du Contrôleur JS7, de l'Agent et du cockpit JOC. L'enregistrement d'un Cluster de Sous-Agents a lieu après l'achèvement du site [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-Cluster).

## Architecture

### Agents

- Les **Agents Autonomes** exécutent des tâches sur des machines distantes et à partir de conteneurs. Ils fonctionnent individuellement et sont gérés par le Contrôleur.
- **Cluster d'Agents
  - les **Agents Directeurs** orchestrent les *Sous-Agents* dans un Cluster d'Agents. Ils fonctionnent à partir de deux instances en Clustering actif-passif et sont gérés par le Contrôleur.
  - les **Sous-Agents** exécutent des tâches sur des machines distantes et à partir de conteneurs. Ils peuvent être considérés comme des nœuds de tâche dans un Cluster d'Agents et sont gérés par des *Agents Directeurs*.

### Connexions

- Les connexions **l'Agent Autonome** et de l'**Agent Directeur** sont établies par le Contrôleur. 
- les connexions **Sous-Agents** dans un Cluster d'Agents sont établies par les *Agents Directeurs*.

## Enregistrer un Cluster de Sous-Agents

L'enregistrement d'une Cluster de Sous-Agents comprend l'enregistrement des éléments suivants

- la *sélection* des Agents Directeurs et des Sous-Agents dans un Cluster d'Agents
- la *Séquence* dans laquelle les Sous-Agents seront exploités
  - *actif-actif* : chaque tâche suivante sera exécutée avec le Sous-Agent suivant. Cela signifie que tous les Sous-Agents sélectionnés sont impliqués. Pour plus de détails, voir - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster).
  - *actif-passif* : seul le premier Sous-Agent sera utilisé pour l'exécution de la tâche. S'il n'est pas disponible, le Sous-Agent suivant sera utilisé. Pour plus d'informations, voir [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster).
  - *basé sur les métriques* : sur la base de règles telles que la consommation de CPU et de mémoire, le Sous-Agent suivant sera sélectionné pour l'exécution de la tâche. Pour plus de détails, voir [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster).

Pour plus d'informations, voir [Initial Operation - Subagent Cluster](/initial-operation-agent-subagent-Cluster)

## Références

### Aide contextuelle

- [Dashboard - Product Status](/dashboard-product-status)
- [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-Cluster)
- [Initial Operation - Register Controller](/initial-operation-register-controller)
- [Initial Operation - Register Subagent](/initial-operation-register-agent-subagent)
- [Initial Operation - Subagent Cluster](/initial-operation-agent-subagent-Cluster)

### Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
  - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster)
  - [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster)
  - [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster)
