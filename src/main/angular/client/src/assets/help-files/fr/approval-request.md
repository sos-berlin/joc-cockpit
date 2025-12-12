# Demande d'approbation

Le site [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) est proposé pour les situations dans lesquelles les utilisateurs ont l'intention d'effectuer des opérations telles que l'ajout ou l'annulation d'Ordres qui nécessitent l'approbation d'un second utilisateur. Il peut s'agir de toute opération modifiant un objet de planification.

Le processus d'approbation implique les rôles suivants :

- Un *Demandeur* demande à effectuer une intervention qui nécessite une approbation.
- Un *approbateur* confirme ou refuse la demande d'approbation.

La fonctionnalité de base du processus d'approbation comprend :

- mettre en œuvre le principe des 4 yeux : un *approbateur* doit confirmer l'intervention d'un *demandeur* avant que l'intervention puisse être exécutée dans le cadre du compte, des rôles et des autorisations du *demandeur*. 
- pour garder une trace des demandes d'approbation en attente.
- pour offrir une solution de repli à un certain nombre d'*approbateurs*.

## Demande d'approbation

Les demandes d'approbation sont ajoutées lorsqu'un utilisateur tente d'effectuer une opération soumise à approbation. Les conditions préalables sont les suivantes

- L'utilisateur se voit attribuer le *rôle de demandeur*. Pour connaître le nom de ce rôle, consultez le site [Settings - JOC Cockpit](/settings-joc).
- L'opération en cours est indiquée avec les permissions du *rôle de demandeur*.

Par exemple, si le *rôle de demandeur* spécifie les autorisations pour les Ordres et que l'utilisateur essaie d'ajouter un Ordre à un Workflow, une fenêtre pop-up s'affichera pour demander de spécifier les informations suivantes :

- **Titre** est l'indicateur de la demande d'approbation. Les utilisateurs peuvent librement spécifier le *Titre*.
- **L'approbateur** est sélectionné dans la liste de [Approver Profiles](/approval-profiles). L'*approbateur* indiqué sera de préférence notifié. Cependant, tout *approbateur* peut approuver ou rejeter la demande d'approbation.
- le **motif** fournit une explication à l'*approbateur* sur la nécessité de l'intervention.

Lorsque la demande d'approbation est soumise, elle devient visible dans la vue [Approval Requests](/approval-requests). L'*approbateur* concerné recevra une notification par courrier électronique.

## Références

### Aide contextuelle

- [Approval Notification Settings](/approval-notification-settings)
- [Approver Profiles](/approval-profiles)
- [Approval Requests](/approval-requests)

### Product Knowledge Base

- [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)

