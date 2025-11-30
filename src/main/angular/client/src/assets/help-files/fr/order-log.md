# Vue du journal des ordres

La vue *Journal de l'Ordre* offre un journal en cours d'exécution qui est mis à jour toutes les 2 ou 3 secondes. Cela permet de suivre la sortie des Ordres et des instructions de Workflow exécutées par l'Ordre en temps quasi réel.

## Filtrage des sorties

La vue *Ordre Log View* permet de filtrer à partir d'un certain nombre de critères disponibles en haut de la fenêtre :

- **Main** spécifie que les détails concernant les débuts d'ordres, les débuts de travaux et le paramétrage sur les débuts de travaux seront affichés. Cette sortie est indiquée par le qualificatif [MAIN].
- **Les événements de succès** sont indiqués par le qualificatif [SUCCESS] et affichent des détails tels que le paramétrage résultant lorsque les travaux sont terminés.
- **stdout** spécifie si la sortie écrite par les Jobs sur le canal stdout sera affichée à l'aide du qualificateur [STDOUT].
- **Debug** s'applique aux Jobs de la JVM qui utilisent [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API). Ces Jobs peuvent se voir ajouter l'argument *log_level* contenant la valeur *debug* ou*trace*. Si une sortie de débogage est disponible pour un travail, elle sera affichée à l'aide du qualificateur [DEBUG].

La sortie de journal écrite par les travaux sur le canal stderr n'est pas soumise au filtrage et sera affichée à l'aide du qualificateur [STDERR].

## Affichage de la sortie de journal

La sortie du journal est affichée dans l'ordre historique d'arrivée. Si un Workflow fork l'exécution à des Jobs parallèles, la sortie de chaque Job sera affichée de manière cohérente.

En haut de la fenêtre, les icônes chevron vers le bas et chevron vers le haut permettent de développer ou de réduire la sortie du journal de n'importe quel travail.

### Horodatage

La sortie du journal indique les horodatages provenant de différentes sources :

- **Heure de l'agent** : Les événements initiaux principaux tels que *OrderStarted* sont créés par l'agent et reflètent l'horloge en temps réel de l'agent.
- **Heure du travail** : La sortie des Jobs utilise le fuseau horaire du serveur sur lequel le Job sera exécuté ou le fuseau horaire spécifié dans l'implémentation du Job.
- **Heure du contrôleur** : Les événements finaux tels que *OrderFinished* sont créés par le contrôleur et reflètent l'horloge en temps réel du contrôleur.

Le *Ordre Log View* convertit les horodatages en fonction du fuseau horaire de l'utilisateur, si le paramètre correspondant dans le site [Profile - Preferences](/profile-preferences) est actif. Sinon, les fuseaux horaires du contrôleur et de l'agent seront utilisés.

Si les horloges en temps réel du contrôleur et de l'agent ne sont pas synchronisées, la sortie du journal peut suggérer un déplacement dans le temps.

### Navigation

Sur le côté droit de l'écran, les utilisateurs trouvent une icône de flèche vers la gauche qui fait avancer le panneau de navigation.

Ce panneau présente l'historique des tâches et des instructions de Workflow exécutées par l'Ordre. La couleur rouge indique les tâches et les instructions de Workflow qui ont échoué.

En cliquant sur une tâche dans le panneau de navigation, vous accédez à la sortie du journal de la tâche correspondante dans le panneau d'affichage.

## Références

- [Profile - Preferences](/profile-preferences)
- [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API)
- [JS7 - Log Levels and Debug Options](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Levels+and+Debug+Options)

