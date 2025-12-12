# Configuration - Inventaire - Workflow - Tags Tâches

La vue *Workflow* permet de concevoir des Workflows à partir d'une séquence d'instructions. Les utilisateurs peuvent glisser-déposer les *instructions de tâche* depuis la *barre d'outils* vers une position dans le Workflow.

L'interface graphique propose un certain nombre d'onglets pour spécifier les détails du tâche. Le troisième onglet est proposé pour les *tags de tâche*.

## Tags

Il est possible d'ajouter un nombre quelconque de tags à un tâche. Ils sont affichés dans la vue [Workflows](/workflows) et sont optionnellement inclus dans les notifications. Pour plus de détails, voir [JS7 - Tagging Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging+-+Jobs).

- **Tags** permet d'ajouter ou de supprimer des tags. Elles peuvent être sélectionnées dans la liste des tags existantes. La saisie d'un nom d'un tag.

## Groupes de tags

Les groupes de tags peuvent être utilisés pour organiser les tags qui doivent partager un groupe commun. Par exemple, un tâche doit être assigné à l'une des priorités de ticket P1, P2, P3, P4 en fonction de la criticité du tâche. Les utilisateurs peuvent saisir le groupe de tags et le tag en les séparant par deux points, comme dans *TicketPriority:P1*, *TicketPriority:P2*, etc. La priorité de ticket d'un tâche devient disponible lorsque des notifications sont créées en cas d'échec et peut être utilisée pour alimenter un système de tickets.

- **Tag-Group:Tag** permet d'ajouter ou de supprimer le tag correspondant dans le groupe de tags spécifié. Le groupe de tags sera créé s'il n'existe pas.

## Références

### Aide contextuelle

- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  - [Configuration - Inventory - Workflows - Job Options](/configuration-inventory-workflows-tâche-options)
  - [Configuration - Inventory - Workflows - Job Properties](/configuration-inventory-workflows-tâche-properties)
  - [Configuration - Inventory - Workflows - Job Node Properties](/configuration-inventory-workflows-tâche-node-properties)
  - [Configuration - Inventory - Workflows - Job Notifications](/configuration-inventory-workflows-tâche-notifications)
- [Tags](/tags)

### Product Knowledge Base

- [JS7 - Tagging](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging)
  - [JS7 - Tagging Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging+-+Jobs)
  - [JS7 - Tagging Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging+-+Orders)
  - [JS7 - Tagging Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging+-+Workflows)

