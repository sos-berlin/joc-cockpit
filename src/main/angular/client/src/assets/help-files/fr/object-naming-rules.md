# Règles de Dénomination des Objets

Les noms d'objets sont spécifiés à plusieurs endroits pour :

- Workflows, Tâches, Variables, Tableaux de Condition, Verrous de Ressources, Sources d'Ordres de Fichiers, Ressources de Tâches, Dossiers,
- Les Calendriers, les Planifications, les Blocks Scripts, les Modèles de Tâche, les Rapports.

Le JS7 n'impose pas de conventions de dénomination pour les objets : les utilisateurs sont libres de choisir des conventions de dénomination à leur guise, par exemple pour les noms de tâches en utilisant :

- le style camel case comme dans : *loadDataWarehouseDaily*
- style tiret comme dans : *load-data-warehouse-daily*
- style mixte comme dans : *DataWarehouse-Load-Daily*

## Jeu de caractères

JS7 permet l'utilisation de caractères Unicode pour les noms d'objets.

### Noms d'objets

Un certain nombre de restrictions s'appliquent aux noms d'objets :

#### Règles de dénomination

- Les règles de dénomination suivantes doivent être prises en compte pour les noms d'objets : [Identificateurs Java] (https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.8)
- Aucun caractère de contrôle n'est autorisé selon l'expression régulière \[^\\\\x00-\\\\x1F\\\\x7F\\\\x80-\\\\x9F\]
- Aucun caractère de ponctuation n'est autorisé. Toutefois, les points '.', le trait de soulignement '_' et le tiret '-' sont autorisés conformément à l'expression régulière : \[^\\\\x20-\\\\x2C\\\\x2F\\\\x3A-\\\\x40\\\\x5B-\\\\x5E\\\\x60\\\\x7B-\\\\x7E\\\\xA0-\\\\xBF\\\\xD7\\\\xF7\]
  - Point : n'est pas autorisé comme caractère de début ou de fin et deux points à la suite ne sont pas autorisés.
  - Tiret : n'est pas autorisé comme caractère d'ouverture ou de fermeture et deux tirets à la suite ne sont pas autorisés.
  - Les parenthèses ne sont pas autorisées [({})\]
- Les caractères demi-largeur ne sont pas autorisés, voir [Formes demi-largeur et pleine largeur] (https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_(Unicode_block)).
- Les espaces ne sont pas autorisés.
- Les noms d'objets peuvent commencer par un chiffre.
- L'utilisation des mots-clés réservés de Java n'est pas autorisée :
  - *abstrait, continue, for, new, switch, assert, default, goto, package, synchronized, boolean, do, if, private, this, break, double, implements, protected, throw, byte, else, import, public, throws, case, enum, instanceof, return, transient, catch, extends, int, short, try, char, final, interface, static, void, class, finally, long, strictfp, volatile, const, float, native, super, while*
  - Exemple : l'utilisation du mot-clé réservé *switch* n'est pas autorisée, l'utilisation de *myswitch* est autorisée.

#### Exemples

- Caractères des langues nationales comme le japonais :
  - *こんにちは世界*
- Utilisation du point, du tiret, du trait de soulignement :
  - *Say.Hello*
  - *Say-Hello*
  - *Say_hello*

#### Tags

Des règles plus souples s'appliquent aux *Tags* utilisées pour indiquer la position d'une tâche ou d'une autre instruction de Workflow :

- Les Tags peuvent commencer par des chiffres, des caractères, _
- Les Tags peuvent inclure $, _, -, #, :, !
- Les Tags ne peuvent pas inclure ce qui n'est pas autorisé pour les noms d'objets, par exemple pas de guillemets, pas d'espaces, \[, \], {, }, /, \, =, +

### Unicité des noms d'objets

Les noms d'objets dans le JS7 sont uniques par type d'objet, c'est-à-dire par Workflow, par tâche dans un Workflow, par Verrou, etc.

- Les utilisateurs peuvent ajouter des noms d'objets avec une orthographe majuscule/minuscule.
- Le nom de l'objet est conservé par l'interface graphique du JOC Cockpit exactement tel qu'il a été saisi par l'utilisateur.
- Les utilisateurs ne peuvent pas ajouter le même nom d'objet avec une orthographe différente si cela n'est pas pris en charge par le SGBD sous-jacent pour le type de données *nvarchar*. Par exemple, si un nom d'objet existant est *myLock*, un nouvel objet portant le nom *mylock* ne peut pas être créé avec le SGBD MySQL.

### Longueur des noms d'objets

La longueur maximale des noms d'objets est la suivante :

- En principe, les noms d'objets peuvent contenir jusqu'à 255 caractères Unicode.
- La restriction suivante s'applique :
  - Les objets sont généralement situés dans des dossiers : la longueur totale de la hiérarchie du dossier et du nom de l'objet ne doit pas dépasser 255 caractères.
  - Les branches à l'intérieur d'un site [JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction) sont limitées à 10 caractères.
  - Les branches peuvent être imbriquées jusqu'à 15 niveaux.

## Références

- [Formes demi-largeur et pleine largeur](https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_(Unicode_block))
- [Identifiants Java](https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.8)
- [JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction)
- [JS7 - Object Naming Rules](https://kb.sos-berlin.com/display/JS7/JS7+-+Object+Naming+Rules)
