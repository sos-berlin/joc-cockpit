# Configuration - Inventaire - Opérations - Publier Objet

La publication d'objets permet de les activer, par exemple pour les utiliser dans la vue [Plan Quotidien](/daily-plan). Cela s'applique à des objets tels que les Planifications et les Calendriers disponibles dans le dossier système *Automatisation*.

La vue *Configuration-&gt;Inventaire* permet de publier un seul objet et de publier des objets à partir de dossiers, voir [Configuration - Inventaire - Opérations - Publier Dossier](/configuration-inventory-operations-release-folder).

Lorsque vous publiez un seul objet à partir du bouton *Publier* correspondant, une fenêtre contextuelle s'affiche comme suit :

<img src="release-schedule.png" alt="Publier Planification" width="600" height="330" />

## Mise à jour du Plan Quotidien

La publication d'objets tels que les Planifications et les Calendriers a un impact sur le [Plan Quotidien](/daily-plan). Il arrive fréquemment que la version mise à jour d'un objet soit utilisée pour les Ordres dans le Plan Quotidien. Les utilisateurs contrôlent le comportement à partir des options suivantes :

- **Mettre à jour le Plan Quotidien**
  - **Maintenant** spécifie la mise à jour du Plan Quotidien pour les Ordres planifiés à un moment donné à partir de maintenant.
  - **A partir de** La sélection de l'option ajoute un champ de saisie pour la date cible à partir de laquelle le Plan Quotidien sera mis à jour.
  - **Non** spécifie que le Plan Quotidien ne sera pas mis à jour. Les Ordres existants s'en tiendront à l'utilisation des versions d'objets précédemment déployées.
- **Inclure les Ordres tardifs d'aujourd'hui** si coché, cela inclura les Ordres qui ont été planifiés pour une heure passée dans la journée en cours, mais qui sont retardés et n'ont pas démarré.

## Inclut les Dépendances

Les objets d'inventaire sont liés par des dépendances, voir [Matrice des Dépendances](/dependencies-matrix). Par exemple, un Workflow référençant une Ressource de Tâche et un Verrou de Ressource ; une Planification référençant un Calendrier et un ou plusieurs Workflows.

Lors de la publication des objets, la cohérence est prise en compte, par exemple :

- Si une Planification est créée et fait référence à un Calendrier nouvellement créé, la publication de la Planification inclut également la publication du Calendrier. Cela inclut également le déploiement d'un Workflow référencé par la Planification.
- Si un Calendrier est référencé par une Planification validée et qu'il doit être retiré ou supprimé, la Planification doit également être retirée ou supprimée. Ceci inclut la révocation ou la suppression du Workflow référencé par la Planification.

Les utilisateurs contrôlent le déploiement cohérent à partir des options suivantes :

- **Inclut les Dépendances**
  - si cette option est cochée, elle inclura à la fois les objets référents et les objets référencés.
    - Si les objets liés sont à l'état de brouillon, un déploiement commun est proposé. Il sera appliqué, si nécessaire, en cas de modification des relations entre les objets.
    - Si les objets liés sont au statut déployé/publié, le déploiement commun est facultatif. Les utilisateurs peuvent sélectionner des objets liés pour le déploiement commun.
  - si la case n'est pas cochée, les dépendances ne sont pas prises en compte. Les utilisateurs doivent vérifier si les objets liés sont valides et déployés/publiés. Le Contrôleur émettra des messages d'erreur en cas d'objets manquants en raison d'un déploiement incohérent.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Opérations - Publier Dossier](/configuration-inventory-operations-release-folder)
- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
- [Matrice des Dépendances](/dependencies-matrix)
- [Plan Quotidien](/daily-plan)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
