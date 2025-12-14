# Demandes d'Autorisation

Le site [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) est proposé pour les situations dans lesquelles les utilisateurs ont l'intention d'effectuer des opérations telles que l'ajout ou l'annulation d'Ordres qui nécessitent l'autorisation d'un deuxième utilisateur. Il peut s'agir de toute opération modifiant un objet de scheduling.

Le processus d'autorisation implique les rôles suivants :

- Un *Demandeur* demande à effectuer une intervention nécessitant une autorisation.
- Un *Approbateur* confirme ou refuse la demande d'autorisation.

La fonctionnalité de base du processus d'autorisation comprend :

- mettre en œuvre le principe des 4 yeux : un *Approbateur* doit confirmer l'intervention d'un *Demandeur* avant que l'intervention puisse être exécutée dans le cadre du compte, des rôles et des autorisations du *Demandeur*. 
- pour garder une trace des demandes d'autorisation en attente.
- pour offrir une solution de repli à un certain nombre d'*Approbateurs*.

## Liste des Demandes d'Autorisation

Les demandes d'autorisation sont ajoutées par les utilisateurs qui demandent la confirmation d'une intervention, voir [Demande d'Autorisation](/approval-request).

La liste des demandes d'autorisation est proposée avec les propriétés suivantes :

- **Date Status Demande** est la date à laquelle la demande a été ajoutée comme [Demande d'Autorisation](/approval-request).
- **Titre** est spécifié par le *Demandeur* lors de l'ajout de la demande d'autorisation.
- **Demandeur** indique le compte d'utilisateur qui a introduit la demande d'autorisation.
- **Status Demande** est l'un des suivants : *requested*, *approved*, *withdrawn*, *executed*.
- **Approver** est le *prénom* et *nom* de l'*Approbateur* préféré.
- **Status Autorisation** est l'un des statuts suivants : *en attente*, *approuvé*, *refusé*
- **Date Status Autorisation** est la date la plus récente à laquelle l'*Approbateur* a agi sur la demande d'autorisation, par exemple en approuvant ou en rejetant la demande.
- **URL Demande** est le point de terminaison [REST Web Service API](/rest-api) que le *Demandeur* souhaite utiliser.
- **Catégorie** indique la portée de la demande, par exemple si elle est destinée à un Contrôleur, au Plan Quotidien, etc.
- **Raison** indique l'explication fournie par le *Demandeur* sur l'objet de la demande d'autorisation.

## Références

### Aide contextuelle

- [Demande d'Autorisation](/approval-request)
- [Paramètres de Notification d'Autorisation](/approval-notification-settings)
- [Profils Approbateur](/approval-profiles)
- [REST Web Service API](/rest-api)

### Product Knowledge Base

- [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)
