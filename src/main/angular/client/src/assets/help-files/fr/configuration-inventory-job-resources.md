# Configuration - Inventaire - Ressources pour l'emploi

Le panneau *Ressources de travail* permet de spécifier les ressources de travail à utiliser avec les Workflows et les travaux.

Les ressources de travail contiennent des variables de paires clé/valeur qui sont utilisées dans les buts suivants :

- Pour les Jobs JVM exécutés dans la machine virtuelle Java de l'agent, les variables sont spécifiées à partir des *Arguments*. Lorsqu'une ressource de travail est affectée à un travail, les arguments du travail correspondant sont remplis.
- Pour les jobs Shell, les variables sont spécifiées dans *Environment Variables*. Lorsqu'une ressource est affectée à un travail, les variables d'environnement sont créées automatiquement.

Les ressources Job se voient attribuer un Workflow ou un Job à partir de la propriété de l'objet correspondant, voir [Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options). Lorsqu'elles sont attribuées au niveau du Workflow, les variables de la ressource Job sont disponibles pour tous les Jobs du Workflow.

Les ressources de travail sont gérées à partir des panneaux suivants :

- Le site [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation), situé sur le côté gauche de la fenêtre, permet de naviguer dans les dossiers contenant des ressources de travail. En outre, ce panneau permet d'effectuer des opérations sur les ressources de travail.
- Le panneau *Ressources d'emploi* sur le côté droit de la fenêtre contient les détails de la configuration des ressources d'emploi.

## Panneau des ressources de travail

Pour une ressource de travail, les entrées suivantes sont disponibles :

- **Nom** est l'identifiant unique d'une ressource d'emploi, voir [Object Naming Rules](/object-naming-rules).
- **Titre** contient une explication facultative de l'objectif de la ressource d'emploi.

Le panneau permet de configurer les variables de la ressource d'emploi à partir des onglets suivants :

- **Arguments** sont utilisés par les Jobs JVM créés à partir de Java, JavaScript, etc.
- **Variables d'environnement** sont utilisées par les Jobs Shell.

Les variables Job Resource sont configurées pour chaque onglet à partir des entrées suivantes :

- **Nom** peut être choisi librement à l'adresse [Object Naming Rules](/object-naming-rules).
  - Pour les *Arguments*, des limites Java s'appliquent. L'orthographe des noms des *Arguments* est sensible à la casse.
  - Pour les *variables d'environnement*, les limites du système d'exploitation s'appliquent, par exemple en excluant les tirets et les espaces. Une convention de dénomination fréquente inclut l'orthographe en majuscules. Sous Unix, les noms des variables d'environnement sont sensibles à la casse, tandis que sous Windows, ils ne le sont pas.
- la **Valeur** peut être une entrée directe de chaînes de caractères, de nombres ou d'expressions, voir [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables).

Si la même variable est disponible à la fois pour les *Arguments* et les *Variables d'environnement*, la valeur de la Variable d'environnement peut faire référence au nom de l'*Argument* comme suit : *$argument-name*

### Opérations sur les ressources de l'emploi

Pour les opérations disponibles, voir [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

## Références

- [Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options)
- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Object Naming Rules](/object-naming-rules)
- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)

