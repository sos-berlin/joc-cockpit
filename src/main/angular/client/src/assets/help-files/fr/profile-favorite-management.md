# Profil - Gestion des Favoris

L'onglet *Profil - Gestion des Favoris* permet de spécifier des entrées de favoris à partir d'onglets distincts

- pour la sélection des *Agents* affectés aux tâches.
- pour les *Contrôles des Entrées* qui régissent l'entrée de l'utilisateur dans les variables d'Ordre.

Pour plus de détails, voir [JS7 - Inventory Favorites](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Favorites) et [JS7 - Profiles - Favorite Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+Favorite+Management).

## Agents favoris

Les utilisateurs peuvent trouver un plus grand nombre d'Agents dans leur environnement à partir de [Agents Autonomes](/initial-operation-register-agent-standalone) et de [Clusters de Sous-Agents](/initial-operation-register-agent-subagent-cluster). Au lieu de faire défiler de longues listes, les utilisateurs peuvent spécifier leurs *Agents favoris* qui figureront en haut de la liste des Agents assignables.

### Ajouter des Agents favoris

Les *Agents favoris* peuvent être ajoutés directement lors de l'affectation d'Agents dans l'onglet [Configuration - Inventaire - Workflow - Propriétés de Tâche](/configuration-inventory-workflow-job-properties). En cliquant sur le lien \* d'un Agent, vous ajouterez l'Agent en question à la liste des favoris.

Les utilisateurs peuvent ajouter des *Agents favoris* à partir de leur *Profil* en utilisant le bouton *Ajouter un favori*. Cela permet de sélectionner l'Agent à ajouter.

### Liste des Agents favoris

La liste des *Agents favoris* peut être limitée à partir du bouton *Partagé avec moi*. Cela limite la liste aux favoris partagés par d'autres utilisateurs.

Les utilisateurs peuvent limiter davantage la liste en spécifiant une chaîne de caractères dans le champ de saisie *Recherche* qui sera recherchée dans le nom de l'Agent. La recherche implique une troncature à gauche et à droite.

Les utilisateurs peuvent ordonner la liste en déplaçant un *Agent favori* vers une position antérieure ou postérieure.

### Opérations sur les Agents favoris

Les opérations suivantes sont disponibles à partir du menu d'action à 3 points d'un *Agent favori* :

- **Éditer** permet de modifier le favori.
- **Partager** permet de partager le favori avec d'autres utilisateurs. Les favoris partagés sont indiqués par une icône associée.
- **Supprimer** supprime l'Agent concerné de la liste des favoris.

## Contrôles des Entrées favoris

Les utilisateurs peuvent détenir un plus grand nombre de *Contrôles des Entrées* dans leur inventaire qui sont appliquées à [Configuration - Inventaire - Workflows](/configuration-inventory-workflows). Si un Workflow spécifie des variables de Workflow de type chaîne de données, alors une *Contrôle des Entrées* peut être appliquée pour restreindre la saisie de l'utilisateur. Les *Contrôles des Entrées* sont des expressions régulières qui sont appliquées pour vérifier les entrées utilisateur correspondantes.

Lors de l'attribution de *Contrôles des Entrées* aux variables de Workflow, au lieu de faire défiler de longues listes, les utilisateurs peuvent spécifier leurs *Contrôles des Entrées préférées* qui figureront en haut de la liste.

### Ajout des Contrôles des Entrées aux favoris

Les *Contrôles des Entrées* peuvent être ajoutés directement lors de la spécification des Variables de Workflow dans la vue [Configuration - Inventaire - Workflows](/configuration-inventory-workflows). En cliquant sur le lien \* d'une *Contrôle des Entrées*, vous ajoutez la *Contrôle des Entrées* correspondante à la liste des favoris.

Les utilisateurs peuvent ajouter des *Contrôles des Entrées favoris* à partir de leur *Profil* en utilisant le bouton *Ajouter un favori*. Cela permet de spécifier le nom de du *Contrôle des Entrées* et l'expression régulière associée qui doit être ajoutée.

### Liste des Contrôles des Entrées favoris

La liste des *Contrôles des Entrées favoris* peut être limitée à partir du bouton *Partagé avec moi*. Cela limite la liste aux favoris partagés par d'autres utilisateurs.

Les utilisateurs peuvent limiter davantage la liste en spécifiant une chaîne dans le champ de saisie *Recherche* qui sera recherchée dans le nom de du *Contrôles des Entrées*. La recherche implique une troncature à gauche et à droite.

Les utilisateurs peuvent ordonner la liste en déplaçant un *Contrôle des Entrées Favori* vers une position antérieure ou postérieure.

### Opérations sur les Contrôles des Entrées favoris

Les opérations suivantes sont disponibles à partir du menu d'action à 3 points d'un *Contrôles des Entrées favoris* :

- **Editer** permet de modifier le nom et l'expression régulière d'un *Contrôles des Entrées*.
- **Partager** permet de partager le favori avec d'autres utilisateurs. Les favoris partagés sont signalés par une icône associée.
- **Supprimer** supprime le *Contrôle des Entrées* associée de la liste des favoris.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
- [Configuration - Inventaire - Workflow - Propriétés de Tâche](/configuration-inventory-workflow-job-properties)
- [Opération initiale - Enregistrer Agent Autonome](/initial-operation-register-agent-standalone)
- [Initial Operation - Register Subagent Clusters](/initial-operation-register-agent-subagent-cluster)
- [Profil](/profile)

### Product Knowledge Base

- [JS7 - Inventory Favorites](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Favorites)
- [JS7 - Profiles - Favorite Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+Favorite+Management)
