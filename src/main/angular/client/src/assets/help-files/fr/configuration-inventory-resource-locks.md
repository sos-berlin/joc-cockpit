# Configuration - Inventaire - Verrou de Ressource

La vue *Verrous des Ressource* permet de spécifier les Verrous de Ressource à utiliser avec les Workflows.

Les Verrous de Ressource limitent le parallélisme des tâches et autres instructions de Workflow. Ils peuvent être considérés comme un feu de circulation, plus précisément comme un [sémaphore] (https://en.wikipedia.org/wiki/Semaphore_%28programming%29), ce qui implique que 

- les Ordres doivent acquérir le verrou pour continuer dans le Workflow et sinon resteront dans l'état *attendant* jusqu'à ce que le verrou devienne disponible.
- les Ordres qui attendent un verrou ne consomment pas de ressources informatiques telles que l'unité centrale,
- les tentatives d'acquisition d'un verrou par les Ordres seront prises en compte pour tous les Tâches et autres instructions de Workflow à travers les Workflows et les Agents.

Les variantes suivantes sont disponibles pour les Verrous de Ressource :

- **Verrous exclusifs** permettent l'utilisation unique d'un verrou par un [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction).
- **Verrous partagés** permettent l'utilisation parallèle d'un verrou par un certain nombre d'*instructions Lock* provenant du même Workflow ou de différents Workflows.
  - Le cas d'utilisation sous-jacent est une ressource telle qu'une table de base de données à laquelle un nombre limité de tâches peuvent accéder en même temps. Pour éviter les blocages de la base de données, le nombre de tâches accédant à la table est limité.
  - Chaque *Instruction Lock* spécifie un *poids* qui est pris en compte dans la *capacité* du Verrou de Ressource. Si le *poids* correspond à la *capacité* disponible, l'Ordre peut être exécuté. Dans le cas contraire, l'Ordre attendra que la part de *capacité* requise devienne disponible.

Les dispositions suivantes s'appliquent à l'utilisation des Verrous de Ressource par les *instructions Lock* :

- les *Instructions Lock* sont des instructions en bloc utilisées dans un Workflow qui peut engendrer un nombre quelconque de tâches et d'autres instructions de Workflow.
- les *Instructions Lock* peuvent être imbriquées à n'importe quel niveau.
- En cas d'erreur dans une tâche, l'Ordre libère par défaut le verrou et est déplacé au début de l'*Instruction Lock*. Les utilisateurs qui souhaitent qu'un Ordre *échouoé* continue d'utiliser un verrou peuvent appliquer [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction) avec la valeur *false* pour l'option *StopOnFailure*.

Les Verrous de Ressource sont gérés à partir des vues suivants :

- La vue [Configuration - Inventaire - Navigation](/configuration-inventory-navigation), situé sur le côté gauche de la fenêtre, permet de naviguer dans les dossiers contenant des Verrous de Ressource. En outre, cette vue permet d'effectuer des opérations sur les Verrous de Ressource.
- La vue *Verrous des Ressource* sur le côté droit de la fenêtre contient les détails de la configuration du Verrou de Ressource.

## Vue Verrous de Ressource

Pour un Verrou de Ressource, les entrées suivantes sont disponibles :

- **Nom** est l'identifiant unique d'un Verrou de Ressource, voir [Règles de Dénomination des Objets](/object-naming-rules).
- **Titre** contient une explication facultative de l'objectif du Verrou de Ressource.
- **Capacité** est un nombre qui représente l'acceptation maximale de *poids* provenant d'instructions de verrouillage parallèles :
  - une *capacité* de 1 limite du Verrou de Ressource à un usage unique indépendamment des *instructions Lock* *exclusives* ou *partagées*.
  - une *capacité* plus importante permet l'utilisation parallèle du Verrou de Ressource par des *verrous partagés*. Les *instructions Lock* connexes peuvent spécifier l'utilisation de la *capacité* du verrou :
    - l'utilisation *exclusive* tente d'acquérir le verrou exclusivement, indépendamment de sa *capacité*. 
    - *L'utilisation *partagée* vérifie si le *poids* de l'*instruction Lock* correspond à la *capacité* restante.

### Opérations sur les Verrous de Ressource

Pour les opérations disponibles, voir [Configuration - Inventaire - Navigation](/configuration-inventory-navigation).

### Priorité des Ordres

Les Verrous de Ressource prennent en compte les *priorités* des Ordres. Lors de l'ajout d'Ordres à partir de [Configuration - Inventaire - Planifications](/configuration-inventory-schedules) et lors de l'ajout d'Ordres ad hoc à l'aide de [Workflows - Ajouter des Ordres](/workflows-orders-add), la *priorité* peut être spécifiée.

Si plusieurs Ordres sont en attente devant un Verrou de Ressource, l'Ordre ayant la *priorité* la plus élevée sera le premier à acquérir le Verrou de Ressource.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Navigation](/configuration-inventory-navigation)
- [Règles de Dénomination des Objets](/object-naming-rules)
- [Workflow - Inventory - Navigation Panel](/configuration-inventory-navigation)

### Connaissance du produit Base

- [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction)
- [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction)
- [Sémaphore] (https://en.wikipedia.org/wiki/Semaphore_%28programming%29)
