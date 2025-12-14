# Configuration - Inventaire - Workflow

La vue *Inventaire-&gt;Workflow* permet de concevoir des Workflows à partir d'une séquence d'instructions qui façonnent le Workflow pour un [Directed acyclic graph] (https://en.wikipedia.org/wiki/Directed_acyclic_graph). 

- Les utilisateurs peuvent glisser-déposer des instructions à partir de la *barre d'outils* pour créer des modèles de Workflow tels qu'une séquence de tâches, des tâches de bifurcation et de jonction, une exécution conditionnelle, etc.
- La page [Configuration - Inventaire - Navigation](/configuration-inventory-navigation) permet de naviguer par Tags et par dossiers. En outre, la vue permet d'effectuer des opérations sur les Workflows.

## Barre d'outils

La *barre d'outils* contient les instructions suivantes :

- **Job** met en œuvre une tâche. Les Workflows peuvent inclure un nombre quelconque de Jobs. Pour plus d'informations, consultez le site [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction).
- L'instruction **Try/Catch** met en œuvre la gestion des exceptions à partir d'un bloc *Try* qui contient des Jobs ou d'autres instructions. Si une tâche échoue, les instructions du bloc *Catch* sont exécutées. Un bloc *Catch* vide résoudra l'état d'erreur d'une instruction ayant échoué précédemment. Pour plus d'informations, consultez le site [JS7 - Try-Catch Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Try-Catch+Instruction).
- L'instruction **Retry** met en œuvre l'exécution répétée d'une séquence de tâches ou d'autres instructions en cas d'échec. Si l'un des Jobs du bloc *Retry* échoue, l'Ordre est déplacé au début du bloc *Retry* pour répéter l'exécution. Pour plus de détails, voir [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction).
- L'instruction **Finish** fait en sorte qu'un Ordre quitte le Workflow avec un résultat positif ou négatif dans [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History). Pour plus de détails, voir [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction).
- L'instruction **Fail** fait échouer un Ordre. Sans traitement d'erreur supplémentaire, l'Ordre restera dans l'état *échoué*, voir [États d'Ordre](/order-states). Une instruction *Try/Catch* ou *Retry* est déclenchée par l'instruction *Fail*. Pour plus de détails, voir [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction).
- l'instruction **Fork** permet aux Ordres d'être bifurqués et joints pour permettre le traitement parallèle des Jobs et d'autres instructions dans un Workflow. Les branches sont créées en faisant glisser et en déposant des instructions sur l'instruction *Fork*. Lorsqu'un Ordre entre dans la *Instruction de tâche*, un Ordre enfant est créé pour chaque branche. Pour plus de détails, consultez le site [JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction).
  - Chaque Ordre enfant transmettra les nœuds de sa branche indépendamment des Ordres enfants parallèles.
  - Les Ordres enfants peuvent renvoyer des résultats aux Ordres parents en leur transmettant des variables.
  - Les Ordres enfants jouent le rôle des Ordres parents dans les *Instructions fourchettes* imbriquées.
- l'instruction **ForkList** est la version dynamique de l'instruction *Fork* et se présente sous les formes suivantes :
  - L'instruction attend d'un Ordre qu'il fournisse une *variable de liste* qui est implémentée comme une liste (tableau) de valeurs. La liste peut comprendre n'importe quel nombre de paires nom/valeur (variables). L'instruction *ForkList* est conçue comme une branche unique : en fonction du nombre d'entrées fournies avec la *variable de liste* portée par l'Ordre, l'Agent créera dynamiquement des branches pour chaque entrée de la *variable de liste*. Cela permet par exemple d'exécuter des tâches pour chaque entrée d'une *variable de liste*. Pour plus de détails, voir [JS7 - ForkList-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction).
  - L'instruction permet de créer dynamiquement un certain nombre d'Ordres enfants et de branches et d'exécuter la même séquence de Jobs ou d'autres instructions sur un certain nombre de Sous-agents : les utilisateurs peuvent exécuter les mêmes Jobs en parallèle sur un certain nombre de serveurs ou de conteneurs exploitant des Sous-agents. Les cas d'utilisation comprennent par exemple l'exécution de tâches de sauvegarde similaires sur un plus grand nombre de serveurs. Pour plus d'informations, consultez le site [JS7 - ForkList-Join Instruction for Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction+for+Agent+Clusters).
- L'instruction **Cycle** offre une exécution répétée de tout ou partie des Jobs et autres instructions d'un Workflow. Il s'agit d'une instruction en bloc qui peut générer un Workflow complet ou des Jobs et instructions sélectionnés dans un Workflow. L'instruction *Cycle* peut être imbriquée. Pour plus de détails, consultez le site [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction).
- L'instruction **Break** est utilisée dans une *instruction Cycle* pour mettre fin au cycle et faire en sorte qu'un Ordre quitte le cycle. Pour plus de détails, voir [JS7 - Break Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Break+Instruction).
- L'instruction **Lock** est une instruction de bloc utilisée pour spécifier un ou plusieurs tâches et d'autres instructions en vue d'une exclusion mutuelle, afin d'empêcher l'exécution de tâches en parallèle dans le même Workflow ou dans des Workflows différents. *Les instructions de verrouillage* peuvent être imbriquées. Pour plus de détails, voir [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction).
- L'instruction **Sleep** est utilisée pour retarder la poursuite du traitement dans un Workflow d'une durée spécifiée en secondes. Pour plus de détails, voir [JS7 - Sleep Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Sleep+Instruction).
- L'instruction **Prompt** interrompt l'exécution d'un Ordre dans un Workflow jusqu'à ce que le *Prompt* soit confirmée. L'Ordre est assigné à l'état *prompting*. Les utilisateurs peuvent confirmer ou annuler les Ordres *prompting*, voir [États d'Ordre](/order-states). Pour plus de détails, voir [JS7 - Prompt Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Prompt+Instruction).
- l'instruction **AdmissionTimes** interrompt l'exécution d'un Ordre dans un Workflow jusqu'à ce que le créneau horaire donné soit atteint. L'Ordre se voit attribuer l'état *attente*. En outre, les Ordres peuvent être interrompus s'ils dépassent le temps imparti. L'instruction peut être configurée de manière à ce qu'un Ordre ignore toutes les instructions incluses dans le cas où aucun créneau horaire correspondant n'est trouvé pour la date du plan journalier de l'Ordre. Pour plus de détails, consultez [[JS7 - AdmissionTime Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AdmissionTime+Instruction).
- l'instruction **AddOrder** est utilisée dans un Workflow pour créer un Ordre pour un autre Workflow. Par défaut, les Ordres ajoutés sont exécutés de manière asynchrone dans un Workflow séparé et en parallèle avec l'Ordre actuel, c'est-à-dire que le résultat de leur exécution n'est pas synchronisé et n'a pas d'impact sur l'Ordre actuel. Si l'exécution de l'Ordre ajouté est synchronisée, les instructions *ExpectNotices* et *ConsumeNotices* peuvent être utilisées. Pour plus de détails, voir [JS7 - AddOrder Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AddOrder+Instruction).
- l'instruction **PostNotices** est utilisée pour créer un ou plusieurs avis pour les tableaux d'affichage. Les avis sont attendus par les instructions *ExpectNotices* et *ConsumeNotices* correspondantes d'un même Workflow ou de différents Workflows. Un Workflow peut inclure un nombre quelconque d'instructions *PostNotices* pour publier des avis sur le même tableau d'affichage ou sur des tableaux d'affichage différents. La publication d'un avis ne bloque pas la poursuite de l'exécution d'un Ordre dans un Workflow. L'Ordre se poursuit immédiatement après la publication de l'avis. Pour plus de détails, voir [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction).
- l'instruction **ExpectNotices** est utilisée pour vérifier si des avis sont disponibles sur un ou plusieurs tableaux d'affichage ajoutés par une instruction *PostNotices* ou par l'utilisateur. Si l'avis n'existe pas, l'Ordre restera en *attente* avec l'instruction. Un Workflow peut inclure un nombre quelconque d'instructions *ExpectNotices* pour attendre des avis provenant du même tableau d'affichage ou de tableaux d'affichage différents. Pour plus de détails, voir [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction).
- l'instruction **ConsumeNotices** est utilisée pour que les Ordres attendent des avis d'un ou de plusieurs tableaux d'affichage ajoutés par une instruction *PostNotices* ou par l'utilisateur. L'instruction *ConsumeNotices* est une instruction en bloc qui peut inclure d'autres instructions et qui supprime les avis attendus lorsque l'Ordre arrive à la fin du bloc d'instructions. Pour plus de détails, voir [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction).
- L'instruction **If** est une instruction de bloc utilisée pour le traitement conditionnel dans un Workflow. Elle permet de vérifier les codes de retour et les valeurs de retour des Ordres précédents et d'évaluer les variables de l'Ordre. Pour plus de détails, voir [JS7 - If Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+If+Instruction).
- L'instruction **Case** est utilisée pour le traitement conditionnel des tâches et d'autres instructions dans un Workflow. Cette instruction étend l'instruction *If*. L'instruction *Case* peut être utilisée avec des instructions *Case-When* répétées et éventuellement avec une instruction *Case-Else* unique. Pour plus de détails, voir [JS7 - Case Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Case+Instruction).
- L'instruction **CaseWhen** est utilisée pour vérifier un prédicat similaire à l'instruction *If*. L'instruction peut apparaître autant de fois que vous le souhaitez dans une *Instruction Cas*.
- L'instruction **CaseElse** est utilisée si toutes les vérifications des instructions *CaseWhen* échouent.
- l'instruction **StickySubagent** peut être utilisée pour exécuter un certain nombre de tâches avec le même Sous-Agent d'un Cluster d'Agents. L'instruction de bloc vérifie le premier Sous-Agent disponible d'une Cluster de Sous-Agents. Ce Sous-Agent sera utilisé pour les tâches suivants au sein de l'instruction en bloc. L'utilisation des Cluster d'Agents est soumise aux conditions d'utilisation des Cluster d'Agents sur le site [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License). Pour plus d'informations, consultez le site [JS7 - StickySubagent Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+StickySubagent+Instruction+for+Agent+Clusters).
- l'instruction **Options** est une instruction de bloc qui régit la gestion des erreurs pour l'instruction *Lock* et l'instruction *ConsumeNotices*. Si l'instruction *Options* est en place et spécifie la propriété *Stop on Failure*, les Ordres *échoués* resteront avec l'instruction défaillante, par exemple un Job. Si l'instruction n'est pas en place, les Ordres qui échouent dans une *Instruction Lock* ou une *Instruction ConsumeNotices* seront déplacés au début du bloc d'instructions et resteront dans l'état *échoué*. Pour plus de détails, voir [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction).
- **Coller** permet de glisser-déposer une instruction précédemment copiée ou coupée dans le Workflow.

## Panneau Workflow

Le panneau contient la représentation graphique d'un Workflow.

- Les utilisateurs peuvent faire glisser et déposer des instructions de la *barre d'outils* vers le Workflow.
  - Pour glisser-déposer la première instruction d'un Workflow, les utilisateurs maintiennent la touche de la souris enfoncée et déposent l'instruction dans la zone de dépôt indiquée du Workflow.
  - Pour glisser-déposer d'autres instructions, maintenez la touche de la souris enfoncée, naviguez jusqu'à la ligne de connexion souhaitée entre les instructions et relâchez la touche de la souris.
- Pour l'instruction *Fork*, les utilisateurs peuvent glisser-déposer une instruction *Job* directement sur le nœud *Fork* pour créer une nouvelle branche.
- Pour l'instruction *If*, les utilisateurs peuvent faire glisser et déposer une instruction *Job* directement sur le bloc *If* : la première instruction représente la branche *vraie*, la seconde instruction glissée et déposée pour créer la branche *Sinon*.

Les Workflows sont automatiquement enregistrés dans l'inventaire. Cela se produit toutes les 30 secondes et lorsque vous quittez la vue *Workflow*.

Pour un Workflow, les entrées suivantes sont disponibles :

- **Nom** est l'identifiant unique d'un Workflow, voir [Règles de Dénomination des Objets](/object-naming-rules).
- **Titre** contient une explication facultative de l'objectif du Workflow.
- les **Ressources de Tâche** sont des objets d'inventaire qui contiennent des variables de paires clé/valeur qui peuvent être rendues disponibles à partir des variables de Workflow et des variables d'environnement. *Les Ressources de Tâche* peuvent être attribuées au niveau de la Tâche et au niveau du Workflow, ce qui les rend disponibles pour tous les Tâches d'un Workflow. Pour plus d'informations, consultez [Configuration - Inventaire - Ressources de Tâche](/configuration-inventory-job-resources).
- **Fuseau horaire** qui est renseigné à partir de l'adresse [Profil - Préférences](/profile-preferences) de l'utilisateur. Les identifiants de fuseaux horaires sont acceptés comme *UTC*, *Europe/London*, etc. Pour une liste complète des identificateurs de fuseaux horaires, voir [Liste des fuseaux horaires de la base de données tz] (https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).
  - Le *fuseau horaire* est appliqué aux périodes dans les délais d'admission et dans l'*instruction Cycle*.
  - Il est possible d'utiliser un *fuseau horaire* différent de celui de la base de données [Réglages - Plan Quotidien](/settings-daily-plan). Toutefois, cela peut entraîner des résultats déroutants.
- **Autoriser les variables non déclarées** permet d'utiliser des variables d'Ordre qui ne sont pas déclarées avec le Workflow. Cela signifie que les Ordres peuvent contenir des variables dont le type de données n'a pas été vérifié et dont l'utilisation n'est pas obligatoire. Les Jobs échoueront lorsqu'ils feront référence à des variables non déclarées qui ne sont pas disponibles dans un Ordre.

### Variables du Workflow

Les variables de Workflow sont déclarées dans le Workflow et sont utilisées pour paramétrer l'exécution des taches :

- Les variables obligatoires sont déclarées par le Workflow sans valeur par défaut. Les Ordres ajoutés au Workflow doivent spécifier des valeurs pour les variables obligatoires.
- Les variables optionnelles sont déclarées par le Workflow avec une valeur par défaut. Les Ordres ajoutés au Workflow peuvent spécifier des valeurs, sinon la valeur par défaut est utilisée.

Pour les variables de Workflow, les types de données suivants sont proposés :

- **Caractères** contient n'importe quel caractère. Les valeurs peuvent être entourées de guillemets simples.
  - Valeurs constantes : *hello world*
  - Fonctions : *now( format='yyyy-MM-dd hh:mm:ss', timezone='Europe/London' )*, *env('HOSTNAME')*
- **Nombre** contient des nombres entiers et des nombres flottants tels que 3.14.
- **Booléen** sont *vrai* ou *faux*.
- **Final** les valeurs sont évaluées par le Contrôleur lorsqu'un Ordre est ajouté. Les autres types de données sont évalués par l'Agent lorsqu'un Ordre est lancé.
  - L'utilisation principale concerne des fonctions telles que : *tâcheResourceVariable( 'myJobResource', 'myVariable' )*
  - Pour plus de détails, voir [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables).
- **Liste** est un type de données de type tableau qui permet d'ajouter un nombre quelconque de variables, chacune utilisant son propre type de données et sa propre valeur par défaut.
  - Les références aux variables de type tableau utilisent la syntaxe suivante *$colors(0).lightblue*, *$colors(0).blue*, *$colors(1).lightgreen*, *$colors(1).green*
- **Map** est une liste de variables, chacune ayant son propre type de données et sa valeur par défaut.
  - Les références aux variables de la carte utilisent la syntaxe suivante *$colors.blue*, *$colors.green*

### Recherche dans les Workflows

Une icône de recherche est disponible en haut du *Panneau de Workflow*. En cliquant sur cette icône, vous pouvez spécifier une chaîne de caractères correspondant au nom d'une tâche ou d'une instruction de Workflow.

- Lorsque vous saisissez le premier caractère, une zone de liste s'ouvre et affiche les instructions de Workflow correspondantes et indique les occurrences en rouge.
- Lorsque vous cliquez sur une réponse, la fenêtre défile jusqu'à la tâche ou l'instruction de Workflow correspondante.
- La recherche d'instructions est insensible à la casse et est tronquée à gauche et à droite. Par exemple, si vous tapez le caractère **O** (o majuscule), vous trouverez *J**o**b*.

### Opérations sur les Workflows

#### Opérations de déploiement

En haut du *Panneau Workflow*, les utilisateurs trouvent les indicateurs de statut suivants :

- **valide** / **non valide** indique à partir de la couleur bleue / orange si le Workflow est cohérent et prêt à être déployé. *Les Workflows non valides* ne peuvent pas être déployés, mais les modifications sont enregistrées dans l'inventaire. Par exemple, l'affectation d'un Agent manquant à une tâche rendra le Workflow *invalide*. Dans l'indicateur de statut *non valide*, l'icône d'information (i) est disponible et affiche la raison pour laquelle le Workflow est +non valide*
- **déployé** / **non déployé** indique si la version actuelle du Workflow a été *déployée* ou s'il s'agit d'un brouillon qui n'a pas été *déployé*.

Le bouton *Déployer* permet de déployer un Contrôleur en un seul clic. En dehors de cela, les opérations de déploiement sont disponibles au niveau du dossier, voir [Configuration - Inventaire - Navigation](/configuration-inventory-navigation).

#### Opérations sur les instructions

Lorsque vous passez la souris sur une instruction, le menu d'action à 3 points vous propose les opérations suivantes :

- **Toutes les instructions** proposent les opérations *Copier*, *Couper* et *Enlever*. Les instructions en bloc telles que l'instruction *Fork* proposent en outre l'opération *Remove All* : alors que l'opération *Remove* supprime uniquement l'instruction, l'opération *Remove All* supprime l'instruction et toutes les instructions incluses, telles que les Jobs.
- **Job Instruction** propose l'opération *Créer Modèle de Tâche* qui permet de créer un Modèle de Tâche à partir de la tâche en cours. Le Modèle de Tâche peut être utilisé par d'autres Jobs dans le même Workflow ou dans des Workflows différents.

#### Opérations Copier, Couper, Coller

Les opérations **Copier** et **Couper** sont disponibles dans le menu d'action 3 points d'une instruction. Les opérations *copier* et *couper* sur une instruction de bloc agissent sur toutes les instructions incluses dans l'instruction de bloc. Pour copier ou couper plusieurs instructions d'un même niveau, l'utilisateur maintient la touche de la souris enfoncée et marque les instructions, comme s'il utilisait un lasso. 

- le raccourci clavier **Ctrl+C** permet de copier les instructions surlignées.
- le raccourci clavier **Ctrl+X** permet de couper les instructions surlignées.

L'opération **Coller** est disponibles dans le *Panneau de la barre d'outils* qui permet de faire glisser et de déposer les instructions copiées ou coupées dans le Workflow.

- Le raccourci clavier **Ctrl+V** colle les instructions copiées ou coupées lorsque l'utilisateur clique sur une ligne de connexion entre les instructions du Workflow.

#### Panneau des opérations

Lorsque vous cliquez sur le canevas du *Panneau de Workflow*, un *Panneau d'opérations* devient visible et propose les opérations suivantes :

- Opérations de zoom
  - **Le zoom avant** augmente la taille des instructions de Workflow.
  - **Zoom arrière** pour réduire la taille des instructions de Workflow.
  - **L'option Zoom par défaut** permet d'établir la taille par défaut des instructions de Workflow.
  - **Adapter au panneau** permet de choisir une taille pour les instructions de workflow qui permet au Workflow de s'adapter à la taille du panneau.
- Opérations Annuler, Refaire
  - **Annuler** permet d'annuler la dernière modification. Vous pouvez annuler jusqu'à 20 opérations.
  - **Rétablir** rejoue la dernière modification qui a été annulée.
- Opérations de téléchargement, de chargement
  - **Télécharger JSON** téléchargera le Workflow au format JSON dans un fichier .json.
  - **Télécharger JSON** permet de télécharger un fichier .json qui remplacera le Workflow.
- Opérations d'exportation
  - **Exporter une image** permet de télécharger un fichier image .png du Workflow.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Navigation](/configuration-inventory-navigation)
- [Configuration - Inventaire - Ressources de Tâche](/configuration-inventory-job-resources)
- [États d'Ordre](/order-states)
- [Historique des Ordres](/history-orders)
- [Plan Quotidien](/daily-plan)

### Product Knowledge Base

- [Graphique acyclique dirigé] (https://en.wikipedia.org/wiki/Directed_acyclic_graph)
- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
- [JS7 - Workflow Instructions - Processing](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Processing)
  - [JS7 - AdmissionTime Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AdmissionTime+Instruction)
  - [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
  - [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction)
  - [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction)
  - [JS7 - Prompt Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Prompt+Instruction)
  - [JS7 - Sleep Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Sleep+Instruction)
- [JS7 - Workflow Instructions - Clustering](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Clustering)
  - [JS7 - ForkList-Join Instruction for Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction+for+Agent+Clusters)
  - [JS7 - StickySubagent Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+StickySubagent+Instruction+for+Agent+Clusters)
- [JS7 - Workflow Instructions - Conditional Processing](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Conditional+Processing)
  - [JS7 - If Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+If+Instruction)
  - [JS7 - Case Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Case+Instruction)
- [JS7 - Workflow Instructions - Cyclic Execution](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Cyclic+Execution)
  - [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction)
  - [JS7 - Break Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Break+Instruction)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)
  - [JS7 - AddOrder Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AddOrder+Instruction)
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)
- [JS7 - Workflow Instructions - Error Handling](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Error+Handling)
  - [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction)
  - [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction)
  - [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction)
  - [JS7 - Try-Catch Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Try-Catch+Instruction)
- [JS7 - Workflow Instructions - Forking](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Forking)
  - [JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction)
  - [JS7 - ForkList-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction)
