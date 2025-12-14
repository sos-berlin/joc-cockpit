# Configuration - Inventaire - Ressources de Tâche

La vue *Ressources de Tâche* permet de spécifier les Ressources de Tâche à utiliser avec les Workflows et les tâches.

Les Ressources de Tâches contiennent des variables de paires clé/valeur qui sont utilisées dans les buts suivants :

- Pour les tâches JVM exécutés dans la machine virtuelle Java de l'Agent, les variables sont spécifiées à partir des *Arguments*. Lorsqu'une Ressource de Tâche est affectée à une tâche, les arguments correspondant sont remplis.
- Pour les tâches Shell, les variables sont spécifiées dans *Environment Variables*. Lorsqu'une Ressource de Tâche est affectée à une tâche, les variables d'environnement sont créées automatiquement.

Les Ressources de Tâche se voient attribuer un Workflow ou une tâche à partir de la propriété de l'objet correspondant, voir [Configuration - Inventaire - Workflow - Options de Tâche](/configuration-inventory-workflow-job-options). Lorsqu'elles sont attribuées au niveau du Workflow, les variables de la Ressource de Tâches sont disponibles pour toutes les tâches du Workflow.

Les Ressources de Tâche sont gérées à partir des vues suivantes :

- La page [Configuration - Inventaire - Navigation](/configuration-inventory-navigation), situé sur le côté gauche de la fenêtre, permet de naviguer dans les dossiers contenant des Ressources de Tâches. En outre, ce panneau permet d'effectuer des opérations sur les Ressources de Tâches.
- Le vue *Ressources des Tâche* sur le côté droit de la fenêtre contient les détails de la configuration des ressources.

## Vue des Ressources de Tâche

Pour une Ressource de Tâche, les entrées suivantes sont disponibles :

- **Nom** est l'identifiant unique d'une ressource, voir [Règles de Dénomination des Objets](/object-naming-rules).
- **Titre** contient une explication facultative de l'objectif de la ressource.

La vue permet de configurer les variables de la ressource à partir des onglets suivants :

- **Arguments** sont utilisés par les tâches JVM créés à partir de Java, JavaScript, etc.
- **Variables d'environnement** sont utilisées par les tâches Shell.

Les variables Resource de tâches sont configurées pour chaque onglet à partir des entrées suivantes :

- **Nom** peut être choisi librement à l'adresse [Règles de Dénomination des Objets](/object-naming-rules).
  - Pour les *Arguments*, des limites Java s'appliquent. L'orthographe des noms des *Arguments* est sensible à la casse.
  - Pour les *variables d'environnement*, les limites du système d'exploitation s'appliquent, par exemple en excluant les tirets et les espaces. Une convention de dénomination fréquente inclut l'orthographe en majuscules. Sous Unix, les noms des variables d'environnement sont sensibles à la casse, tandis que sous Windows, ils ne le sont pas.
- la **Valeur** peut être une entrée directe de chaînes de caractères, de nombres ou d'expressions, voir [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables).

Si la même variable est disponible à la fois pour les *Arguments* et les *Variables d'environnement*, la valeur de la Variable d'environnement peut faire référence au nom de l'*Argument* comme suit : *$argument-name*

### Opérations sur les Ressources de Tâche

Pour les opérations disponibles, voir [Configuration - Inventaire - Navigation](/configuration-inventory-navigation).

## Références

### Aide contextuelle

- [Configuration - Inventaire - Workflow - Options de Tâche](/configuration-inventory-workflow-job-options)
- [Configuration - Inventaire - Navigation](/configuration-inventory-navigation)
- [Règles de Dénomination des Objets](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
