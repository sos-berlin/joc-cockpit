# Configuration - Notification

JS7 fournit des notifications en cas d'avertissements et d'erreurs des produits JS7 et en cas d'échec des Tâches et des Workflows. Des notifications peuvent également être envoyées en cas d'exécution réussie des Tâches et des Workflows.

- Les notifications sont basées sur une surveillance continue par le JOC Cockpit à partir de [Service de Surveillance](/service-monitor) et sont visualisées dans la vue [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor). Il s'agit notamment de
  - la surveillance de la disponibilité du Contrôleur et des Agents,
  - la surveillance de l'exécution des Workflows et des Jobs.
- Les notifications sont transmises par l'un des moyens suivants :
  - par courriel électronique, pour plus de détails, voir [JS7 - Notifications - Configuration Element MailFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+MailFragment) et [JS7 - How to set up e-mail notification for tâches](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+set+up+e-mail+notification+for+tâches).
  - en utilisant un outil CLI tel qu'un Agent System Monitor pour [JS7 - Passive Checks with a System Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Passive+Checks+with+a+System+Monitor), pour plus de détails, voir [JS7 - Notifications - Configuration Element CommandFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+CommandFragment).

Les notifications sont gérées à partir de la sous-vue Configuration-&gt;Notification dans le JOC Cockpit. La configuration est stockée au format XML et est validée par rapport au *Schéma XSD assigné* indiqué en haut de la page.

La page est divisée en deux parties : le *Vue de navigation* à gauche et le *Vue de détails* à droite. 

- Le *Vue de détails* offre des champs de saisie et une documentation connexe par élément.
- Lorsque vous saisissez des détails de configuration, ils sont automatiquement enregistrés dans un délai de 30 secondes et lorsque vous quittez la page.

Le cycle de vie typique lors de la modification des notifications est le suivant

- saisir les détails de la configuration
- cliquer sur le bouton *Valider* pour vérifier que la configuration est cohérente,
- cliquer sur le bouton *Publier* pour activer la configuration.

## Vue de navigation

La configuration est proposée à partir de la navigation par éléments. En cliquant sur le nom d'un élément, vous ouvrez l'élément et affichez les sous-éléments disponibles. L'indicateur de flèche à gauche du nom de l'élément indique si des sous-éléments sont disponibles.

Le menu d'action à 3 points d'un élément propose les opérations suivantes :

- **Ajouter un nœud enfant** permet d'ajouter des nœuds à l'élément actuel. Les types de nœuds disponibles sont indiqués.
- **Afficher tous les nœuds enfants du nœud sélectionné** fait apparaître une fenêtre contextuelle qui affiche les nœuds enfants possibles. Cette fonction permet de parcourir les nœuds enfants et de rechercher les nœuds enfants par leur nom.
- **Copier/coller** permet de copier un nœud, y compris les nœuds enfants. Le collage est disponible à partir du menu d'action du nœud parent.
- **Supprimer** le nœud et tous les nœuds enfants.

### Fragments

#### MessageFragments

- **Message**
  - Un *Message* définit le contenu qui est envoyé, par exemple, par courrier électronique à un utilisateur ou qui est utilisé pour paramétrer un utilitaire de ligne de commande, tel que le contenu à transmettre à un moniteur système.
    - les *messages* à utiliser avec le courrier électronique représentent le corps du courrier électronique utilisé à partir de texte brut ou de HTML.
    - Les messages à utiliser avec la ligne de commande représentent une chaîne qui peut être utilisée avec l'élément *CommandFragmentRef*, voir ci-dessous.
    - les éléments *Message* peuvent inclure des variables de moniteur qui sont des espaces réservés pour des valeurs, par exemple pour le chemin du Workflow, l'ID de l'Ordre, etc.
    - Vous pouvez ajouter autant d'éléments *Message* que vous le souhaitez.

#### MonitorFragments

Les fragments se présentent sous différentes formes pour les types de notification suivants.

- **MailFragment**
  - Les éléments suivants sont nécessaires pour envoyer un courrier :
    - **MessageRef** : Spécifie la référence à un élément Message qui fournit le corps du message.
    - **Subject** : Indique l'objet du courrier électronique et peut inclure des variables de surveillance.
    - **To** : Spécifie l'adresse électronique du destinataire. Plusieurs destinataires peuvent être séparés par une virgule.
  - Les éléments suivants sont facultatifs pour l'envoi du courrier :
    - **CC** : Le destinataire des copies carbone. Plusieurs destinataires peuvent être séparés par une virgule.
    - **Bcc** : Le destinataire des copies carbone en aveugle. Les destinataires multiples peuvent être séparés par une virgule.
    - **From** : L'adresse électronique du compte utilisé pour envoyer le courrier. Considérez que la configuration de votre serveur de messagerie détermine si un compte spécifique ou arbitraire peut être utilisé.
- **CommandFragment**
  - **MessageRef** : Spécifie la référence à un élément *Message* qui fournit le contenu qui sera transmis avec l'élément Command. Le contenu du message est disponible dans la variable de contrôle *$\{MESSAGE\}* et peut être utilisé avec les éléments suivants.
  - **Command** : Spécifie la commande shell pour Linux/Windows qui est utilisée pour transmettre les notifications, par exemple à un utilitaire de surveillance du système.
    - Par exemple, la commande suivante peut être utilisée :
      - *echo "$\{MESSAGE\}" &gt;&gt; /tmp/notification.log*
      - La commande shell *echo* ajoute le contenu de la variable de moniteur *$\{MESSAGE\}* à un fichier dans le répertoire */tmp*.
- **JMSFragment**
  - Le type de fragment est utilisé pour intégrer un produit Java Message Queue qui met en œuvre l'API JMS. Les valeurs des attributs sont spécifiques au produit JMS utilisé.

#### ObjectFragments 

- **Workflows** : Il est possible d'ajouter un nombre quelconque de configurations de Workflow, qui se distinguent par un nom unique attribué à l'élément.
  - **Workflow** : Un Workflow peut être spécifié par son nom. L'attribut *Path* permet une expression régulière spécifiant une partie du chemin du Workflow.
    - **WorkflowJob** : Cet élément peut être utilisé pour limiter les notifications à des tâches spécifiques dans un Workflow.
      - Il est possible de spécifier l'attribut *Job Name* et/ou son attribut *Label*. Pour les deux attributs, des valeurs constantes et des expressions régulières peuvent être utilisées, par exemple *.\** pour spécifier l'envoi d'un courrier électronique pour n'importe quel tâche.
      - Pour les versions antérieures à 2.7.1 :
        - Il est nécessaire que la criticité, qui est l'une des valeurs suivantes : *TOUT*, *NORMAL* ou *CRITICAL*, soit spécifiée lors de l'utilisation de l'élément.
      - Pour les versions à partir de la 2.7.1 :
        - La criticité peut être une ou plusieurs des valeurs suivantes : *MINOR*, *NORMAL*, *MAJOR*, *CRITICAL*.
        - La criticité *TOUT* est obsolète.
      - Les attributs **return_code_from** et **return_code_to** peuvent éventuellement être utilisés pour limiter les notifications aux tâches qui se terminent avec le code de retour donné. Le code de retour pour les Jobs Shell correspond au code de sortie du système d'exploitation.
    - Vide : Si aucun élément *WorkflowJob* n'est spécifié, la notification s'applique à tout [JS7 - Workflow Instructions](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions), y compris le [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction), sinon elle s'applique aux occurrences du [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction).

### Notifications

Ils activent les notifications effectives par des références aux éléments *Fragment* décrits ci-dessus.

#### SystemNotification

- **SystemNotification** : Sélectionne un ou plusieurs des *Fragments de surveillance* ci-dessus. Il est possible de sélectionner plusieurs *Fragments* du même type.
  - Les notifications sont créées à partir des erreurs et des avertissements du système qui sont identifiés dans les fichiers journaux du produit JS7, voir [Service de Notification des Journaux](/service-log-notification).
  - L'élément est utilisé pour remplir la sous-vue [Moniteur - Notifications du Système](/monitor-notifications-system) de JOC Cockpit.

#### Notification

- **Notification** : Il est possible d'ajouter un nombre illimité de notifications, chacune d'entre elles se distinguant par un nom unique. Une notification se voit attribuer un type qui peut être *SUCCESS*, *WARNING* ou *ERROR*. Cela permet d'envoyer des notifications, par exemple en cas d'erreurs ou d'avertissements relatifs à une tâche. De même, des notifications peuvent être envoyées en cas d'exécution réussie d'un Workflow. Notez qu'une exécution réussie comprend à la fois l'absence d'erreurs de tâche et, optionnellement, la présence d'avertissements de tâche.
  - **NotificationMonitors** : Sélectionne un ou plusieurs des *MonitorFragments* ci-dessus. Il est possible de sélectionner plusieurs fragments du même type.
    - **CommandFragmentRef** : Sélectionne le *CommandFragment* utilisé.
      - **MessageRef** : Sélectionne l'élément *Message* utilisé avec la *Commande*.
    - **MailFragmentRef** : Ordres les *MailFragment* utilisés pour envoyer des notifications par courrier électronique. Si plusieurs éléments *MailFragment* sont référencés, différents types d'e-mails peuvent être utilisés, par exemple pour différents destinataires ou avec un contenu et une présentation différents du corps de l'e-mail.
    - **JMSFragmentRef** : Sélectionne le *JMSFragment* utilisé pour envoyer des notifications à un produit compatible avec Java Message Queue.
  - **NotificationObjects** : Sélectionne les Workflows pour lesquels des notifications sont créées.
    - **WorkflowRef** : Sélectionne un élément *Workflows* qui limite les notifications aux Workflows associés. Vous pouvez ajouter autant de références de Workflow que vous le souhaitez.

## Opérations sur les notifications

La page Notification propose les opérations suivantes à partir des boutons connexes situés en haut de la page :

- **Nouveau** : démarre à partir d'une configuration vide.
- **Supprimer** : supprime la configuration actuelle.
- **Revenir au brouillon** : crée un nouveau brouillon à partir de la version la plus récente. Les modifications en cours seront perdues.
- **Télécharger** : permet de télécharger la configuration dans un fichier XML.
- **Éditer XML** : permet d'éditer directement la configuration au format XML.
- **Valider** : valide la configuration par rapport à un schéma XSD. Cela garantit que la configuration XML est bien formée et formellement correcte.
- **Publier** : publie la configuration dans JOC Cockpit. Les modifications entrent en vigueur immédiatement.

## Références

### Aide contextuelle

- [Moniteur - Disponibilité de l'Agent](/monitor-availability-agent)
- [Moniteur - Disponibilité de Contrôleur](/monitor-availability-controller)
- [Moniteur - Notifications d'Ordre](/monitor-notifications-order)
- [Moniteur - Notifications du Système](/monitor-notifications-system)
- [Service de Notification des Journaux](/service-log-notification)
- [Service de Surveillance](/service-monitor)

### Product Knowledge Base

- [JS7 - How to set up e-mail notification for tâches](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+set+up+e-mail+notification+for+tâches)
- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Monitor Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor+Service)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
  - [JS7 - Notifications - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration)
    - [JS7 - Notifications - Configuration Element CommandFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+CommandFragment)
    - [JS7 - Notifications - Configuration Element MailFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+MailFragment)
  - [JS7 - Passive Checks with a System Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Passive+Checks+with+a+System+Monitor)
- [JS7 - Workflow Instructions](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions)
  - [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction)
  - [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
