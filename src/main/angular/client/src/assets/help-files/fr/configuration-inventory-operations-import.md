# Configuration - Inventaire - Opérations - Importer

L'importation d'objets consiste à ajouter des éléments à partir d'un fichier d'archive .zip ou .tar.gz dans l'inventaire du JOC Cockpit.

Cela concerne les objets des dossiers système *Contrôleur* et *Automatisation* ainsi que les objets des dossiers d'utilisateur. Les objets peuvent être importés à partir de la même instance JOC Cockpit ou d'une autre instance.

Si des versions différentes de JOC Cockpit sont utilisées pour l'exportation et l'importation, l'importation peut être effectuée vers une version plus récente. L'importation vers des versions antérieures est refusée.

Lors de l'importation d'objets à l'aide de l'opération *Import* à partir du bouton du même nom situé dans le coin supérieur droit de la fenêtre, la fenêtre contextuelle suivante s'affiche :

- **Dossier** désigne le dossier d'inventaire dans lequel les objets sont importés. 
  - Si le dossier n'existe pas, il est créé. Plusieurs dossiers peuvent être spécifiés en les séparant par une barre oblique (/), par exemple */a/b/c*.
  - La hiérarchie des dossiers du fichier d'archive est ajoutée au dossier d'inventaire.
- **Format de fichier** désigne le format .zip ou .tar.gz.
- **Remplacer** signifie que les objets existants portant le même nom seront remplacés.
  - Dans l'inventaire JOC Cockpit, les noms d'objets sont uniques pour chaque type d'objet, comme les flux de travail, les calendriers, etc. 
- **Remplacer les Tags** signifie que les Tags des objets existants, tels que les Workflows, seront remplacés par les Tags du fichier d'archive pour le même objet.
- **Noms d'objets** propose des options si l'option *Remplacer* n'a pas été sélectionnée :
  - **Ignorer si présent** : l'objet n'est pas importé. Un objet existant du même type et portant le même nom est conservé.
- **Ajouter un préfixe** : un préfixe est spécifié, qui est ajouté au nom de l'objet, séparé par un tiret.
- **Ajouter un suffixe** : un suffixe est spécifié, qui est ajouté au nom de l'objet, séparé par un tiret.
- **Nom de fichier** : les utilisateurs peuvent sélectionner un fichier d'archive par glisser-déposer  ou utiliser l'option *choisir les fichiers à télécharger* pour sélectionner un fichier à importer.

## Références

### Aide contextuelle

- [Matrice des Dépendances](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Exportation et importation d'inventaire](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import)
- [JS7 - Dépendances des objets d'inventaire](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
