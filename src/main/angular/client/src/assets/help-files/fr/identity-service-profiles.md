# Service d'Identité - Profils

Les Services d'Identité régissent l'accès au JOC Cockpit par l'authentification et l'autorisation, voir [Services d'Identité](/identity-services).

Pour les utilisateurs qui se connectent avec un Service d'Identité, un *profil* est créé lors de la première connexion pour le Service d'Identité concerné.

- Si plusieurs Services d'Identité sont disponibles pour la connexion, l'utilisateur disposera d'un *profil* pour chaque Service d'Identité auquel il s'est connecté avec succès.
- Le *Profil* est créé à partir du compte spécifié avec le paramètre *default_profile_account* dans la page [Réglages - JOC Cockpit](/settings-joc). Par défaut, le *Profil* du compte *root* sera utilisé.
- les *Profils* seront purgés s'ils ne sont pas utilisés pendant une période prolongée. La page [Réglages - Service d'Assainissement](/settings-cleanup) précise la période maximale pendant laquelle un *Profil* restera en place si aucune connexion n'est effectuée à partir du compte d'utilisateur concerné.

## Opérations sur les profils

La vue Secondaire affiche la liste des *Profils* actifs et la date de la dernière connexion. Les opérations suivantes sont disponibles pour les *Profils* individuellement :

- En cliquant sur le *Profil*, vous accédez à la sous-vue [Service d'Identité - Rôles](/identity-service-roles) pour afficher les rôles utilisés par le *Profil* en question.
- Le menu d'action d'un *Profil* propose les opérations suivantes :
  - **Supprimer les Préférences du profil** rétablit les valeurs par défaut de [Profil - Préférences](/profile-preferences). Les autres paramètres du *Profil* tels que *Gestion Git* et *Gestion des favoris* restent en place. L'opération peut être utilisée pour imposer l'application du *Profil* du compte par défaut.
  - **Supprimer le profil** efface le *Profil* du compte de l'utilisateur. Lors de la prochaine connexion du compte concerné, un nouveau *Profil* sera créé.

Les utilisateurs peuvent sélectionner un ou plusieurs *profils* pour effectuer les opérations ci-dessus en masse pour les *profils* sélectionnés.

## Références

### Aide contextuelle

- [Profil - Préférences](/profile-preferences) 
- [Réglages - JOC Cockpit](/settings-joc)
- [Réglages - Service d'Assainissement](/settings-cleanup)
- [Services d'Identité](/identity-services)
- [Service d'Identité - Comptes](/identity-service-accounts)
- [Service d'Identité - Configuration](/identity-service-configuration)
- [Service d'Identité - Rôles](/identity-service-roles)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
