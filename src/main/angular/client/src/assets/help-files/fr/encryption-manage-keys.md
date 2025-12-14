# Gérer les Clés de Chiffrement

Le site [JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption) offre un moyen sûr de gérer les secrets utilisés dans les Workflows. Les utilisateurs peuvent chiffrer et déchiffrer des données sensibles telles que des mots de passe en utilisant des clés asymétriques.

Le cryptage et le décryptage utilisent des clés privées et des certificats X.509 asymétriques. Cela inclut les rôles suivants :

- L'expéditeur : a accès au certificat ou à la clé publique du destinataire et crypte un secret basé sur la clé publique du destinataire qui est directement disponible ou qui peut être calculée à partir d'un certificat.
- Récepteur : a accès à la clé privée qui permet de déchiffrer le secret chiffré.

Pour la création de clés de chiffrement, voir [JS7 - How to create X.509 Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Encryption+Keys).

Pour la gestion des clés de chiffrement, voir [JS7 - Encryption - Management of Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Management+of+Encryption+Keys).

Le processus de cryptage fonctionne comme suit :

<img src="encryption-process.png" alt="Processus Cryptage" width="750" height="240" />

Le processus de décryptage fonctionne comme suit :

<img src="decryption-process.png" alt="Processus Decryptage" width="880" height="210" />

La page *Gérer les Clefs de Cryptage* est utilisée pour gérer les certificats et spécifier les propriétés du certificat.

## Liste des certificats

Les certificats de cryptage existants sont affichés dans une liste :

- **Action** permet de mettre à jour et de supprimer l'entrée du certificat.
- **Alias du certificat** est le nom unique que les utilisateurs attribuent à un certificat.
- **L'icône d'affichage** permet de cliquer sur l'icône pour afficher le certificat correspondant.
- **Chemin d'accès de la clé privée** spécifie l'emplacement de la clé privée avec les Agents associés.

## Opérations sur les certificats

Les boutons suivants sont disponibles en haut de l'écran :

- **Ajouter certificat** permet d'ajouter un certificat à partir d'un copier/coller. Pour plus d'informations, consultez [Gérer les Certificats de Cryptage](/encryption-manage-certificate).
- **Importer certificat** permet de télécharger un fichier de certificat.

À partir de la *Liste des certificats*, les opérations suivantes sont proposées avec le menu d'action à 3 points correspondant :

- **Mettre à jour le certificat** permet de modifier l'entrée du certificat. Pour plus de détails, consultez [Gérer les Certificats de Cryptage](/encryption-manage-certificate).
- **Supprimer le certificat** permet de supprimer l'entrée du certificat.

## Références

### Aide contextuelle

- [Gérer les Certificats de Cryptage](/encryption-manage-certificate)

### Product Knowledge Base

- [JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption)
  - [JS7 - Encryption - Management of Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Management+of+Encryption+Keys)
  - [JS7 - Encryption - Integration with Workflows - Jobs - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Workflows+-+Jobs+-+Orders)
  - [JS7 - Encryption - Integration with Shell CLI](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Shell+CLI)
  - [JS7 - Encryption - Integration with Secret Manager Products](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Secret+Manager+Products)
- [JS7 - How to create X.509 Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Encryption+Keys)
