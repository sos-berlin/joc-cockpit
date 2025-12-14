# Historique des Soumissions

L'*Historique des Soumissions* conserve la trace des Ordres soumis à partir du [Plan Quotidien](/daily-plan).

Les Ordres sont créés par le Plan Quotidien en deux étapes : d'abord ils sont *planifiés*, ensuite ils sont *soumis* au Contrôleur et aux Agents. La soumission signifie que les Ordres seront lancés de manière autonome par les Agents.

L'*Historique des Soumissions* est soumis à une purge de la base de données effectuée par le [Service d'Assainissement](/service-cleanup).

## Historique

L'affichage est groupé en blocs par date du Plan Quotidien, par Soumission et Ordres inclus.

L'affichage est limité à un maximum de 5 000 entrées, sauf indication contraire sur [Profil - Préférences](/profile-preferences).

### Historique du Plan Quotidien

Les informations suivantes sont affichées pour chaque date du Plan Quotidien.

- **Date du Plan Quotidien** indique le jour pour lequel les Ordres sont planifiés.
- **Total** indique le nombre d'Ordres soumis à toutes les soumissions pour la date donnée.
- **Nombre de soumissions** indique le nombre d'Ordres soumis avec succès.
  - Si le nombre correspond au *Compte total*, tous les Ordres ont été soumis avec succès.
  - Si le nombre est supérieur à zéro mais inférieur au *Compte total*, alors
    - le paramètre permettant de soumettre les Ordres individuellement est en place, voir [Réglages - Plan Quotidien](/settings-daily-plan) et
    - un certain nombre d'Ordres n'ont pas pu être soumis.
  - Si le nombre est égal à zéro, cela signifie que
    - le paramètre permettant de soumettre les Ordres individuellement n'est pas en place, voir [Réglages - Plan Quotidien](/settings-daily-plan), et/ou
    - que tous les Ordres n'ont pas été soumis.

### Historique des soumissions

Il peut y avoir un nombre illimité de soumissions pour une date donnée du Plan Quotidien. Lorsque les utilisateurs apportent des modifications aux objets d'inventaire tels que les Workflows et les Planifications, et qu'ils choisissent l'option de mise à jour du Plan Quotidien, une Soumission est ajoutée pour les objets en question.

Lorsque vous cliquez sur l'icône de la flèche vers le bas à partir de la *Date du Plan Quotidien*, les détails de chaque soumission s'affichent :

- **Compte total des soumissions** indique le nombre d'Ordres soumis à la soumission donnée.
- **Le nombre de soumissions** indique le nombre d'Ordres soumis avec succès dans le cadre de la soumission donnée.
  - Si le nombre correspond au *Compte total des soumissions*, tous les Ordres ont été soumis avec succès.
  - Si le nombre est égal ou supérieur à zéro, les explications précédentes concernant les soumissions par date du Plan Quotidien s'appliquent.

### Historique des soumissions par Ordre

En cliquant sur l'icône de la flèche vers le bas à partir de la *Date de soumission*, les détails par Ordre seront affichés :

- **Message** peut indiquer un message d'erreur en cas d'échec de la soumission.
- **ID Ordre** est l'identifiant unique attribué à l'Ordre.
- **Workflow** indique le Workflow passé par l'Ordre.
  - En cliquant sur le nom du Workflow, vous accédez à la vue [Workflows](/workflows).
  - En cliquant sur l'icône en forme de crayon, vous accédez à la vue [Configuration - Inventaire - Workflows](/configuration-inventory-workflows).
- **Prévu pour** indique la date et l'heure auxquelles l'Ordre est censé commencer.
- **Etat** est l'un des deux suivants : *Soumis* ou *Non soumis*.
  - *Soumis* indique que l'Ordre est disponible auprès d'un Agent.
  - *Non soumis" indique que la soumission a échoué.

## Filtres

L'utilisateur peut appliquer les filtres disponibles en haut de la fenêtre pour limiter l'affichage des dates du Plan Quotidien et des soumissions.

- les boutons de filtre **Soumis**, **Non soumis** limitent l'affichage aux soumissions ayant le statut correspondant.
- les boutons de filtrage **Plage de Dates** permettent de choisir la plage de dates pour l'affichage des soumissions.
- la case à cocher **Contrôleur actuel** limite les soumissions au Contrôleur actuellement sélectionné.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
- [Plan Quotidien](/daily-plan)
- [Profil - Préférences](/profile-preferences)
- [Réglages - Plan Quotidien](/settings-daily-plan)
- [Service d'Assainissement](/service-cleanup)
- [Workflows](/workflows)

### Product Knowledge Base

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)

