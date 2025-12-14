# Configuration - Inventaire - Modelès de Rapport

La Vue *Modèles de Rapport* permet de spécifier des rapports sur l'exécution des Workflows et des Tâches :

- Les configurations des rapports sont gérées à partir de l'inventaire disponible dans la vue *Configuration* du JOC Cockpit. Elles comprennent la spécification :
  - **Maquette de Rapport** indiquant le type de rapport, par exemple les 10 premiers workflows ayant échoué, les 100 premiers tâches ayant échoué, etc. Pour obtenir la liste complète, consultez le [Maquettes de Rapport](/report-templates).
  - la **Période de Rapport** est une plage de dates pour laquelle les éléments sont rapportés. Les plages de dates peuvent être absolues ou relatives, par exemple les deux derniers mois, le dernier trimestre, l'année dernière.
  - la **Fréquence** divise la *Période de Rapport* en unités de temps égales, par exemple par semaine ou par mois.
- L'exécution et la visualisation des rapports sont disponibles dans la vue *Rapports* de JOC Cockpit.

Les Modèles de Rapport sont gérés à partir des panneaux suivants :

- La page [Configuration - Inventaire - Navigation](/configuration-inventory-navigation), situé sur le côté gauche de la fenêtre, permet de naviguer dans les dossiers contenant les Modèles de Rpport. En outre, ce panneau permet d'effectuer des opérations sur les Modèles de Rapport.
- La vue *Modèles de Rapport* sur le côté droit de la fenêtre contient les détails de la configuration des Modèles de Rapport.

## Vue des Modèles de Rapport

Pour un Modèle de Rapport, les entrées suivantes sont disponibles :

- **Nom** est l'identifiant unique d'un rapport, voir [Règles de Dénomination des Objets](/object-naming-rules).
- **Titre** explique l'objet du rapport. 
- **Maquette de Rapport** spécifie le [Maquette de Rapport](/report-templates) utilisé.
- **Période du Rapport** spécifie la plage de dates qui est l'une des suivantes :
  - **du .. au**
    - *Mois du*, *Mois au* spécifie le nombre de mois passés à partir desquels la *Période du Rapport* commencera et se terminera, par exemple de *1m* à *1m* pour le dernier mois.
  - **calculé**
    - *Unité* est l'un des éléments suivants : *Année*, *Mois*, *Trimestre*
    - *From* spécifie le nombre d'unités passées à partir desquelles la *Période de rapport* commencera, par exemple *3 mois* auparavant.
    - *Count* spécifie le nombre d'unités passées à partir desquelles la *Période de rapport* se terminera.
  - **prédéfini** permet de choisir parmi un certain nombre de plages de dates prédéfinies telles que *Dernier mois*, *Ce trimestre*, *Dernier trimestre*, *Cette année*, *Dernière année*
- **Tri**
  - **le plus élevé** : Le rapport renvoie les n valeurs les plus élevées.
  - **le plus bas** : Le rapport renvoie les n valeurs les plus basses.
- **Fréquence** : spécifie la division de la *Période du Rapport* en unités de temps égales :
  - *chaque semaine*
  - *toutes les 2 semaines
  - *mensuel* *tous les 3 mois*
  - *tous les 3 mois
  - *tous les 6 mois
  - *tous les 6 mois* 
  - *annuel*

## Opérations sur les Modèles de Rapport

Pour les opérations générales, voir [Configuration - Inventaire - Navigation](/configuration-inventory-navigation).

Les opérations sur les rapports sont disponibles à partir des vues suivantes :

- Les rapports sont créés à partir de la vue [Création des Rapports](/report-creation).
- L'exécution des rapports est disponible à partir de la vue [Historique d'Exécution des Rapports](/report-run-history).
- Les rapports sont visualisés à partir de la vue [Rapports](/reports).

## Références

### Aide contextuelle

- [Création des Rapports](/report-creation)
- [Configuration - Inventaire - Navigation](/configuration-inventory-navigation)
- [Historique d'Exécution des Rapports](/report-run-history)
- [Maquettes de Rapport](/report-templates)
- [Rapports](/reports)
- [Règles de Dénomination des Objets](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports)
- [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration)
- [JS7 - Reports - Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Templates)
