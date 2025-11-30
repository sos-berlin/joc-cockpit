# Fonctionnement initial - Enregistrement d'un agent autonome

L'opération initiale est effectuée après l'installation du contrôleur JS7, de l'agent et du JOC Cockpit. L'enregistrement de l'agent a lieu après l'achèvement du site [Initial Operation - Register Controller](/initial-operation-register-controller).

## Enregistrer un agent autonome

Les utilisateurs doivent vérifier que les connexions réseau entre le serveur du contrôleur et le serveur de l'agent sont disponibles et que les règles du pare-feu autorisent les connexions au port de l'agent.

La page *Gestion des contrôleurs/agents* est accessible à partir de l'icône de la roue dans la barre de menu principale et propose l'opération *Ajouter un agent autonome* dans le menu d'action du contrôleur. Cette opération fait apparaître la fenêtre contextuelle d'enregistrement d'un agent autonome.

Les utilisateurs fournissent les données suivantes :

- **Identifiant de l'agent** est l'identifiant unique d'un agent qui ne peut pas être modifié pendant la durée de vie de l'agent. L'ID de l'agent n'est pas visible avec les tâches et les Workflows.
- **Nom de l'agent** est le nom unique de l'agent. Lors de l'attribution d'un agent à un travail, c'est le *nom de l'agent* qui est utilisé. Si vous modifiez le *nom de l'agent* par la suite, vous devez continuer à utiliser le *nom de l'agent* précédent à partir d'un *nom d'alias*.
- le **Titre** est une description qui peut être ajoutée pour un agent.
- les **noms d'alias** sont des noms alternatifs pour le même agent. Lorsque vous attribuez un agent à un travail, des *noms d'alias* vous seront également proposés. *Les noms d'alias* peuvent être utilisés, par exemple, si un environnement de test comprend moins d'agents que l'environnement de production : pour que les affectations d'agents restent inchangées d'un environnement à l'autre, les agents manquants sont mappés à partir des *noms d'alias* du même agent.
- **URL** attend l'URL du protocole, de l'hôte et du port utilisés par le contrôleur pour se connecter à l'agent, par exemple http://localhost:4445.
  - L'URL commence par le protocole *http* si l'agent utilise le protocole HTTP ordinaire. Le protocole *https* est utilisé si l'agent est configuré pour HTTPS.
  - Le nom d'hôte peut être *localhost* si l'agent est installé sur la même machine que le contrôleur. Sinon, le FQDN de l'hôte de l'agent doit être spécifié.
  - Le *port* de l'agent est déterminé lors de l'installation. 

Une fois l'enregistrement réussi, l'agent sera affiché dans la vue [Resources - Agents](/resources-agents).

## Références

### Aide contextuelle

- [Dashboard - Product Status](/dashboard-product-status)
- [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster)
- [Initial Operation - Register Controller](/initial-operation-register-controller)

### Product Knowledge Base

- [JS7 - How to troubleshoot Agent Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Agent+Initial+Operation)
- [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)

