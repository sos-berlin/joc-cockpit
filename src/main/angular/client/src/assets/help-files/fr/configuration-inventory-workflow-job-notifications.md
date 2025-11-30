# Configuration - Inventaire - Workflow - Notifications de travaux

Le panneau *Workflow* permet de concevoir des Workflow à partir d'une séquence d'instructions. Les utilisateurs peuvent glisser-déposer les *instructions de travail* depuis la *barre d'outils* vers une position dans le Workflow.

L'interface graphique propose un certain nombre d'onglets pour spécifier les détails du travail. Le cinquième onglet est destiné aux *notifications*.

## Notifications

### Notifications globales

Les notifications globales sont configurées à partir de [Notifications](/notifications) et sont appliquées à tous les Workflows et Jobs spécifiés avec sa configuration.

Les notifications permettent d'utiliser différents canaux :

- Mise à disposition de la notification dans les vues [Monitor - Order Notifications](/monitor-notifications-order) et [Monitor - System Notifications](/monitor-notifications-system) 
- Envoi de notifications par courrier électronique.
- Exécution d'une commande Shell. Par exemple, les outils tiers de surveillance du système offrent souvent une interface de ligne de commande qui peut être paramétrée pour alimenter la surveillance du système à partir d'événements relatifs à l'exécution réussie ou non d'un travail.

### Notifications relatives aux tâches

Les notifications spécifiques par tâche ont la priorité sur les notifications globales à partir des paramètres suivants :

- **Mail on** spécifie un ou plusieurs événements pour lesquels un e-mail doit être envoyé
  - *ERROR* déclenche la notification en cas d'échec du travail.
  - *WARNING* déclenche la notification en cas de réussite d'un travail indiquant un code de retour d'avertissement.
  - *SUCCESS* déclenche la notification en cas de réussite d'un travail avec ou sans avertissement.
- **Mail To** spécifie la liste des destinataires du courrier électronique. Vous pouvez spécifier plusieurs destinataires en utilisant une virgule ou un point-virgule. Si aucun destinataire n'est spécifié, aucune notification ne sera envoyée par courrier électronique, ce qui annule le paramètre de notification globale.
- **Cc** spécifie la liste des destinataires du courrier électronique qui recevront des copies carbone. Vous pouvez spécifier plusieurs destinataires en utilisant une virgule ou un point-virgule.
- **Mail Cci** spécifie la liste des destinataires du courrier électronique qui recevront des copies aveugles. Vous pouvez spécifier plusieurs destinataires en utilisant une virgule ou un point-virgule.

## Références

### Aide contextuelle

- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  - [Configuration - Inventory - Workflows - Job Options](/configuration-inventory-workflows-job-options)
  - [Configuration - Inventory - Workflows - Job Properties](/configuration-inventory-workflows-job-properties)
  - [Configuration - Inventory - Workflows - Job Node Properties](/configuration-inventory-workflows-job-node-properties)
  - [Configuration - Inventory - Workflows - Job Tags](/configuration-inventory-workflows-job-tags)
- [Monitor - Order Notifications](/monitor-notifications-order)
- [Monitor - System Notifications](/monitor-notifications-system)
- [Notifications](/notifications)

### Product Knowledge Base

- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)

