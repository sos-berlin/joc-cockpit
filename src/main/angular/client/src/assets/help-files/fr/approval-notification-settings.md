# Paramètres de Notification d'Autorisation

Le site [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) est proposé pour les situations dans lesquelles les utilisateurs ont l'intention d'effectuer des opérations telles que l'ajout ou l'annulation d'Ordres qui nécessitent l'autorisation d'un deuxième utilisateur. Il peut s'agir de toute opération modifiant un objet de scheduling.

Le processus d'autorisation implique les rôles suivants :

- Un *Demandeur* demande à effectuer une intervention qui nécessite une autorisation.
- Un *Approbateur* confirme ou refuse la demande d'autorisation.

La fonctionnalité de base du processus d'autorisation comprend :

- mettre en œuvre le principe des 4 yeux : un *Approbateur* doit confirmer l'intervention d'un *Demandeur* avant que l'intervention puisse être exécutée dans le cadre du compte, des rôles et des autorisations du *Demandeur*. 
- pour garder une trace des demandes d'autorisation en attente.
- pour offrir une solution de repli à un certain nombre d'*Approbateurs*.

## Paramètres de Notification d'Autorisation

Les paramètres de notification comprennent les propriétés permettant d'envoyer un courrier aux *Approbateurs* en cas d'arrivée de [Demandes d'Autorisation](/approval-requests):

- **Ressource de Tâche** contient les paramètres de connexion au serveur de messagerie. Pour plus de détails, voir [JS7 - eMailDefault Job Resource](https://kb.sos-berlin.com/display/JS7/JS7+-+eMailDefault+Job+Resource).
- **Content Type**, **Charset**, **Encoding** sont communs à tout système envoyant du courrier.
- **Mail de Demande d'Autorisation**
  - **Cc**, **Bcc** indiquent éventuellement les destinataires des copies et des copies carbone de la notification.
  - **L'objet**, **le corps** du courrier peuvent inclure des caractères de remplacement qui seront substitués lors de l'envoi du courrier. Les caractères génériques sont spécifiés en utilisant le format $\{placeholder\}.
    - Les caractères génériques suivants sont disponibles :
      - $\{RequestStatusDate\} : Date de l'état de la demande
      - $\{ApprovalStatusDate\} : Date de l'état de l'autorisation
      - $\{Title\} : Titre de la demande
      - $\{Requestor\} : Compte du *Demandeur*
      - $\{RequestStatus} : État de la demande, l'un de REQUESTED, EXECUTED, WITHDRAWN
      - $\{Approver\} : Compte de l'*Approbateur*
      - $\{ApprovalStatus\} : État de l'autorisation, l'un de APPROVED, REJECTED
      - $\{RequestURI\} : URI de la demande
      - $\{RequestBody\} : Corps de la demande contenant les détails de la demande d'API REST
      - $\{Category\} : Catégorie
      - $\{Reason\} : Raison
    - En outre, les caractères génériques suivants peuvent être utilisés s'ils sont spécifiés à partir d'une Ressource de Tâche telle que *eMailDefault*.
      - $\{jocURL\} : URL à partir de laquelle le JOC Cockpit est accessible.
      - $\{jocURLReverseProxy\} : même fonctionnalité que *jocURL*, mais spécifie l'URL disponible à partir d'un Reverse Proxy

## Références

### Aide contextuelle

- [Demande d'Autorisation](/approval-request)
- [Demandes d'Autorisation](/approval-requests)
- [Paramètres de Notification d'Autorisation](/approval-notification-settings)
- [Profils Approbateur](/approval-profiles)

### Product Knowledge Base

- [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)
- [JS7 - eMailDefault Job Resource](https://kb.sos-berlin.com/display/JS7/JS7+-+eMailDefault+Job+Resource)
