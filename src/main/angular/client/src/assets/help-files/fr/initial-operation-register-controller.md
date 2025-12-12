# Fonctionnement initial - Contrôleur de registre

L'opération initiale est effectuée après l'installation du contrôleur JS7, de l'agent et du JOC Cockpit.

L'exploitation d'un groupe de contrôleurs est soumise aux conditions de licence [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License).

- Utilisation d'un contrôleur autonome :
  - disponible pour les détenteurs d'une licence Open Source et pour les détenteurs d'une licence commerciale.
- Utilisation d'un groupe de contrôleurs :
  - disponible pour les détenteurs de licences commerciales,
  - pour plus de détails, voir [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)

Pour un contrôleur autonome, l'opération initiale comprend

- l'enregistrement d'un contrôleur autonome,
- l'enregistrement des agents, voir [Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone) et [Initial Operation - Register Cluster Agent](/initial-operation-register-agent-cluster).

Pour un groupe de contrôleurs, l'opération initiale comprend

- l'enregistrement d'un groupe de contrôleurs,
- l'enregistrement d'agents autonomes ou d'agents cluster.

## Enregistrer le contrôleur

Après la première connexion, une fenêtre contextuelle s'affiche pour vous proposer d'enregistrer un contrôleur. La fenêtre contextuelle est également disponible à partir de l'icône de la roue dans la barre de menu principale, en sélectionnant la page *Gerer contrôleurs/agents*.

La fenêtre contextuelle propose l'enregistrement d'un contrôleur autonome. L'enregistrement d'un cluster de contrôleurs est proposé si une clé de licence JS7 est en place pour JOC Cockpit. Cliquez sur le logo JS7 dans le coin supérieur gauche de l'interface graphique de JOC Cockpit pour afficher le type de licence utilisé.

Les utilisateurs doivent vérifier que les connexions réseau entre le serveur de JOC Cockpit et le serveur du contrôleur sont disponibles et que les règles du pare-feu autorisent les connexions.

Une fois l'enregistrement réussi, les instances du contrôleur sont affichées dans la vue *Dashboard*.

### Enregistrer un contrôleur autonome

Les utilisateurs fournissent les données suivantes :

- **Légende** est le titre du contrôleur qui sera affiché avec le rectangle du contrôleur dans le panneau [Dashboard - Product Status](/dashboard-product-status).
- **Connexion de JOC Cockpit au Contrôleur** attend l'URL du protocole, de l'hôte et du port utilisés par JOC Cockpit pour se connecter au contrôleur, par exemple http://localhost:4444.
  - L'URL commence par le protocole *http* si le contrôleur utilise le protocole HTTP ordinaire. Le protocole *https* est utilisé si le contrôleur est configuré pour HTTPS.
  - Le nom d'hôte peut être *localhost* si le contrôleur est installé sur la même machine que JOC Cockpit. Sinon, le FQDN de l'hôte du contrôleur doit être spécifié.
  - Le *port* du contrôleur est déterminé lors de l'installation. 

Lorsque les informations d'enregistrement sont soumises, JOC Cockpit établit une connexion avec le contrôleur autonome.

### Enregistrer un cluster  de contrôleurs

Les conditions préalables à l'installation sont les suivantes :

- JOC Cockpit et toutes les instances de contrôleur doivent être équipés d'une clé de licence JS7 valide.
- Le contrôleur secondaire doit contenir dans son fichier ./config/controller.conf le paramètre : *js7.journal.cluster.node.is-backup = yes*
- Les instances de contrôleur primaire et secondaire doivent être opérationnelles.

Les utilisateurs fournissent les données suivantes :

- **Contrôleur Primaire** est l'instance de contrôleur à laquelle sera initialement attribué le rôle actif. Le rôle actif peut être modifié ultérieurement.
  - **Légende** est le titre du contrôleur qui sera affiché avec le rectangle du contrôleur dans la vue [Dashboard - Product Status](/dashboard-product-status).
  - **Connexion de JOC Cockpit au Contrôleur Primaire** attend l'URL du protocole, de l'hôte et du port utilisés par JOC Cockpit pour se connecter au contrôleur principal, par exemple http://primary-server:4444.
  - **Connexion du Contrôleur Secondaire au Contrôleur Primaire** est, dans la plupart des cas, identique à la connexion du JOC Cockpit au contrôleur principal. Une URL différente est appliquée si un serveur proxy est utilisé entre le contrôleur principal et le contrôleur secondaire. L'URL est utilisée par le contrôleur secondaire pour se connecter au contrôleur primaire.
- **Contrôleur Secondaire** est l'instance de contrôleur à laquelle sera initialement attribué le rôle de contrôleur en attente.
  - **Légende** est le titre du contrôleur qui sera affiché avec le rectangle du contrôleur dans le panneau [Dashboard - Product Status](/dashboard-product-status).
  - **Connexion de JOC Cockpit au Contrôleur Secondaire** attend l'URL du protocole, l'hôte et le port utilisés par JOC Cockpit pour se connecter au contrôleur secondaire, par exemple http://secondary-server:4444.
  - **Connexion du Contrôleur Primaire au Contrôleur Secondaire** est identique à la connexion du JOC Cockpit au contrôleur secondaire. Une URL différente est appliquée si un serveur proxy est utilisé entre le contrôleur primaire et le contrôleur secondaire. L'URL est utilisée par le contrôleur primaire pour se connecter au contrôleur secondaire.

Lorsque les informations d'enregistrement sont soumises, JOC Cockpit établit une connexion avec les instances de contrôleur primaire et secondaire.

## Références

### Aide contextuelle

- [Dashboard - Product Status](/dashboard-product-status)
- [Initial Operation - Register Cluster Agent](/initial-operation-register-agent-cluster)
- [Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone)

### Product Knowledge Base

- [JS7 - How to troubleshoot Controller Cluster Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Controller+Cluster+Initial+Operation)
- [JS7 - Initial Operation for Controller Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Controller+Cluster)
- [JS7 - Initial Operation for Standalone Controller](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Standalone+Controller)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)

