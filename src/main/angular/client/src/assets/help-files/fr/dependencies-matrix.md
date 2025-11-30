# Matrice de dépendance

Les objets de l'inventaire JS7 sont liés par des dépendances. Par exemple, un Workflow référençant une ressource de travail et un verrou de ressource ; une Plannification référençant un calendrier et un ou plusieurs Workflows.

Lors du déploiement des objets, la cohérence est prise en compte, par exemple :

- Si une ressource d'emploi est créée et est référencée par un Workflow nouvellement créé, alors le déploiement du Workflow inclut le déploiement de la ressource d'emploi.
- Si une ressource d'emploi est référencée par un Workflow déployé et doit être révoquée ou supprimée, le Workflow doit également être révoqué ou supprimé.

Pour plus de détails, consultez [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies).

La matrice de dépendance des objets d'inventaire se présente comme suit :

la matrice de dépendance des objets d'inventaire se présente de la manière suivante : | Domaine | Type d'objet | Références entrantes | | Références sortantes | | | | | | |
| ----- | ----- | ----- | ----- |
| Contrôleur
| Workflow | Plannification | Workflow | Job Resource | Notice Board | Resource Lock | Job Template | Script Include |
| Source de l'Ordre des Fichiers | | | Workflow |
| Modèle de travail - Inclure le script - Source de la commande de fichier - Workflow - Inclure le script - Inclure le modèle de travail
| | Tableau d'affichage | Workflow
| Workflow | Verrouillage des ressources | Workflow | Automatisation | Verrouillage des ressources
| Automatisation
| Calendrier | Plannification | | Workflow | Calendrier
| Calendrier | Plannification
| Modèle de travail - Workflow
| Workflow - Inclure un script - Workflow - Inclure un script - Workflow - Inclure un script - Workflow - Inclure un script - Workflow - Inclure un script - Workflow

## Références

### Aide contextuelle

- [Configuration - Inventory - Operations - Deploy Folder](/configuration-inventory-operations-deploy-folder)
- [Configuration - Inventory - Operations - Deploy Object](/configuration-inventory-operations-deploy-object)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

