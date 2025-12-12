# Configuration - Inventaire - Rapports

La Vue *rapports* permet de spécifier des rapports sur l'exécution des Workflows et des Tâches :

- Les configurations des rapports sont gérées à partir de l'inventaire disponible dans la vue *Configuration* du JOC Cockpit. Elles comprennent la spécification :
  - **Modèle de rapport** indiquant le type de rapport, par exemple les 10 premiers workflows ayant échoué, les 100 premiers tâches ayant échoué, etc. Pour obtenir la liste complète, consultez le site [Report Templates](/report-templates).
  - la **Période de rapport** est une plage de dates pour laquelle les éléments sont rapportés. Les plages de dates peuvent être absolues ou relatives, par exemple les deux derniers mois, le dernier trimestre, l'année dernière.
  - la **fréquence** divise la *période de rapport* en unités de temps égales, par exemple par semaine ou par mois.
- L'exécution et la visualisation des rapports sont disponibles dans la vue *Rapports* de JOC Cockpit.

Les rapports sont gérés à partir des panneaux suivants :

- La page [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation), situé sur le côté gauche de la fenêtre, permet de naviguer dans les dossiers contenant les rapports. En outre, ce panneau permet d'effectuer des opérations sur les rapports.
- La vue *rapports* sur le côté droit de la fenêtre contient les détails de la configuration des rapports.

## Vue des rapports

Pour un rapport, les entrées suivantes sont disponibles :

- **Nom** est l'identifiant unique d'un rapport, voir [Object Naming Rules](/object-naming-rules).
- **Titre** explique l'objet du rapport. 
- **Modèle de rapport** spécifie le site [Report Template](/report-templates) utilisé.
- **Période du rapport** spécifie la plage de dates qui est l'une des suivantes :
  - **du .. au**
    - *Mois du*, *Mois au* spécifie le nombre de mois passés à partir desquels la *Période du rapport* commencera et se terminera, par exemple de *1m* à *1m* pour le dernier mois.
  - **calculé**
    - *Unité* est l'un des éléments suivants : *Année*, *Mois*, *Trimestre*
    - *From* spécifie le nombre d'unités passées à partir desquelles la *Période de rapport* commencera, par exemple *3 mois* auparavant.
    - *Count* spécifie le nombre d'unités passées à partir desquelles la *Période de rapport* se terminera.
  - **Preset** permet de choisir parmi un certain nombre de plages de dates prédéfinies telles que *Dernier mois*, *Ce trimestre*, *Dernier trimestre*, *Cette année*, *Dernière année*
- **Tri**
  - **Le plus élevé** : Le rapport renvoie les n valeurs les plus élevées.
  - **Lowest** : Le rapport renvoie les n valeurs les plus basses.
- **Fréquence** : spécifie la division de la *période du rapport* en unités de temps égales :
  - *chaque semaine*
  - *toutes les 2 semaines
  - *mensuel* *tous les 3 mois*
  - *tous les 3 mois
  - *tous les 6 mois
  - tous les 6 mois* *annuel

## Opérations sur les rapports

Pour les opérations générales, voir [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

Les opérations sur les rapports sont disponibles à partir des vues suivantes :

- Les rapports sont créés à partir de la vue [Report - Creation](/report-creation).
- L'exécution des rapports est disponible à partir de la vue [Report - Run History](/report-run-history).
- Les rapports sont visualisés à partir de la vue [Reports](/reports).

## Références

### Aide contextuelle

- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Object Naming Rules](/object-naming-rules)
- [Reports](/reports)
- [Report - Creation](/report-creation)
- [Report - Run History](/report-run-history)
- [Report Templates](/report-templates)

### Product Knowledge Base

- [JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports)
- [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration)
- [JS7 - Reports - Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Templates)

