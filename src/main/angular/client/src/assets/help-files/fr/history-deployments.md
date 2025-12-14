# Historique des Déploiements

La vue *Historique des Déploiements* résume les déploiements des objets de l'inventaire.

JS7 met en œuvre une architecture distribuée qui permet d'exécuter des tâches du même Workflow sur différents Agents et plates-formes. Un déploiement réussi comprend la confirmation par chaque Agent des nouveaux objets et des objets mis à jour, qui arrive de manière asynchrone.

Lorsque vous utilisez l'opération *Deployer* dans la vue *Configuration*, la confirmation arrivera en fonction de la disponibilité de l'Agent. Par exemple, un Agent arrêté confirmera le déploiement lorsqu'il sera redémarré, ce qui peut se produire quelque temps plus tard.

L'*Historique des Déploiements* est mis à jour de manière asynchrone pour refléter l'état de déploiement des objets de l'inventaire.

## Historique

### Historique des Déploiements

L'affichage est regroupé en un bloc par déploiement et en blocs par objet d'inventaire.

- **Date de déploiement** indique le moment du déploiement.
- **Compte** indique le compte d'utilisateur du JOC Cockpit qui a effectué l'opération de déploiement.
- **Etat** indique si le déploiement a réussi ou échoué.
  - *Deployed* indique que tous les objets de l'inventaire ont été déployés avec succès.
  - *Not Deployed* indique qu'un ou plusieurs objets d'inventaire n'ont pas pu être déployés.
- **Nombre d'entrées** indique le nombre d'objets d'inventaire tels que les Workflows, les Ressources de Tâche, etc. dans le champ d'application du déploiement.

### Historique des Déploiements par objet d'inventaire

Lorsque vous cliquez sur l'icône de la flèche vers le bas à partir de la *Date de déploiement*, les détails de chaque objet d'inventaire s'affichent :

- **Message** indique un message d'erreur en cas d'échec du déploiement.
- **Type d'objet** indique le type d'objet d'inventaire tel que *Workflow*, *Resource de Tâche* etc.
- **Chemins** indique le dossier d'inventaire et le nom de l'objet. Pour les objets Workflow
  - en cliquant sur le nom du Workflow, vous accédez à la vue [Workflows](/workflows),
  - en cliquant sur l'icône du crayon, vous accédez à la vue [Configuration - Inventaire - Workflows](/configuration-inventory-workflows).
- **Opération** est l'une des deux options suivantes : *stocker* ou *supprimer*. Les deux opérations permettent de mettre à jour les objets.
- **Date** indique le moment de l'opération de déploiement.

## Références

- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
- [Workflows](/workflows)
- [JS7 - Deployment of Scheduling Objects](https://kb.sos-berlin.com/display/JS7/JS7+-+Deployment+of+Scheduling+Objects)
