# Profil

Le *Profil* contient les paramètres pertinents pour l'interaction d'un utilisateur avec JOC Cockpit.

Un *Profil par défaut* est disponible, généralement à partir du compte *root* utilisé

- pour remplir les *Profils d'utilisateur* des comptes d'utilisateur lors de la première connexion,
- pour fournir des paramètres pertinents pour tous les comptes d'utilisateurs si JOC Cockpit est utilisé à un niveau de sécurité *faible*.

Les utilisateurs peuvent changer le *Profil par défaut* pour un autre compte à partir de la page [Settings - JOC Cockpit](/settings-joc).

Les utilisateurs doivent savoir que les profils inactifs sont susceptibles d'être purgés par le service [Cleanup Service](/service-cleanup).

Le *Profil de l'utilisateur* permet de gérer les préférences et les paramètres applicables à l'utilisateur actuel.

Pour plus de détails, voir [JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles).

## Changer le mot de passe

En cliquant sur le lien correspondant, les utilisateurs peuvent modifier leur mot de passe si le [Identity Services](/identity-services) actif comprend un service de type *JOC* qui a été utilisé pour le login actuel.

- **Ancien mot de passe** s'attend à ce que le mot de passe actuellement utilisé soit spécifié.
- **Nouveau mot de passe** s'attend à ce que le nouveau mot de passe soit spécifié.
    - Une longueur minimale de mot de passe est requise, comme configuré à l'adresse [Settings - Identity Service](/settings-identity-service).
    - L'*ancien mot de passe* et le *nouveau mot de passe* doivent être différents.

## Sections du profil

Les paramètres des *profils d'utilisateur* sont disponibles dans les sections suivantes :

- [Profile - Preferences](/profile-preferences)
- [Profile - Permissions](/profile-permissions)
- [Profile - Signature Key Management](/profile-signature-key-management)
- [Profile - SSL Key Management](/profile-ssl-key-management)
- [Profile - Git Management](/profile-git-management)
- [Profile - Favorite Management](/profile-favorite-management)

## Références

### Aide contextuelle

- [Cleanup Service](/service-cleanup)
- [Identity Services](/identity-services)
- [Settings - JOC Cockpit](/settings-joc)
- [Settings - Identity Service](/settings-identity-service)

### Product Knowledge Base

- [JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles)
