# Paramètres - Kiosque

JOC Cockpit peut être utilisé sur [JS7 - Kiosk Mode](https://kb.sos-berlin.com/display/JS7/JS7+-+Kiosk+Mode) qui comprend

- un fonctionnement sans surveillance,
- l'affichage d'un certain nombre de pages, chacune pour une période prédéfinie,
- la mise à jour des pages lorsque de nouveaux événements surviennent, tels que l'achèvement des tâches.

La page *Réglages* est accessible à partir de l'icône ![wheel icon](assets/images/wheel.png) dans la barre de menu.

## Paramètres du kiosque

### Paramètre : *kiosk\_role*, Défaut : *kiosque*

Indique le nom du rôle auquel est attribué un compte utilisé pour les opérations en mode kiosque :

- Le rôle doit être créé par l'utilisateur.
- Le rôle doit inclure des autorisations de lecture seule.
- Le rôle est le seul à qui le compte est attribué.

### Paramètre : *view_dashboard\_duration*, Valeur par défaut : *20*

Spécifie la durée en secondes pendant laquelle le tableau de bord sera affiché.

Les utilisateurs peuvent modifier la présentation du tableau de bord pour le compte utilisé en mode kiosque.

- La valeur 0 indique que la vue ne sera pas affichée.
- Une valeur &gt;10 indique la durée souhaitée.

### Setting : *view_monitor\_order\_notification\_duration*, Valeur par défaut : *15*

Spécifie la durée en secondes pendant laquelle la vue [Monitor - Order Notifications](/monitor-notifications-order) sera affichée.

- La valeur 0 indique que la vue ne sera pas affichée.
- Une valeur &gt;10 indique la durée souhaitée.

### Setting : *view_monitor\_system\_notification\_duration*, Valeur par défaut : *15*

Spécifie la durée en secondes pendant laquelle la vue [Monitor - System Notifications](/monitor-notifications-system) sera affichée.

- La valeur 0 indique que la vue ne sera pas affichée.
- Une valeur &gt;10 indique la durée souhaitée.

### Paramètre : *view_history\_tasks\_duration*, Valeur par défaut : *30*

Spécifie la durée en secondes pendant laquelle la vue [Task History](/history-tasks) sera affichée.

- La valeur 0 indique que la vue ne sera pas affichée.
- Une valeur &gt;10 indique la durée souhaitée.

### Paramètre : *view_history\_orders\_duration*, Défaut : *0*

Spécifie la durée en secondes pendant laquelle la vue [Order History](/history-orders) sera affichée.

La valeur 0 indique que la vue ne sera pas affichée.
Une valeur &gt;10 indique la durée souhaitée.

## Références

### Aide contextuelle

- [Monitor - Order Notifications](/monitor-notifications-order)
- [Monitor - System Notifications](/monitor-notifications-system)
- [Order History](/history-orders)
- [Task History](/history-tasks)
- [Settings](/settings)

### Product Knowledge Base

- [JS7 - Kiosk Mode](https://kb.sos-berlin.com/display/JS7/JS7+-+Kiosk+Mode)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)

