# Service d'Identité - Échecs de Connexion

Les Services d'Identité règlent l'accès au JOC Cockpit par l'authentification et l'autorisation, voir [Services d'Identité](/identity-services).

Les comptes d'utilisateurs qui ne parviennent pas à se connecter sont enregistrés dans la sous-vue *Échecs de Connexion*.

- La liste des connexions échouées comprend des entrées pour tous les Services d'Identité qui ont été déclenchés sans succès. Si plusieurs Services d'Identité optionnels sont utilisés, la connexion est considérée comme réussie si l'un des Services d'Identité a été déclenché avec succès. Dans ce cas, aucun échec de connexion n'est signalé.
- Le JOC Cockpit met en œuvre des délais pour les échecs répétés de connexion afin d'empêcher l'analyse des temps de réponse et de prévenir les attaques par force brute.
- Notez qu'un certain nombre de fournisseurs d'identité, par exemple LDAP utilisé pour l'accès à Active Directory, peuvent ne pas accepter des tentatives de connexion échouées à plusieurs reprises et bloquer le compte d'utilisateur concerné.

Les utilisateurs doivent savoir que les données historiques relatives aux échecs de connexion sont susceptibles d'être supprimées par le [Service d'Assainissement](/service-cleanup).

## Opérations sur les échecs de connexion

Les utilisateurs peuvent effectuer les opérations suivantes sur les connexions échouées :

- **Ajouter à la liste de blocage** ajoute le compte concerné à la liste [Service d'Identité - Liste de Blocage](/identity-service-blocklist) qui interdit toute connexion ultérieure. Cette opération est disponible si un compte est indiqué. Pour les connexions effectuées sans compte, l'espace réservé *\*none* est indiqué.

## Références

### Aide contextuelle

- [Services d'Identité](/identity-services)
- [Service d'Identité - Liste de Blocage](/identity-service-blocklist)
- [Service d'Assainissement](/service-cleanup)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
