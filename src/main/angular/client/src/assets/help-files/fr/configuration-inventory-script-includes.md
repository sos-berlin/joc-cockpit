# Configuration - Inventaire - Blocs Scripts

La vue *Blocs Scripts* permet de spécifier des extraits de code à utiliser avec les tâches. Pour plus de détails, voir [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes).

Les tâches Shell peuvent être utilisées pour un certain nombre de langages de script tels que Bash, Python, PowerShell, etc.

- Les utilisateurs réutilisent souvent des extraits de code dans plusieurs tâches, par exemple des fonctions réutilisables qui sont appelées dans plusieurs *Scripts de Jobs*.
- Cela s'applique aux tâches Shell utilisant Bash, etc. et à l'utilisation de n'importe quel langage de script avec une tâche.
- Les Blocs Scripts sont développés dans les *Scripts de la Tâche* lorsque le Workflow est déployé. Cela implique que les modifications apportées aux inclusions de scripts nécessitent le déploiement du Workflow correspondant. Le JS7 garde la trace des dépendances et propose de déployer les Workflows associés lors de la publication du Bloc Script.

Les Blocs Scripts sont gérés à partir des panneaux suivants :

- La page [Configuration - Inventaire - Navigation](/configuration-inventory-navigation), sur le côté gauche de la fenêtre, permet de naviguer dans les dossiers contenant les Blocs Scripts. En outre, cette vue permet d'effectuer des opérations sur les inclusions de scripts.
- La vue *Blocs Scripts*, sur le côté droit de la fenêtre, contient les détails de la configuration des scripts inclus.

## Vue Blocs Scripts

Pour un script inclus, les entrées suivantes sont disponibles :

- **Nom** est l'identifiant unique d'un Bloc Script, voir [Règles de Dénomination des Objets](/object-naming-rules).
- **Titre** contient une explication facultative de l'objectif de l'inclusion de script.
- **Bloc Script** contient l'extrait de code.

## Opérations sur les Blocs Scripts

Pour les opérations disponibles, voir [Configuration - Inventaire - Navigation](/configuration-inventory-navigation).

## Utilisation dans les tâches

Les tâches font référence à des inclusions de script à partir de la propriété *Script de la Tâche* en utilisant l'une des saveurs syntaxiques suivantes :

- **\#\#!include *script-include-name***
- **::!include *script-include-name***
- **//!include *script-include-name***

Le *script-include-name* spécifie l'identifiant du script inclus. Les utilisateurs peuvent saisir les données ci-dessus dans le *Script de la Tâche* et invoquer la recherche rapide.

### Recherche rapide

Si vous appuyez sur le raccourci clavier CTRL+Espace alors que le curseur se trouve dans le *Script de la Tâche*, la recherche rapide d'inclusions de scripts sera activée :

- La recherche rapide offre 
  - la navigation à partir des dossiers de l'inventaire,
  - en sélectionnant les Blocs Scripts par leur nom en tapant un ou plusieurs caractères.
- La recherche rapide ne tient pas compte des majuscules et des minuscules et est tronquée à droite. Pour les entrées tronquées à gauche, les utilisateurs peuvent appliquer le métacaractère \* qui est un espace réservé pour n'importe quel nombre de caractères.
- Après avoir sélectionné un Bloc Script, l'entrée correspondante est ajoutée à la ligne sur laquelle se trouve le curseur.

### Paramétrage

Les Blocs Scripts peuvent être paramétrés de la manière suivante :

- **\#\#!include *script-include-name* --replace="search-literal", "replacement-literal"**
- **::!include *script-include-name* --replace="search-literal", "replacement-literal"**
- **//!include *script-include-name* --replace="search-literal", "replacement-literal"**

Le *search-literal* sera recherché dans le Bloc Script et sera remplacé par le *replacement-literal* lorsque le Workflow contenant la tâche associé sera déployé.

### Exemples

#### PowerShell pour Unix

Pour l'utilisation de PowerShell sur les plates-formes Unix, le shebang suivant est suggéré pour un Bloc Script :

<pre>
#!/usr/bin/env pwsh
</pre>

#### PowerShell pour Windows

Pour l'utilisation de PowerShell sur les plates-formes Windows, le shebang suivant est suggéré pour un Bloc Script :

<pre>
@@setlocal enabledelayedexpansion &amp; set NO_COLOR=1 &amp; set f=%RANDOM%.ps1 &amp; @@findstr/v "^@@[fs].*&amp;" "%~f0" &gt; !f ! &amp; powershell.exe -NonInteractive -File !f ! &amp; set e=!errorlevel ! &amp; del /q !f ! &amp; exit !e!/b&amp
</pre>

Le Bloc Script écrira le contenu du *Script de la Tâche* dans un fichier temporaire qui sera exécuté avec le binaire *powershell.exe*. Les utilisateurs doivent passer à l'utilisation du binaire *pwsh.exe* si des versions ultérieures de PowerShell sont utilisées. Les erreurs de script seront prises en compte par l'Agent JS7 et la sortie du journal sera dépouillée des caractères d'échappement pour la coloration. 

## Références

### Aide contextuelle

- [Configuration - Inventaire - Navigation](/configuration-inventory-navigation)
- [Configuration - Inventaire - Workflow - Options de Tâche](/configuration-inventory-workflow-job-options)
- [Règles de Dénomination des Objets](/object-naming-rules)

### Product Knowledge Base

- [JS7 - How to run PowerShell scripts from tâches](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+run+PowerShell+scripts+from+tâches)
- [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes)
