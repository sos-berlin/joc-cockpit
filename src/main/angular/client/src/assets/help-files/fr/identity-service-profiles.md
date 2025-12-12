# Profils de services d'identité

Les services d'identité régissent l'accès au JOC Cockpit par l'authentification et l'autorisation, voir [Identity Services](/identity-services).

Pour les utilisateurs qui se connectent avec un service d'identité, un *profil* est créé lors de la première connexion pour le service d'identité concerné.

- Si plusieurs services d'identité sont disponibles pour la connexion, l'utilisateur disposera d'un *profil* pour chaque service d'identité auquel il s'est connecté avec succès.
- Le *Profil* est créé à partir du compte spécifié avec le paramètre *default_profile_account* dans la page [Settings - JOC Cockpit](/settings-joc). Par défaut, le *Profil* du compte *root* sera utilisé.
- les *Profils* seront purgés s'ils ne sont pas utilisés pendant une période prolongée. La page [Settings - Cleanup Service](/settings-cleanup) précise la période maximale pendant laquelle un *Profil* restera en place si aucune connexion n'est effectuée à partir du compte d'utilisateur concerné.

## Opérations sur les profils

La vue secondaire affiche la liste des *Profils* actifs et la date de la dernière connexion. Les opérations suivantes sont disponibles pour les *Profils* individuellement :

- En cliquant sur le *Profil*, vous accédez à la sous-vue [Identity Service - Roles](/identity-service-roles) pour afficher les rôles utilisés par le *Profil* en question.
- Le menu d'action d'un *Profil* propose les opérations suivantes :
  - **Supprimer les Préférences du profil** rétablit les valeurs par défaut de [Profile - Preferences](/profile-preferences). Les autres paramètres du *Profil* tels que *Gestion Git* et *Gestion des favoris* restent en place. L'opération peut être utilisée pour imposer l'application du *Profil* du compte par défaut.
  - **Supprimer le profil** efface le *Profil* du compte de l'utilisateur. Lors de la prochaine connexion du compte concerné, un nouveau *Profil* sera créé.

Les utilisateurs peuvent sélectionner un ou plusieurs *profils* pour effectuer les opérations ci-dessus en masse pour les *profils* sélectionnés.

## Références

### Aide contextuelle

- [Identity Service - Configuration](/identity-service-configuration)
- [Identity Service - Accounts](/identity-service-accounts) 
- [Identity Service - Roles](/identity-service-roles) 
- [Identity Services](/identity-services)
- [Profile - Preferences](/profile-preferences) 
- [Settings - Cleanup Service](/settings-cleanup)
- [Settings - JOC Cockpit](/settings-joc)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)

