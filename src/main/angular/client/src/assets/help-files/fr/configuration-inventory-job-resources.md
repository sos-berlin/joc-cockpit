# Configuration - Inventaire - Ressources de tâche

La vue *Ressources de tâche* permet de spécifier les ressources de tâche à utiliser avec les Workflows et les tâches.

Les ressources de tâches contiennent des variables de paires clé/valeur qui sont utilisées dans les buts suivants :

- Pour les tâches JVM exécutés dans la machine virtuelle Java de l'agent, les variables sont spécifiées à partir des *Arguments*. Lorsqu'une ressource de tâche est affectée à une tâche, les arguments du tâches correspondant sont remplis.
- Pour les tâches Shell, les variables sont spécifiées dans *Environment Variables*. Lorsqu'une ressource est affectée à un tâches, les variables d'environnement sont créées automatiquement.

Les ressources de tâche se voient attribuer un Workflow ou une tâche à partir de la propriété de l'objet correspondant, voir [Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-tâche-options). Lorsqu'elles sont attribuées au niveau du Workflow, les variables de la ressource de tâches sont disponibles pour toutes les tâches du Workflow.

Les ressources de tâche sont gérées à partir des vues suivantes :

- La page [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation), situé sur le côté gauche de la fenêtre, permet de naviguer dans les dossiers contenant des ressources de tâches. En outre, ce panneau permet d'effectuer des opérations sur les ressources de tâches.
- Le vue *Ressources des Tâche* sur le côté droit de la fenêtre contient les détails de la configuration des ressources.

## Vue des ressources de tâche

Pour une ressource de tâche, les entrées suivantes sont disponibles :

- **Nom** est l'identifiant unique d'une ressource, voir [Object Naming Rules](/object-naming-rules).
- **Titre** contient une explication facultative de l'objectif de la ressource.

La vue permet de configurer les variables de la ressource à partir des onglets suivants :

- **Arguments** sont utilisés par les tâches JVM créés à partir de Java, JavaScript, etc.
- **Variables d'environnement** sont utilisées par les tâches Shell.

Les variables Resource de tâches sont configurées pour chaque onglet à partir des entrées suivantes :

- **Nom** peut être choisi librement à l'adresse [Object Naming Rules](/object-naming-rules).
  - Pour les *Arguments*, des limites Java s'appliquent. L'orthographe des noms des *Arguments* est sensible à la casse.
  - Pour les *variables d'environnement*, les limites du système d'exploitation s'appliquent, par exemple en excluant les tirets et les espaces. Une convention de dénomination fréquente inclut l'orthographe en majuscules. Sous Unix, les noms des variables d'environnement sont sensibles à la casse, tandis que sous Windows, ils ne le sont pas.
- la **Valeur** peut être une entrée directe de chaînes de caractères, de nombres ou d'expressions, voir [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables).

Si la même variable est disponible à la fois pour les *Arguments* et les *Variables d'environnement*, la valeur de la Variable d'environnement peut faire référence au nom de l'*Argument* comme suit : *$argument-name*

### Opérations sur les ressources de tâche

Pour les opérations disponibles, voir [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

## Références

- [Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-tâche-options)
- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Object Naming Rules](/object-naming-rules)
- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)

