# Réglages - JOC Cockpit

Les paramètres suivants sont appliqués à JOC Cockpit. Les modifications prennent effet immédiatement.

La page *Réglages* est accessible à partir de l'icône ![wheel icon](assets/images/wheel.png) dans la barre de menu.

## Paramètres du Journal d'Audit

### Paramètre : *force\_comments\_for\_audit\_log*, Défaut : *false*

Spécifie qu'une raison doit être ajoutée à l'adresse [Journal d'Audit](/audit-log) pour tout changement appliqué à des objets tels que l'ajout d'un Ordre, l'annulation d'un Ordre, etc.

Cela s'applique aux opérations effectuées à partir de l'interface graphique et aux opérations effectuées à partir de l'interface utilisateur [REST Web Service API](/rest-api)
La spécification de la valeur *true* pour ce paramètre oblige toutes les requêtes API qui modifient des objets à fournir des arguments pour le Journal d'Audit.

Notez que le site [Profil - Préférences](/profile-preferences) comprend un paramètre connexe, Activer les raisons pour le Journal d'Audit, qui a le même effet. Toutefois, son utilisation est volontaire et limitée au compte du profil. Le paramètre force\_comments\_for\_audit\_log impose ce comportement à tous les comptes d'utilisateurs, quels que soient les paramètres de profil des comptes d'utilisateurs individuels.

### Paramètre : *comments\_for\_audit\_log*

Spécifie une liste de commentaires possibles à sélectionner par un utilisateur lorsqu'il effectue une opération GUI qui modifie un objet. Outre les entrées de la liste, les utilisateurs sont libres d'utiliser des commentaires individuels lorsqu'ils effectuent ces opérations.

La liste contient des motifs bien connus de modification des objets. Les utilisateurs sont libres de modifier les entrées de la liste et d'ajouter leurs propres entrées pour les commentaires possibles.

### Paramètre : *default\_profile\_account*, Défaut : *root*

Lorsque des comptes d'utilisateurs sont ajoutés au JOC Cockpit à l'aide de [Services d'Identité](/identity-services), [Profil - Préférences](/profile-preferences) est créé avec des paramètres individuels pour chaque compte d'utilisateur.

- Ce paramètre indique le compte utilisé comme modèle pour le profil lors de la création de comptes d'utilisateur. 
- Par défaut, le compte *root* est utilisé, ce qui revient à dire que le profil d'un nouveau compte est alimenté par des paramètres tels que la langue, le thème, etc. du compte de profil par défaut.

## Paramètres de Connexion

### Paramètre : *enable\_remember\_me*, Défaut : *true*

Ce paramètre active la case à cocher *Se souvenir de moi* qui est disponible dans la fenêtre de connexion et qui stocke les informations d'identification de l'utilisateur, telles que le compte et le mot de passe, dans un cookie du site. Par conséquent, le compte et le mot de passe de l'utilisateur sont renseignés lors de la prochaine connexion.

- Certains utilisateurs peuvent considérer que le stockage des informations d'identification dans les données du navigateur constitue un risque pour la sécurité.
- Ce paramètre peut être désactivé afin de ne pas proposer le stockage des informations d'identification de l'utilisateur.

## Paramètres de l'Inventaire

### Paramètres : *copy\_paste\_suffix*, *copy\_paste\_prefix*, Défaut : *copy*

Spécifie le préfixe/suffixe à utiliser pour les noms d'objets lors des opérations de copier-coller dans l'interface graphique du JOC Cockpit.

- Dans l'inventaire JS7, les noms d'objets sont uniques pour chaque type d'objet : par exemple, les Workflows utilisent des noms uniques, mais une Ressource de Tâche peut utiliser le même nom qu'un Workflow.
- Par conséquent, un nouveau nom d'objet doit être créé lors des opérations de copier-coller. Pour ce faire, vous pouvez ajouter un préfixe ou un suffixe au choix de l'utilisateur.

### Paramètre : *restore\_suffix*, *restore\_prefix*, Défaut : *restored*

Lorsque des objets d'inventaire sont supprimés, ils sont ajoutés à la corbeille d'inventaire.

- Lorsque les objets supprimés sont restaurés à partir de la corbeille d'inventaire, le nom de l'objet d'origine peut être utilisé par un objet plus récent. 
- Ce paramètre permet à l'utilisateur de spécifier les valeurs de préfixe et de suffixe à utiliser lors de la restauration d'objets de la corbeille.

### Paramètre : *import\_suffix*, *import\_prefix*, Défaut : *imported*

Les opérations d'exportation et d'importation de l'inventaire JS7 permettent d'importer des objets à partir d'un fichier d'archive.

- Lorsque des objets sont importés, leurs noms peuvent entrer en conflit avec des noms d'objets existants.
- Ce paramètre permet à l'utilisateur de spécifier les valeurs de préfixe et de suffixe à utiliser lors de l'importation d'objets.

## Paramètres Vue

### Paramètre : *show\_view\_\**

Ces paramètres peuvent être utilisés pour désactiver des vues individuelles qui sont disponibles à partir de l'interface graphique du JOC Cockpit par les éléments du menu principal tels que Plan Quotidien, Moniteur, Workflow, etc.

- Ce paramètre fonctionne indépendamment des rôles et des autorisations par défaut.
- Ce paramètre fonctionne indépendamment des rôles et des autorisations par défaut. Par conséquent, un compte d'utilisateur peut être autorisé à consulter les données de la vue Moniteur, bien que cette vue ne soit pas proposée à partir de l'interface graphique. En même temps, les données de la vue Moniteur seront disponibles pour ce compte lorsque vous utiliserez le site [REST Web Service API](/rest-api).

### Paramètre : *display\_folders\_in\_views*, Défaut : *true*

Spécifie que dans les vues telles que *Workflows*, *Plan Quotidien*, *Ressources - Calendriers*, *Ressources - Verrous de Ressources*, *Ressources - Tableaux de Condition*, les noms des objets et les chemins d'accès sont affichés. Si la valeur *false* est utilisée pour ce paramètre, le chemin est omis dans l'affichage des objets. Dans JS7, tous les noms d'objets sont uniques.

## Paramètres du Contrôleur

### Paramètre : *controller\_connection\_joc\_password*, *controller\_connection\_history\_password*

JS7 offre une configuration cohérente sans utiliser de mots de passe. Cela inclut la connexion entre le JOC Cockpit et les Contrôleurs, qui peut être sécurisée par l'authentification mutuelle du serveur HTTPS et du client. Si les utilisateurs ne souhaitent pas configurer l'authentification mutuelle pour les connexions aux Contrôleurs, un mot de passe doit être utilisé pour identifier le JOC Cockpit avec le Contrôleur.

Cela s'applique aux deux connexions établies entre le JOC Cockpit et les Contrôleurs, qui sont reflétées par des paramètres distincts pour le *controller\_connection\_joc\_password* et le *controller\_connection\_history\_password* :

- L'interface graphique du JOC Cockpit utilise une connexion pour recevoir des événements, par exemple sur les transitions d'état des Ordres.
- Le service Historique est connecté à un Contrôleur pour recevoir des informations sur l'historique, telles que l'état d'exécution des tâches et toute sortie de journal des tâches.

Le mot de passe est spécifié en texte clair dans la page Paramètres et sous forme de valeur hachée dans le fichier private.conf du Contrôleur.

Le lien **Afficher la valeur de hachage** est disponible sur la page Paramètres et permet d'afficher la valeur de hachage du mot de passe.

Si un mot de passe est modifié dans la page Paramètres, il doit également être modifié dans le fichier private.conf du Contrôleur pour que les mots de passe correspondent.

Il est recommandé de modifier d'abord le mot de passe dans le fichier private.conf de l'instance active du Contrôleur, puis dans la page Paramètres. Redémarrez ensuite l'instance du Contrôleur. Le JOC Cockpit se reconnectera alors à l'instance de Contrôleur active. Si un Cluster de Contrôleurs est utilisé, la même modification doit être appliquée au fichier private.conf de l'instance de Contrôleur passive.

## Paramètres Unicode

### Paramètre : *encoding*

L'encodage est appliqué si JOC Cockpit est utilisé dans un environnement Windows. Windows ne prend pas en charge Unicode mais utilise des pages de code. Si la page de code Windows ne peut pas être détectée automatiquement, les utilisateurs peuvent spécifier la page de code. Une valeur fréquemment utilisée est *UTF-8*.

## Paramètres de Licence

### Paramètre : *disable\_warning\_on\_license\_expiration*, Défaut : *false*

JS7 propose d'afficher des avertissements en cas d'expiration prochaine de la licence. La fonction d'affichage des avertissements d'expiration de licence peut être désactivée en attribuant à ce paramètre la valeur *vrai*.

## Paramètres du Journal

### Paramètre : *log\_ext\_directory*

Indique un répertoire accessible à JOC Cockpit et dans lequel seront écrites les copies des fichiers journaux de l'Ordre et des fichiers journaux des tâches.

### Paramètre : *log\_ext\_order\_history*

Spécifie qu'un fichier JSON contenant des informations sur l'Historique des Ordres est créé en cas d'Ordres réussis, d'Ordres échoués ou les deux. Les valeurs possibles sont les suivantes :

- **tous** : créer un fichier Historique pour tous les Ordres réussis et échoués.
- **échec** : création d'un fichier historique pour les Ordres ayant échoué.
- **succès** : création d'un fichier historique pour les Ordres réussis.

### Paramètre : *log\_ext\_order*

Indique qu'un fichier d'historique des Ordres est créé en cas d'Ordres réussis, d'Ordres échoués ou les deux. Les valeurs possibles sont les suivantes :

- **Tous** : création d'un fichier journal pour tous les Ordres réussis et échoués.
- **échec** : création d'un fichier journal pour les Ordres ayant échoué.
- **succès** : création d'un fichier journal de l'Ordre pour les Ordres réussis.

### Paramètre : *log\_ext\_task*

Indique qu'un fichier journal de tâche est créé en cas de tâche réussie, de tâche échouée ou des deux. Les valeurs possibles sont les suivantes :

- **tous** : crée un fichier journal de la tâche pour toutes les tâches réussies et échouées.
- **Échec** : création d'un fichier journal pour les tâches qui ont échoué.
- **succès** : crée un fichier journal pour les tâches réussies.

### Paramètre : *log\_maximum\_display\_size*, Défaut : *10* MO

JOC Cockpit propose l'affichage de la sortie du journal dans la fenêtre Log View si la taille de la sortie du journal non compressée ne dépasse pas cette valeur. Dans le cas contraire, le journal n'est proposé qu'en téléchargement. La taille est spécifiée en Mo.

### Paramètre : *log\_applicable\_size*, Défaut : *500* MO

Si la valeur de la taille du journal d'une tâche est dépassée, le service Historique tronquera le journal et utilisera les 100 premiers et derniers Ko pour le journal de la tâche. Le fichier journal d'origine sera supprimé. La taille est spécifiée en Mo.

### Paramètre : *log\_maximum\_size*, Défaut : *1000* MO

Si cette valeur pour la taille de la sortie du journal d'une tâche est dépassée, le service Historique tronquera la sortie du journal et utilisera les 100 premiers Ko pour le journal de la tâche. Le fichier journal d'origine sera supprimé. La taille est spécifiée en Mo.

## Paramètres du Lien

### Paramètre : *joc\_reverse\_proxy\_url*

Si JOC Cockpit n'est pas accessible à partir de son URL d'origine mais uniquement à partir d'un service de reverse proxy, cette valeur indique l'URL à utiliser, par exemple pour les notifications par e-mail,

## Paramètres de Tâche

### Paramètre : *allow\_empty\_arguments*, Défaut : *false*

Par défaut, les arguments spécifiés pour les tâches doivent contenir des valeurs, faute de quoi le Workflow est considéré comme invalide. Ce paramètre remplace le comportement par défaut et permet de spécifier des valeurs vides.

## Paramètres de l'Ordre

### Paramètre : *allow\_undeclared\_variables*, Défaut : *false*

Par défaut, toutes les variables de l'Ordre doivent être déclarées dans le Workflow. Ce paramètre modifie le comportement par défaut et permet aux Ordres de spécifier des variables arbitraires. Les utilisateurs doivent savoir que les tâches et les instructions connexes échoueront s'ils font référence à des variables qui ne sont pas spécifiées par les Ordres entrants.

## Paramètres des Tags

### Paramètre : *num\_of\_tags\_displayed\_as\_order\_id*, Défaut : *0*

Indique le nombre de Tags affichés avec chaque Ordre. La valeur 0 supprime l'affichage des Tags. Tenez compte du fait que l'affichage d'un grand nombre de Tags par Ordre peut entraîner des pertes de performances.

### Paramètre : *num\_of\_workflow\_tags\_displayed*, Défaut : *0*

Indique le nombre de Tags affichées pour chaque Workflow. La valeur 0 supprime l'affichage des Tags.

## Paramètres d'Autorisation

### Paramètre : *approval\_requestor\_role*

Indique le nom du rôle de demandeur auquel sont attribués les comptes soumis au processus d'approbation.

## Paramètres du Rapport

### Paramètre : *report\_java\_options*, Défaut : *-Xmx54M*

Spécifie les options Java utilisées lors de la création de rapports. La valeur par défaut tient compte de l'espace de pagination Java minimal requis pour créer les rapports. Les utilisateurs qui constatent un plus grand nombre d'exécutions de tâches par jour peuvent être amenés à augmenter cette valeur pour répondre aux besoins en mémoire.

## Références

### Aide contextuelle

- [Journal d'Audit](/audit-log)
- [Profil - Préférences](/profile-preferences)
- [Réglages](/settings)
- [REST Web Service API](/rest-api)
- [Services d'Identité](/identity-services)

### Product Knowledge Base

- [JS7 - Audit Log](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Log)
- [JS7 - Audit Trail](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Trail)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
