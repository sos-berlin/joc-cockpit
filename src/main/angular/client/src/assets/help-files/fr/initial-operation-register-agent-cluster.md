# Opération initiale - Enregistrer Agents Cluster

L'opération initiale est effectuée après l'installation du Contrôleur JS7, de l'Agent et du JOC Cockpit. L'enregistrement d'un Cluster d'Agents s'effectue apres l'enregistrement[Opération initiale - Enregistrer Contrôleur](/initial-operation-register-controller).

L'exploitation d'un Cluster d'Agents est soumise aux conditions de licence [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License).

- Utilisation d'un Agent Autonome :
  - les détenteurs d'une licence Open Source et les détenteurs d'une licence commerciale peuvent utiliser l'Agent Autonome.
- Utilisation d'un Cluster d'Agents :
  - disponible pour les détenteurs de licences commerciales,
  - pour plus de détails, voir [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)

## Architecture

### Agents

- **Agents Autonomes** exécutent des tâches sur des machines distantes sur site et à partir de conteneurs. Ils fonctionnent individuellement et sont gérés par le Contrôleur.
- **Agents Cluster**
  - les **Agents Directeurs** orchestrent les *Sous-Agents* dans un Cluster d'Agents. Ils fonctionnent à partir de deux instances en Clustering actif-passif et sont gérés par le Contrôleur.
  - les **Sous-Agents** exécutent des tâches sur des machines distantes sur site et à partir de conteneurs. Ils peuvent être considérés comme des nœuds de tâche dans un Cluster d'Agents et sont gérés par des *Agents Directeurs*.

### Connexions

- Les connexions **Agent Autonome** et de **Agent Directeur** sont établies par le Contrôleur. 
- Les connexions **Sous-Agent** dans un Cluster d'Agents sont établies par les *Agents Directeurs*.

## Enregistrer un Cluster d'Agents

L'enregistrement d'un Cluster d'Agents comprend l'enregistrement des Agents Directeurs Primaire et Secondaires. Pour l'enregistrement ultérieur des Sous-Agents, voir [Opération initiale - Enregistrer Sous-Agent](/initial-operation-register-agent-subagent).

Les conditions préalables à l'installation sont les suivantes

- Le JOC Cockpit, le Contrôleur et toutes les instances de Agent Directeur doivent être dotés d'une clé de licence JS7 valide.
- L'Agent Directeur Secondaire doit contenir dans son fichier ./config/agent.conf le paramètre : *js7.journal.Cluster.node.is-backup = yes*
- Les instances de Directeur Agent Primaire et Secondaire doivent être opérationnelles.

Les utilisateurs doivent vérifier que les connexions réseau entre le serveur du Contrôleur et les serveurs des deux Agents Director sont disponibles et que les règles du pare-feu autorisent les connexions aux ports des Agents Director.

La page *Gérer Contrôleurs/Agents* est accessible à partir de l'icône de la roue dans la barre de menu principale et propose l'opération *Ajouter Agent Cluster* dans le menu d'action du Contrôleur. Cette opération fait apparaître la fenêtre contextuelle d'enregistrement d'un Cluster d'Agents.

Les utilisateurs fournissent les données suivantes :

- **Id Agent** est l'identifiant unique du Cluster d'Agents, qui ne peut pas être modifié pendant la durée de vie du groupe. L'*Identifiant de l'Agent* n'est pas visible avec les tâches et les Workflows.
- **Nom du Cluster Agent** est le nom unique d'un Cluster d'Agents. Lors de l'attribution d'un Agent à une tâche, le *nom du Cluster Agents* est utilisé. Si vous modifiez le *nom du Cluster d'Agents* par la suite, vous devez continuer à utiliser le *nom du Clsuter Agent* précédent à partir d'un *nom d'alias*.
- le **Titre** est une description qui peut être ajoutée pour un Cluster d'Agents.
- les **Noms d'Alias** sont des noms alternatifs pour le même Cluster d'Agents. Lorsque vous attribuez un Agent à une tâche, les *Noms d'Alias* vous seront également proposés. Les *Noms d'Alias* peuvent être utilisés, par exemple, si un environnement de test comprend moins de Cluster d'Agents que l'environnement de production : pour que les affectations d'Agents restent inchangées d'un environnement à l'autre, les Cluster d'Agents manquantes sont mappées à partir des *Noms d'Alias* du même Custer d'Agents.
- **Agent Directeur Primaire**
  - **ID Sous-Agent** est l'identifiant unique de l'Agent Directeur Primaire qui ne peut pas être modifié pendant la durée de vie de l'Agent Directeur. L'*ID du Sous-Agent* n'est pas visible avec les Jobs et les Workflows.
  - **Titre** est une description qui peut être ajoutée pour un Agent Directeur.
  - **URL** attend l'URL du protocole, de l'hôte et du port utilisés par le Contrôleur pour se connecter à l'Agent Directeur Primaire, par exemple http://localhost:4445.
    - L'URL commence par le protocole *http* si le Agent Directeur utilise le protocole HTTP simple. Le protocole *https* est utilisé si l'Agent Directeur
	est configuré pour HTTPS.
    - Le nom d'hôte peut être *localhost* si l'Agent Agent Directeur est installé sur la même machine que le Contrôleur. Dans le cas contraire, il convient d'indiquer le FQDN de l'hôte de l'Agent administrateur.
    - Le *port* de l'Agent Directeur est déterminé lors de l'installation. 
  - **Comme propre Cluster de Sous-Agents** crée facultativement des Clusters de Sous-Agents pour chaque Agent Directeur Agent Primaire et Secondaire, voir [Opération initiale - Enregistrer Cluster Sous-Agents](/initial-operation-register-agent-subagent-cluster).
- **Agent Directeur Secondaire**
  - **ID Sous-Agent** est l'identifiant unique de l'Agent Directeur Secondaire qui ne peut pas être modifié pendant la durée de vie de l'Agent Directeur. Le *Subagent ID* n'est pas visible avec les Jobs et les Workflows.
  - **Titre** est une description qui peut être ajoutée pour un Agent Directeur.
  - **URL** attend l'URL du protocole, de l'hôte et du port utilisés par le Contrôleur pour se connecter à l'Agent Directeur Secondaire, de la même manière que pour l'*Agent Directeur Primaire*.

Une fois l'enregistrement réussi, l'Agent sera affiché dans la vue [Ressources - Agents](/resources-agents).

## Références

### Aide contextuelle

- [Opération initiale - Enregistrer Contrôleur](/initial-operation-register-controller)
- [Opération initiale - Enregistrer Agent Autonome](/initial-operation-register-agent-standalone)
- [Opération initiale - Enregistrer Sous-Agent](/initial-operation-register-agent-subagent)
- [Opération initiale - Enregistrer Cluster Sous-Agents](/initial-operation-register-agent-subagent-cluster)
- [Tableau de Bord - État du Produit](/dashboard-product-status)

### Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - How to troubleshoot Agent Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Agent+Initial+Operation)
- [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)
