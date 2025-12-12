# Configuration - Inventaire - Verrouillage des ressources

La vue * verrous des ressource* permet de spécifier les verrous de ressources à utiliser avec les Workflows.

Les verrous de ressources limitent le parallélisme des tâches et autres instructions de Workflow. Ils peuvent être considérés comme un feu de circulation, plus précisément comme un [sémaphore] (https://en.wikipedia.org/wiki/Semaphore_%28programming%29), ce qui implique que 

- Les Ordres doivent acquérir le verrou pour continuer dans le Workflow et sinon resteront dans l'état *attendant* jusqu'à ce que le verrou devienne disponible.
- Les ordres qui attendent un verrou ne consomment pas de ressources informatiques telles que l'unité centrale,
- Les tentatives d'acquisition d'un verrou par les Ordres seront prises en compte pour tous les Tâches et autres instructions de Workflow à travers les Workflows et les Agents.

Les variantes suivantes sont disponibles pour les verrous de ressources :

- **Les verrous exclusifs** permettent l'utilisation unique d'un verrou par un [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction).
- les **verrous partagés** permettent l'utilisation parallèle d'un verrou par un certain nombre d'*instructions de verrouillage* provenant du même Workflow ou de différents Workflows.
  - Le cas d'utilisation sous-jacent est une ressource telle qu'une table de base de données à laquelle un nombre limité de Tâches peuvent accéder en même temps. Pour éviter les blocages de la base de données, le nombre de tâches accédant à la table est limité.
  - Chaque *instruction de verrouillage* spécifie un *poids* qui est pris en compte dans la *capacité* du verrou de ressource. Si le *poids* correspond à la *capacité* disponible, l'Ordre peut être exécuté. Dans le cas contraire, l'Ordre attendra que la part de *capacité* requise devienne disponible.

Les dispositions suivantes s'appliquent à l'utilisation des écluses de ressources par les *instructions d'écluse* :

- les *Instructions de verrouillage* sont des instructions en bloc utilisées dans un Workflow qui peut engendrer un nombre quelconque de tâches et d'autres instructions de Workflow.
- les *Instructions de verrouillage* peuvent être imbriquées à n'importe quel niveau.
- En cas d'erreur dans un tâche, l'Ordre libère par défaut le verrou et est déplacé au début de l'*Instruction de blocage*. Les utilisateurs qui souhaitent qu'un Ordre *défaillant* continue d'utiliser un verrou peuvent appliquer l'adresse [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction) avec la valeur *false* pour l'option *StopOnFailure*.

Les verrous de ressources sont gérés à partir des vues suivants :

- La vue [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation), situé sur le côté gauche de la fenêtre, permet de naviguer dans les dossiers contenant des verrous de ressources. En outre, cette vue permet d'effectuer des opérations sur les verrouillages de ressources.
- La vue  *verous des ressources* sur le côté droit de la fenêtre contient les détails de la configuration du verrous des ressource.

## vue verrous de ressource

Pour un verrou de ressource, les entrées suivantes sont disponibles :

- **Nom** est l'identifiant unique d'un verrou de ressource, voir [Object Naming Rules](/object-naming-rules).
- **Titre** contient une explication facultative de l'objectif du verrou de ressource.
- **Capacité** est un nombre qui représente l'acceptation maximale de *poids* provenant d'instructions de verrouillage parallèles :
  - une *capacité* de 1 limite le Resource Lock à un usage unique indépendamment des *Instructions de verrouillage *exclusives* ou *partagées*.
  - une *capacité* plus importante permet l'utilisation parallèle du verrou de ressource par des *verrous partagés*. Les *Instructions de verrouillage* connexes peuvent spécifier l'utilisation de la *Capacité* du verrou :
    - l'utilisation *exclusive* tente d'acquérir le verrou exclusivement, indépendamment de sa *capacité*. 
    - *L'utilisation *partagée* vérifie si le *poids* de l'instruction de verrouillage correspond à la *capacité* restante.

### Opérations sur les verrous de ressource

Pour les opérations disponibles, voir [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

### Ordre de priorité

Les verrous de ressource prennent en compte les *priorités* des ordres. Lors de l'ajout d'Ordres à partir de [Configuration - Inventory - Schedules](/configuration-inventory-schedules) et lors de l'ajout d'Ordres ad hoc à l'aide de [Workflows - Add Orders](/workflows-orders-add), la *Priorité* peut être spécifiée.

Si plusieurs Ordres sont en attente devant un verrou de ressource, l'Ordre ayant la *Priorité* la plus élevée sera le premier à acquérir le verrou de ressource.

## Références

### Aide contextuelle

- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Object Naming Rules](/object-naming-rules)
- [Workflow - Inventory - Navigation Panel](/configuration-inventory-navigation)

### Connaissance du produit Base

- [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction)
- [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction)
- [Sémaphore] (https://en.wikipedia.org/wiki/Semaphore_%28programming%29)

