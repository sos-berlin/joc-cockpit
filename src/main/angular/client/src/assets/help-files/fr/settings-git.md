# Réglages - Git

Le JOC Cockpit propose [JS7 - Inventory Git Integration](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Git+Integration) pour la versionnification et le déploiement des objets en utilisant les dépôts Git.

La page *Réglages* est accessible à partir de l'icône ![wheel icon](assets/images/wheel.png) dans la barre de menu.

Les paramètres suivants sont appliqués pour l'utilisation des référentiels Git. Les modifications entrent en vigueur immédiatement.

## Paramètres du Dépôt Git

### Paramètre : *git\_hold\_workflows*, Défaut : *rollout*

Indique si les Workflows sont considérés comme locaux à un environnement ou s'ils sont destinés à être déployés avec Git.

### Paramètre : *git\_hold\_resource\_locks*, Défaut : *rollout*

Spécifie si [Ressources - Verrous de Ressource](/resources-resource-locks) est considéré comme local à un environnement ou destiné à être déployé avec Git.

### Paramètre : *git\_hold\_file\_order\_sources*, Défaut : *rollout*

Ordonne si les Sources d'Ordres de Fichiers sont considérées comme locales à un environnement ou destinées à être déployées avec Git.

### Paramètre : *git\_hold\_notice\_boards*, Défaut : *rollout*

Spécifie si [Ressources - Tableaux de Condition](/resources-notice-boards) est considéré comme local à un environnement ou destiné à être déployé avec Git.

### Paramètre : *git\_hold\_script\_includes*, Défaut : *rollout*

Spécifie si les Blocs Scripts sont considérés comme locaux à un environnement ou s'ils sont destinés à être déployés avec Git.

### Paramètre : *git\_hold\_job\_templates*, Défaut : *rollout*

Indique si les Modèles de Tâche sont considérés comme locaux à un environnement ou s'ils sont destinés à être déployés avec Git.

### Paramètre : *git\_hold\_job\_resources*, Défaut : *local*

Indique si les Ressources de Tâches sont considérées comme locales à un environnement ou si elles sont destinées à être déployées avec Git.

### Paramètre : *git\_hold\_calendars*, Défaut : *local*

Indique si les Calendriers sont considérés comme locaux à un environnement ou s'ils sont destinés à être déployés avec Git.

### Paramètre : *git\_hold\_schedules*, Défaut : *local*

Indique si les Planifications sont considérées comme locales à un environnement ou si elles sont destinées à être déployées avec Git.

## Références

### Aide contextuelle

- [Profil - Git](/profile-git-management)
- [Réglages](/settings)
- [Ressources - Tableaux de Condition](/resources-notice-boards)
- [Ressources - Verrous de Ressource](/resources-resource-locks)

### Product Knowledge Base

- [JS7 - Inventory Git Integration](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Git+Integration)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
