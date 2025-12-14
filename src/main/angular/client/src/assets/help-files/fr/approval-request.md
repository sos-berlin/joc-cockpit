# Demande d'Autorisation

Le site [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) est proposé pour les situations dans lesquelles les utilisateurs ont l'intention d'effectuer des opérations telles que l'ajout ou l'annulation d'Ordres qui nécessitent l'autorisation d'un second utilisateur. Il peut s'agir de toute opération modifiant un objet de scheduling.

Le processus d'autorisation implique les rôles suivants :

- Un *Demandeur* demande à effectuer une intervention qui nécessite une autorisation.
- Un *Approbateur* confirme ou refuse la demande d'autorisation.

La fonctionnalité de base du processus d'autorisation comprend :

- mettre en œuvre le principe des 4 yeux : un *Approbateur* doit confirmer l'intervention d'un *Demandeur* avant que l'intervention puisse être exécutée dans le cadre du compte, des rôles et des autorisations du *Demandeur*. 
- pour garder une trace des demandes d'autorisation en attente.
- pour offrir une solution de repli à un certain nombre d'*Approbateurs*.

## Demande d'Autorisation

Les demandes d'autorisation sont ajoutées lorsqu'un utilisateur tente d'effectuer une opération soumise à autorisation. Les conditions préalables sont les suivantes

- L'utilisateur se voit attribuer le *rôle de demandeur*. Pour connaître le nom de ce rôle, consultez les [Réglages - JOC Cockpit](/settings-joc).
- L'opération en cours est indiquée avec les permissions du *rôle de demandeur*.

Par exemple, si le *rôle de demandeur* spécifie les autorisations pour les Ordres et que l'utilisateur essaie d'ajouter un Ordre à un Workflow, une fenêtre pop-up s'affichera pour demander de spécifier les informations suivantes :

- **Titre** est l'indicateur de la demande d'autorisation. Les utilisateurs peuvent librement spécifier le *Titre*.
- **Approbateur** est sélectionné dans la liste des [Profils Approbateur](/approval-profiles). L'*Approbateur* indiqué sera de préférence notifié. Cependant, tout *Approbateur* peut approuver ou rejeter la demande d'autorisation.
- **Raison** fournit une explication à l'*Approbateur* sur la nécessité de l'intervention.

Lorsque la demande d'autorisation est soumise, elle devient visible dans la vue [Demandes d'Autorisation](/approval-requests). L'*Approbateur* concerné recevra une notification par courrier électronique.

## Références

### Aide contextuelle

- [Demandes d'Autorisation](/approval-requests)
- [Paramètres de Notification d'Autorisation](/approval-notification-settings)
- [Profils Approbateur](/approval-profiles)

### Product Knowledge Base

- [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)
