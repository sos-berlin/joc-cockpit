# Configuration - Inventaire - Opérations - Git - Cloner le dépôt

Les objets de l'inventaire peuvent être déployés à l'aide de dépôts Git, voir [JS7 - Inventory Git Integration](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Git+Integration).

Cela inclut les opérations Git pour commettre, pousser et tirer des objets.

Les dépôts Git sont associés à des dossiers d'inventaire de premier niveau. 

- L'opération initiale consiste à cloner un référentiel distant vers un référentiel local géré par JOC Cockpit.
-<jetty-base\> Les référentiels de JOC Cockpit sont situés dans le répertoire *COPY00 /resources/joc/repositories* du système de fichiers. 
  - Le sous-répertoire *local* indique un référentiel utilisé pour les objets locaux à une instance de JOC Cockpit, par exemple, les Job Resources qui contiennent des paramètres spécifiques à un environnement.
  - Le sous-répertoire *rollout* indique un référentiel utilisé pour les objets qui seront déployés dans d'autres environnements, par exemple les Workflows qui doivent être utilisés dans tous les environnements sans modification.
  - Pour la correspondance entre les types d'objets d'inventaire et les types de référentiels Git, voir [Réglages - Git](/settings-git).
- Les utilisateurs peuvent accéder aux référentiels du JOC Cockpit à partir du système de fichiers et peuvent utiliser un client Git pour des opérations connexes, par exemple la gestion des branches.

L'opération *Clone* est disponible à partir du panneau *Navigation* et est proposée pour les dossiers de premier niveau à partir de leur menu d'action à 3 points. La hiérarchie du menu comprend *Dépôt Git-&gt;Local|Rollout-&gt;Git-&gt;Clone*.

## Cloner le dépôt

<img src="git-clone.png" alt="Git Clone Repository" width="400" height="130" />

Le champ de saisie attend l'URL Git utilisée pour le clonage, par exemple, *git@github.com:sos-berlin/js7-demo-inventory-rollout.git*

- *git@* est un préfixe constant,
- *github.com* spécifie le nom d'hôte du serveur Git,
- *sos-berlin* est le propriétaire du dépôt,
- *js7-demo-inventory-rollout* est le nom du dépôt,
- *.git* est un suffixe constant.

Les valeurs ci-dessus sont données à titre d'exemple. Veuillez spécifier les valeurs correspondant au serveur Git souhaité.

## Références

### Aide contextuelle

- [Matrice des Dépendances](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
- [JS7 - Inventory Git Integration](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Git+Integration)
- [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface)

