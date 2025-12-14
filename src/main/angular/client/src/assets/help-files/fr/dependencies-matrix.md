# Matrice de Dépendance

Les objets de l'inventaire JS7 sont liés par des dépendances. Par exemple, un Workflow référençant une Ressource de Tâche et un Verrou de Ressource ; une Planification référençant un Calendrier et un ou plusieurs Workflows.

Lors du déploiement des objets, la cohérence est prise en compte, par exemple :

- Si une Ressource de Tâche est créée et est référencée par un Workflow nouvellement créé, alors le déploiement du Workflow inclut le déploiement de la Ressource de Tâche.
- Si une Ressource de Tâche est référencée par un Workflow déployé et doit être révoquée ou supprimée, le Workflow doit également être révoqué ou supprimé.

Pour plus de détails, consultez [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies).

La matrice de dépendance des objets d'inventaire se présente comme suit :

la matrice de dépendance des objets d'inventaire se présente de la manière suivante :

| Domaine | Type d'objet | Références entrantes |      | Références sortantes |      |      |      |      |      |      |
| ----- | ----- | ----- | ----- |
| Contrôleur  |
|      | Workflow | Workflow | Planification | Workflow | Resource de Tâche | Tableau de Condition | Verrou de Ressource | Modèle de Tâche | Bloc Script |
|      | Source de l'Ordre des Fichiers |      |      | Workflow |
|      | Resource de Tâche | Workflow |
|      | Tableau de Condition | Workflow |
|      | Verrou de Ressource | Workflow |
| Automatisation |
|      | Planification |      |      | Workflow | Calendrier |
|      | Calendrier | Planification |
|      | Modèle de Tâdche | Workflow |
|      | Bloc Script | Workflow |

## Références

### Aide contextuelle

- [Configuration - Inventaire - Opérations - Deployer Dossier](/configuration-inventory-operations-deploy-folder)
- [Configuration - Inventaire - Opérations - Deployer Objet](/configuration-inventory-operations-deploy-object)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
