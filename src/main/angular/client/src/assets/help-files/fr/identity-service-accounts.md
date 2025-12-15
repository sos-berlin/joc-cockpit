# Service d'Identité - Comptes

Les Services d'Identité régissent l'accès au JOC Cockpit par l'authentification et l'autorisation, voir [Services d'Identité](/identity-services).

Les comptes utilisateurs seront gérés et stockés dans JOC Cockpit pour les types de Services d'Identité suivants :

| Type de Service d'Identité | Documentation |
| ----- | ----- |
*JOC* | [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service) | *KEYCLOAK-JOC* | 
| *KEYCLOAK-JOC* | [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service) | | *LDAP-JOC* | 
*LDAP-JOC* | [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service) | *OIDC-JOC* | 
*OIDC-JOC* | [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service) | *CERTIFICATE* | 
| *CERTIFICAT* | [JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service) | *FIDO* | 
| *FIDO* | [JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service) | *FIDO* | 

Pour les types de Services d'Identité suivants, les comptes utilisateurs ne sont pas gérés par JOC Cockpit mais par le fournisseur de Services d'Identité :

| Type de Service d'Identité | Documentation |
| ----- | ----- |
*KEYCLOAK* | [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service) | *LDAP* | 
| *LDAP* | [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service) | *OIDC* | 
| *OIDC* | [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service) | *OIDC* | 

## Liste des comptes

Pour chaque compte, les propriétés suivantes sont affichées :

- **Compte** indique le compte tel qu'il a été spécifié lors de la connexion.
- **Rôles** indique la liste des [Service d'Identité - Rôles](/identity-service-roles) auxquels le compte est associé.
- **Forcer le changement de mot de passe** indique si le compte utilisateur doit changer son mot de passe lors de la prochaine connexion.
- **Bloqué** indique que le compte a été ajouté à un [Service d'Identité - Liste de Blocage](/identity-service-blocklist) et que l'accès lui est refusé.
- **Désactivé** indique que le compte est inactif et que l'accès lui est refusé.

## Opérations sur les comptes

Les utilisateurs peuvent ajouter un compte en utilisant le bouton correspondant dans le coin supérieur droit de la vue.

### Opérations sur les comptes individuels

Les opérations suivantes sont disponibles dans le menu d'action à 3 points de chaque compte :

- **Modifier** permet de spécifier l'adresse [Service d'Identité - Configuration du Compte](/identity-service-account-configuration).
- **Dupliquer** permet de copier le compte sélectionné dans un nouveau compte. Les utilisateurs doivent spécifier le nom du nouveau compte.
- **Réinitialiser le mot de passe** supprime le mot de passe du compte et attribue le mot de passe spécifié avec le paramètre *initial_password* dans la page [Réglages - Service d'Identité](/settings-identity-service). Le compte utilisateur concerné doit se connecter avec le *mot_de_passe initial* et doit modifier son mot de passe lors de la prochaine connexion.
- **Forcer le changement de mot de passe** oblige le compte à changer son mot de passe lors de la prochaine connexion.
- **Ajouter compte à la Liste de Blocage** interdit l'accès au compte pendant la durée de l'ajout du compte à la Liste de Blocage [Service d'Identité - Liste de Blocage](/identity-service-blocklist).
- **Désactiver** désactive le compte et interdit l'accès à partir de ce compte.
- **Supprimer** supprime le compte du Service d'Identité.
- **Visualiser les Permissions** affiche la liste des autorisations résultant de la fusion des rôles du compte donné.

### Opérations en masse sur les comptes

Les utilisateurs peuvent effectuer les opérations de masse suivantes à partir des boutons situés en haut de l'écran :

- **Exporter** ajoute les comptes sélectionnés à un fichier d'exportation au format JSON qui peut être utilisé pour importer des comptes vers un autre Service d'Identité dans la même instance ou dans une instance différente de JOC Cockpit.
- **Copier** copie les comptes sélectionnés dans un presse-papiers interne à partir duquel ils peuvent être collés dans un autre Service d'Identité de la même instance du JOC Cockpit.

Les utilisateurs peuvent sélectionner un ou plusieurs *comptes* pour effectuer les opérations ci-dessus en masse pour les *comptes* sélectionnés.

- **Réinitialiser le mot de passe** supprime le mot de passe des comptes sélectionnés et attribue le mot de passe spécifié avec le paramètre *initial_password* dans la page [Réglages - Service d'Identité](/settings-identity-service). Les comptes utilisateurs concernés doivent se connecter avec le *mot_de_passe initial* et doivent changer leur mot de passe lors de la prochaine connexion.
- **Forcer le changement de mot de passe** oblige les comptes sélectionnés à changer leur mot de passe lors de la prochaine connexion.
- **Désactiver** désactive les comptes sélectionnés et refuse l'accès aux comptes donnés.
- **Activer** active les comptes sélectionnés et désactivés.
- **Supprimer** les comptes sélectionnés du Service d'Identité.

## Références

### Aide contextuelle

- [Réglages - JOC Cockpit](/settings-joc)
- [Réglages - Service d'Identité](/settings-identity-service)
- [Services d'Identité](/identity-services)
- [Service d'Identité - Configuration](/identity-service-configuration)
- [Service d'Identité - Configuration du Compte](/identity-service-account-configuration)
- [Service d'Identité - Liste de Blocage](/identity-service-blocklist)
- [Service d'Identité - Rôles](/identity-service-roles) 

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
