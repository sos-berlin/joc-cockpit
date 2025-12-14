# Historique des Transferts de Fichiers

La vue *Historique des Transferts de Fichiers* résume l'historique d'exécution des Ordres pour les tâches de transfert de fichiers gérés par YADE.

Pour le journal créé à partir des tâches de transfert de fichiers, voir [Historique des Tâches](/history-tasks). Pour l'Historique des Ordres, voir [Historique des Ordres](/history-orders).

## Historique

### Historique des transferts

L'affichage est regroupé en un bloc pour l'opération de transfert et en blocs pour le transfert de fichiers individuels :

- **État** indique si un transfert a été un *succès* ou *échec*.
  - *Succès" indique que tous les fichiers du transfert ont été traités avec succès.
  - *Échec" indique qu'un ou plusieurs fichiers du transfert ont été traités avec des erreurs.
- **Nom du profil** est l'identifiant unique d'un profil de transfert de fichiers.
- **Opération** : *COPY*, *MOVE*, *REMOVE*, *GETLIST*.
- **Workflow** indique le Workflow exécuté par l'Ordre.
  - En cliquant sur le nom du Workflow, vous accédez à la vue [Workflows](/workflows).
  - En cliquant sur l'icône en forme de crayon, vous accédez à la vue [Configuration - Inventaire - Workflows](/configuration-inventory-workflows).
- **ID Ordre** est l'identifiant unique attribué à un Ordre.
- **Total** indique le nombre de fichiers inclus dans le transfert.

### Historique par fichier

Une opération de transfert de fichiers peut inclure n'importe quel nombre de fichiers. L'*Historique des transferts de fichiers* affiche l'état du transfert par fichier lorsque vous cliquez sur l'icône flèche vers le bas disponible à partir du transfert :

Les informations affichées sont regroupées dans les blocs suivants :

- **Source** indique la source du transfert.
- **Cible** indique la cible du transfert.
- **Saut** indique l'utilisation d'un hôte de saut entre la source et la cible. Un hôte *Jump* est utilisé si le transfert de fichiers ne peut pas être effectué directement entre la source et la cible, mais nécessite un hôte dans la zone démilitarisée pour les opérations entrantes et sortantes.

Les détails sont affichés pour les hôtes *Source*, *Cible* et *Jump* :

- **Hôte** indique le nom d'hôte ou l'adresse IP du serveur.
- **Compte** indique le compte utilisateur utilisé pour accéder au serveur.
- **Port** indique le port utilisé pour se connecter au serveur.
- **Protocole** indique le protocole de transfert de fichiers tel que FTP, FTPS, SFTP, CIFS, etc.

Pour *Source* et *Cible*, les détails suivants sont affichés :

- **Nom du fichier** indique le nom du fichier.
- **Chemin du fichier** indique le chemin du répertoire du fichier, y compris son nom.
- **Statut
  - **TRANSFERRED** indique que le fichier a été transféré avec succès lorsqu'il est utilisé avec les opérations *COPY* ou *MOVE*.
  - **DELETED** indique que le fichier a été supprimé lorsqu'il est utilisé avec l'opération *REMOVE*.
  - **SKIPPED** indique que le fichier a été exclu du transfert, par exemple lors de l'utilisation de l'opération *GETLIST*.
- **Taille** indique le nombre d'octets transférés.
- **Hash d'Intégrité** indique un hachage MD5 si les options correspondantes ont été utilisées pour le transfert.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
- [Historique des Ordres](/history-orders)
- [Historique des Tâches](/history-tasks)

### Product Knowledge Base

- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Task History](https://kb.sos-berlin.com/display/JS7/JS7+-+Task+History)
