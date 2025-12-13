# Demandes d'approbation

Le site [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) est proposé pour les situations dans lesquelles les utilisateurs ont l'intention d'effectuer des opérations telles que l'ajout ou l'annulation d'Ordres qui nécessitent l'approbation d'un deuxième utilisateur. Il peut s'agir de toute opération modifiant un objet de planification.

Le processus d'approbation implique les rôles suivants :

- Un *Demandeur* demande à effectuer une intervention nécessitant une approbation.
- Un *approbateur* confirme ou refuse la demande d'approbation.

La fonctionnalité de base du processus d'approbation comprend :

- mettre en œuvre le principe des 4 yeux : un *approbateur* doit confirmer l'intervention d'un *demandeur* avant que l'intervention puisse être exécutée dans le cadre du compte, des rôles et des autorisations du *demandeur*. 
- pour garder une trace des demandes d'approbation en attente.
- pour offrir une solution de repli à un certain nombre d'*approbateurs*.

## Liste des demandes d'approbation

Les demandes d'approbation sont ajoutées par les utilisateurs qui demandent la confirmation d'une intervention, voir [Approval Request](/approval-request).

La liste des demandes d'approbation est proposée avec les propriétés suivantes :

- **Request Status Date** est la date à laquelle la demande a été ajoutée à [Approval Request](/approval-request).
- le **Titre** est spécifié par le *Demandeur* lors de l'ajout de la demande d'approbation.
- **Requestor** indique le compte d'utilisateur qui a introduit la demande d'approbation.
- **Le statut de la demande** est l'un des suivants : *requested*, *approved*, *withdrawn*, *executed*.
- **Approver** est le *prénom* et *nom* de l'*approbateur* préféré.
- **Statut d'approbation** est l'un des statuts suivants : *en attente*, *approuvé*, *refusé*
- la **Date d'approbation** est la date la plus récente à laquelle l'*approbateur* a agi sur la demande d'approbation, par exemple en approuvant ou en rejetant la demande.
- **Request URL** est le point de terminaison [REST Web Service API](/rest-api) que le *Demandeur* souhaite utiliser.
- **Catégorie** indique la portée de la demande, par exemple si elle est destinée à un Contrôleur, au Plan Quotidien, etc.
- **Raison** indique l'explication fournie par le *demandeur* sur l'objet de la demande d'approbation.

## Références

### Aide contextuelle

- [Approval Notification Settings](/approval-notification-settings)
- [Approver Profiles](/approval-profiles)
- [Approval Request](/approval-request)
- [REST Web Service API](/rest-api)

### Product Knowledge Base

- [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)

