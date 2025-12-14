# Opération initiale - Enregistrer Agent Autonome

L'opération initiale est effectuée après l'installation du Contrôleur JS7, de l'Agent et du JOC Cockpit. L'enregistrement de l'Agent a lieu après l'achèvement de[Opération initiale - Enregistrer Contrôleur](/initial-operation-register-controller).

## Enregistrer un Agent Autonome

Les utilisateurs doivent vérifier que les connexions réseau entre le serveur du Contrôleur et le serveur de l'Agent sont disponibles et que les règles du pare-feu autorisent les connexions au port de l'Agent.

La page *Gestion des Contrôleurs/Agents* est accessible à partir de l'icône de la roue dans la barre de menu principale et propose l'opération *Ajouter un Agent Autonome* dans le menu d'action du Contrôleur. Cette opération fait apparaître la fenêtre contextuelle d'enregistrement d'un Agent Autonome.

Les utilisateurs fournissent les données suivantes :

- **Id Agent** est l'identifiant unique d'un Agent qui ne peut pas être modifié pendant la durée de vie de l'Agent. L'ID de l'Agent n'est pas visible avec les tâches et les Workflows.
- **Nom Agent** est le nom unique de l'Agent. Lors de l'attribution d'un Agent à une tâche, c'est le *nom de l'Agent* qui est utilisé. Si vous modifiez le *nom de l'Agent* par la suite, vous devez continuer à utiliser le *nom de l'Agent* précédent à partir d'un *nom d'alias*.
- **Titre** est une description qui peut être ajoutée pour un Agent.
- **Noms d'Alias** sont des noms alternatifs pour le même Agent. Lorsque vous attribuez un Agent à une tâche, des *noms d'alias* vous seront également proposés. *Les noms d'alias* peuvent être utilisés, par exemple, si un environnement de test comprend moins d'Agents que l'environnement de production : pour que les affectations d'Agents restent inchangées d'un environnement à l'autre, les Agents manquants sont mappés à partir des *noms d'alias* du même Agent.
- **URL** attend l'URL du protocole, de l'hôte et du port utilisés par le Contrôleur pour se connecter à l'Agent, par exemple http://localhost:4445.
  - L'URL commence par le protocole *http* si l'Agent utilise le protocole HTTP ordinaire. Le protocole *https* est utilisé si l'Agent est configuré pour HTTPS.
  - Le nom d'hôte peut être *localhost* si l'Agent est installé sur la même machine que le Contrôleur. Sinon, le FQDN de l'hôte de l'Agent doit être spécifié.
  - Le *port* de l'Agent est déterminé lors de l'installation. 

Une fois l'enregistrement réussi, l'Agent sera affiché dans la vue [Ressources - Agents](/resources-agents).

## Références

### Aide contextuelle

- [Opération initiale - Enregistrer Contrôleur](/initial-operation-register-controller)
- [Opération initiale - Enregistrer Cluster Agents](/initial-operation-register-agent-cluster)
- [Tableau de Bord - État du Produit](/dashboard-product-status)

### Product Knowledge Base

- [JS7 - How to troubleshoot Agent Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Agent+Initial+Operation)
- [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)
