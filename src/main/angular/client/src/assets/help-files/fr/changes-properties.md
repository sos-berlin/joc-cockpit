# Modifier les propriétés

JOC Cockpit permet de gérer [JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes) des objets tels que les Workflows. Un changement est une collection d'objets d'inventaire qui sont soumis à des opérations de déploiement communes

- pour le déploiement vers les contrôleurs,
- pour le déploiement à l'aide de [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import),
- pour le déploiement à l'aide de [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface).

Les modifications comprennent les objets d'inventaire tels que les Workflows, les Plannifications, etc. et les objets référencés, par exemple une ressource de travail référencée par un Workflow.

- Les utilisateurs peuvent ajouter des objets d'inventaire directement à une modification.
- Les objets référencés sont automatiquement associés à un changement.

La fenêtre contextuelle *Changement - Propriétés* est utilisée pour spécifier les propriétés des changements.

## Propriétés du changement

Les changements possèdent les propriétés suivantes :

- **Nom** est le nom unique que les utilisateurs attribuent à un changement.
- **Titre** explique l'objectif du changement.
- **Status** est l'une des deux options suivantes : *Open* ou *Closed*. Les modifications fermées ne sont pas proposées pour les opérations de déploiement ou d'exportation.

## Références

### Aide contextuelle

- [Changes](/changes)

### Product Knowledge Base

- [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface)
- [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import)
- [JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes)

