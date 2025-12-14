# Gérer les Changements

JOC Cockpit permet de gérer [JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes) des objets tels que les Workflows. Un Changement est considéré comme une liste d'objets d'inventaire qui font l'objet d'opérations de déploiement conjointes

- pour le déploiement vers les Contrôleurs,
- pour le déploiement  via  [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import),
- pour le déploiement via [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface).

Les Changements comprennent les objets d'inventaire tels que les Workflows, les Planifications, etc. et les objets référencés, par exemple une Ressource de Tâche référencée par un Workflow.

- Les utilisateurs peuvent ajouter des objets d'inventaire directement à une modification.
- Les objets référencés sont automatiquement associés à un Changement.

La page *Gestion des Changements* permet d'ajouter, de mettre à jour et de supprimer des Changements.

## Liste des Changements

Les Changements existantes sont affichées dans une liste :

- **Menu d'action** permet de mettre à jour et de supprimer l'entrée du Changement.
- **Nom** est le nom unique que les utilisateurs attribuent à une modification.
- **Titre** explique l'objet de la modification.
- **Status** est l'une des options suivantes : *Open* (ouvert) ou *Closed* (fermé). Les Changements fermées ne sont pas proposées pour les opérations de déploiement ou d'exportation.
- **Propriétaire** indique le compte propriétaire du Changement.
- **Objets** propose une icône permettant d'afficher les objets concernés par le Changement.

## Opérations sur les Changements

Les boutons suivants sont disponibles en haut de l'écran :

- **Ajouter un Changement** permet d'ajouter un Changement. Trouvez des détails à partir de [Changements - Propriétés](/changes-properties).

Dans la *Liste des modifications*, les opérations suivantes sont proposées avec le menu d'action correspondant à 3 points :

- **Éditer** permet de mettre à jour les propriétés du Changement. Pour plus d'informations, consultez les [Changements - Propriétés](/changes-properties).
- **Supprimer** permet de supprimer l'entrée du Changement.

## Références

### Aide contextuelle

- [Changements - Propriétés](/changes-properties)

### Product Knowledge Base

- [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface)
- [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import)
- [JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes)
