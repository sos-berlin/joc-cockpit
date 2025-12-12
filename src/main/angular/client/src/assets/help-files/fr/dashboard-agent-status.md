# Statut de l'agent

L'Affichage *Agent Status* indique l'état de la connexion des agents enregistrés.

<img src="dashboard-agent-status.png" alt="Agent Status" width="332" height="135" />

## Architecture

### Agents

- **Les Agents Autonomes** exécutent des tâches sur des serveurs distantes sur site et à partir de conteneurs. Ils fonctionnent de manière autonome et sont gérés par le contrôleur.
- **Cluster d'agents
  - les **Agents Directeurs** orchestrent les *Sous-Agents* dans un Cluster d'Agents. Ils fonctionnent à partir de deux instances en clustering actif-passif et sont gérés par le contrôleur.
  - les **Sous-Agents** exécutent des tâches sur des machines distantes sur site et à partir de conteneurs. Ils peuvent être considérés comme des nœuds de tâche dans un cluster d'agents et sont gérés par des *agents directeurs*.

### Connexions

- **Les connexions à l'Agent Autonome** et de l'Agent Directeur** sont établies par le Contrôleur. 
- les connexions **Sous-Agent** dans un cluster d'agents sont établies par les *Agents Directeurs*.

## État de la connexion

L'affichage de l'état des agents utilise les indicateurs de couleur suivants :

- **La couleur verte** indique des connexions d'agents saines.
- **La couleur jaune** indique que les agents sont en train de se réinitialiser, ce qui signifie qu'ils sont en train d'initialiser leur journal et de redémarrer.
- **La couleur rouge** indique l'échec des connexions aux agents si l'agent n'est pas joignable.
- **Couleur grise** indique un état de connexion *inconnu*, par exemple si un agent directeur n'est pas joignable, l'état est *inconnu* pour les sous-agents.

Les utilisateurs doivent tenir compte des implications suivantes :

- Si la connexion d'un agent est considérée comme échouée, cela ne confirme pas que l'agent est en panne. Des problèmes de réseau peuvent empêcher la connexion.
- Le JOC Cockpit reçoit du contrôleur des informations sur l'état de la connexion de l'agent. Si le contrôleur n'est pas disponible, ces informations ne sont pas présentes. Cela ne signifie pas que les agents sont hors service, mais que les agents seront indiqués à partir d'un état *inconnu*.
- Le contrôleur signale les connexions aux *agents stables* et aux *agents directeurs*. L'échec des connexions aux *agents directeurs* suggère que le contrôleur ne connaît pas l'état des *sous-agents* dans le groupe d'agents qui est donc indiqué comme étant *inconnu*.

## Références

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)

