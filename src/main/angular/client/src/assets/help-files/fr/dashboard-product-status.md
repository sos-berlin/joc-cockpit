# Tableau de Bord - État du Produit

L'affichage *État du Produit* fournit des informations sur les composants JS7 suivants :

- **JOC Cockpit** est utilisé pour surveiller et contrôler l'environnement de scheduling et pour gérer l'inventaire des tâches.
- **Contrôleur** orchestre les Agents et gère le déploiement des Ordres, des Workflows et des Jobs.
- **Agents** exécutent les tâches. 

Les composants JS7 peuvent être exploités de manière autonome et dans le cadre d'un Clustering actif-passif.

## État des composants et état des connexions

### JOC Cockpit

Le JOC Cockpit se connecte à la base de données et aux instances du Contrôleur.

- État du composant
  - L'état du composant est indiqué par la couleur de la tuile dans le coin supérieur gauche du rectangle du JOC Cockpit.
  - **Une tuile de couleur verte** indique que l'instance du JOC Cockpit est en bonne santé.
  - **Une tuile de couleur rouge** indique un état inconnu. 
- État de la connexion à la base de données
  - **Une ligne de couleur verte** indique que la connexion est saine.
  - **Une ligne de couleur jaune** indique des problèmes de connexion, par exemple si JOC Cockpit ne reçoit pas de battements de cœur de la base de données.
- État de la connexion du Contrôleur
  - **Une ligne de couleur verte** indique que la connexion avec le Contrôleur est saine.
  - **Une ligne de couleur rouge** indique un échec de la connexion au Contrôleur.

### Contrôleur

Le Contrôleur se connecte aux instances d'Agents. Dans un Cluster de Contrôleurs, ses membres ont des connexions bidirectionnelles.

- État du composant
  - L'état du composant est indiqué par la couleur de la tuile dans le coin supérieur gauche du rectangle du Contrôleur.
  - **Une tuile de couleur verte** indique que l'instance du Contrôleur est en bonne santé.
  - **Une tuile de couleur jaune** indique une instance de Contrôleur en cours d'exécution, qui n'est pas en bonne santé, par exemple en cas de défaillance du couplage dans une grappe. 
  - **La tuile de couleur rouge** indique un état *inconnu*. 
- État de la connexion à la grappe
  - **Une ligne de couleur verte** indique que la grappe est en bonne santé et que la synchronisation entre les instances de Contrôleur est active.
  - **Ligne de couleur jaune** indique une connexion à l'instance de Contrôleur d'appariement sans couplage réussi.
  - **La ligne en couleur rouge** indique une connexion défaillante entre les instances de Contrôleur.

## Opérations

### Opérations du JOC Cockpit

Opérations proposées pour toutes les instances visibles et saines du JOC Cockpit :

- **Bascule Manuelle** dans un Cluster passera le rôle actif à l'instance en attente, ce qui peut prendre de 20s à environ 60s. L'opération est proposée pour les instances en attente.
- **Mettre à jour l'URL** permet de modifier l'URL d'affichage. JOC Cockpit peut être accessible à partir d'un certain nombre d'URL et la première utilisée est affichée. Si ce n'est pas ce que souhaite l'utilisateur, il peut spécifier l'URL à afficher. L'opération ne modifie pas l'URL de JOC Cockpit mais son affichage.

Les opérations sur JOC Cockpit sont proposées pour l'instance à laquelle le navigateur est connecté :

- **Redémarrer les Services** permet de redémarrer tous les services tels que le Service Cluster, le Service Proxy, le Service Historique, etc. 
- **Redémarrer le Service** permet de redémarrer un service spécifique :
  - **Service d'Assainissement** purge la base de données des informations périmées qui ont dépassé leur période de rétention.
  - **Service Plan Quotidien** crée des Ordres pour le Plan Quotidien. Le service s'exécute une fois par jour pour créer et soumettre les Ordres au Contrôleur et aux Agents.
  - **Service Historique** reçoit l'historique des tâches et les journaux de sortie des tâches du Contrôleur via le Service Proxy.
  - **Service de Notification des logs** est un service syslog qui reçoit les erreurs et les avertissements des instances de Contrôleur et d'Agent enregistrées.
  - **Service de Surveillance** crée des notifications pour la vue *Moniteur* et envoie éventuellement des alertes par courrier.
  - **Service Proxy** établit la connexion avec l'instance active du Contrôleur. L'Historique permet d'envoyer des commandes au Contrôleur et de recevoir l'historique des tâches et le journal de sortie des tâches.
- **Démarrer Service** force l'exécution immédiate du service :
  - **Service d'Assainissement** purge la base de données.
  - **Service Plan Quotidien** crée des Ordres pour le Plan Quotidien. Le service peut être exécuté autant de fois que vous le souhaitez par jour. Une exécution individuelle n'empêchera pas le service de s'exécuter à l'heure spécifiée par ses paramètres.
- **Télécharger le Journal** permet de télécharger le fichier joc.log de JOC Cockpit au format gzip.

### Opérations du Contrôleur

Les instances de Contrôleur proposent les opérations suivantes à partir du menu d'action à 3 points dans le rectangle de chaque instance :

- **Terminer**, **Terminer et Rédemarrer** pour arrêter l'instance. Pour l'instance active d'un Cluster, le menu est élargi :
  - **avec bascule manuelle** pour passer le rôle actif à l'instance en attente.
  - **sans bascule manuelle** : pour que le rôle actif reste dans l'instance active. Les utilisateurs doivent savoir qu'aucun basculement n'aura lieu et qu'aucune instance ne sera active.
- **Annuler**, **Annuler et Redémarrer** mettent fin de force à l'instance. S'il est appliqué à l'instance active d'un Cluster, il forcera le basculement :
  - **avec bascule automatique** transmet le rôle actif à l'instance en attente.
- **Télécharger le Journal** offre le fichier controller.log du Contrôleur au format gzip.

Le rectangle d'état du Cluster permet d'effectuer les opérations suivantes à partir de son menu d'action à trois points :

- **Bascule manuelle** transmet le rôle actif à l'instance en attente. Cette opération est disponible si le Cluster est couplé.
- **Confirmer la perte de l'instance de Contrôleur** est applicable si aucune instance de JOC Cockpit n'était disponible lorsqu'une instance de Contrôleur d'un Cluster est tombée en panne. JOC Cockpit est nécessaire en tant que témoin dans le Cluster. Dans cette situation, les utilisateurs doivent vérifier quelle instance de Contrôleur était en veille au moment du crash et doivent confirmer que l'instance en veille est arrêtée pour permettre à l'instance active de reprendre.
