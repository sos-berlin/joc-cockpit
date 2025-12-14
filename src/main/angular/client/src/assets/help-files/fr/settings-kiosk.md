# Réglages - Mode Kiosque

JOC Cockpit peut être utilisé sur [JS7 - Kiosk Mode](https://kb.sos-berlin.com/display/JS7/JS7+-+Kiosk+Mode) qui comprend

- un fonctionnement sans surveillance,
- l'affichage d'un certain nombre de pages, chacune pour une période prédéfinie,
- la mise à jour des pages lorsque de nouveaux événements surviennent, tels que l'achèvement des tâches.

La page *Réglages* est accessible à partir de l'icône ![wheel icon](assets/images/wheel.png) dans la barre de menu.

## Paramètres du Mode Kiosque

### Paramètre : *kiosk\_role*, Défaut : *kiosque*

Indique le nom du rôle auquel est attribué un compte utilisé pour les opérations en mode kiosque :

- Le rôle doit être créé par l'utilisateur.
- Le rôle doit inclure des autorisations de lecture seule.
- Le rôle est le seul à qui le compte est attribué.

### Paramètre : *view\_dashboard\_duration*, Défaut : *20*

Spécifie la durée en secondes pendant laquelle le tableau de bord sera affiché.

Les utilisateurs peuvent modifier la présentation du tableau de bord pour le compte utilisé en mode kiosque.

- La valeur 0 indique que la vue ne sera pas affichée.
- Une valeur &gt;10 indique la durée souhaitée.

### Paramètre : *view\_monitor\_order\_notification\_duration*, Défaut : *15*

Spécifie la durée en secondes pendant laquelle la vue [Moniteur - Notifications d'Ordre](/monitor-notifications-order) sera affichée.

- La valeur 0 indique que la vue ne sera pas affichée.
- Une valeur &gt;10 indique la durée souhaitée.

### Paramètre : *view\_monitor\_system\_notification\_duration*, Défaut : *15*

Spécifie la durée en secondes pendant laquelle la vue [Moniteur - Notifications du Système](/monitor-notifications-system) sera affichée.

- La valeur 0 indique que la vue ne sera pas affichée.
- Une valeur &gt;10 indique la durée souhaitée.

### Paramètre : *view\_history\_tasks\_duration*, Défaut : *30*

Spécifie la durée en secondes pendant laquelle la vue [Historique des Tâches](/history-tasks) sera affichée.

- La valeur 0 indique que la vue ne sera pas affichée.
- Une valeur &gt;10 indique la durée souhaitée.

### Paramètre : *view\_history\_orders\_duration*, Défaut : *0*

Spécifie la durée en secondes pendant laquelle la vue [Historique des Ordres](/history-orders) sera affichée.

La valeur 0 indique que la vue ne sera pas affichée.
Une valeur &gt;10 indique la durée souhaitée.

## Références

### Aide contextuelle

- [Moniteur - Notifications d'Ordre](/monitor-notifications-order)
- [Moniteur - Notifications du Système](/monitor-notifications-system)
- [Historique des Ordres](/history-orders)
- [Historique des Tâches](/history-tasks)
- [Réglages](/settings)

### Product Knowledge Base

- [JS7 - Kiosk Mode](https://kb.sos-berlin.com/display/JS7/JS7+-+Kiosk+Mode)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
