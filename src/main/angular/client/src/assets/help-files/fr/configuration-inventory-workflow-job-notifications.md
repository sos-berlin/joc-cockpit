# Configuration - Inventaire - Workflow - Notifications de Tâche

La vue *Workflow* permet de concevoir des Workflow à partir d'une séquence d'instructions. Les utilisateurs peuvent glisser-déposer l'*instruction Job* depuis la *barre d'outils* vers une position dans le Workflow.

L'interface graphique propose un certain nombre d'onglets pour spécifier les détails de la tâche. Le cinquième onglet est destiné aux *notifications*.

## Notifications

### Notifications globales

Les notifications globales sont configurées à partir de [Notifications](/notifications) et sont appliquées à tous les Workflows et tâches spécifiés avec sa configuration.

Les notifications permettent d'utiliser différents canaux :

- Mise à disposition de la notification dans les vues [Moniteur - Notifications d'Ordre](/monitor-notifications-order) et [Moniteur - Notifications du Système](/monitor-notifications-system) 
- Envoi de notifications par courrier électronique.
- Exécution d'une commande Shell. Par exemple, les outils tiers de surveillance du système offrent souvent une interface de ligne de commande qui peut être paramétrée pour alimenter la surveillance du système à partir d'événements relatifs à l'exécution réussie ou non d'une tâche.

### Notifications relatives aux tâches

Les notifications spécifiques par tâche ont la priorité sur les notifications globales à partir des paramètres suivants :

- **Mail en cas de** spécifie un ou plusieurs événements pour lesquels un e-mail doit être envoyé
  - *ERROR* déclenche la notification en cas d'échec de la tâche.
  - *WARNING* déclenche la notification en cas de réussite d'une tâche indiquant un code de retour d'avertissement.
  - *SUCCESS* déclenche la notification en cas de réussite d'une tâche avec ou sans avertissement.
- **Mail To** spécifie la liste des destinataires du courrier électronique. Vous pouvez spécifier plusieurs destinataires en utilisant une virgule ou un point-virgule. Si aucun destinataire n'est spécifié, aucune notification ne sera envoyée par courrier électronique, ce qui annule le paramètre de notification globale.
- **Mail Cc** spécifie la liste des destinataires du courrier électronique qui recevront des copies carbone. Vous pouvez spécifier plusieurs destinataires en utilisant une virgule ou un point-virgule.
- **Mail Bcc** spécifie la liste des destinataires du courrier électronique qui recevront des copies cachées. Vous pouvez spécifier plusieurs destinataires en utilisant une virgule ou un point-virgule.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
  - [Configuration - Inventaire - Workflow - Options de Tâche](/configuration-inventory-workflows-job-options)
  - [Configuration - Inventaire - Workflow - Propriétés de Tâche](/configuration-inventory-workflows-job-properties)
  - [Configuration - Inventaire - Workflow - Propriétés du Nœud de Tâche](/configuration-inventory-workflows-job-node-properties)
  - [Configuration - Inventaire - Workflow - Tags Tâche](/configuration-inventory-workflows-job-tags)
- [Moniteur - Notifications d'Ordre](/monitor-notifications-order)
- [Moniteur - Notifications du Système](/monitor-notifications-system)
- [Notifications](/notifications)

### Product Knowledge Base

- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
