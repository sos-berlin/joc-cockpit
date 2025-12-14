# Tableau de Bord - Plan Quotidien

L'affichage *Plan Quotidien* fournit des informations sur l'exécution des Ordres créés par le Plan Quotidien. Cela exclut les Ordres créés sur demande par l'intervention de l'utilisateur et les Ordres créés à partir d'un fichier surveillé par *Source d'Ordre de Fichier*.

<img src="dashboard-daily-plan.png" alt="Daily Plan" width="330" height="80" />

## Statut du Plan Quotidien

Le statut du Plan Quotidien est le statut initial lorsqu'un Ordre est créé par le Service du Plan Quotidien.

- Les Ordres **planifiés** n'ont pas été soumis au Contrôleur et aux Agents. Tout nombre d'Ordres *planifiés* indique un problème si la plage de dates est supérieure au nombre de jours pour lesquels les Ordres doivent être soumis.
- Les Ordres **soumises** sont planifiés pour une exécution ultérieure au cours de la journée ou sont en cours d'exécution. Le statut ne reflète pas l'état actuel des Ordres qui ont été lancés mais résume les Ordres qui devraient être exécutés au cours de la journée.
- Les Ordres **terminés** sont terminés. Ce statut est indépendant du résultat de l'exécution réussie ou non des Ordres, qui est indiqué dans la vue *Historique des Ordres*.

En cliquant sur le nombre d'Ordres indiqué, vous accédez à la vue *Plan Quotidien* qui affiche les Ordres en détail.

## Filtres

Le bouton déroulant situé dans le coin supérieur droit de l'affichage permet de sélectionner des Ordres dans une plage de dates :

- **Aujourd'hui**: Les Ordres sont liés à la journée en cours qui est calculée à partir du fuseau horaire dans le profil de l'utilisateur.
- **Prochain Jour**: Les Ordres  sont destinés à être exécutés le jour suivant. Cela exclut les Ordres d'*aujourd'hui*.
- **2ième jour suivant**: Les Ordres  sont destinés à être exécutés le 2ième jour suivant.
- **3ième jour suivant**: Les Ordres  sont destinés à être exécutés le 3ième jour suivant.
- **4ième jour suivant**: Les Ordres  doivent être exécutés le 4ième jour suivant.
- **5ième jour suivant**: Les Ordres seront exécutés le 5ième jour suivant.
- **6ième jour suivant**: Les Ordres seront exécutés le 6ième jour suivant.
- **7ième jour suivant**: Les Ordres seront exécutés le 7ième jour suivant.

## Références

- [Plan Quotidien](/daily-plan)
- [Tableau de Bord - Ordres](/dashboard-orders)
- [Historique des Ordres](/history-orders)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
