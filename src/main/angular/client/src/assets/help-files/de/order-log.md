# Ansicht Auftragsprotokoll

Die *Auftragsprotokollansicht* bietet ein laufendes Protokoll, das alle 2-3 Sekunden aktualisiert wird. So können Sie die Ausgabe von Aufträgen und Arbeitsabläufen, die durch den Auftrag ausgeführt werden, nahezu in Echtzeit verfolgen.

## Ausgabefilterung

In der *Auftragsprotokollansicht* können Sie nach einer Reihe von Kriterien filtern, die im oberen Teil des Fensters verfügbar sind:

- **Haupt** gibt an, dass Details über Auftragsstarts, Auftragsstarts und die Parametrisierung von Auftragsstarts angezeigt werden. Eine solche Ausgabe wird durch den Qualifizierer [MAIN] angezeigt.
- **Erfolg** Ereignisse werden durch den Qualifizierer [SUCCESS] gekennzeichnet und zeigen Details wie die resultierende Parametrisierung an, wenn Jobs abgeschlossen sind.
- **stdout** gibt an, ob die von Jobs in den stdout-Kanal geschriebenen Ausgaben mit dem Qualifizierer [STDOUT] angezeigt werden sollen.
- **Debug** gilt für JVM-Jobs, die [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API) verwenden. Solchen Jobs kann das Argument *log_level* mit dem Wert *debug* oder *trace* hinzugefügt werden. Wenn eine Debug-Ausgabe von einem Job verfügbar ist, wird sie mit dem Qualifizierer [DEBUG] angezeigt.

Log-Ausgaben, die von Jobs in den stderr-Kanal geschrieben werden, unterliegen nicht der Filterung und werden mit dem Qualifizierer [STDERR] angezeigt.

## Anzeige der Protokollausgabe

Die Protokollausgabe wird in der historischen Reihenfolge der Ankunft angezeigt. Wenn ein Arbeitsablauf die Ausführung an parallele Jobs weitergibt, werden die Ausgaben der einzelnen Jobs zusammenhängend angezeigt.

Am oberen Rand des Fensters finden Sie die Symbole Chevron-down und Chevron-up, mit denen Sie die Protokollausgabe aller Jobs ein- und ausblenden können.

### Zeitstempel

Die Protokollausgabe enthält Zeitstempel aus verschiedenen Quellen:

- **Zeit des Agenten**: Anfängliche Hauptereignisse wie *OrderStarted* werden vom Agenten erstellt und spiegeln die Echtzeituhr des Agenten wider.
- **Zeit des Jobs**: Bei der Ausgabe von Jobs wird die Zeitzone des Servers verwendet, auf dem der Job ausgeführt wird, oder die Zeitzone, die in der Job-Implementierung angegeben ist.
- **Zeit des Controllers**: Abschließende Ereignisse wie *OrderFinished* werden vom Controller erzeugt und spiegeln die Echtzeituhr des Controllers wider.

Die *Auftragsprotokollansicht* konvertiert Zeitstempel in die Zeitzone des Benutzers, wenn die entsprechende Einstellung in [Profil - Einstellungen](/profile-preferences) aktiv ist. Andernfalls werden die Zeitzonen des Controllers und des Agenten verwendet.

Wenn die Echtzeituhren des Controllers und des Agenten nicht synchronisiert sind, kann dies zu Protokollausgaben führen, die Zeitreisen suggerieren.

### Navigation

Auf der rechten Seite des Anzeigefeldes finden Sie ein Pfeil-Links-Symbol, mit dem Sie das Navigationsfeld aufrufen können.

Das Panel zeigt die historische Reihenfolge der vom Auftrag ausgeführten Aufträge und Arbeitsabläufe an. Die rote Farbe weist auf fehlgeschlagene Aufträge und Arbeitsabläufe hin.

Wenn Sie im Navigationsbereich auf einen Auftrag klicken, wird die Protokollausgabe des entsprechenden Auftrags im Anzeigebereich angezeigt.

## Referenzen

- [Profil - Einstellungen](/profile-preferences)
- [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API)
- [JS7 - Log Levels and Debug Options](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Levels+and+Debug+Options)

