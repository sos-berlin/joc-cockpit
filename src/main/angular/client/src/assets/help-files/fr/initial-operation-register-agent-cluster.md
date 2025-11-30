# Opération initiale - Enregistrer le groupe d'agents

L'opération initiale est effectuée après l'installation du contrôleur JS7, de l'agent et du cockpit JOC. L'enregistrement d'un groupe d'agents a lieu après l'achèvement du site [Initial Operation - Register Controller](/initial-operation-register-controller).

L'exploitation d'un groupe d'agents est soumise aux accords du site [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License).

- Utilisation d'un agent autonome :
  - les détenteurs d'une licence Open Source et les détenteurs d'une licence commerciale peuvent utiliser l'agent autonome.
- Utilisation d'un groupe d'agents :
  - disponible pour les détenteurs de licences commerciales,
  - pour plus de détails, voir [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)

## Architecture

### Agents

- **Les agents Standalone** exécutent des tâches sur des machines distantes sur site et à partir de conteneurs. Ils fonctionnent individuellement et sont gérés par le contrôleur.
- **Cluster d'agents
  - les **Agents Directeurs** orchestrent les *Sous-Agents* dans un Cluster d'Agents. Ils fonctionnent à partir de deux instances en clustering actif-passif et sont gérés par le contrôleur.
  - les **Subagents** exécutent des tâches sur des machines distantes sur site et à partir de conteneurs. Ils peuvent être considérés comme des nœuds de travail dans un cluster d'agents et sont gérés par des *agents directeurs*.

### Connexions

- **Les connexions de l'Agent Standalone** et de l'Agent Directeur** sont établies par le Contrôleur. 
- les connexions **Subagent** dans un cluster d'agents sont établies par les *Agents Directeurs*.

## Enregistrer un groupe d'agents

L'enregistrement d'un groupe d'agents comprend l'enregistrement des agents directeurs principaux et secondaires. Pour l'enregistrement ultérieur des sous-agents, voir [Initial Operation - Register Subagent](/initial-operation-register-agent-subagent).

Les conditions préalables à l'installation sont les suivantes

- Le JOC Cockpit, le contrôleur et toutes les instances de Director Agent doivent être dotés d'une clé de licence JS7 valide.
- L'agent Director secondaire doit contenir dans son fichier ./config/agent.conf le paramètre : *js7.journal.cluster.node.is-backup = yes*
- Les instances de Director Agent primaire et secondaire doivent être opérationnelles.

Les utilisateurs doivent vérifier que les connexions réseau entre le serveur du contrôleur et les serveurs des deux agents Director sont disponibles et que les règles du pare-feu autorisent les connexions aux ports des agents Director.

La page *Gestion des contrôleurs/agents* est accessible à partir de l'icône de la roue dans la barre de menu principale et propose l'opération *Ajouter un groupe d'agents* dans le menu d'action du contrôleur. Cette opération fait apparaître la fenêtre contextuelle d'enregistrement d'un groupe d'agents.

Les utilisateurs fournissent les données suivantes :

- **Identifiant de l'agent** est l'identifiant unique du groupe d'agents, qui ne peut pas être modifié pendant la durée de vie du groupe. L'*Identifiant de l'agent* n'est pas visible avec les Jobs et les Workflows.
- **Nom du groupe d'agents** est le nom unique d'un groupe d'agents. Lors de l'attribution d'un agent à un travail, le *nom du cluster d'agents* est utilisé. Si vous modifiez le *nom du groupe d'agents* par la suite, vous devez continuer à utiliser le *nom du groupe d'agents* précédent à partir d'un *nom d'alias*.
- le **Titre** est une description qui peut être ajoutée pour un cluster d'agents.
- les **Noms d'alias** sont des noms alternatifs pour le même groupe d'agents. Lorsque vous attribuez un agent à un travail, les *noms de groupe d'alias* vous seront également proposés. *Les noms de grappes d'alias* peuvent être utilisés, par exemple, si un environnement de test comprend moins de grappes d'agents que l'environnement de production : pour que les affectations d'agents restent inchangées d'un environnement à l'autre, les grappes d'agents manquantes sont mappées à partir des *noms de grappes d'alias* de la même grappe d'agents.
- **Primary Director Agent**
  - **L'ID du sous-agent** est l'identifiant unique de l'agent Director primaire qui ne peut pas être modifié pendant la durée de vie de l'agent Director. L'*ID du sous-agent* n'est pas visible avec les Jobs et les Workflows.
  - le **Titre** est une description qui peut être ajoutée pour un Director Agent.
  - **L'URL** attend l'URL du protocole, de l'hôte et du port utilisés par le contrôleur pour se connecter à l'agent Director primaire, par exemple http://localhost:4445.
    - L'URL commence par le protocole *http* si le Director Agent utilise le protocole HTTP simple. Le protocole *https* est utilisé si l'agent Director Agent est configuré pour HTTPS.
    - Le nom d'hôte peut être *localhost* si l'agent Director Agent est installé sur la même machine que le contrôleur. Dans le cas contraire, il convient d'indiquer le FQDN de l'hôte de l'agent administrateur.
    - Le *port* de l'agent Director est déterminé lors de l'installation. 
  - **As own Subagent Cluster** crée facultativement des clusters de sous-agents pour chaque agent Director Agent primaire et secondaire, voir [Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster).
- **Agent Director secondaire**
  - **L'ID du sous-agent** est l'identifiant unique de l'agent Director secondaire qui ne peut pas être modifié pendant la durée de vie de l'agent Director. Le *Subagent ID* n'est pas visible avec les Jobs et les Workflows.
  - le **Titre** est une description qui peut être ajoutée pour un Director Agent.
  - **L'URL** attend l'URL du protocole, de l'hôte et du port utilisés par le contrôleur pour se connecter à l'agent Director secondaire, de la même manière que pour l'*agent Director primaire*.

Une fois l'enregistrement réussi, l'agent sera affiché dans la vue [Resources - Agents](/resources-agents).

## Références

### Aide contextuelle

- [Dashboard - Product Status](/dashboard-product-status)
- [Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone)
- [Initial Operation - Register Subagent](/initial-operation-register-agent-subagent)
- [Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster)
- [Initial Operation - Register Controller](/initial-operation-register-controller)

### Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - How to troubleshoot Agent Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Agent+Initial+Operation)
- [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)

