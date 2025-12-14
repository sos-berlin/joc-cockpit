# Ressources - Statut de l'Agent

La vue *Agents* résume l'état de la connexion des Agents enregistrés.

## Architecture

### Agents

- **Les Agents Autonomes** exécutent des tâches sur des machines distantes sur site et à partir de conteneurs. Ils fonctionnent individuellement et sont gérés par le Contrôleur.
- **Cluster d'Agents**
  - les **Agents Directeurs** orchestrent les *Sous-Agents* dans un Cluster d'Agents. Ils fonctionnent à partir de deux instances en Clustering actif-passif et sont gérés par le Contrôleur.
  - les **Sous-Agents** exécutent des tâches sur des machines distantes sur site et à partir de conteneurs. Ils peuvent être considérés comme des nœuds de tâche dans un Cluster d'Agents et sont gérés par des *Agents Directeurs*.

### Connexions

- Les connexions de l'**Agent Autonome** et de l'**Agent Directeur** sont établies par le Contrôleur. 
- Les connexions **Sous-Agents** dans un Cluster d'Agents sont établies par les *Agents Directeurs*.

## État de la connexion

L'affichage de l'état des Agents utilise les indicateurs de couleur suivants :

- **La couleur verte** indique des connexions d'Agents saines.
- **La couleur jaune** indique que les Agents sont en train de se réinitialiser, ce qui signifie qu'ils sont en train d'initialiser leur journal et de redémarrer.
- **La couleur rouge** indique l'échec des connexions aux Agents, par exemple si l'Agent n'est pas joignable.
- **La couleur grise** indique un état de connexion *inconnu*, par exemple si un Agent Directeur n'est pas joignable, l'état est *inconnu* pour les Sous-Agents.

Les utilisateurs doivent tenir compte des implications suivantes :

- Si la connexion d'un Agent est considérée comme échouée, cela ne confirme pas que l'Agent est hors service. Des problèmes de réseau peuvent empêcher la connexion.
- Le JOC Cockpit reçoit du Contrôleur des informations sur l'état de la connexion de l'Agent. Si le Contrôleur n'est pas disponible, ces informations ne sont pas présentes. Cela ne signifie pas que les Agents sont hors service, mais que les Agents seront indiqués à partir d'un état *inconnu*.
- Le Contrôleur signale les connexions aux *Agents Autonomes* et aux *Agents Directeurs*. L'échec des connexions aux *Agents Directeurs* suggère que le Contrôleur ne connaît pas l'état des *Sous-Agents* dans le Cluster d'Agents qui est donc indiqué comme étant *inconnu*.

## Références

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
