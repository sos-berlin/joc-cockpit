# Service d'Identité - Configuration du Compte

Les Services d'Identité régissent l'accès au JOC Cockpit par l'authentification et l'autorisation, voir [Services d'Identité](/identity-services).

Pour un certain nombre de Services d'Identité, les opérations d'ajout, de mise à jour et de suppression de comptes sont disponibles, par exemple pour le site [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service).

## Configuration du compte

Les propriétés suivantes sont disponibles pour un compte :

- **Compte** spécifie le compte utilisé pour se connecter.
- **Mot de passe** est disponible pour le type de Service d'Identité *JOC*. Le *mot de passe* sera haché avant d'être stocké dans la base de données. Lors de la connexion, une opération de hachage similaire est effectuée pour comparer les mots de passe. 
  - Un *mot de passe* individuel peut être spécifié. S'il est laissé vide, le *mot_de_passe initial* spécifié sur la page [Réglages - Service d'Identité](/settings-identity-service) sera utilisé. Le *mot de passe* doit correspondre à l'exigence de *longueur_de_mot_de_passe_minimum* de la même page de paramètres.
  - Quelle que soit la source utilisée pour le *mot de passe*, l'utilisateur doit modifier le *mot de passe* du compte lors de sa prochaine connexion.
- la propriété **Confirmer le mot de passe** est utilisée pour répéter un *mot de passe* spécifié individuellement. Si la propriété *Mot de passe* est vide, la propriété *Confirmation du mot de passe* doit l'être également.
- **Roles** spécifie la liste des [Service d'Identité - Rôles](/identity-service-roles) auxquels le compte est attribué.
- **Forcer le changement de mot de passe** indique si le compte d'utilisateur doit changer son *mot de passe* lors de la prochaine connexion. Le changement de mot de passe est imposé pour empêcher l'utilisation continue du *mot de passe* spécifié individuellement et du *mot de passe* initial.
- Les propriétés disponibles pour les comptes existants sont les suivantes :
  - **Bloqué** spécifie que le compte doit être ajouté à [Service d'Identité - Liste de Blocage](/identity-service-blocklist) et que l'accès lui sera refusé.
  - **Désactivé** indique que le compte est inactif et que l'accès lui est refusé.

## Références

### Aide contextuelle

- [Réglages - Service d'Identité](/settings-identity-service)
- [Services d'Identité](/identity-services)
- [Service d'Identité - Liste de Blocage](/identity-service-blocklist)
- [Service d'Identité - Rôles](/identity-service-roles) 

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)

