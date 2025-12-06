# Anzeige Job-Potokoll

Die *Anzeige Job-Protokoll* bietet ein laufendes Protokoll, das alle 2-3 Sekunden aktualisiert wird. So können Sie die Ausgaben von Jobs nahezu in Echtzeit verfolgen.

## Filter

In der *Anzeige Job-Protokoll* können Sie nach einer Reihe von Kriterien filtern, die Sie oben im Fenster finden:

- **Main** gibt an, dass Details über den Job-Start und die Parametrierung beim Job-Start angezeigt werden sollen. Diese Ausgabe wird durch den Qualifizierer [MAIN] angezeigt.
- **stdout** gibt an, ob die vom Job in den stdout Kanal geschriebenen Ausgaben mit dem Qualifizierer [STDOUT] angezeigt werden sollen.
- **Debug** gilt für JVM Jobs, die [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API) verwenden. Solchen Jobs kann das Argument *log_level* mit dem Wert *debug* oder *trace* hinzugefügt werden. Wenn eine Debug-Ausgabe von einem Job verfügbar ist, wird sie mit dem Qualifizierer [DEBUG] angezeigt.

Protokollausgaben, die von Jobs in den stderr Kanal geschrieben werden, unterliegen nicht der Filterung und werden mit dem Qualifizierer [STDERR] angezeigt.

## Anzeigebereich

Die Protokollausgaben werden in der Reihenfolge der Erstellung angezeigt.

### Zeitstempel

Ein Protokoll enthält Zeitstempel aus unterschiedlichen Quellen:

- **Zeit des Agenten**: Ereignisse wie *Start* und *Ende* werden vom Agenten generiert und spiegeln die Echtzeituhr des Agenten wider.
- **Zeit des Jobs**: Bei der Ausgabe von Jobs wird die Zeitzone des Servers verwendet, auf dem der Job ausgeführt wird, oder die Zeitzone, die in der Job-Implementierung angegeben ist.

Die *Anzeige Job-Protokoll* konvertiert Zeitstempel in die Zeitzone des Benutzers, wenn die entsprechende Einstellung in [Profil - Einstellungen](/profile-preferences) aktiviert ist. Andernfalls wird die Zeitzone des Agenten verwendet.

Wenn die Echtzeituhr des Agenten nicht synchronisiert ist, kann dies zu ungenauen Zeitstempeln in den Protokollen führen.

## Referenzen

- [Profil - Einstellungen](/profile-preferences)
- [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API)
- [JS7 - Log Levels and Debug Options](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Levels+and+Debug+Options)
