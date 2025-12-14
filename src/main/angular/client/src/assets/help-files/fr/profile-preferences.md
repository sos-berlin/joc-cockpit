# Profil - Préférences

La page *Profil - Préférences* contient les paramètres d'un compte utilisateur.

Lorsqu'un utilisateur se connecte pour la première fois à JOC Cockpit, les préférences du *compte utilisateur par défaut* sont copiées dans les préférences de l'utilisateur. Le *compte utilisateur par défaut* est spécifié à partir de la page [Réglages - JOC Cockpit](/settings-joc).

## Rôles

Les rôles attribués au compte utilisateur sont affichés. Les autorisations résultantes sont fusionnées à partir des attributions de rôles et sont disponibles à partir de l'onglet [Profil - Permissions](/profile-permissions).

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

- **Nombre maximum d'entrées dans l'Historique** s'applique à la vue [Historique des Ordres](/history-orders).
- **Nombre maximum d'entrées du Journal d'Audit** s'applique à la vue [Journal d'Audit](/audit-log).
- **Nombre maximal d'entrées de notification** s'applique aux vues [Moniteur - Notifications d'Ordres](/moitor-notifications-order) et [Moniteur - Notifications du Système](/monitor-notifications-system).
- **Nombre maximal d'entrées de l'aperçu des Ordres** s'applique à la vue [Aperçu des Ordres](/orders-overview).
- **Nombre maximum d'entrées du Plan Quotidien** s'applique à la vue [Plan Quotidien](/daily-plan).
- **Nombre maximum d'Ordres par Workflow** limite le nombre d'Ordres disponibles avec la vue [Workflows](/workflows).
- **Nombre maximum d'entrées de transfert de fichiers** s'applique à la vue [Historique des Transferts de Fichiers](/history-file-transfers).
- **Nombre maximum d'Ordres par Verrou de Ressources** limite le nombre d'Ordres affichés avec la vue [Ressources - Verrous de Ressource](/resources-resource-locks).
- **Le nombre maximum d'Ordres par Tableau de Condition** limite le nombre d'Ordres affichés dans la vue [Ressources - Tableaux de Condition](/resources-notice-boards).

### Préférences de la vue Workflow

Les préférences s'appliquent à la vue [Workflows](/workflows):

- **Nombre max. d'entrées de l'Historique des Ordres par Workflow** limite le nombre d'entrées dans le panneau *Historique des Ordres*.
- **Nombre maximum d'entrées dans l'Historique des tâches par Workflow** limite le nombre d'entrées dans le panneau *Historique des tâches* .
- **Le nombre maximum d'entrées du Journal d'Audit par objet** limite le nombre d'entrées dans le panneau *Journal d'Audit*.

### Configuration - Préférences d'affichage de l'inventaire

- **Nombre maximum d'entrées de favoris** limite l'affichage des favoris, par exemple lors de l'attribution d'une tâche à un Agent.

### Préférences de pagination

Les préférences s'appliquent à la pagination sur n'importe quelle page :

- **Nombre maximum d'entrées par page** limite le nombre d'entrées visibles sur une seule page.
- **Nombre par défaut d'entrées par page** spécifie la valeur par défaut qui peut être 10, 25, 50, 100, 1000.

### Préférences du thème

- **Changer de thème** permet de passer d'un thème à l'autre. Certains thèmes sont plus contrastés et conviennent mieux aux utilisateurs souffrant de déficiences visuelles.
  - **Changer la couleur des Ordres** est disponible à partir d'une icône à droite de *Changer le Thème* et permet de changer les couleurs par défaut pour [États d'Ordre](/order-states). Il peut sembler déroutant de changer des couleurs qui sont représentées différemment dans la documentation JS7. Cependant, les utilisateurs souffrant de déficiences visuelles pourraient trouver ceci utile : les utilisateurs peuvent spécifier des valeurs RVB pour chaque couleur utilisée pour un état de l'Ordre.
- **La couleur de la barre de menu** est disponible si le thème *Light* est utilisé. Elle permet de modifier la couleur d'arrière-plan de la barre de menu. Ce paramètre peut être appliqué, par exemple, si les utilisateurs tâchelent avec des environnements JS7 distincts pour dev, test, prod : l'utilisation de couleurs d'arrière-plan différentes permet d'identifier l'environnement JS7 correspondant.
- le **Titre du thème** est affiché juste en dessous de la barre de menu. Tout comme la *Couleur de la barre de menu*, il peut être utilisé pour identifier l'environnement JS7 concerné.

### Préférences de l'éditeur

- **Taille de l'onglet** est utilisé dans l'onglet [Configuration - Inventaire - Workflow - Propriétés de Tâche](/configuration-inventory-workflow-job-properties) lors de l'édition du *Job Script*. Le paramètre spécifie le nombre d'espaces correspondant à la taille lorsque vous appuyez sur la touche TAB.

### Préférences d'affichage

- **Afficher les journaux** spécifie l'affichage des onglets [Affichage du Journal d'Ordre](/order-log) et [Affichage du Journal de Tâche](/task-log). Les deux vues de journaux permettent d'afficher et de télécharger les journaux.
- **Afficher les documentations** spécifie l'affichage de la documentation utilisateur pour les Workflows et les Jobs.

### Préférences de l'affichage de la configuration

- **Afficher les sous-dossiers et le contenu des dossiers** règle le comportement lorsque vous cliquez sur un dossier dans le *Panneau de navigation* de la vue *Configuration-&gt;Inventaire* pour afficher soit les objets disponibles uniquement, soit les objets disponibles et les sous-dossiers.

### Préférences mixtes

- **Afficher les fichiers immédiatement dans la vue Transfert de fichiers** est utile si chaque transfert de fichiers comprend un nombre prévisible de fichiers. Pour les transferts uniques pouvant inclure des milliers de fichiers, il peut être préférable de désactiver ce paramètre.
- **Activer les raisons pour le Journal d'Audit** oblige l'utilisateur à spécifier une raison lorsqu'il modifie des objets tels que l'ajout ou l'annulation d'Ordres, la suspension de Workflows, etc. Le réglage de l'utilisateur peut être annulé à partir de [Réglages - JOC Cockpit](/settings-joc).
- **Use time zone for log timestamps** s'applique lorsque les Agents fonctionnent sur des serveurs situés dans des fuseaux horaires différents ou différents du fuseau horaire du serveur du Contrôleur. Dans ce cas, un journal de l'Ordre qui contient la sortie du journal d'un certain nombre d'Ordres exécutés avec des Agents éventuellement différents peut sembler confus. Le paramètre convertit les horodatages des journaux dans le *fuseau horaire* spécifié dans le profil de l'utilisateur.
- l'option **Current Controller** s'applique lorsque plusieurs Contrôleurs sont connectés à JOC Cockpit. Option proposée dans un certain nombre de vues, par exemple la vue [Historique des Ordres](/history-orders). Lorsqu'elle est cochée, elle limite l'affichage aux Ordres soumis au Contrôleur actuellement sélectionné et, dans le cas contraire, elle affiche les Ordres de tous les Contrôleurs connectés. Ce paramètre détermine la valeur par défaut des options *Contrôleur actuel* connexes dans les vues du JOC Cockpit.
- **Supprimer les infobulles pour les objets de l'inventaire** concerne la vue *Configuration-&gt;Inventaire* qui propose des infobulles, par exemple pour [Configuration - Inventaire - Workflow - Propriétés de Tâche](/configuration-inventory-workflow-job-properties). Les infobulles s'affichent si la souris est déplacée sur le label d'un champ de saisie afin d'aider les utilisateurs en expliquant les saisies possibles. Bien que cela soit utile pour les utilisateurs qui ne sont pas trop familiers avec JS7, les infobulles peuvent ne pas être nécessaires pour les utilisateurs expérimentés.
- **L'avertissement de licence reconnu** fait référence à l'utilisation de licences d'abonnement qui sont généralement limitées à un an. Avant l'expiration de la licence, JOC Cockpit affichera des avertissements connexes. L'utilisateur peut choisir de supprimer les avertissements relatifs à l'expiration de la licence. Pour plus d'informations, consultez le site [JS7 - How to manage License Expiration Warnings](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+manage+License+Expiration+Warnings).
- **Afficher plus d'options** active le bouton du curseur correspondant dans la vue *Configuration-&gt;Inventaire*. Il offre des options plus détaillées pour la configuration de la tâche, par exemple avec l'onglet [Configuration - Inventaire - Workflow - Options de Tâche](/configuration-inventory-workflow-job-options).
- **Réduire variable list** s'applique à la vue [Configuration - Inventaire - Workflows](/configuration-inventory-workflows) qui permet de spécifier des variables de Workflow à partir d'un certain nombre de types de données. Si le type de données *Liste* (tableau) est utilisé, il peut contenir un plus grand nombre d'entrées. Les utilisateurs peuvent ne pas vouloir voir immédiatement les variables de liste développées lorsqu'ils modifient un Workflow.

### Préférences de type de vue

- **Afficher la vue** s'applique à un certain nombre de vues qui offrent l'indicateur correspondant dans le coin supérieur droit de la fenêtre. Le paramètre spécifie le type de vue qui sera utilisé par défaut. Les utilisateurs peuvent modifier le type de vue sur demande dans n'importe quelle vue. Le type de vue *Carte* nécessite plus d'espace à l'écran que le type de vue *Liste*. Cependant, certains utilisateurs peuvent préférer la visibilité des cartes.
- **Afficher la vue d'ensemble des Ordres** est similaire au paramètre *Afficher la vue* mais s'applique à la vue [Aperçu des Ordres](/orders-overview). De plus, la vue offre le type de vue *Bulk* qui permet la transition des Ordres à partir d'opérations en vrac.

### Préférences de mise en page du Workflow

Les préférences s'appliquent à l'affichage des instructions de Workflow avec la vue [Configuration - Inventaire - Workflows](/configuration-inventory-workflows):

- **Orientation** permet de basculer l'affichage des Workflows vers une présentation verticale ou horizontale. Travailler avec un écran large en utilisant l'*Orientation* horizontale présente des avantages lorsque vous concevez des Workflows avec un grand nombre de Jobs et d'autres instructions de Workflow.
- **L'espacement entre les instructions sur des couches adjacentes** permet de modifier l'espacement entre les instructions de Workflow verticales.
- **L'espacement entre les instructions sur le même calque** permet de modifier l'espacement entre les instructions de Workflow horizontales.
- **Les bords arrondis pour les connexions** aplatissent les bords de l'affichage des instructions de Workflow, par exemple des Jobs.

## Références

### Aide contextuelle

- [Affichage du Journal d'Ordre](/order-log)
- [Affichage du Journal de Tâche](/task-log)
- [Aperçu des Ordres](/orders-overview)
- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
  - [Configuration - Inventaire - Workflow - Options de Tâche](/configuration-inventory-workflow-job-options)
  - [Configuration - Inventaire - Workflow - Propriétés de Tâche](/configuration-inventory-workflow-job-properties)
- [États d'Ordre](/order-states)
- [Journal d'Audit](/audit-log)
- [Historique des Ordres](/history-orders)
- [Historique des Transferts de Fichiers](/history-file-transfers)
- [Plan Quotidien](/daily-plan)
- [Profil](/profile)
   - [Profil - Permissions](/profile-permissions)
- [Ressources - Tableaux de Condition](/resources-notice-boards)
- [Ressources - Verrous de Ressource](/resources-resource-locks)
- [Réglages - JOC Cockpit](/settings-joc)
- [Réglages - Plan Quotidien](/settings-daily-plan)
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
