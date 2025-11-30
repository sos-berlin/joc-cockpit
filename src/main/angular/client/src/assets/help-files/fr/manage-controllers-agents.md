# Gérer les contrôleurs et les agents

La page *Gestion des contrôleurs/agents* est utilisée pour 

- pour enregistrer des Contrôleurs autonomes et des Clusters de Contrôleurs,
- pour enregistrer les agents autonomes auprès des contrôleurs,
- d'enregistrer des agents de grappe avec des contrôleurs,
  - spécifier une grappe d'*agents directeurs*, - spécifier un nombre quelconque de *sous-agents*
  - en spécifiant un nombre quelconque de *Subagents* qui agissent en tant que nœuds de travail.
  - la spécification d'un nombre quelconque de *Clusters de sous-agents* qui régissent l'utilisation des agents et auxquels peuvent être attribués des Jobs dans les Workflows.

L'exploitation d'une grappe de contrôleurs ou d'agents est soumise aux accords du site [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License).

## Enregistrer le contrôleur

L'opération d'enregistrement d'un contrôleur est disponible à partir du bouton *Nouveau contrôleur*. Lors de la première utilisation de JOC Cockpit, la fenêtre contextuelle permettant d'enregistrer un contrôleur s'affiche automatiquement.

Pour plus d'explications, voir [Initial Operation - Register Controller](/initial-operation-register-controller).

## Opérations sur les contrôleurs

Pour un contrôleur existant, les opérations suivantes sont proposées à partir de son menu d'action à 3 points :

- **Editer** permet de modifier les propriétés d'un contrôleur, y compris les URL des instances de contrôleur.
- **Ajouter un agent autonome** permet d'enregistrer un agent autonome.
  - Pour plus d'explications, voir [Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone).
- **Ajouter un agent de grappe** permet d'enregistrer une grappe d'agents. 
  - L'opération comprend la spécification des *Agents Directeurs* et des *Sous-Agents*.
  - Pour plus d'explications, voir [Initial Operation - Register Cluster Agent](/initial-operation-register-agent-cluster).
- **Créer un jeton à usage unique** 
- **Exporter la configuration de l'agent** permet de télécharger un fichier d'exportation au format JSON contenant les configurations de l'agent du contrôleur sélectionné.
- **Importer la configuration de l'agent** permet de télécharger un fichier d'exportation au format JSON contenant les configurations de l'agent précédemment exportées. Les agents concernés seront enregistrés auprès du contrôleur.
- **Supprimer** permet de supprimer la configuration du contrôleur, y compris toutes les configurations des agents. Cette opération n'efface pas le contrôleur et les agents du disque, mais supprime la configuration dans JOC Cockpit.

## Filtres

Les boutons de filtrage suivants pour les agents sont disponibles en haut de l'écran :

- **Tous les agents** affiche toutes les configurations d'agents indépendamment de leur état de déploiement.
- **Synchronisé** affiche les configurations d'agents qui ont été déployées sur un contrôleur.
- **Non synchronisé** affiche les configurations d'agents pour lesquelles les changements n'ont pas été déployés vers un contrôleur.
- **Non déployées** affiche les configurations d'agents qui n'ont pas été initialement déployées vers un contrôleur.
- **Inconnu** affiche les configurations d'agents dont l'état est inconnu, par exemple après la réinitialisation d'un contrôleur. Les utilisateurs doivent déployer la configuration de l'agent.

## Références

### Aide contextuelle

- [Initial Operation - Register Cluster Agent](/initial-operation-register-agent-cluster)
- [Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone)
- [Initial Operation - Register Controller](/initial-operation-register-controller)

### Product Knowledge Base

- [JS7 - How to troubleshoot Controller Cluster Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Controller+Cluster+Initial+Operation)
- [JS7 - Initial Operation for Controller Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Controller+Cluster)
- [JS7 - Initial Operation for Standalone Controller](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Standalone+Controller)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)

