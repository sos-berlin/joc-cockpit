# Calendrier du Plan Quotidien

Un certain nombre d'opérations sont disponibles à partir du Calendrier du Plan Quotidien. 

Pour les opérations générales disponibles à partir du Plan Quotidien, voir [Plan Quotidien](/daily-plan).

## Sélection d'une date unique

En cliquant sur une date du Calendrier, vous afficherez les Ordres disponibles pour la date sélectionnée.

## Sélection de plusieurs dates

Pour sélectionner plusieurs dates

- maintenez la souris enfoncée et faites-la glisser pour sélectionner la plage de dates,
- ou appuyez sur la touche Ctrl et sélectionnez la date de début et la date de fin en cliquant sur la souris,
- ou cliquez sur l'icône du Calendrier et sélectionnez la date de début et la date de fin à l'aide d'un clic de souris.

Les dates sélectionnées seront mises en évidence et les boutons *Supprimer l'Ordre* et *Annuler l'Ordre* seront disponibles sous le menu principal.

Les boutons de filtrage suivants limitent l'étendue des opérations : 

- **Tous** : L'opération peut être appliquée aux Ordres ayant n'importe quel statut.
- **Planifié** : Les opérations *soumettre* et *supprimer* peuvent être appliquées aux Ordres *planifiés* qui ne sont pas *soumis* au Contrôleur.
- **Soumis** : L'opération *annuler* peut être appliquée aux Ordres *soumis* au Contrôleur et aux Agents.
- **Terminés** : L'opération *annuler* peut être appliquée aux Ordres qui se sont terminés.
- **En retard** est un filtre supplémentaire qui s'ajoute aux états des Ordres et qui indique que les Ordres ont été lancés plus tard que prévu.

### Annuler les Ordres

- Lorsqu'elle est appliquée aux Ordres *soumis* dans la plage de dates sélectionnée, les Ordres sont retirés par le Contrôleur et les Agents.
- Lorsqu'elle est appliquée à des Ordres *soumis* ou *terminés*, les Ordres seront remis à l'état *planifié*.
- L'opération est ignorée pour les Ordres *planifiés*.

### Supprimer des Ordres

- Lorsque cette opération est appliquée à des Ordres *planifiés*, les Ordres sont retirés du Plan Quotidien.
  - Lorsque les Ordres sont retirés d'une date du Plan Quotidien, ils ne seront pas exécutés et le Service du Plan Quotidien n'essaiera pas d'ajouter des Ordres à la date donnée.
  - L'opération *Supprimer le Plan Quotidien* supprime implicitement les Ordres. En outre, toutes les soumissions pour la date du Plan Quotidien donnée seront supprimées et la prochaine exécution du Service de Plan Quotidien planifiera les Ordres pour la date donnée, voir [Supprimer le Plan Quotidien](#delete-daily-plan).
- L'opération est ignorée pour les Ordres *soumis* et *terminés*.

### Créer un Plan Quotidien

L'opération est disponible à partir d'un bouton situé sous le widget du Calendrier pour une date individuelle et pour une plage de dates.

- Pour les jours sélectionnés, le Plan Quotidien sera créé.
  - Les utilisateurs peuvent choisir de créer tous les Ordres ou les Ordres des Planifications et Workflows sélectionnés, éventuellement limités par des dossiers.
  - Les utilisateurs peuvent spécifier de remplacer les Ordres existants provenant des mêmes Planifications et de soumettre immédiatement les Ordres au Contrôleur.
  - Les utilisateurs peuvent inclure des Ordres provenant de Planifications qui ne sont pas configurées pour être prises en compte par le Service du Plan Quotidien.
- Si le Plan Quotidien pour une date donnée est créé, l'exécution suivante du Service de Plan Quotidien ne planifiera pas d'Ordres supplémentaires pour la même date. Cependant, le service soumettra des Ordres *planifiés* dans le cadre des jours à venir pour lesquels des Ordres doivent être soumis, voir la page [Réglages - Plan Quotidien](/settings-daily-plan).

### Supprimer le Plan Quotidien

L'opération est disponible à partir d'un bouton situé sous le widget du Calendrier pour une date individuelle et pour une plage de dates.

- Pour les jours sélectionnés, le Plan Quotidien sera supprimé, à condition qu'aucun Ordre *soumis* ou *terminés* ne soit disponible. Si des Ordres *planifiés* sont disponibles, ils seront abandonnés avec le Plan Quotidien.
- Si le Plan Quotidien pour une date donnée est supprimé, la prochaine exécution du Service de Plan Quotidien planifiera les Ordres pour cette date, à condition que la date soit dans le champ des jours à venir pour lesquels les Ordres sont planifiés, voir [Réglages - Plan Quotidien](/settings-daily-plan).

## Références

- [Plan Quotidien](/daily-plan)
- [Réglages - Plan Quotidien](/settings-daily-plan)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
