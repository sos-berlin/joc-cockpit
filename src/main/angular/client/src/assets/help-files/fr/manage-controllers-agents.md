# Gérer les Contrôleurs et les Agents

La page *Gerer Contrôleurs/Agents* est utilisée 

- pour enregistrer des Contrôleurs autonomes et des Clusters de Contrôleurs,
- pour enregistrer les Agents Autonomes auprès des Contrôleurs,
- pour enregistrer des Agents Cluster avec des Contrôleurs,
  - spécifier une grappe d'*Agents Directeurs*, - spécifier un nombre quelconque de *Sous-Agents*
  - en spécifiant un nombre quelconque de *Sous-Agents* qui agissent en tant que nœuds de tâche.
  - la spécification d'un nombre quelconque de *Clusters de Sous-Agents* qui régissent l'utilisation des Agents et auxquels peuvent être attribués des Jobs dans les Workflows.

L'exploitation d'un Cluster de Contrôleurs ou d'Agents est soumise aux conditions de licence [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License).

## Enregistrer le Contrôleur

L'opération d'enregistrement d'un Contrôleur est disponible à partir du bouton *Nouveau Contrôleur*. Lors de la première utilisation de JOC Cockpit, la fenêtre contextuelle permettant d'enregistrer un Contrôleur s'affiche automatiquement.

Pour plus d'explications, voir[Opération initiale - Enregistrer Contrôleur](/initial-operation-register-controller).

## Opérations sur les Contrôleurs

Pour un Contrôleur existant, les opérations suivantes sont proposées à partir de son menu d'action à 3 points :

- **Modifier** permet de modifier les propriétés d'un Contrôleur, y compris les URL des instances de Contrôleur.
- **Ajouter Agent Autonome** permet d'enregistrer un Agent Autonome.
  - Pour plus d'explications, voir [Opération initiale - Enregistrer Agent Autonome](/initial-operation-register-agent-standalone).
- **Ajouter Agent Cluster** permet d'enregistrer un Cluster d'Agents. 
  - L'opération comprend la spécification des *Agents Directeurs* et des *Sous-Agents*.
  - Pour plus d'explications, voir [Opération initiale - Enregistrer Agents Cluster](/initial-operation-register-agent-cluster).
- **Créer un Jeton à usage unique** 
- **Exporter la configuration des Agents** permet de télécharger un fichier d'exportation au format JSON contenant les configurations de l'Agent du Contrôleur sélectionné.
- **Importer la configuration des Agents** permet de télécharger un fichier d'exportation au format JSON contenant les configurations de l'Agent précédemment exportées. Les Agents concernés seront enregistrés auprès du Contrôleur.
- **Effacer** permet de supprimer la configuration du Contrôleur, y compris toutes les configurations des Agents. Cette opération n'efface pas le Contrôleur et les Agents du disque, mais supprime la configuration dans JOC Cockpit.

## Filtres

Les boutons de filtrage suivants pour les Agents sont disponibles en haut de l'écran :

- **Tous les Agents** affiche toutes les configurations d'Agents indépendamment de leur état de déploiement.
- **Synchronisé** affiche les configurations d'Agents qui ont été déployées sur un Contrôleur.
- **Non Synchronisé** affiche les configurations d'Agents pour lesquelles les changements n'ont pas été déployés vers un Contrôleur.
- **Non Déployé** affiche les configurations d'Agents qui n'ont pas été initialement déployées vers un Contrôleur.
- **Non Connu** affiche les configurations d'Agents dont l'état est inconnu, par exemple après la réinitialisation d'un Contrôleur. Les utilisateurs doivent déployer la configuration de l'Agent.

## Références

### Aide contextuelle

- [Opération initiale - Enregistrer Contrôleur](/initial-operation-register-controller)
- [Opération initiale - Enregistrer Agent Autonome](/initial-operation-register-agent-standalone)
- [Opération initiale - Enregistrer Agents Cluster](/initial-operation-register-agent-cluster)

### Product Knowledge Base

- [JS7 - How to troubleshoot Controller Cluster Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Controller+Cluster+Initial+Operation)
- [JS7 - Initial Operation for Controller Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Controller+Cluster)
- [JS7 - Initial Operation for Standalone Controller](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Standalone+Controller)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)
