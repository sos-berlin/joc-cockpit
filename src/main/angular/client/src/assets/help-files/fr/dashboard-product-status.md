# Statut du produit

Le panneau Statut du produit fournit des informations sur les produits JS7 suivants :

- **JOC Cockpit** est utilisé pour surveiller et contrôler l'environnement de planification et pour gérer l'inventaire des travaux.
- **Controller** orchestre les agents et gère le déploiement des Ordres, des Workflows et des Jobs.
- **Les agents exécutent les travaux. 

Les produits JS7 peuvent être exploités de manière autonome et dans le cadre d'un clustering actif-passif.

## État des composants et état des connexions

### Cockpit JOC

Le JOC Cockpit se connecte à la base de données et aux instances du contrôleur.

- État du composant
  - L'état du composant est indiqué par la couleur de la tuile dans le coin supérieur gauche du rectangle du JOC Cockpit.
  - **Une tuile de couleur verte** indique que l'instance du JOC Cockpit est en bonne santé.
  - **Une tuile de couleur rouge indique un état inconnu. 
- État de la connexion à la base de données
  - **Une ligne de couleur verte** indique que la connexion est saine.
  - **Une ligne de couleur jaune** indique des problèmes de connexion, par exemple si JOC Cockpit ne reçoit pas de battements de cœur de la base de données.
- État de la connexion du contrôleur
  - **Une ligne de couleur verte** indique que la connexion avec le contrôleur est saine.
  - **Une ligne de couleur rouge indique un échec de la connexion au contrôleur.

### Contrôleur

Le contrôleur se connecte aux instances d'agents. Dans un groupe de contrôleurs, ses membres ont des connexions bidirectionnelles.

- État du composant
  - L'état du composant est indiqué par la couleur de la tuile dans le coin supérieur gauche du rectangle du contrôleur.
  - **Une tuile de couleur verte** indique que l'instance du contrôleur est en bonne santé.
  - **Une tuile de couleur jaune** indique une instance de contrôleur en cours d'exécution, qui n'est pas en bonne santé, par exemple en cas de défaillance du couplage dans une grappe. 
  - **La tuile de couleur rouge** indique un état *inconnu*. 
- État de la connexion à la grappe
  - **Une ligne de couleur verte** indique que la grappe est en bonne santé et que la synchronisation entre les instances de contrôleur est active.
  - **Ligne de couleur jaune** indique une connexion à l'instance de contrôleur d'appariement sans couplage réussi.
  - **La ligne en couleur rouge** indique une connexion défaillante entre les instances de contrôleur.

## Opérations

### Opérations du cockpit JOC

Opérations proposées pour toutes les instances visibles et saines du JOC Cockpit :

- **Switch-over** dans un cluster passera le rôle actif à l'instance en attente, ce qui peut prendre de 20s à environ 60s. L'opération est proposée pour les instances en attente.
- **La mise à jour de l'URL** permet de modifier l'URL d'affichage. JOC Cockpit peut être accessible à partir d'un certain nombre d'URL et la première utilisée est affichée. Si ce n'est pas ce que souhaite l'utilisateur, il peut spécifier l'URL à afficher. L'opération ne modifie pas l'URL de JOC Cockpit mais son affichage.

Les opérations sur JOC Cockpit sont proposées pour l'instance à laquelle le navigateur est connecté :

- **Restart Services** permet de redémarrer tous les services tels que le service Cluster, le service Proxy, le service Historique, etc. 
- **Redémarrer un service** permet de redémarrer un service spécifique :
  - **Service de nettoyage** purge la base de données des informations périmées qui ont dépassé leur période de rétention.
  - **Service Plan Quotidien** crée des Ordres pour le Plan Quotidien. Le service s'exécute une fois par jour pour créer et soumettre les Ordres au contrôleur et aux agents.
  - **Le service Historique** reçoit l'historique des travaux et les journaux de sortie des travaux du contrôleur via le service Proxy.
  - **Le service de notification des journaux** est un service syslog qui reçoit les erreurs et les avertissements des instances de contrôleur et d'agent enregistrées.
  - le **Monitor Service** crée des notifications pour la vue *Monitor* et envoie éventuellement des alertes par courrier.
  - **Le Service Proxy** établit la connexion avec l'instance active du contrôleur. L'Historique permet d'envoyer des commandes au Contrôleur et de recevoir l'historique des tâches et le journal de sortie des tâches.
- **Service d'exécution** force l'exécution immédiate d'un service :
  - **Service de nettoyage** purge la base de données.
  - service de nettoyage** purge la base de données. **Service Plan Quotidien** crée des Ordres pour le Plan Quotidien. Le service peut être exécuté autant de fois que vous le souhaitez par jour. Une exécution individuelle n'empêchera pas le service de s'exécuter à l'heure spécifiée par ses paramètres.
- **Télécharger le journal** permet de télécharger le fichier joc.log de JOC Cockpit à partir d'un fichier .gz au format gzippé.

### Opérations du contrôleur

Les instances de contrôleur proposent les opérations suivantes à partir du menu d'action à 3 points dans le rectangle de chaque instance :

- **Terminate**, **Terminate and Restart** pour arrêter l'instance. Pour l'instance active d'un cluster, le menu est élargi :
  - **avec basculement** pour passer le rôle actif à l'instance en attente.
  - **sans basculement** : pour que le rôle actif reste dans l'instance active. Les utilisateurs doivent savoir qu'aucun basculement n'aura lieu et qu'aucune instance ne sera active.
- les options **Annuler**, **Annuler et redémarrer** mettent fin de force à l'instance. S'il est appliqué à l'instance active d'un cluster, il forcera le basculement :
  - **avec basculement** transmet le rôle actif à l'instance en attente.
- **Le fichier controller.log du contrôleur peut être téléchargé à partir d'un fichier .gz au format gzippé.

Le rectangle d'état de la grappe permet d'effectuer les opérations suivantes à partir de son menu d'action à trois points :

- **Switch-over** transmet le rôle actif à l'instance en attente. Cette opération est disponible si le cluster est couplé.
- **Confirmer la perte de l'instance de contrôleur** est applicable si aucune instance de JOC Cockpit n'était disponible lorsqu'une instance de contrôleur d'un cluster est tombée en panne. JOC Cockpit est nécessaire en tant que témoin dans le cluster. Dans cette situation, les utilisateurs doivent vérifier quelle instance de contrôleur était en veille au moment du crash et doivent confirmer que l'instance en veille est arrêtée pour permettre à l'instance active de reprendre.

