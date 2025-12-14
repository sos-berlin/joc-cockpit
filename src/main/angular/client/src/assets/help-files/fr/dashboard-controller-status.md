# Tableau de Bord - État des Contrôleurs

L'affichage *État des Contrôleurs* fournit des informations sur les Contrôleurs enregistrés.

## Instances du Contrôleur

Chaque instance de Contrôleur affichée présente les données suivants :

- **Identifiant du Contrôleur** indique un identifiant unique spécifié lors de l'installation d'un Contrôleur. Dans un Cluster de Contrôleurs, toutes les instances partagent le même ID de Contrôleur.
- **L'URL** indique l'URL permettant d'accéder à l'instance de Contrôleur.
- **Status** indique l'état du composant, à savoir *opérationnel* ou *inconnu* si l'instance de Contrôleur n'est pas accessible.
- **Noeud Cluster** indique le rôle *actif* ou *standby* d'une instance de Contrôleur dans un Cluster.

En cliquant sur l'ID du Contrôleur d'une instance, le tableau de bord affiche l'état du produit du Contrôleur concerné.

## Opérations sur les instances de Contrôleur

Les opérations suivantes sont disponibles :

Les instances de Contrôleur offrent les opérations suivantes à partir du menu d'action à 3 points de chaque instance :

- **Terminer**, **Terminer et Redémarrer** pour arrêter l'instance. Pour l'instance active d'un Cluster, le menu est élargi :
  - **avec bascule automatique** pour passer le rôle actif à l'instance en attente.
  - **sans bascule automatique** : pour que le rôle actif reste dans l'instance arrêtée. Les utilisateurs doivent savoir qu'aucun basculement n'aura lieu et qu'aucune instance ne sera active.
- **Annuler**, **Annuler et Redémarrer** mettent fin de force à l'instance. S'il est appliqué à l'instance active d'un Cluster, il forcera le basculement :
  - **avec bascule automatique** transmet le rôle actif à l'instance en attente.
- **Télécharger** le fichier controller.log du Contrôleu au format .gzip.

## Références

- [Tableau de Bord - État du Produit](/dashboard-product-status)
