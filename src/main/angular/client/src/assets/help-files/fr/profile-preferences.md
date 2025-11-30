# Profil - Préférences

La page *Profil - Préférences* contient les paramètres d'un compte utilisateur.

Lorsqu'un utilisateur se connecte pour la première fois à JOC Cockpit, les préférences du *compte utilisateur par défaut* sont copiées dans les préférences de l'utilisateur. Le *compte utilisateur par défaut* est spécifié à partir de la page [Settings - JOC Cockpit](/settings-joc).

## Rôles

Les rôles attribués au compte utilisateur sont affichés. Les autorisations résultantes sont fusionnées à partir des attributions de rôles et sont disponibles à partir de l'onglet [Profile - Permissions](/profile-permissions).

## Préférences

Les utilisateurs peuvent modifier les préférences à leur guise.

### Préférences liées au navigateur

Les préférences de cette section utilisent les valeurs par défaut du navigateur utilisé :

- **Langue** est la langue de l'interface de JOC Cockpit qui est disponible pour l'anglais, le français, l'allemand, le japonais.
- **Fuseau horaire** indique le fuseau horaire dans lequel seront converties les dates affichées dans JOC Cockpit.
- **Format de la date et de l'heure** permet de choisir parmi une liste de formats disponibles.

### Liste des préférences associées

Les préférences s'appliquent à l'affichage des listes dans JOC Cockpit. Les implications suivantes doivent être prises en compte lorsque vous augmentez les valeurs :

- La lecture d'une plus grande quantité de données dans JOC Cockpit n'améliorera pas la réactivité de l'interface graphique.
- Des listes plus longues augmenteront la consommation de mémoire et de CPU du navigateur pour le rendu.

Vous trouverez les paramètres suivants qui peuvent être gérés pour des valeurs communes à partir du lien *Limite de groupe* :

- **Nombre maximum d'entrées dans l'Historique** s'applique à la vue [History - Orders](/history-orders).
- **Nombre maximum d'entrées du journal d'audit** s'applique à la vue [Audit Log](/audit-log).
- **Nombre maximal d'entrées de notification** s'applique aux vues *Surveiller les notifications d'ordres* et *Surveiller les notifications du système*.
- **Nombre maximal d'entrées de l'aperçu des ordres** s'applique à la vue [Orders - Overview](/orders-overview).
- **Nombre maximum d'entrées du Plan Quotidien** s'applique à la vue [Daily Plan](/daily-plan).
- **Nombre maximum d'Ordres par Workflow** limite le nombre d'Ordres disponibles avec la vue [Workflows](/workflows).
- **Nombre maximum d'entrées de transfert de fichiers** s'applique à la vue [History - File Transfers](/history-file-transfers).
- **Nombre maximum d'Ordres par Verrouillage de Ressources** limite le nombre d'Ordres affichés avec la vue [Resources - Resource Locks](/resources-resource-locks).
- **Le nombre maximum d'ordres par tableau d'affichage** limite le nombre d'Ordres affichés dans la vue [Resources - Notice Boards](/resources-notice-boards).

### Préférences de la vue Workflow

Les préférences s'appliquent à la vue [Workflows](/workflows):

- **Nombre max. d'entrées de l'Historique des Ordres par Workflow** limite le nombre d'entrées dans le panneau *Historique des Ordres*.
- **Nombre maximum d'entrées dans l'Historique des tâches par Workflow** limite le nombre d'entrées dans le panneau *Historique des tâches* .
- **Le nombre maximum d'entrées du journal d'audit par objet** limite le nombre d'entrées dans le panneau *Journal d'audit*.

### Configuration - Préférences d'affichage de l'inventaire

- **Nombre maximum d'entrées de favoris** limite l'affichage des favoris, par exemple lors de l'attribution d'une tâche à un agent.

### Préférences de pagination

Les préférences s'appliquent à la pagination sur n'importe quelle page :

- **Nombre maximum d'entrées par page** limite le nombre d'entrées visibles sur une seule page.
- **Nombre par défaut d'entrées par page** spécifie la valeur par défaut qui peut être 10, 25, 50, 100, 1000.

### Préférences du thème

- **Changer de thème** permet de passer d'un thème à l'autre. Certains thèmes sont plus contrastés et conviennent mieux aux utilisateurs souffrant de déficiences visuelles.
  - **Changer la couleur des Ordres** est disponible à partir d'une icône à droite de *Changer le Thème* et permet de changer les couleurs par défaut pour [Order States](/order-states). Il peut sembler déroutant de changer des couleurs qui sont représentées différemment dans la documentation JS7. Cependant, les utilisateurs souffrant de déficiences visuelles pourraient trouver ceci utile : les utilisateurs peuvent spécifier des valeurs RVB pour chaque couleur utilisée pour un état de l'Ordre.
- **La couleur de la barre de menu** est disponible si le thème *Light* est utilisé. Elle permet de modifier la couleur d'arrière-plan de la barre de menu. Ce paramètre peut être appliqué, par exemple, si les utilisateurs travaillent avec des environnements JS7 distincts pour dev, test, prod : l'utilisation de couleurs d'arrière-plan différentes permet d'identifier l'environnement JS7 correspondant.
- le **Titre du thème** est affiché juste en dessous de la barre de menu. Tout comme la *Couleur de la barre de menu*, il peut être utilisé pour identifier l'environnement JS7 concerné.

### Préférences de l'éditeur

- **Taille de l'onglet** est utilisé dans l'onglet [Configuration - Inventory - Workflow - Job Properties](/configuration-inventory-workflow-job-properties) lors de l'édition du *Job Script*. Le paramètre spécifie le nombre d'espaces correspondant à la taille lorsque vous appuyez sur la touche TAB.

### Préférences d'affichage

- **Afficher les journaux** spécifie l'affichage des onglets [Order Log View](/order-log) et [Task Log View](/task-log). Les deux vues de journaux permettent d'afficher et de télécharger les journaux.
- **Afficher les documentations** spécifie l'affichage de la documentation utilisateur pour les Workflows et les Jobs.

### Préférences de l'affichage de la configuration

- **Afficher les sous-dossiers et le contenu des dossiers** règle le comportement lorsque vous cliquez sur un dossier dans le *Panneau de navigation* de la vue *Configuration-&gt;Inventaire* pour afficher soit les objets disponibles uniquement, soit les objets disponibles et les sous-dossiers.

### Préférences mixtes

- **Afficher les fichiers immédiatement dans la vue Transfert de fichiers** est utile si chaque transfert de fichiers comprend un nombre prévisible de fichiers. Pour les transferts uniques pouvant inclure des milliers de fichiers, il peut être préférable de désactiver ce paramètre.
- **Activer les raisons pour le journal d'audit** oblige l'utilisateur à spécifier une raison lorsqu'il modifie des objets tels que l'ajout ou l'annulation d'Ordres, la suspension de Workflows, etc. Le réglage de l'utilisateur peut être annulé à partir du site [Settings - JOC Cockpit](/settings-joc).
- **Use time zone for log timestamps** s'applique lorsque les agents fonctionnent sur des serveurs situés dans des fuseaux horaires différents ou différents du fuseau horaire du serveur du contrôleur. Dans ce cas, un journal de l'Ordre qui contient la sortie du journal d'un certain nombre d'Ordres exécutés avec des Agents éventuellement différents peut sembler confus. Le paramètre convertit les horodatages des journaux dans le *fuseau horaire* spécifié dans le profil de l'utilisateur.
- l'option **Current Controller** s'applique lorsque plusieurs contrôleurs sont connectés à JOC Cockpit. Option proposée dans un certain nombre de vues, par exemple la vue [History - Orders](/history-orders). Lorsqu'elle est cochée, elle limite l'affichage aux Ordres soumis au contrôleur actuellement sélectionné et, dans le cas contraire, elle affiche les Ordres de tous les contrôleurs connectés. Ce paramètre détermine la valeur par défaut des options *Contrôleur actuel* connexes dans les vues du JOC Cockpit.
- **Supprimer les infobulles pour les objets de l'inventaire** concerne la vue *Configuration-&gt;Inventaire* qui propose des infobulles, par exemple pour [Configuration - Inventory - Workflow - Job Properties](/configuration-inventory-workflow-job-properties). Les infobulles s'affichent si la souris est déplacée sur l'étiquette d'un champ de saisie afin d'aider les utilisateurs en expliquant les saisies possibles. Bien que cela soit utile pour les utilisateurs qui ne sont pas trop familiers avec JS7, les infobulles peuvent ne pas être nécessaires pour les utilisateurs expérimentés.
- **L'avertissement de licence reconnu** fait référence à l'utilisation de licences d'abonnement qui sont généralement limitées à un an. Avant l'expiration de la licence, JOC Cockpit affichera des avertissements connexes. L'utilisateur peut choisir de supprimer les avertissements relatifs à l'expiration de la licence. Pour plus d'informations, consultez le site [JS7 - How to manage License Expiration Warnings](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+manage+License+Expiration+Warnings).
- **Afficher plus d'options** active le bouton du curseur correspondant dans la vue *Configuration-&gt;Inventaire*. Il offre des options plus détaillées pour la configuration du travail, par exemple avec l'onglet [Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options).
- **Collapse list variable** s'applique à la vue [Configuration - Inventory - Workflows](/configuration-inventory-workflows) qui permet de spécifier des variables de Workflow à partir d'un certain nombre de types de données. Si le type de données *Liste* (tableau) est utilisé, il peut contenir un plus grand nombre d'entrées. Les utilisateurs peuvent ne pas vouloir voir immédiatement les variables de liste développées lorsqu'ils modifient un Workflow.

### Préférences de type de vue

- **Afficher la vue** s'applique à un certain nombre de vues qui offrent l'indicateur correspondant dans le coin supérieur droit de la fenêtre. Le paramètre spécifie le type de vue qui sera utilisé par défaut. Les utilisateurs peuvent modifier le type de vue sur demande dans n'importe quelle vue. Le type de vue *Carte* nécessite plus d'espace à l'écran que le type de vue *Liste*. Cependant, certains utilisateurs peuvent préférer la visibilité des cartes.
- **Afficher la vue d'ensemble des ordres** est similaire au paramètre *Afficher la vue* mais s'applique à la vue [Orders - Overview](/orders-overview). De plus, la vue offre le type de vue *Bulk* qui permet la transition des Ordres à partir d'opérations en vrac.

### Préférences de mise en page du Workflow

Les préférences s'appliquent à l'affichage des instructions de Workflow avec la vue [Configuration - Inventory - Workflows](/configuration-inventory-workflows):

- **Orientation** permet de basculer l'affichage des Workflows vers une présentation verticale ou horizontale. Travailler avec un écran large en utilisant l'*Orientation* horizontale présente des avantages lorsque vous concevez des Workflows avec un grand nombre de Jobs et d'autres instructions de Workflow.
- **L'espacement entre les instructions sur des couches adjacentes** permet de modifier l'espacement entre les instructions de Workflow verticales.
- **L'espacement entre les instructions sur le même calque** permet de modifier l'espacement entre les instructions de Workflow horizontales.
- **Les bords arrondis pour les connexions** aplatissent les bords de l'affichage des instructions de Workflow, par exemple des Jobs.

## Références

### Aide contextuelle

- [Audit Log](/audit-log)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  - [Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options)
  - [Configuration - Inventory - Workflow - Job Properties](/configuration-inventory-workflow-job-properties)
- [Daily Plan](/daily-plan)
- [History - File Transfers](/history-file-transfers)
- [History - Orders](/history-orders)
- [Order Log View](/order-log)
- [Order States](/order-states)
- [Orders - Overview](/orders-overview)
- [Profile](/profile)
   - [Profile - Permissions](/profile-permissions)
- [Resources - Notice Boards](/resources-notice-boards)
- [Resources - Resource Locks](/resources-resource-locks)
- [Settings - Daily Plan](/settings-daily-plan)
- [Settings - JOC Cockpit](/settings-joc)
- [Task Log View](/task-log)
- [Workflows](/workflows)

### Product Knowledge Base

- [JS7 - Audit Log](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Log)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - File Transfer History](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Transfer+History)
- [JS7 - How to manage License Expiration Warnings](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+manage+License+Expiration+Warnings)
- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Order State Transitions](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+State+Transitions)
- [JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)

