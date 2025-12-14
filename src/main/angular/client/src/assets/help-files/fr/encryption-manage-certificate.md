# Gérer les Certificats de Cryptage

La page [JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption) offre un moyen sûr de traiter les secrets utilisés dans les tâches. Les utilisateurs peuvent chiffrer et déchiffrer des données sensibles telles que des mots de passe en utilisant des clés asymétriques.

Pour plus de détails, voir [Gérer les Clés de Chiffrement](/encryption-manage-keys).

La page *Gérer les Clefs de Cryptage* permet de spécifier les propriétés du certificat.

## Certificat

Les propriétés suivantes sont spécifiées pour un certificat :

- **Alias du certificat** est le nom unique que les utilisateurs attribuent à un certificat. Les utilisateurs sont libres de choisir le nom. Le certificat et ses propriétés seront stockés dans une Ressource de Tâche sous le nom indiqué.
- **Certificat** permet de copier/coller un certificat au format PEM. Un certificat peut ressembler à ceci :

<pre>
-----BEGIN CERTIFICATE-----
MIIB9TCCAZqgAwIBAgIJAIFT2KH9txb9MAoGCCqGSM49BAMCMFgxCzAJBgNVBAYT
AkRFMQ8wDQYDVQIDAZCZXJsaW4xDzANBgNVBAcMBkJlcmxpbjEMMAoGA1UECgwD
U09TMQswCQYDVQDAJVDEMMAoGA1UEAwwDSlM3MB4XDTI0MDYyNzA5MzU0MloX
DTI5MDYyNjA5MzU0MlowWDELMAkGA1UEBhMCREUxDzANBgNVBAgMBkJlcmxpbjEP
MA0GA1UEBwwGQmVybGluMQwwCgYDVQKDANTT1MxCzAJBgNVBAsMAklUMQwwCgYD
VQQDDANKUzcwVjAQBgcqhkjOPQIBBgUrgQACgNCAATBF6yXinah6K/x2TikPNaT
447gK2SxCH8vgO5NygZzUonzhaGOK5n1jktvhmxmrn5V4VSHMC0NzU6O87nUKpA
o1AwTjAdBgNVHQ4EFgQUcovwh3OMrSXjP02VHG5cj03xHxswHwYDVR0jBBgFoAU
covwh3OMrSXjP02VHG5cj03xHxswDAYDVR0TBAUwAwEB/zAKBggqhkjOPQDAgNJ
ADBGAiEAwjGLIhLfV0q/cOYVAnXSZ+jWp8Og/lG5YdvtLcj9CD0CIQCK8O4wURQj
SbNCv0bJswLadTFEcz8ZoYP7alXJzj9FQQ== 
-----END CERTIFICAT-----
</pre>

- **Chemin d'accès au fichier de la Clé Privée** spécifie l'emplacement de la clé privée et des Agents associés.
- **Dossier de la Ressource de Tâche** spécifie le dossier d'inventaire dans lequel la Ressource de Tâche contenant le certificat sera stockée. Une hiérarchie de dossiers peut être spécifiée à l'aide de barres obliques, comme dans /a/b/c. Les dossiers non existants seront créés.

## Opérations sur le certificat

Les opérations suivantes sont disponibles à partir des liens :

- **Afficher l'utilisation du Certificat par les Agents** affiche le *nom de l'Agent* et l'URL des Agents auxquels le certificat a été attribué. 
- **Attribuer le Certificat aux Agents** permet de sélectionner les Agents Autonomes et les Agents de groupe auxquels le certificat est attribué. Les utilisateurs doivent veiller à ce que l'Agent concerné détienne le fichier de clé privée à l'emplacement spécifié dans la propriété *Chemin d'accès au fichier de clé privée*. Les utilisateurs peuvent sélectionner les Agents qui connaissent la clé privée.
- **Test de Cryptage** permet d'effectuer un test de cryptage :
  - En cliquant sur le lien, vous ouvrez le champ de saisie *Texte clair* dans lequel vous pouvez ajouter une chaîne de caractères telle que *secret*.
  - À droite du champ de saisie, l'icône de cryptage est proposée. En cliquant sur l'icône, le *Résultat du cryptage* s'affiche avec le résultat correspondant.

## Références

### Aide contextuelle

- [Gérer les Clés de Chiffrement](/encryption-manage-keys)

### Product Knowledge Base

- [JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption)
  - [JS7 - Encryption - Management of Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Management+of+Encryption+Keys)
  - [JS7 - Encryption - Integration with Workflows - Jobs - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Workflows+-+Jobs+-+Orders)
  - [JS7 - Encryption - Integration with Shell CLI](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Shell+CLI)
  - [JS7 - Encryption - Integration with Secret Manager Products](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Secret+Manager+Products)
- [JS7 - How to create X.509 Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Encryption+Keys)
