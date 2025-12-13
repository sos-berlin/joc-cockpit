# Documentations

La vue *Documentations* affiche des informations sur l'utilisation des Documentations et permet de les gérer.

Les Documentations sont référencées par les Workflows et les tâches, et sont affichées avec la vue [Workflows](/workflows).

## Vue de navigation

Le vue de gauche affiche l'arborescence des dossiers d'inventaire contenant les Documentations.

- Un clic sur le dossier permet d'afficher les Documentations de ce dossier.
- En cliquant sur l'icône en forme de chevron vers le bas disponible lorsque vous survolez un dossier, vous affichez les Documentations de ce dossier et de tous les sous-dossiers.

L'icône de recherche rapide permet de rechercher des Documentations en fonction des données saisies par l'utilisateur :

- En tapant **Test**, vous obtiendrez des Documentations portant des noms tels que *test-documentation-1* et *TEST-documentation-2*. 
- Si vous tapez **\*Test**, vous obtiendrez des Documentations portant des noms tels que *documentation-test-1* et *Documentation-test-2*

## Panneau de Documentation

### Vue Documentations

Les informations suivantes sont affichées :

- **Nom** est le nom unique de la Documentation.
- **Référence** indique le nom du fichier de Documentation qui a été téléchargé.
- **Type** est l'un des types supportés *Text*, *Markdown*, *HTML*, *XML*, *PDF* etc.
- **Modifié** date de la dernière modification.

### Opérations sur les Documentations

Les opérations suivantes sont disponibles à partir du menu d'action d'une Documentation :

- **Éditer la documentation** permet de modifier le fichier référencé.
- **Prévisualiser la Documentation** ouvre l'application à laquelle est attribué le type de mime correspondant pour l'affichage de la Documentation.
- **Exporter** exporte la Documentation dans un fichier d'archive .zip.
- **Supprimer** supprimera la Documentation.
- **Afficher l'utilisation** affichera les Workflows qui contiennent des références à la Documentation.

En haut de la fenêtre, le bouton *Ajouter une Documentation* est proposé :

- **Téléchargement de la Documentation** permet de sélectionner un fichier qui sera téléchargé.
- **Chemin d'accès** spécifie le dossier et le nom de la Documentation dans l'inventaire.

## Références

- [Workflows](/workflows)
- [JS7 - User Documentation](https://kb.sos-berlin.com/display/JS7/JS7+-+User+Documentation)
