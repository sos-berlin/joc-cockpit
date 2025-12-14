# Affichage Journal de Tâche

L'afficage *Journal de Tâche* offre un journal en cours d'exécution qui est mis à jour toutes les 2 ou 3 secondes. Cela permet de suivre les résultats des tâches en temps quasi réel.

## Filtrage des sorties

La vue *Journal de Tâche* permet de filtrer à partir d'un certain nombre de critères disponibles en haut de la fenêtre :

- **Main** spécifie que les détails concernant le démarrage de la tâche et le paramétrage au démarrage de la tâche seront affichés. Cette sortie est indiquée par le qualificateur \[MAIN\].
- **stdout** spécifie si la sortie écrite par la tâche sur le canal stdout sera affichée à l'aide du qualificateur \[STDOUT\].
- **Debug** s'applique aux tâches Java qui utilisent [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API). Ces tâches peuvent se voir ajouter l'argument *log_level* contenant la valeur *debug* ou *trace*. Si une sortie de débogage est disponible pour une tâche, elle sera affichée à l'aide du qualificateur \[DEBUG\].

La sortie de journal écrite par les tâches sur le canal stderr n'est pas soumise au filtrage et sera affichée à l'aide du qualificateur \[STDERR\].

## Affichage de la sortie de journal

La sortie du journal est affichée dans l'ordre historique d'arrivée.

### Horodatage

La sortie du journal indique des horodatages provenant de différentes sources :

- **Heure de l'Agent** : Les événements tels que *ProcessStarted* et *ProcessFinished* sont créés par l'Agent et reflètent son horloge en temps réel.
- **Heure de la Tâche** : La sortie des Jobs utilise le fuseau horaire du serveur sur lequel la tâche sera exécuté ou le fuseau horaire spécifié dans l'implémentation du Job.

Le *Journal d'Ordre* convertit les horodatages dans le fuseau horaire de l'utilisateur, si le paramètre correspondant dans le [Profil - Préférences](/profile-preferences) est actif. Sinon, c'est le fuseau horaire de l'Agent qui est utilisé.

Si l'horloge en temps réel de l'Agent n'est pas synchronisée, les horodatages de la sortie du journal peuvent être inexacts.

## Références

- [Profil - Préférences](/profile-preferences)
- [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API)
- [JS7 - Log Levels and Debug Options](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Levels+and+Debug+Options)
