# Paramètres de notification d'approbation

Le site [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) est proposé pour les situations dans lesquelles les utilisateurs ont l'intention d'effectuer des opérations telles que l'ajout ou l'annulation d'Ordres qui nécessitent l'approbation d'un deuxième utilisateur. Il peut s'agir de toute opération modifiant un objet de planification.

Le processus d'approbation implique les rôles suivants :

- Un *Demandeur* demande à effectuer une intervention qui nécessite une approbation.
- Un *approbateur* confirme ou refuse la demande d'approbation.

La fonctionnalité de base du processus d'approbation comprend :

- mettre en œuvre le principe des 4 yeux : un *approbateur* doit confirmer l'intervention d'un *demandeur* avant que l'intervention puisse être exécutée dans le cadre du compte, des rôles et des autorisations du *demandeur*. 
- pour garder une trace des demandes d'approbation en attente.
- pour offrir une solution de repli à un certain nombre d'*approbateurs*.

## Paramètres de notification d'approbation

Les paramètres de notification comprennent les propriétés permettant d'envoyer un courrier aux *approbateurs* en cas d'arrivée de [Approval Requests](/approval-requests):

- **Ressource de Tâche** contient les paramètres de connexion au serveur de messagerie. Pour plus de détails, voir [JS7 - eMailDefault Job Resource](https://kb.sos-berlin.com/display/JS7/JS7+-+eMailDefault+Job+Resource).
- **Content Type**, **Charset**, **Encoding** sont communs à tout système envoyant du courrier.
- **Mail de demande d'approbation**
  - **Cc**, **Bcc** indiquent éventuellement les destinataires des copies et des copies carbone de la notification.
  - **L'objet**, **le corps** du courrier peuvent inclure des caractères de remplacement qui seront substitués lors de l'envoi du courrier. Les caractères génériques sont spécifiés en utilisant le format $\{placeholder\}.
    - Les caractères génériques suivants sont disponibles :
      - $\{RequestStatusDate\} : Date de l'état de la demande
      - $\N{ApprovalStatusDate\N} : Approval Status Date
      - $\{Title\} : Titre de la demande
      - ${Requestor\} : Compte du demandeur
      - ${RequestStatus} : Statut de la demande, l'un de REQUESTED, EXECUTED, WITHDRAWN
      - ${Approver\} : Compte de l'approbateur
      - $\{ApprovalStatus\} : État de l'approbation, l'un des suivants : APPROVED, EXECUTED, WITHDRAWN : Statut de l'approbation, l'un de APPROVED, REJECTED
      - ${RequestURI\} : URI de la demande
      - $\{RequestBody\} : Corps de la demande contenant les détails de la demande d'API REST
      - $\{Category\} : Catégorie
      - $\{Reason\} : Raison
    - En outre, les caractères génériques suivants peuvent être utilisés s'ils sont spécifiés à partir d'une ressource de tâche telle que *eMailDefault*.
      - $\{jocURL\} : URL à partir de laquelle le JOC Cockpit est accessible.
      - $\{jocURLReverseProxy\} : même fonctionnalité que *jocURL*, mais spécifie l'URL disponible à partir d'un Reverse Proxy

## Références

### Aide contextuelle

- [Approval Notification Settings](/approval-notification-settings)
- [Approval Request](/approval-request)
- [Approval Requests](/approval-requests)
- [Approver Profiles](/approval-profiles)

### Product Knowledge Base

- [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)
- [JS7 - eMailDefault Job Resource](https://kb.sos-berlin.com/display/JS7/JS7+-+eMailDefault+Job+Resource)

