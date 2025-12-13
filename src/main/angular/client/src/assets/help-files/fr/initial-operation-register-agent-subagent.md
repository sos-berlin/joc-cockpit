# Opération initiale - Enregistrement du sous-agent

L'opération initiale est effectuée après l'installation du Contrôleur JS7, de l'Agent et du JOC Cockpit. L'enregistrement du sous-agent a lieu après l'achèvement du site [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster).

## Architecture

### Agents

- **Les Agents Autonomes** exécutent des tâches sur des machines distantes sur site et à partir de conteneurs. Ils fonctionnent individuellement et sont gérés par le Contrôleur.
- **Cluster d'Agents
  - les **Agents Directeurs** orchestrent les *Sous-Agents* dans un Cluster d'Agents. Ils fonctionnent à partir de deux instances en clustering actif-passif et sont gérés par le Contrôleur.
  - les **Sous-Agents** exécutent des tâches sur des machines distantes sur site et à partir de conteneurs. Ils peuvent être considérés comme des nœuds de tâche dans un cluster d'Agents et sont gérés par des *Agents Directeurs*.

### Connexions

- Les connexions de l'**Agent Autonome** et de l'**Agent Directeur** sont établies par le Contrôleur. 
- les connexions **Sous-Agent** dans un cluster d'Agents sont établies par les *Agents Directeurs*.

## Enregistrer un sous-agent

Les utilisateurs doivent vérifier que les connexions réseau entre les serveurs des Agents Directeurs et le serveur du sous-agent sont disponibles et que les règles du pare-feu autorisent les connexions au port du sous-agent.

La page *Gestion des Contrôleurs/agents* est accessible à partir de l'icône de la roue dans la barre de menu principale et propose l'opération *Ajouter un sous-agent* dans le menu d'action du groupe d'Agents. Cette opération fait apparaître la fenêtre contextuelle d'enregistrement d'un sous-agent.

Les utilisateurs fournissent les données suivantes :

- **ID sous-agent** est l'identifiant unique d'un sous-agent qui ne peut pas être modifié pendant la durée de vie du sous-agent. L'*ID du sous-agent* n'est pas visible avec les travaux et les Workflows.
- **Titre** est une description qui peut être ajoutée pour un sous-agent.
- **URL** attend l'URL du protocole, de l'hôte et du port utilisés par les Agents Directeur pour se connecter au Subagent, par exemple http://localhost:4445.
  - L'URL commence par le protocole *http* si le sous-agent utilise le protocole HTTP ordinaire. Le protocole *https* est utilisé si le sous-agent est configuré pour HTTPS.
  - Le nom d'hôte peut être *localhost* si le sous-agent est installé sur la même machine que les Agents Director. Dans le cas contraire, il convient d'indiquer le FQDN de l'hôte du sous-agent.
  - Le *port* du Subagent est déterminé lors de l'installation. 
  - **Comme Sous-Agent Cluster** crée éventuellement un Sous-Agent Cluster pour le Subagent, voir [Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster).

Une fois l'enregistrement réussi, le sous-agent sera affiché dans la vue [Resources - Agents](/resources-agents).

## Références

### Aide contextuelle

- [Dashboard - Product Status](/dashboard-product-status)
- [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster)
- [Initial Operation - Register Controller](/initial-operation-register-controller)
- [Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster)

### Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
- [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)

