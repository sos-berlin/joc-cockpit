# Affichage du Journal d'Ordre

L'affichage *Journal d'Ordre* offre un journal en cours d'exécution qui est mis à jour toutes les 2 ou 3 secondes. Cela permet de suivre la sortie des Ordres et des instructions de Workflow exécutées par l'Ordre en temps quasi réel.

## Filtrage des sorties

La vue *Journal d'Ordre* permet de filtrer à partir d'un certain nombre de critères disponibles en haut de la fenêtre :

- **Main** spécifie que les détails concernant les débuts d'Ordres, les débuts de tâches et le paramétrage sur les débuts de tâches seront affichés. Cette sortie est indiquée par le qualificatif \[MAIN\].
- **Les événements de succès** sont indiqués par le qualificatif \[SUCCESS\] et affichent des détails tels que le paramétrage résultant lorsque les tâches sont terminés.
- **stdout** spécifie si la sortie écrite par les Jobs sur le canal stdout sera affichée à l'aide du qualificateur \[STDOUT\].
- **Debug** s'applique aux Jobs de la JVM qui utilisent [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API). Ces Jobs peuvent se voir ajouter l'argument *log_level* contenant la valeur *debug* ou*trace*. Si une sortie de débogage est disponible pour une tâche, elle sera affichée à l'aide du qualificateur \[DEBUG\].

La sortie de journal écrite par les âche sur le canal stderr n'est pas soumise au filtrage et sera affichée à l'aide du qualificateur \[STDERR\].

## Affichage de la sortie de journal

La sortie du journal est affichée dans l'ordre historique d'arrivée. Si un Workflow fork l'exécution à des tâches parallèles, la sortie de chaque tâche sera affichée de manière cohérente.

En haut de la fenêtre, les icônes chevron vers le bas et chevron vers le haut permettent de développer ou de réduire la sortie du journal de n'importe quel tâche.

### Horodatage

La sortie du journal indique les horodatages provenant de différentes sources :

- **Heure de l'Agent** : Les événements initiaux principaux tels que *OrderStarted* sont créés par l'Agent et reflètent l'horloge en temps réel de l'Agent.
- **Heure de la Tâche** : La sortie des tâches utilise le fuseau horaire du serveur sur lequel la tâche sera exécuté ou le fuseau horaire spécifié dans l'implémentation de la tâche.
- **Heure du Contrôleur** : Les événements finaux tels que *OrderFinished* sont créés par le Contrôleur et reflètent l'horloge en temps réel du Contrôleur.

Le *Journal d'Ordre* convertit les horodatages en fonction du fuseau horaire de l'utilisateur, si le paramètre correspondant dans [Profil - Préférences](/profile-preferences) est actif. Sinon, les fuseaux horaires du Contrôleur et de l'Agent seront utilisés.

Si les horloges en temps réel du Contrôleur et de l'Agent ne sont pas synchronisées, la sortie du journal peut suggérer un déplacement dans le temps.

### Navigation

Sur le côté droit de l'écran, les utilisateurs trouvent une icône de flèche vers la gauche qui fait avancer la vue de navigation.

Cette vue présente l'historique des tâches et des instructions de Workflow exécutées par l'Ordre. La couleur rouge indique les tâches et les instructions de Workflow qui ont échoué.

En cliquant sur une tâche dans la vue de navigation, vous accédez à la sortie du journal de la tâche correspondante.

## Références

- [Profil - Préférences](/profile-preferences)
- [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API)
- [JS7 - Log Levels and Debug Options](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Levels+and+Debug+Options)
