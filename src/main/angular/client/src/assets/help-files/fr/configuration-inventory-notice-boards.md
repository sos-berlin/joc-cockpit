# Configuration - Inventaire - Tableaux de Condition

La vue *Tableau de Condition* permet de spécifier les panneaux d'affichage à utiliser avec les Workflows. Pour plus de détails, voir [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards).

Les tableaux d'affichage mettent en œuvre des dépendances entre les Workflows :

- Les Tableaux de Condition permettent d'ajouter des Annonces 
  - sans intervention de l'utilisateur, voir [Resources - Notice Boards](/resources-notice-boards).
  - à partir de l'instruction *PostNotices* d'un Workflow, voir [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction).
- Les Workflows peuvent être configurés de manière à ce que les Ordres attendent des avis à partir des instructions suivantes :
  - l'instruction *ExpectNotices* est utilisée pour vérifier si des avis sont disponibles sur un ou plusieurs tableaux d'affichage ajoutés par une instruction *PostNotices* ou par l'utilisateur. Si l'avis n'existe pas, l'Ordre restera par défaut en *attente* avec l'instruction. Un Workflow peut inclure un nombre quelconque d'instructions *ExpectNotices* pour attendre des Annonces provenant du même Tableau de Condition ou différents. Pour plus de détails, voir [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction).
  - l'instruction *ConsumeNotices* est utilisée pour que les Ordres attendent un ou plusieurs avis des Tableaux de Condition qui sont ajoutés par une instruction *PostNotices* ou par l'utilisateur. L'instruction *ConsumeNotices* est une instruction en bloc qui peut inclure d'autres instructions et qui supprime les Annonces attendus lorsque l'Ordre arrive à la fin du bloc d'instructions. Pour plus de détails, voir [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction).

Les saveurs suivantes sont disponibles pour les Tableaux de Condition :

- **Tableaux de Condition globaux** mettent en œuvre des avis de portée globale, ce qui rend le même avis disponible pour n'importe quel Workflow à n'importe quel moment.
- **Tableaux de Condition planifiable** implémentent les avis dans le cadre de la Planification [Daily Plan](/daily-plan). Un avis existe dans le cadre d'une date du *Plan Quotidien*, par exemple
  - Le Workflow 1 se déroule du lundi au vendredi.
  - Le Workflow 2 se déroule du lundi au dimanche et dépend de l'exécution précédente du Workflow 1.
  - Le week-end, le Workflow 1 ne démarre pas. Pour permettre le démarrage du Workflow 2 pendant les week-ends, la dépendance est mappée au Plan Quotidien par l'utilisation de *Panneaux d'affichage programmables* : pour les jours où aucun Ordre n'est annoncé pour le Workflow 1, la dépendance est ignorée.

Les Tableaux de Conditions sont gérés à partir des vues suivants :

- Le page [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation), situé sur le côté gauche de la fenêtre, permet de naviguer dans les dossiers contenant les tableaux d'affichage. En outre, ce panneau permet d'effectuer des opérations sur les tableaux d'affichage.
- Le vue *Tableau de Condition*, sur le côté droit de la fenêtre, contient les détails de la configuration.

## Vue des Tableaux de Condition

Pour un tableau d'affichage, les entrées suivantes sont disponibles :

- **Nom** est l'identifiant unique du panneau d'affichage, voir [Object Naming Rules](/object-naming-rules).
- **Titre** contient une explication facultative de l'objectif du panneau d'affichage.
- **Type de Condition** est l'un des suivants : *Tableau de Condition global* ou *Tableau de Condition Planifiable*

### Tableaux de Condition globaux

- **ID Annonce pour publication de l'Ordre** contient une valeur constante ou une expression dérivée de l'Ordre d'affichage :
  - Il est possible d'utiliser une valeur vide ou une chaîne de caractères spécifiant une valeur constante.
  - Une expression régulière peut être utilisée :
    - *Correspondance de la date du Plan Quotidien* extrait la date du Plan Quotidien à partir de l'ID de l'Ordre en utilisant l'expression : *replaceAll($js7OrderId, '^#([0-9]{4}-[0-9]{2}-[0-9]{2})#.*$', '$1')*
    - *Correspondance entre la date du Plan Quotidien et le nom de l'Ordre* extrait la date du Plan Quotidien et le nom de l'Ordre à partir de l'ID de l'Ordre en utilisant l'expression : *replaceAll($js7OrderId, '^#([0-9]{4}-[0-9]{2}-[0-9]{2})#.*-([^:]*)(?::[^|]*)?([|].*)?$', '$1$2$3')*
    - *Correspondance du nom de l'Ordre* extrait le nom de l'Ordre à l'aide de l'expression : *replaceAll($js7OrderId, '^#[0-9]{4}-[0-9]{2}-[0-9]{2}#.*-([^:]*)(?::[^|]*)?([|].*)?$', '$1$2')*
- le **ID Annonce pour l'Ordre en attente** doit contenir la même expression que le *Notice ID for Posting Ordre*.

### Tableaux de Condition planifiable

- **ID Annonce pour publication de l'Ordre** contient une valeur constante ou une expression dérivée de l'Ordre d'affichage :
  - Il est possible d'utiliser une valeur vide ou une chaîne de caractères spécifiant une valeur constante.
  - Une expression régulière peut être utilisée :
    - *Correspondance du nom de l'Ordre* extrait le nom de l'Ordre à l'aide de l'expression : *replaceAll($js7OrderId, '^#[0-9]{4}-[0-9]{2}-[0-9]{2}#.*-([^:]\*)(?::[^|]*)?([|].*)?$', '$1$2')*

### Opérations sur les Tableaux de Condition

Pour les opérations disponibles, voir [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

## Utilisation avec des instructions de Workflow

Les instructions de Workflow pour les tableaux d'affichage offrent les options suivantes :

- l'instruction **PostNotices** contient la liste des tableaux d'affichage pour lesquels des avis sont publiés. L'instruction ne nécessite pas d'options.
- les instructions **ExpectNotices** et **ConsumeNotices** contiennent les données d'entrée suivantes : **Expression** spécifie les conditions d'un ou de plusieurs tableaux d'affichage :
  - **Expression** spécifie des conditions provenant d'un ou de plusieurs tableaux d'affichage et dont la valeur est *vrai* ou *faux* :
    - **&amp;&amp;** comme condition "et" **||** comme condition "ou
    - **||** comme condition "ou
    - les paranthèses **()** précisent la priorité selon laquelle les conditions sont évaluées.
    - Remarque Les noms des conseils dans les expressions doivent être mis entre guillemets.
    - Exemples :
      - **'NB1' &amp;&amp; 'NB2'** : s'attend à ce que les Annonces des deux Tableaux de Condition *NB1* et *NB2* soient évalués à *vrai*.
      - **('NB1' &amp;&amp; 'NB2' ) || 'NB3'** : attend la présence d'Annonce provenant de *NB1* et *NB2*. En revanche, si une Annonce de *NB3* est présent, l'expression est évaluée à *vrai*.
  - **Lorsqu'il n'y a pas eu d'Annonce** spécifie le comportement à adopter dans le cas où une Annonce n'a pas été indiquée. Cela s'applique aux jours pour lesquels aucun Ordre n'est disponible à partir d'un Workflow de comptabilisation.
    - **Attendre** est la valeur par défaut et fait en sorte que les Ordres attendent la présence d'une Annonce indépendamment du fait qu'elles aient été indiquées ou non.
    - l'option **Ignoer** permet aux Ordres d'ignorer l'instruction si l'Annonce n'est pas indiquée.
    - l'option **Process** est disponible pour l'instruction *ConsumeNotices* et permet à un Ordre d'entrer dans l'instruction de blocage au cas où l'Annonce n'est pas annoncé.

## Références

### Aide contextuelle

- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Daily Plan - Dependencies](/daily-plan-dependencies)
- [Object Naming Rules](/object-naming-rules)
- [Resources - Notice Boards](/resources-notice-boards)

### Product Knowledge Base

- [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  - [JS7 - Schedulable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedulable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)  
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)

