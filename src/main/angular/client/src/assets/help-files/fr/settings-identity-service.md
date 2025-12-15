# Réglages - Service d'Identité

Les paramètres suivants sont appliqués à tout [Services d'Identité](/identity-services). Les modifications prennent effet immédiatement.

La page *Réglages* est accessible à partir de l'icône ![wheel icon](assets/images/wheel.png) dans la barre de menu.

## Paramètres du Service d'Identité

### Paramètre : *idle\_session\_timeout*, Défaut : *30*m

Spécifie la durée maximale en minutes d'une séance inactive dans JOC Cockpit.

- Si les utilisateurs sont inactifs pendant le nombre de minutes indiqué, la séance utilisateur expire et est terminée. Les utilisateurs peuvent indiquer leurs informations d'identification et se connecter pour créer une nouvelle séance utilisateur.
- Si la durée de vie d'un jeton d'accès fourni par un Service d'Identité externe est différente de la durée maximale d'inactivité, le JOC Cockpit tente de renouveler le jeton d'accès auprès du Service d'Identité. Le renouvellement d'un jeton d'accès ne nécessite pas que l'utilisateur saisisse à nouveau ses identifiants de connexion.
- Les Services d'Identité peuvent limiter la durée de vie des jetons d'accès (time to live) et limiter le renouvellement des jetons d'accès (maximum time to live). Si un jeton d'accès ne peut pas être renouvelé, la séance de l'utilisateur est terminée et l'utilisateur doit se connecter.

### Paramètre : *initial\_password*, Défaut : *initial*

Spécifie le mot de passe initial utilisé lors de la création de nouveaux comptes ou de la réinitialisation des mots de passe sur le site [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service).

- Si un administrateur ajoute des comptes d'utilisateurs avec le JOC Cockpit et ne spécifie pas de mot de passe, le mot de passe initial sera utilisé. En règle générale, le JOC Cockpit n'autorise pas l'utilisation de mots de passe vides, mais les remplit à partir du *mot de passe initial*. Les administrateurs peuvent appliquer le mot de passe initial et ils peuvent spécifier un mot de passe individuel pour un compte donné.
- Lors de la réinitialisation du mot de passe d'un compte d'utilisateur, le mot de passe existant sera remplacé par le *mot de passe initial*.
- Indépendamment du fait que le *mot de passe initial ou un mot de passe individuel soit attribué à un compte d'utilisateur, le mot de passe doit être modifié par l'utilisateur lors de sa première connexion. Cela garantit que les utilisateurs ne peuvent pas utiliser le mot de passe initial, sauf pour la première connexion.

### Paramètre : *minimum\_password\_length*, Défaut : *1*

Spécifie la longueur minimale des mots de passe dans le Service d'Identité JOC.

Pour tous les mots de passe spécifiés - y compris le *mot de passe initial* - la longueur minimale est indiquée.
Notez que le nombre de caractères et le caractère arbitraire de la sélection des caractères sont des facteurs clés pour des mots de passe sûrs. La complexité du mot de passe, qui exige par exemple l'utilisation de chiffres et de caractères spéciaux, ne renforce pas sensiblement la sécurité du mot de passe, sauf dans le cas de mots de passe courts.

## Références

### Aide contextuelle

- [Réglages](/settings)
- [Services d'Identité](/identity-services)

### Product Knowledge Base

- [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
- [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
