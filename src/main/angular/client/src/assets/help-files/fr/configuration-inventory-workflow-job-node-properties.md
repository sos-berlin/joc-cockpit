# Configuration - Inventaire - Workflow - Propriétés du nœud de travail

Le panneau *Workflow* permet de concevoir des Workflow à partir d'une séquence d'instructions. Les utilisateurs peuvent glisser-déposer les *instructions de travail* depuis la *barre d'outils* vers une position dans le Workflow.

L'interface graphique propose un certain nombre d'onglets pour spécifier les détails du travail. Le quatrième onglet concerne les *Propriétés du nœud*.

## Propriétés du nœud

Un nœud est la position d'une tâche dans le Workflow. Si le même travail apparaît plusieurs fois dans le même Workflow, il utilisera le même *nom de travail* mais des *étiquettes* différentes. L'*étiquette* identifie le nœud dans le Workflow.

Si le même travail est utilisé avec différents jeux de paramètres à chaque occurrence dans le Workflow, les *Propriétés de nœud* peuvent être utilisées. Elles offrent des paires clé/valeur qui créent des variables de nœud.

- **Nom** spécifie le nom de la variable de nœud qui peut être utilisée dans les travaux Shell en attribuant un environnement à la variable de nœud
  - dans les travaux Shell, en attribuant à une variable d'environnement le *nom* de la variable de nœud à l'aide de la syntaxe *$myNodeVariable*.
  - dans les travaux JVM en attribuant à une variable de travail le *nom* de la variable de nœud à l'aide de la syntaxe *$myNodeVariable*.
- **Valeur** accepte des chaînes de caractères, des nombres et des références à des variables de Workflow comme dans *$myWorkflowVariable*.

Les noms des variables de nœud sont sensibles à la casse.

## Références

### Aide contextuelle

- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  - [Configuration - Inventory - Workflows - Job Options](/configuration-inventory-workflows-job-options)
  - [Configuration - Inventory - Workflows - Job Properties](/configuration-inventory-workflows-job-properties)
  - [Configuration - Inventory - Workflows - Job Notifications](/configuration-inventory-workflows-job-notifications)
  - [Configuration - Inventory - Workflows - Job Tags](/configuration-inventory-workflows-job-tags)

### Product Knowledge Base

- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)

