# Opération initiale - Enregistrer Contrôleur

L'opération initiale est effectuée après l'installation du Contrôleur JS7, de l'Agent et du JOC Cockpit.

L'exploitation d'un Cluster de Contrôleurs est soumise aux conditions de licence [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License).

- Utilisation d'un Contrôleur Autonome :
  - disponible pour les détenteurs d'une licence Open Source et pour les détenteurs d'une licence commerciale.
- Utilisation d'un Cluster de Contrôleurs :
  - disponible pour les détenteurs de licences commerciales,
  - pour plus de détails, voir [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)

Pour un Contrôleur Autonome, l'opération initiale comprend

- l'enregistrement d'un Contrôleur Autonome,
- l'enregistrement des Agents, voir [Opération initiale - Enregistrer Agent Autonome](/initial-operation-register-agent-standalone) et [Opération initiale - Enregistrer Agents Cluster](/initial-operation-register-agent-cluster).

Pour un Cluster de Contrôleurs, l'opération initiale comprend

- l'enregistrement d'un Cluster de Contrôleurs,
- l'enregistrement d'Agents Autonomes ou d'Agents Cluster.

## Enregistrer le Contrôleur

Après la première connexion, une fenêtre contextuelle s'affiche pour vous proposer d'enregistrer un Contrôleur. La fenêtre contextuelle est également disponible à partir de l'icône de la roue dans la barre de menu principale, en sélectionnant la page *Gerer Contrôleurs/agents*.

La fenêtre contextuelle propose l'enregistrement d'un Contrôleur Autonome. L'enregistrement d'un Cluster de Contrôleurs est proposé si une clé de licence JS7 est en place pour JOC Cockpit. Cliquez sur le logo JS7 dans le coin supérieur gauche de l'interface graphique de JOC Cockpit pour afficher le type de licence utilisé.

Les utilisateurs doivent vérifier que les connexions réseau entre le serveur de JOC Cockpit et le serveur du Contrôleur sont disponibles et que les règles du pare-feu autorisent les connexions.

Une fois l'enregistrement réussi, les instances du Contrôleur sont affichées dans la vue *Dashboard*.

### Enregistrer un Contrôleur Autonome

Les utilisateurs fournissent les données suivantes :

- **Légende** est le titre du Contrôleur qui sera affiché avec le rectangle du Contrôleur dans le panneau [Tableau de Bord - État du Produit](/dashboard-product-status).
- **Connexion de JOC Cockpit au Contrôleur** attend l'URL du protocole, de l'hôte et du port utilisés par JOC Cockpit pour se connecter au Contrôleur, par exemple http://localhost:4444.
  - L'URL commence par le protocole *http* si le Contrôleur utilise le protocole HTTP ordinaire. Le protocole *https* est utilisé si le Contrôleur est configuré pour HTTPS.
  - Le nom d'hôte peut être *localhost* si le Contrôleur est installé sur la même machine que JOC Cockpit. Sinon, le FQDN de l'hôte du Contrôleur doit être spécifié.
  - Le *port* du Contrôleur est déterminé lors de l'installation. 

Lorsque les informations d'enregistrement sont soumises, JOC Cockpit établit une connexion avec le Contrôleur Autonome.

### Enregistrer un Cluster  de Contrôleurs

Les conditions préalables à l'installation sont les suivantes :

- JOC Cockpit et toutes les instances de Contrôleur doivent être équipés d'une clé de licence JS7 valide.
- Le Contrôleur Secondaire doit contenir dans son fichier ./config/controller.conf le paramètre : *js7.journal.Cluster.node.is-backup = yes*
- Les instances de Contrôleur Primaire et Secondaire doivent être opérationnelles.

Les utilisateurs fournissent les données suivantes :

- **Contrôleur Primaire** est l'instance de Contrôleur à laquelle sera initialement attribué le rôle actif. Le rôle actif peut être modifié ultérieurement.
  - **Légende** est le titre du Contrôleur qui sera affiché avec le rectangle du Contrôleur dans la vue [Tableau de Bord - État du Produit](/dashboard-product-status).
  - **Connexion de JOC Cockpit au Contrôleur Primaire** attend l'URL du protocole, de l'hôte et du port utilisés par JOC Cockpit pour se connecter au Contrôleur principal, par exemple http://primary-server:4444.
  - **Connexion du Contrôleur Secondaire au Contrôleur Primaire** est, dans la plupart des cas, identique à la connexion du JOC Cockpit au Contrôleur principal. Une URL différente est appliquée si un serveur proxy est utilisé entre le Contrôleur principal et le Contrôleur Secondaire. L'URL est utilisée par le Contrôleur Secondaire pour se connecter au Contrôleur Primaire.
- **Contrôleur Secondaire** est l'instance de Contrôleur à laquelle sera initialement attribué le rôle de Contrôleur en attente.
  - **Légende** est le titre du Contrôleur qui sera affiché avec le rectangle du Contrôleur dans le panneau [Tableau de Bord - État du Produit](/dashboard-product-status).
  - **Connexion de JOC Cockpit au Contrôleur Secondaire** attend l'URL du protocole, l'hôte et le port utilisés par JOC Cockpit pour se connecter au Contrôleur Secondaire, par exemple http://secondary-server:4444.
  - **Connexion du Contrôleur Primaire au Contrôleur Secondaire** est identique à la connexion du JOC Cockpit au Contrôleur Secondaire. Une URL différente est appliquée si un serveur proxy est utilisé entre le Contrôleur Primaire et le Contrôleur Secondaire. L'URL est utilisée par le Contrôleur Primaire pour se connecter au Contrôleur Secondaire.

Lorsque les informations d'enregistrement sont soumises, JOC Cockpit établit une connexion avec les instances de Contrôleur Primaire et Secondaire.

## Références

### Aide contextuelle

- [Opération initiale - Enregistrer Agent Autonome](/initial-operation-register-agent-standalone)
- [Opération initiale - Enregistrer Agents Cluster](/initial-operation-register-agent-cluster)
- [Tableau de Bord - État du Produit](/dashboard-product-status)

### Product Knowledge Base

- [JS7 - How to troubleshoot Controller Cluster Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Controller+Cluster+Initial+Operation)
- [JS7 - Initial Operation for Controller Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Controller+Cluster)
- [JS7 - Initial Operation for Standalone Controller](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Standalone+Controller)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)
