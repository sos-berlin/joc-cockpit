# Configuration - Inventaire - Workflow - Tags Tâches

La vue *Workflow* permet de concevoir des Workflows à partir d'une séquence d'instructions. Les utilisateurs peuvent glisser-déposer l'*instruction Job* depuis la *barre d'outils* vers une position dans le Workflow.

L'interface graphique propose un certain nombre d'onglets pour spécifier les détails de la tâche. Le troisième onglet est proposé pour les *Tags Tâche*.

## Tags

Il est possible d'ajouter un nombre quelconque de Tags à une tâche. Ils sont affichés dans la vue [Workflows](/workflows) et sont optionnellement inclus dans les notifications. Pour plus de détails, voir [JS7 - Tagging Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging+-+Jobs).

- **Tags** permet d'ajouter ou de supprimer des Tags. Elles peuvent être sélectionnées dans la liste des Tags existantes. La saisie d'un nom d'un Tag.

## Groupes de Tags

Les groupes de Tags peuvent être utilisés pour organiser les Tags qui doivent partager un groupe commun. Par exemple, une tâche doit être assigné à l'une des priorités de ticket P1, P2, P3, P4 en fonction de la criticité de la tâche. Les utilisateurs peuvent saisir le groupe de Tags et le tag en les séparant par deux points, comme dans *TicketPriority:P1*, *TicketPriority:P2*, etc. La priorité de ticket d'une tâche devient disponible lorsque des notifications sont créées en cas d'échec et peut être utilisée pour alimenter un système de tickets.

- **Tag-Group:Tag** permet d'ajouter ou de supprimer le Tag correspondant dans le groupe de Tags spécifié. Le groupe de Tags sera créé s'il n'existe pas.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
  - [Configuration - Inventaire - Workflow - Options de Tâche](/configuration-inventory-workflows-job-options)
  - [Configuration - Inventaire - Workflow - Propriétés de Tâche](/configuration-inventory-workflows-job-properties)
  - [Configuration - Inventaire - Workflow - Propriétés du Nœud de Tâche](/configuration-inventory-workflows-job-node-properties)
  - [Configuration - Inventaire - Workflow - Notifications de Tâche](/configuration-inventory-workflows-job-notifications)

### Product Knowledge Base

- [JS7 - Tagging](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging)
  - [JS7 - Tagging Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging+-+Jobs)
  - [JS7 - Tagging Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging+-+Orders)
  - [JS7 - Tagging Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging+-+Workflows)
