# Profil - Gestion Clés de Signature

L'onglet *Profil - Gestion Clés de Signature* contient le certificat de signature utilisé pour le déploiement des Workflows et des Ressources de Tâche.

- Si JOC Cockpit est utilisé avec le niveau de sécurité *faible*, le certificat de signature est stocké avec le compte *root* et est utilisé pour les opérations de déploiement de n'importe quel compte utilisateur.
- Si JOC Cockpit est utilisé avec le niveau de sécurité *moyen*, le certificat de signature est stocké individuellement avec le compte d'utilisateur et est utilisé pour les opérations de déploiement du compte d'utilisateur correspondant.
- Si JOC Cockpit est utilisé avec un niveau de sécurité *élevé*, le certificat de signature est stocké en dehors de JOC Cockpit et l'onglet *Gestion des clés de signature* n'est pas disponible.

Pour plus d'informations, consultez le site [JS7 - Profiles - Signature Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+Signature+Key+Management).

<img src="profile-signature-key-management.png" alt="Signature Key Management" width="800" height="75" />

## Certificat de Signature

Le JS7 est livré avec un certificat de signature par défaut. Les utilisateurs doivent tenir compte de la période de validité du certificat. Les nouveaux certificats sont livrés avec les versions de la JS7 environ six mois avant l'expiration du certificat. Au lieu de mettre à jour la JS7, les utilisateurs peuvent télécharger un certificat plus récent disponible sur [JS7 - How to update the Digital Signing Certificate for deployment](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+update+the+Digital+Signing+Certificate+for+deployment).

Les utilisateurs peuvent créer leur propre certificat de signature :

- à partir d'une autorité de certification (AC) privée ou publique. L'utilisation d'une autorité de certification privée est expliquée à l'adresse [JS7 - How to create X.509 Signing Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Signing+Certificates).
- à partir de l'autorité de certification intégrée à JOC Cockpit.

Lorsque vous utilisez une autorité de certification privée ou publique, le certificat de l'autorité de certification racine ou le certificat de l'autorité de certification intermédiaire qui a été utilisé pour signer le certificat de signature doit être mis à la disposition des instances du Contrôleur et de l'Agent. Le certificat doit être disponible dans un fichier au format PEM situé dans le répertoire *./config/private/trusted-x509-keys* du Contrôleur et de l'Agent.

## Opérations sur le Certificat de Signature

Les opérations suivantes sont proposées :

- **Afficher** est disponible en cliquant sur l'icône à droite de la période de validité. Cela affichera la clé privée et le certificat de signature.
- **Mettre à jour** invoque une fenêtre contextuelle qui permet de coller une clé privée et un certificat de signature mis à jour.
- **Importer** invoque une fenêtre contextuelle qui propose de télécharger la clé privée et le certificat de signature.
- **Générer** invoque une fenêtre contextuelle qui permet de générer la clé privée et le certificat de signature à partir de l'autorité de certification intégrée.
  - Les utilisateurs doivent vérifier que l'onglet [Profil - Gestion Clés SSL](/profile-ssl-key-management) contient un certificat d'autorité de certification racine ou un certificat d'autorité de certification intermédiaire valide.
  - Lors de la génération des clés, les utilisateurs doivent sélectionner l'option *Use SSL CA* pour utiliser l'autorité de certification intégrée lors de la création et de la signature d'un nouveau certificat de signature.
- l'option **Supprimer** supprime la clé privée et le certificat de signature. Dans les niveaux de sécurité *faible* et *moyen*, cela empêchera le déploiement des Workflows et des Ressources de Tâche.

## Références

### Aide contextuelle

- [Profil](/profile)
- [Profil - Gestion Clés SSL](/profile-ssl-key-management)

### Product Knowledge Base

- [JS7 - How to create X.509 Signing Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Signing+Certificates)
- [JS7 - How to update the Digital Signing Certificate for deployment](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+update+the+Digital+Signing+Certificate+for+deployment)
- [JS7 - Profiles - Signature Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+Signature+Key+Management)
