# Configuration - Inventaire - Workflow - Job Options

Le panneau *Workflow* permet de concevoir des Workflow à partir d'une séquence d'instructions. Les utilisateurs peuvent glisser-déposer les *instructions de travail* depuis la *barre d'outils* vers une position dans le Workflow.

L'interface graphique offre un certain nombre d'onglets pour spécifier les détails du travail. Le deuxième onglet est proposé pour les *options de travail*.

## Options de travail fréquemment utilisées

- **Parallélisme** spécifie le nombre d'instances parallèles pour lesquelles le job peut être exécuté. Si plusieurs Ordres traitent le Workflow, ils peuvent exécuter le Job en parallèle. En plus du *Parallélisme*, la limite de processus s'applique et est appliquée par les agents autonomes et les clusters d'agents.
- **La *criticité** spécifie l'importance des défaillances du travail. La *Criticité* est disponible dans les notifications relatives aux échecs des tâches.

### Périodes d'exécution des tâches

- **Le délai d'exécution** spécifie la période d'exécution maximale que le job est autorisé à consommer. Si le job dépasse le *Temps d'exécution*, il sera annulé par l'agent en tenant compte du *Temps de grâce* du job. Les données d'entrée peuvent être spécifiées dans les formats suivants :
  - *1* ou *1s* : un nombre ou un nombre suivi de *s* spécifie le *délai* en secondes.
  - *1m 2d 3h* : spécifie 1 mois, 2 jours et 3 heures comme période d'exécution maximale.
  - *01:02:03* : spécifie 1 heure, 2 minutes et 3 secondes comme période d'exécution maximale.
- **Avertissement en cas de période d'exécution plus courte** déclenche un avertissement et une notification correspondante si le travail se termine avant la période spécifiée. Les formats d'entrée sont les suivants :
  - *1* ou *1s* : un nombre ou un nombre suivi de *s* spécifie la période d'exécution en secondes.
  - *01:02:03* : spécifie 1 heure, 2 minutes et 3 secondes pour la période d'exécution.
  - *30%* : spécifie une période d'exécution 30% plus courte que la moyenne des exécutions précédentes du job. Le calcul utilise le site [Task History](/history-tasks) qui est soumis à une purge par le site [Cleanup Service](/service-cleanup).
- **Avertissement en cas de période d'exécution plus longue** émet un avertissement et une notification correspondante si le travail dépasse la période spécifiée. Les formats d'entrée sont les suivants : *1* ou *1s* :
  - *1* ou *1s* : un nombre ou un nombre suivi de *s* spécifie la période d'exécution en secondes.
  - *01:02:03* : spécifie 1 heure, 2 minutes et 3 secondes pour la période d'exécution.
  - *30%* : spécifie une période d'exécution 30% plus longue que la moyenne des exécutions précédentes du job. Le calcul utilise le site [Task History](/history-tasks) qui est soumis à une purge par le site [Cleanup Service](/service-cleanup).

### Sortie du journal des travaux

- **Fail on output to stderr** spécifie que l'agent fera échouer le travail s'il écrit une sortie sur le canal stderr. Cette vérification s'ajoute à la vérification de la *valeur de retour* (pour les travaux Shell : code de sortie) d'un travail.
- **Warn on output to stderr** spécifie que la même vérification est effectuée que pour *Fail on output to stderr*. Toutefois, le travail n'échouera pas, mais un avertissement sera émis et une notification sera créée.

### Temps d'admission des travaux

*Les délais d'admission* déterminent le moment où un travail peut être lancé ou doit être ignoré, ainsi que la période absolue pendant laquelle un travail peut être exécuté. Pour plus de détails, voir [JS7 - Admission Times for Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Admission+Times+for+Jobs).

- **Skip Job if no admission for Ordre's date** spécifie que le job sera ignoré si son *Admission Time* ne correspond pas à la date de l'Ordre. Par exemple, l'heure d'admission du job peut exclure les week-ends, ce qui signifie que le job sera exécuté du lundi au vendredi et sera ignoré par les Ordres planifiés pour les samedis et dimanches. Les utilisateurs doivent considérer que c'est la date à laquelle l'Ordre est planifié qui est pertinente, et non la date d'arrivée de l'Ordre à l'Opération. Si la date programmée de l'ordre correspond à l'"heure d'admission", mais que l'ordre arrive plus tard, en dehors de l'"heure d'admission", le travail ne sera pas ignoré et l'ordre attendra l'"heure d'admission" suivante.
- **Interrompre le travail à la fin de la période** spécifie que l'agent annulera le travail s'il dépasse la période spécifiée avec l'*heure d'admission*.
- **L'option *Heure d'admission** permet de spécifier les jours et les heures pendant lesquels les travaux peuvent être exécutés à partir du lien *Afficher les périodes*.

#### Types d'admission

*Les types d'admission* permettent de spécifier les jours auxquels le travail peut commencer. En outre, il est possible de spécifier des plages de mois limitant le *type d'admission* à certains mois.

- les **jours de la semaine** spécifient les jours de la semaine pendant lesquels l'emploi peut commencer.
- **Les jours de semaine spécifiques** spécifient les jours de semaine relatifs tels que le premier ou le dernier lundi d'un mois.
- **Jours spécifiques** spécifiez les jours de l'année.
- **Jours du mois** spécifiez les jours relatifs d'un mois, par exemple le premier ou le dernier jour du mois.

#### Période d'exécution

La *période d'exécution* est spécifiée à partir de son *début* et de sa *durée* :

- **Le début** est spécifié par une heure au format HH:MM:SS, par exemple 10:15:00 pour 10 heures et quart.
- **La *durée** est spécifiée par l'utilisation des formats suivants : *1* ou *1s* :
  - *1* ou *1s* : un nombre ou un nombre suivi de *s* spécifie la *Durée* en secondes.
  - *1m 2d 3h* : spécifie 1 mois, 2 jours et 3 heures pour la *Durée*.
  - *01:02:03* : spécifie 1 heure, 2 minutes et 3 secondes pour la *Durée*.

## Options de travail disponibles à partir de *Plus d'options*

La vue *Configuration - Inventaire* propose un curseur *Plus d'options* en haut de la fenêtre, qui est inactif par défaut. L'utilisation de ce curseur permet d'accéder à des options supplémentaires.

- le **Grace Timeout** est appliqué aux travaux sous Unix qui reçoivent un signal SIGTERM lorsqu'ils dépassent leur *Timeout* ou lorsqu'ils sont interrompus de force par l'intervention de l'utilisateur. Si le job ne se termine pas en réponse au signal SIGTERM, l'agent enverra un signal SIGKILL après le *Grace Timeout* pour terminer le job de force. Pour plus de détails, voir [JS7 - FAQ - How does JobScheduler terminate Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+FAQ+-+How+does+JobScheduler+terminate+Jobs) et [JS7 - Agent Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Operation).
- **Compatibilité** offre le niveau de compatibilité *v1* pour les utilisateurs de la branche 1.x de JobScheduler. En mode compatibilité, le comportement suivant est modifié :
  - *Les variables d'environnement* ne doivent pas être spécifiées mais sont automatiquement créées pour toutes les variables de Workflow. Les noms des variables d'environnement sont préfixés à partir de *SCHEDULER_PARAM_* en utilisant uniquement des lettres majuscules.
  - Pour l'utilisation des arguments de Job, le mode de compatibilité offre un onglet correspondant.

### Redémarrage des travaux

- l'option **Job non redémarrable** s'applique aux Jobs qui ont été interrompus de force par l'Agent ou par son chien de garde lors de l'arrêt ou de l'annulation de l'Agent. Par défaut, les travaux sont considérés comme redémarrables et seront redémarrés lorsque l'agent sera redémarré. Les utilisateurs peuvent empêcher ce comportement en activant la case à cocher.

### Exécution de Jobs pour Windows à l'aide de différents comptes d'utilisateur

Les options suivantes indiquent que les travaux exécutés avec des agents pour Windows doivent changer de contexte d'utilisateur, voir [JS7 - Running Jobs as a different User](https://kb.sos-berlin.com/display/JS7/JS7+-+Running+Jobs+as+a+different+User).

- **Clé d'identification** spécifie la clé de l'entrée dans le gestionnaire d'identifiants Windows qui contient les identifiants du compte d'utilisateur cible.
- **Charger le profil de l'utilisateur** spécifie si le profil du compte d'utilisateur cible, y compris les entrées de registre, doit être chargé au démarrage du job.

## Références

### Aide contextuelle

- [Cleanup Service](/service-cleanup)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  - [Configuration - Inventory - Workflows - Job Properties](/configuration-inventory-workflows-job-properties)
  - [Configuration - Inventory - Workflows - Job Node Properties](/configuration-inventory-workflows-job-node-properties)
  - [Configuration - Inventory - Workflows - Job Notifications](/configuration-inventory-workflows-job-notifications)
  - [Configuration - Inventory - Workflows - Job Tags](/configuration-inventory-workflows-job-tags)
- [Task History](/history-tasks)

### Product Knowledge Base

- [JS7 - Admission Times for Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Admission+Times+for+Jobs).
- [JS7 - Agent Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Operation)
- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - FAQ - How does JobScheduler terminate Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+FAQ+-+How+does+JobScheduler+terminate+Jobs)
- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
- [JS7 - Running Jobs as a different User](https://kb.sos-berlin.com/display/JS7/JS7+-+Running+Jobs+as+a+different+User)

