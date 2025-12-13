# État du Contrôleur

L'affichage *État des Contrôleurs* fournit des informations sur les Contrôleurs enregistrés.

## Instances du Contrôleur

Chaque instance de Contrôleur affichée présente les données suivants :

- **Identifiant du Contrôleur** indique un identifiant unique spécifié lors de l'installation d'un Contrôleur. Dans un groupe de Contrôleurs, toutes les instances partagent le même ID de Contrôleur.
- **L'URL** indique l'URL permettant d'accéder à l'instance de Contrôleur.
- **Status** indique l'état du composant, à savoir *opérationnel* ou *inconnu* si l'instance de Contrôleur n'est pas accessible.
- **Noeud Cluster** indique le rôle *actif* ou *standby* d'une instance de Contrôleur dans un cluster.

En cliquant sur l'ID du Contrôleur d'une instance, le tableau de bord affiche l'état du produit du Contrôleur concerné.

## Opérations sur les instances de Contrôleur

Les opérations suivantes sont disponibles :

Les instances de Contrôleur offrent les opérations suivantes à partir du menu d'action à 3 points de chaque instance :

- **Terminer**, **Terminer et Redémarrer** pour arrêter l'instance. Pour l'instance active d'un cluster, le menu est élargi :
  - **avec basculement** pour passer le rôle actif à l'instance en attente.
  - **sans basculement** : pour que le rôle actif reste dans l'instance arrêtée. Les utilisateurs doivent savoir qu'aucun basculement n'aura lieu et qu'aucune instance ne sera active.
- les options **Avorter**, **Avorter et redémarrer** mettent fin de force à l'instance. S'il est appliqué à l'instance active d'un cluster, il forcera le basculement :
  - **avec basculement** transmet le rôle actif à l'instance en attente.
- **Le fichier controller.log du Contrôleur peut être téléchargé à partir d'un fichier .gz au format gzip.

## Références

- [Dashboard - Product Status](/dashboard-product-status)

