# Tableau de Bord - Workflow

L'affichage *Workflows* fournit des informations sur l'état des Workflows.

<img src="dashboard-workflows.png" alt="Workflows" width="330" height="80" />

## Statut du Workflow

Les Workflows sont affichés à partir des statuts suivants :

- **Synchronisé** Les Workflows sont déployés et sont disponibles avec le Contrôleur et les Agents.
- **Non synchronisé** Les Workflows ne sont pas déployés auprès du Contrôleur et des Agents mais sont disponibles à partir de l'inventaire uniquement.
- **Les Workflows suspendus** sont gelés, ils acceptent les Ordres mais n'autorisent pas le démarrage des Ordres jusqu'à ce que les Workflows reprennent.
- **Les Workflows en suspens** attendent la confirmation par un ou plusieurs Agents que le Workflow est suspendu.

En cliquant sur le nombre de Workflows indiqué, vous accédez à la vue *Workflows* qui affiche les Workflows à l'aide du filtre correspondant.

## Références

- [Workflows](/workflows)
- [JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows)
