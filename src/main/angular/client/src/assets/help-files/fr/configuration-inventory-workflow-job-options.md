# Configuration - Inventaire - Workflow - Job Options

La vue *Workflow* permet de concevoir des Workflow à partir d'une séquence d'instructions. Les utilisateurs peuvent glisser-déposer l'*instruction Job* depuis la *barre d'outils* vers une position dans le Workflow.

L'interface graphique offre un certain nombre d'onglets pour spécifier les détails de la tâche. Le deuxième onglet est proposé pour les *options de tâche*.

## Options de tâche fréquemment utilisées

- **Limite de Tâche** spécifie le nombre d'instances parallèles pour lesquelles la tâche peut être exécuté. Si plusieurs Ordres traitent le Workflow, ils peuvent exécuter le Job en parallèle. En plus du *Parallélisme*, la limite de processus s'applique et est appliquée par les Agents Autonomes et les Clusters d'Agents.
- **Criticité** spécifie l'importance des défaillances de la tâche. La *Criticité* est disponible dans les notifications relatives aux échecs des tâches.

### Périodes d'exécution des tâches

- **Timeout** spécifie la période d'exécution maximale que la tâche est autorisé à consommer. Si la tâche dépasse le *Temps d'exécution*, il sera annulé par l'Agent en tenant compte du *Delai de grâce* de la tâche. Les données d'entrée peuvent être spécifiées dans les formats suivants :
  - *1* ou *1s* : un nombre ou un nombre suivi de *s* spécifie le *délai* en secondes.
  - *1m 2d 3h* : spécifie 1 mois, 2 jours et 3 heures comme période d'exécution maximale.
  - *01:02:03* : spécifie 1 heure, 2 minutes et 3 secondes comme période d'exécution maximale.
- **Avertir si plus court de** déclenche un avertissement et une notification correspondante si la tâche se termine avant la période spécifiée. Les formats d'entrée sont les suivants :
  - *1* ou *1s* : un nombre ou un nombre suivi de *s* spécifie la période d'exécution en secondes.
  - *01:02:03* : spécifie 1 heure, 2 minutes et 3 secondes pour la période d'exécution.
  - *30%* : spécifie une période d'exécution 30% plus courte que la moyenne des exécutions précédentes de la tâche. Le calcul utilise le [Historique des Tâches](/history-tasks) qui est soumis à une purge par le [Service d'Assainissement](/service-cleanup).
- **Avertir si plus long de** émet un avertissement et une notification correspondante si la tâche dépasse la période spécifiée. Les formats d'entrée sont les suivants : *1* ou *1s* :
  - *1* ou *1s* : un nombre ou un nombre suivi de *s* spécifie la période d'exécution en secondes.
  - *01:02:03* : spécifie 1 heure, 2 minutes et 3 secondes pour la période d'exécution.
  - *30%* : spécifie une période d'exécution 30% plus longue que la moyenne des exécutions précédentes de la tâche. Le calcul utilise le [Historique des Tâches](/history-tasks) qui est soumis à une purge par le [Service d'Assainissement](/service-cleanup).

### Sortie du journal des tâches

- **Echec sur la sortie stderr** spécifie que l'Agent fera échouer la tâche s'il écrit une sortie sur le canal stderr. Cette vérification s'ajoute à la vérification de la *valeur de retour* (pour les tâches Shell : code de sortie) d'une tâche.
- **Avertissement sur la sortie stderr** spécifie que la même vérification est effectuée que pour *Fail on output to stderr*. Toutefois, la tâche n'échouera pas, mais un avertissement sera émis et une notification sera créée.

### Temps d'admission des tâches 

*Les délais d'admission* déterminent le moment où une tâche peut être lancé ou doit être ignoré, ainsi que la période absolue pendant laquelle une tâche peut être exécuté. Pour plus de détails, voir [JS7 - Admission Times for Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Admission+Times+for+Jobs).

- **Ignorer si la période admission ne correspond pas à la date de l'Ordre** spécifie que la tâche sera ignoré si son *Admission Time* ne correspond pas à la date de l'Ordre. Par exemple, l'heure d'admission peut exclure les week-ends, ce qui signifie que la tâche sera exécuté du lundi au vendredi et sera ignoré par les Ordres planifiés pour les samedis et dimanches. Les utilisateurs doivent considérer que c'est la date à laquelle l'Ordre est planifié qui est pertinente, et non la date d'arrivée de l'Ordre à l'Opération. Si la date programmée de l'Ordre correspond à l'"heure d'admission", mais que l'Ordre arrive plus tard, en dehors de l'"heure d'admission", la tâche ne sera pas ignoré et l'Ordre attendra l'"heure d'admission" suivante.
- **Interrompre la tâche à la fin de la période** spécifie que l'Agent annulera la tâche s'il dépasse la période spécifiée avec l'*heure d'admission*.
- **Heure d'admission** permet de spécifier les jours et les heures pendant lesquels les tâches peuvent être exécutés à partir du lien *Afficher les périodes*.

#### Types d'admission

*Les types d'admission* permettent de spécifier les jours auxquels la tâche peut commencer. En outre, il est possible de spécifier des plages de mois limitant le *type d'admission* à certains mois.

- **Jours de la semaine** spécifient les jours de la semaine pendant lesquels la tâche peut commencer.
- **Jours de semaine spécifiques** spécifient les jours de semaine relatifs tels que le premier ou le dernier lundi d'un mois.
- **Jours spécifiques** spécifiez les jours de l'année.
- **Jours du mois** spécifiez les jours relatifs d'un mois, par exemple le premier ou le dernier jour du mois.

#### Période d'exécution

La *période d'exécution* est spécifiée à partir de son *début* et de sa *durée* :

- **Le début** est spécifié par une heure au format HH:MM:SS, par exemple 10:15:00 pour 10 heures et quart.
- **La *durée** est spécifiée par l'utilisation des formats suivants : *1* ou *1s* :
  - *1* ou *1s* : un nombre ou un nombre suivi de *s* spécifie la *Durée* en secondes.
  - *1m 2d 3h* : spécifie 1 mois, 2 jours et 3 heures pour la *Durée*.
  - *01:02:03* : spécifie 1 heure, 2 minutes et 3 secondes pour la *Durée*.

## Options de tâche disponibles à partir de *Plus d'options*

La vue *Configuration - Inventaire* propose un curseur *Plus d'options* en haut de la fenêtre, qui est inactif par défaut. L'utilisation de ce curseur permet d'accéder à des options supplémentaires.

- **Délai de Grâce** est appliqué aux tâches sous Unix qui reçoivent un signal SIGTERM lorsqu'ils dépassent leur *Timeout* ou lorsqu'ils sont interrompus de force par l'intervention de l'utilisateur. Si la tâche ne se termine pas en réponse au signal SIGTERM, l'Agent enverra un signal SIGKILL après le *Délai de Grâce* pour terminer la tâche de force. Pour plus de détails, voir [JS7 - FAQ - How does JobScheduler terminate Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+FAQ+-+How+does+JobScheduler+terminate+Jobs) et [JS7 - Agent Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Operation).
- **Compatibilité** offre le niveau de compatibilité *v1* pour les utilisateurs de la branche 1.x de JobScheduler. En mode compatibilité, le comportement suivant est modifié :
  - *Les variables d'environnement* ne doivent pas être spécifiées mais sont automatiquement créées pour toutes les variables de Workflow. Les noms des variables d'environnement sont préfixés à partir de *SCHEDULER_PARAM_* en utilisant uniquement des lettres majuscules.
  - Pour l'utilisation des arguments de tâche, le mode de compatibilité offre un onglet correspondant.

### Redémarrage des tâches

- **Tâche pas redémarrable** s'applique aux tâches qui ont été interrompus de force par l'Agent ou lors de l'arrêt ou de l'annulation de l'Agent. Par défaut, les tâches sont considérés comme redémarrables et seront redémarrés lorsque l'Agent sera redémarré. Les utilisateurs peuvent empêcher ce comportement en activant la case à cocher.

### Exécution de tâches sur Windows à l'aide de différents comptes d'utilisateur

Les options suivantes indiquent que les tâches exécutés avec des Agents pour Windows doivent changer de contexte d'utilisateur, voir [JS7 - Running Jobs as a different User](https://kb.sos-berlin.com/display/JS7/JS7+-+Running+Jobs+as+a+different+User).

- **Clé d'identification** spécifie la clé de l'entrée dans le gestionnaire d'identifiants Windows qui contient les identifiants du compte d'utilisateur cible.
- **Charger le profil de l'utilisateur** spécifie si le profil du compte d'utilisateur cible, y compris les entrées de registre, doit être chargé au démarrage de la tâche.

## Références

### Aide contextuelle

- [Configuration - Inventaire - Workflows](/configuration-inventory-workflows)
  - [Configuration - Inventaire - Workflow - Propriétés de Tâche](/configuration-inventory-workflows-job-properties)
  - [Configuration - Inventaire - Workflow - Propriétés du Nœud de Tâche](/configuration-inventory-workflows-job-node-properties)
  - [Configuration - Inventaire - Workflow - Notifications de Tâche](/configuration-inventory-workflows-job-notifications)
  - [Configuration - Inventaire - Workflow - Tags Tâche](/configuration-inventory-workflows-job-tags)
- [Historique des Tâches](/history-tasks)
- [Service d'Assainissement](/service-cleanup)

### Product Knowledge Base

- [JS7 - Admission Times for Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Admission+Times+for+Jobs).
- [JS7 - Agent Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Operation)
- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - FAQ - How does JobScheduler terminate Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+FAQ+-+How+does+JobScheduler+terminate+Jobs)
- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
- [JS7 - Running Jobs as a different User](https://kb.sos-berlin.com/display/JS7/JS7+-+Running+Jobs+as+a+different+User)
