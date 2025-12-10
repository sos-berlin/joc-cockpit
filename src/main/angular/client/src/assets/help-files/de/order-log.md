# Anzeige Auftragsprotokoll

Die *Anzeige Auftragsprotokoll* bietet ein laufendes Protokoll, das alle 2-3 Sekunden aktualisiert wird. So können Sie die Ausgaben von Jobs und Anweisungen des Arbeitsablaufs nahezu in Echtzeit verfolgen.

## Filter

In der *Anzeige Auftragsprotokoll* können Sie nach einer Reihe von Kriterien filtern, die im oberen Teil des Fensters verfügbar sind:

- **Main** gibt an, dass Details über Auftragsstarts, Job Starts und die Parametrierung von Auftragsstarts angezeigt werden. Eine solche Ausgabe wird durch den Qualifizierer [MAIN] angezeigt.
- **Success** Ereignisse werden durch den Qualifizierer [SUCCESS] gekennzeichnet und zeigen Details wie die resultierende Parametrierung an, wenn Jobs abgeschlossen sind.
- **stdout** gibt an, ob die von Jobs in den stdout Kanal geschriebenen Ausgaben mit dem Qualifizierer [STDOUT] angezeigt werden sollen.
- **Debug** gilt für JVM Jobs, die [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API) verwenden. Solchen Jobs kann das Argument *log_level* mit dem Wert *debug* oder *trace* hinzugefügt werden. Wenn eine Debug-Ausgabe von einem Job verfügbar ist, wird sie mit dem Qualifizierer [DEBUG] angezeigt.
- **Detail** legt fest, ob Ereignisse aus Arbeitsablauf-Anweisungen, die zum Beispiel Notizen senden oder empfangen, angezeigt werden sollen.

Protokollausgaben, die von Jobs in den stderr Kanal geschrieben werden, unterliegen nicht der Filterung und werden mit dem Qualifizierer [STDERR] angezeigt.

## Anzeige des Protokolls

Die Protokollausgaben werden in der Reihenfolge der Erstellung angezeigt. Wenn ein Arbeitsablauf die Ausführung an parallele Jobs weitergibt, werden die Ausgaben der einzelnen Jobs zusammenhängend angezeigt.

Am oberen Rand des Fensters finden Sie die Symbole Chevron-down und Chevron-up, mit denen Sie die Protokollausgabe aller Jobs ein- und ausblenden können.

### Anzeigebereich

#### Zeitstempel

Die Protokollausgabe enthält Zeitstempel aus unterschiedlichen Quellen:

- **Zeit des Agenten**: Initiale Eeignisse wie *OrderStarted* werden vom Agenten generiert und spiegeln die Echtzeituhr des Agenten wider.
- **Zeit des Jobs**: Bei der Ausgabe von Jobs wird die Zeitzone des Servers verwendet, auf dem der Job ausgeführt wird, oder die Zeitzone, die in der Job-Implementierung angegeben ist.
- **Zeit des Controller**: Abschließende Ereignisse wie *OrderFinished* werden vom Controller generiert und spiegeln die Echtzeituhr des Controller wieder.

Die *Anzeige Auftragsprotokoll* konvertiert Zeitstempel in die Zeitzone des Benutzers, wenn die entsprechende Einstellung in [Profil - Einstellungen](/profile-preferences) aktiv ist. Andernfalls werden die Zeitzonen des Controller und des Agenten verwendet, die ggf. nicht übereinstimmen.

Wenn die Echtzeituhren des Controller und eines Agenten nicht synchronisiert sind, kann dies zu Protokollausgaben führen, die Zeitreisen suggerieren.

### Navigationsbereich

Auf der rechten Seite des Fensters finden Sie ein Pfeil-Links-Symbol, mit dem Sie den Navigationsbereich öffnen können.

Der Bereich zeigt die historische Reihenfolge der vom Auftrag ausgeführten Jobs und Anweisungen an. Die rote Farbe weist auf fehlgeschlagene Jobs und Anweisungen hin.

Wenn Sie im Navigationsbereich auf einen Job oder eine Anweisung klicken, wird die entsprechende Protokollausgabe im Anzeigebereich angezeigt.

## Referenzen

- [Profil - Einstellungen](/profile-preferences)
- [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API)
- [JS7 - Log Levels and Debug Options](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Levels+and+Debug+Options)
