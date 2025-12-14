# Profil - Gestion Clés SSL

L'onglet *Profil - Gestion Clés SSL* offre l'autorité de certification intégrée qui permet de créer des certificats d'authentification serveur et des certificats d'authentification client pour les connexions TLS/SSL aux produits JS7.

Pour plus de détails, voir [JS7 - Profiles - SSL Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+SSL+Key+Management).

<img src="profile-ssl-key-management.png" alt="SSL Key Management" width="800" height="75" />

## Certificat de l'autorité de certification SSL

Le JS7 est livré avec un certificat d'autorité de certification SSL par défaut. Les utilisateurs doivent tenir compte de la période de validité du certificat. Les nouveaux certificats sont livrés avec les versions de JS7 environ six mois avant l'expiration du certificat. Au lieu de mettre à jour JS7, les utilisateurs peuvent télécharger un certificat plus récent.

Les utilisateurs peuvent créer leur propre certificat d'autorité de certification SSL :

- à partir d'une autorité de certification (AC) privée ou d'une AC publique. L'utilisation d'une autorité de certification privée est expliquée à l'adresse [JS7 - How to create X.509 SSL TLS Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+SSL+TLS+Certificates).
- à partir de l'autorité de certification SSL intégrée qui est livrée avec JOC Cockpit.

## Opérations sur le certificat de l'autorité de certification SSL

Les opérations suivantes sont proposées :

- **Afficher** est disponible en cliquant sur l'icône à droite de la période de validité. La clé privée et le certificat de l'autorité de certification SSL s'affichent.
- **Mettre à jour** invoque une fenêtre contextuelle qui permet de coller une clé privée et un certificat d'autorité de certification SSL mis à jour.
- **Importer** invoque une fenêtre contextuelle qui propose de télécharger la clé privée et le certificat de l'autorité de certification SSL.
- **Générer** invoque une fenêtre contextuelle qui permet de générer la clé privée et le certificat d'autorité de certification SSL auto-émis.

## Références

### Aide contextuelle

- [Profil](/profile)
- [Profil - Gestion Clés SSL](/profile-ssl-key-management)

### Product Knowledge Base

- [JS7 - Certificate Authority](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Authority)
  - [JS7 - Certificate Authority - Manage Certificates with JOC Cockpit](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Authority+-+Manage+Certificates+with+JOC+Cockpit)
  - [JS7 - Certificate Authority - Rollout Certificates for HTTPS Connections](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Authority+-+Rollout+Certificates+for+HTTPS+Connections)
- [JS7 - Comment créer des certificats X.509 SSL TLS](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+SSL+TLS+Certificates)
- [JS7 - Profiles - SSL Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+SSL+Key+Management)
