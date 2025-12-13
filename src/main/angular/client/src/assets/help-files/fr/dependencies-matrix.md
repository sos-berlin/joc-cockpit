# Matrice de dépendance

Les objets de l'inventaire JS7 sont liés par des dépendances. Par exemple, un Workflow référençant une ressource de tâche et un Verrou de Ressource ; une Plannification référençant un Calendrier et un ou plusieurs Workflows.

Lors du déploiement des objets, la cohérence est prise en compte, par exemple :

- Si une ressource de tâche est créée et est référencée par un Workflow nouvellement créé, alors le déploiement du Workflow inclut le déploiement de la ressource d'emploi.
- Si une ressource de tâche est référencée par un Workflow déployé et doit être révoquée ou supprimée, le Workflow doit également être révoqué ou supprimé.

Pour plus de détails, consultez [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies).

La matrice de dépendance des objets d'inventaire se présente comme suit :

la matrice de dépendance des objets d'inventaire se présente de la manière suivante : | Domaine | Type d'objet | Références entrantes | | Références sortantes | | | | | | |
| ----- | ----- | ----- | ----- |
| Contrôleur
| Workflow | Plannification | Workflow | Resource de Tâche | Tableau de Condition | Verrous de Ressource| Modèle de Tâche | Script Include |
| Source de l'Ordre des Fichiers | | | Workflow |
| Modèle de tâche - Inclure le script - Source d'Ordres de fichier - Workflow - Inclure le script - Inclure le modèle de tâche
| | Tableau de Condition | Workflow
| Workflow | Verrouillage des Ressources | Workflow | Automatisation | Verrouillage des Ressources
| Automatisation
| Calendrier | Plannification | | Workflow | Calendrier
| Calendrier | Plannification
| Modèle de tâche - Workflow
| Workflow - Inclure un script - Workflow - Inclure un script - Workflow - Inclure un script - Workflow - Inclure un script - Workflow - Inclure un script - Workflow

## Références

### Aide contextuelle

- [Configuration - Inventory - Operations - Deploy Folder](/configuration-inventory-operations-deploy-folder)
- [Configuration - Inventory - Operations - Deploy Object](/configuration-inventory-operations-deploy-object)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

