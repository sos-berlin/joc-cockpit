# Configuration - Inventaire - Workflow - Propriétés de Tâche

Le panneau *Workflow* permet de concevoir des Workflow à partir d'une séquence d'instructions. Les utilisateurs peuvent glisser-déposer l'*instruction Job* depuis la *barre d'outils* vers une position dans le Workflow.

L'interface graphique propose un certain nombre d'onglets pour spécifier les détails de la tâche. Le premier onglet concerne les *Propriétés de Tâche*.

## Propriétés requises pour la Tâche

Les propriétés minimales d'une tâche sont les suivantes :

- **Nom** identifie la tâche à partir d'un nom unique. Si plus d'une tâche dans le Workflow utilise le même nom, alors une seule copie de la tâche est stockée et les autres occurrences référencent la tâche en utilisant différents *Labels*.
- **Label** est un identifiant unique pour les instructions dans un Workflow. L'unicité est appliquée aux tâches et aux autres instructions. Si le même *nom de tâche* est utilisé plusieurs fois dans un Workflow, des *Labels* différentes doivent être utilisées.
- **Agent** assigne un Agent pour l'exécution de la tâche.
  - les *Agents Autonomes* sont sélectionnés à partir de leur *Nom d'Agent*.
  - les *Agents Cluster* sont spécifiés en sélectionnant le *Cluster d'Agents* et le *Cluster de Sous-Agents* souhaité.
- **Script** contient les commandes shell, les appels aux scripts et les fichiers exécutables qui sont exécutés par la tâche pour la plate-forme Unix ou Windows correspondante.

## Propriétés optionnelles de la tâche

- **Titre** décrit l'objectif de la tâche. Les utilisateurs peuvent ajouter des liens en utilisant la syntaxe markdown, par exemple \[Example\]\(https://example.com\). Le *Titre* est pris en compte lors du filtrage des résultats, par exemple dans la vue [Workflows](/workflows).
- **Ressources de Tâche** sont des objets d'inventaire qui contiennent des variables de paires clé/valeur qui peuvent être rendues disponibles à partir de variables de Workflow et de variables d'environnement. *Les Ressources de Tâche* peuvent être attribuées au niveau de la tâche et au niveau du Workflow, ce qui les rend disponibles pour tous les tâches d'un Workflow. Pour plus de détails, consultez [Configuration - Inventaire - Ressources de Tâche](/configuration-inventory-job-resources).
- **Code de retour** indique si une tâche est considérée comme un succès ou un échec. Par défaut, la valeur 0 indique un succès, les autres valeurs indiquent un échec. Un certain nombre de codes de retour peuvent être séparés par une virgule, par exemple *0,2,4,8*. Une plage de codes de retour peut être spécifiée par deux points, par exemple *0..8* ou *0,2,4,8,16..64*, séparés par une virgule. Les codes de retour négatifs sont indéfinis.
  - **Les codes de retour négatifs sont indéfinis.
  - **En cas d'échec** spécifie les codes de retour d'échec qui indiquent un échec.
  - **Ignorer** ne considère pas les codes de retour comme un indicateur de réussite ou d'échec d'une tâche.
- le **Code de retour sur avertissement** est un sous-ensemble des codes de retour réussis. Si un code de retour réussi est spécifié en tant qu'avertissement, une notification sera créée, mais le flux de l'Ordre dans le Workflow ne sera pas affecté par les avertissements.

### Catégorie de Tâche

- **Catégorie de Tâche** spécifie le type de tâche exécuté. Pour plus d'informations, consultez le site [JS7 - Job Classes](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Classes).
  - les tâches **Shell** sont exécutés avec le shell du système d'exploitation, par exemple le Shell Windows ou le Shell Unix disponible à partir de /bin/sh. Les tâches Shell peuvent inclure des commandes Shell, des appels à des scripts et des fichiers exécutables. Les tâches Shell permettent d'utiliser des langages de script tels que Node.js, Perl, Python, PowerShell, etc. Ils nécessitent l'installation d'un interpréteur avec le système d'exploitation qui peut être exécuté à partir de la ligne de commande.
  - les tâche **JVM Jobs** sont mis en œuvre dans un certain nombre de langages exploités pour une machine virtuelle Java pour laquelle l'Agent JS7 propose le site [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API). Les langages pris en charge sont les suivants :
    - *Modèles de Tâche*
      - **JITL Jobs** sont des tâches Java livrés avec JS7 et utilisés à partir de [JS7 - Integration Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Integration+Job+Templates), par exemple pour accéder à des bases de données, à des hôtes distants par SSH, etc.
    - tâches définis par l'utilisateur
      - les tâches **Java** sont exécutés dans la JVM fournie par l'Agent JS7.
      - les tâches **JavaScript** et **Python** nécessitent l'utilisation des bibliothèques Oracle® Graal Polyglot.
      de la machine virtuelle Java Oracle® GraalVM avec l'Agent JS7. Les bibliothèques fournissent le compilateur JIT.

### Variables d'environnement

Pour les tâches *Shell*, le paramétrage est disponible à partir des variables d'environnement.

- Le **nom** peut être choisi librement dans les limites du système d'exploitation, par exemple en excluant les tirets et les espaces. Une convention de dénomination fréquente inclut l'orthographe en majuscules. Sous Unix, les *Noms* sont sensibles à la casse, alors que sous Windows, ils ne le sont pas.
- La **valeur** peuvent être des entrées directes de chaînes de caractères ou de nombres. En outre, il est possible de spécifier des variables de Workflow qui sont déclarées avec le Workflow et qui sont précédées du caractère $ comme dans *$variable*. L'orthographe des variables de Workflow est sensible à la casse.

## Propriétés de la tâche disponibles dans *Plus d'options*

La vue *Configuration - Inventaire* propose le curseur *Plus d'options* en haut de la fenêtre, qui est inactif par défaut. L'utilisation de ce curseur permet d'accéder à des options supplémentaires.

- **Documentation** contient une référence à [Ressources - Documentations](/resources-documentations) qui peut être utilisée pour expliquer la tâche. La référence à la documentation est visible dans la vue [Workflows](/workflows).

## Références

### Aide contextuelle

- [Configuration - Inventaire - Ressources de Tâche](/configuration-inventory-job-resources)
- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
  - [Configuration - Inventaire - Workflow - Options de Tâche](/configuration-inventory-workflows-job-options)
  - [Configuration - Inventaire - Workflow - Propriétés du Nœud de Tâche](/configuration-inventory-workflows-job-node-properties)
  - [Configuration - Inventaire - Workflow - Notifications de Tâche](/configuration-inventory-workflows-job-notifications)
  - [Configuration - Inventaire - Workflow - Tags Tâche](/configuration-inventory-workflows-job-tags)
- [Ressources - Documentations](/resources-documentations)

### Product Knowledge Base

- [JS7 - Integration Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Integration+Job+Templates)
- [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API)
- [JS7 - Job Classes](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Classes)
- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
