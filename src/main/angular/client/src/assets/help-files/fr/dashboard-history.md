# Historique

L'Affichage *Historique* fournit des informations sur l'exécution passée des Ordres et des Tâches.

<img src="dashboard-history.png" alt="History" width="330" height="80" />

## Historique Statut

Le statut Historique est le statut final lorsqu'un Ordre ou une Tâche est terminé. L'Historique ne prend pas en compte les Ordres et les Tâches en cours. Aucune opération n'est disponible sur les Ordres ou les Tâches indiqués - ils font partie de l'historique.

- **Les Ordres réussis** sont terminés avec succès. Cela inclut les Ordres qui auraient pu échouer pendant leur durée de vie mais qui se sont rétablis grâce à une gestion automatisée des erreurs ou à l'intervention de l'utilisateur.
- **Les Ordres qui ont échoué** ont rencontré un problème, comme un tâche échoué ou une *instruction d'échec*.
- les **Tâches réussis** sont terminés avec succès. Cela inclut les Tâches dans les Workflows pour lesquels les Ordres associés ne sont pas terminés.
- les **Tâches échoués** ont rencontré un problème lors de l'exécution de la taĉhe.

En cliquant sur le nombre indiqué d'Ordres ou de Tâches, vous accédez à la vue *Historique des Ordres* ou *Historique des Tâches* qui affiche les Ordres et les Tâches en détail.

## Filtres

Le bouton déroulant situé dans le coin supérieur droit de l'affichage permet de sélectionner des Ordres et des Tâches passés à partir d'une plage de dates :

- **Aujourd'hui** Les ordres et les Tâches sont liés à la journée en cours, qui est calculée à partir du fuseau horaire indiqué dans le profil de l'utilisateur.
- **Dernière heure** inclut les Ordres et les Tâches qui se sont terminés au cours de la dernière heure.
- **Les 12 dernières heures** incluent les Ordres et les Tâches qui ont été complétés au cours des 12 dernières heures.
- **Les dernières 24 heures** incluent les Ordres et les Tâches qui ont été complétés au cours des dernières 24 heures.
- **Les 7 derniers jours** comprennent les Ordres et les Emplois qui ont été complétés au cours des 7 derniers jours.

## Références

- [Order History](/history-orders)
- [Task History](/history-tasks)
- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Task History](https://kb.sos-berlin.com/display/JS7/JS7+-+Task+History)

