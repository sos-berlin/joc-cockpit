# Configuration - Inventaire - Workflow - Propriétés du Nœud de Tâche

La vue *Workflow* permet de concevoir des Workflow à partir d'une séquence d'instructions. Les utilisateurs peuvent glisser-déposer la *instruction Job* depuis la *barre d'outils* vers une position dans le Workflow.

L'interface graphique propose un certain nombre d'onglets pour spécifier les détails de la tâche. Le quatrième onglet concerne les *Propriétés du nœud*.

## Propriétés du nœud

Un nœud est la position d'une tâche dans le Workflow. Si la même tâche apparaît plusieurs fois dans le même Workflow, elle utilisera le même *nom de tâche* mais des *Labels* différentes. Le *Label* identifie le nœud dans le Workflow.

Si la même tâche est utilisé avec différents paramètres à chaque occurrence dans le Workflow, les *Propriétés de nœud* peuvent être utilisées. Elles offrent des paires clé/valeur qui créent des variables de nœud.

- **Nom** spécifie le nom de la variable de nœud qui peut être utilisée dans les tâches Shell en attribuant un environnement à la variable de nœud
  - dans les tâches Shell, en attribuant à une variable d'environnement le *nom* de la variable de nœud à l'aide de la syntaxe *$myNodeVariable*.
  - dans les tâches JVM en attribuant à une variable de tâche le *nom* de la variable de nœud à l'aide de la syntaxe *$myNodeVariable*.
- **Valeur** accepte des chaînes de caractères, des nombres et des références à des variables de Workflow comme dans *$myWorkflowVariable*.

Les noms des variables de nœud sont sensibles à la casse.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
  - [Configuration - Inventaire - Workflow - Options de Tâche](/configuration-inventory-workflows-job-options)
  - [Configuration - Inventaire - Workflow - Propriétés de Tâche](/configuration-inventory-workflows-job-properties)
  - [Configuration - Inventaire - Workflow - Notifications de Tâche](/configuration-inventory-workflows-job-notifications)
  - [Configuration - Inventaire - Workflow - Tags Tâche](/configuration-inventory-workflows-job-tags)

### Product Knowledge Base

- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
