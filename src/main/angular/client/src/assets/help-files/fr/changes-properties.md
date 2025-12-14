# Changement - Propriétés

JOC Cockpit permet de gérer [JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes) des objets tels que les Workflows. Un Changement est une collection d'objets d'inventaire qui sont soumis à des opérations de déploiement communes

- pour le déploiement vers les Contrôleurs,
- pour le déploiement via [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import),
- pour le déploiement via [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface).

Les modifications comprennent les objets d'inventaire tels que les Workflows, les Planifications, etc. et les objets référencés, par exemple une Ressource de Tâche référencée par un Workflow.

- Les utilisateurs peuvent ajouter des objets d'inventaire directement à une modification.
- Les objets référencés sont automatiquement associés à un Changement.

La fenêtre contextuelle *Changement - Propriétés* est utilisée pour spécifier les propriétés des Changements.

## Propriétés du Changement

Les Changements possèdent les propriétés suivantes :

- **Nom** est le nom unique que les utilisateurs attribuent à un Changement.
- **Titre** explique l'objectif du Changement.
- **Status** est l'une des deux options suivantes : *Open* ou *Closed*. Les modifications fermées ne sont pas proposées pour les opérations de déploiement ou d'exportation.

## Références

### Aide contextuelle

- [Changements](/changes)

### Product Knowledge Base

- [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface)
- [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import)
- [JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes)
