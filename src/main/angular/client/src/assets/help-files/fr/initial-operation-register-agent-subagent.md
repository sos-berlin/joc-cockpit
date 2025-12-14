# Opération initiale - Enregistrement du Sous-Agent

L'opération initiale est effectuée après l'installation du Contrôleur JS7, de l'Agent et du JOC Cockpit. L'enregistrement du Sous-Agent a lieu après l'achèvement de [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-Cluster).

## Architecture

### Agents

- **Les Agents Autonomes** exécutent des tâches sur des machines distantes sur site et à partir de conteneurs. Ils fonctionnent individuellement et sont gérés par le Contrôleur.
- **Cluster d'Agents
  - les **Agents Directeurs** orchestrent les *Sous-Agents* dans un Cluster d'Agents. Ils fonctionnent à partir de deux instances en Clustering actif-passif et sont gérés par le Contrôleur.
  - les **Sous-Agents** exécutent des tâches sur des machines distantes sur site et à partir de conteneurs. Ils peuvent être considérés comme des nœuds de tâche dans un Cluster d'Agents et sont gérés par des *Agents Directeurs*.

### Connexions

- Les connexions de l'**Agent Autonome** et de l'**Agent Directeur** sont établies par le Contrôleur. 
- les connexions **Sous-Agent** dans un Cluster d'Agents sont établies par les *Agents Directeurs*.

## Enregistrer un Sous-Agent

Les utilisateurs doivent vérifier que les connexions réseau entre les serveurs des Agents Directeurs et le serveur du Sous-Agent sont disponibles et que les règles du pare-feu autorisent les connexions au port du Sous-Agent.

La page *Gestion des Contrôleurs/agents* est accessible à partir de l'icône de la roue dans la barre de menu principale et propose l'opération *Ajouter un Sous-Agent* dans le menu d'action du Cluster d'Agents. Cette opération fait apparaître la fenêtre contextuelle d'enregistrement d'un Sous-Agent.

Les utilisateurs fournissent les données suivantes :

- **ID Sous-Agent** est l'identifiant unique d'un Sous-Agent qui ne peut pas être modifié pendant la durée de vie du Sous-Agent. L'*ID du Sous-Agent* n'est pas visible avec les tâches et les Workflows.
- **Titre** est une description qui peut être ajoutée pour un Sous-Agent.
- **URL** attend l'URL du protocole, de l'hôte et du port utilisés par les Agents Directeur pour se connecter au Sous-Agent, par exemple http://localhost:4445.
  - L'URL commence par le protocole *http* si le Sous-Agent utilise le protocole HTTP ordinaire. Le protocole *https* est utilisé si le Sous-Agent est configuré pour HTTPS.
  - Le nom d'hôte peut être *localhost* si le Sous-Agent est installé sur la même machine que les Agents Director. Dans le cas contraire, il convient d'indiquer le FQDN de l'hôte du Sous-Agent.
  - Le *port* du Subagent est déterminé lors de l'installation. 
  - **Comme Cluster Sous-Agent** crée éventuellement un Cluster Sous-Agent pour le Sous-Agent, voir [Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-Cluster).

Une fois l'enregistrement réussi, le Sous-Agent sera affiché dans la vue [Resources - Agents](/resources-agents).

## Références

### Aide contextuelle

- [Dashboard - Product Status](/dashboard-product-status)
- [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-Cluster)
- [Initial Operation - Register Controller](/initial-operation-register-controller)
- [Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-Cluster)

### Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
- [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)
