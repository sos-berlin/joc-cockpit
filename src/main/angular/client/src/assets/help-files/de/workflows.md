# Arbeitsabläufe

Die Ansicht *Arbeitsabläufe* ermöglicht die Überwachung und Steuerung von Arbeitsabläufen.

- Benutzer können Aufträge identifizieren, die für bestimmte Arbeitsabläufe verarbeitet werden.
- Benutzer können Aufträge bei Bedarf zu Arbeitsabläufen hinzufügen. Solche Aufträge werden nicht zum [Tagesplan](/daily-plan) hinzugefügt, sondern werden ad hoc hinzugefügt.

## Bereich: Navigation

Der linke Bereich ist in Registerkarten unterteilt, die die Navigation in Ordnern und die Filterung nach Kennzeichnungen für Arbeitsabläufe und Aufträge ermöglichen.

### Navigation: Ordner

Die Navigation durch Ordner bietet das Symbol mit dem Doppelpfeil nach unten, wenn Sie den Mauszeiger über einen Ordnernamen bewegen. Dadurch werden Arbeitsabläufe aus dem aktuellen Ordner und aus allen Unterordnern angezeigt. Wenn Sie das Symbol mit dem Doppelpfeil nach oben verwenden, wird die Auswahl auf den aktuellen Ordner zurückgesetzt.

### Navigation: Kennzeichnungen

Kennzeichnungen werden auf den folgenden Registerkarten konfiguriert:

- **Kennz. Arbeitsablauf** werden in der Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows) zugewiesen.
- **Kennz. Auftrag** werden in der Ansicht [Konfiguration - Inventar - Zeitpläne](/configuration-inventory-schedules) zugewiesen.

Kennzeichnungen werden über die Symbole + und - ausgewählt und können über das Symbol *Schnellsuche* nachgeschlagen werden. Die Anzeige von Kennzeichnungen muss auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) aktiviert werden.

## Bereich: Arbeitsabläufe

### Zusammenfassung der Aufträge

Im oberen Teil des Fensters befindet sich die Zusammenfassung der Aufträge, ähnlich wie bei [Übersicht - Aufträge](/dashboard-orders). Sie können auf die angegebene Anzahl von Aufträgen für einen bestimmten Zustand klicken, um ein Popup-Fenster zu öffnen, in dem die Liste der Aufträge angezeigt wird.

Die Zusammenfassung der Aufträge wird für Aufträge angezeigt, die sich auf Arbeitsabläufe beziehen, die für ausgewählte Ordner oder Kennzeichnungen angezeigt werden.

### Anzeige von Arbeitsabläufen

- **Name** ist der eindeutige Name, der einem Arbeitsablauf zugewiesen ist.
  - Wenn Sie auf den Namen des *Arbeitsablaufs* klicken, öffnet sich im unteren Teil des Fensters der Bereich *Historie*, in dem die jüngste Ausführungshistorie des Arbeitsablaufs angezeigt wird.
  - Wenn Sie auf das große Pfeil-nach-unten-Symbol klicken, werden alle Aufträge und Jobs angezeigt.
  - Wenn Sie auf das kleine Pfeil-nach-unten-Symbol klicken, werden die Aufträge und Jobs der obersten Ebene angezeigt.
  - Klicken Sie auf das Bleistiftsymbol, um zur Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows) zu gelangen.
  - Wenn Sie auf das +-Symbol klicken, öffnet sich ein Popup-Fenster für [Aufträge hinzufügen](/workflows-orders-add).
- mit den Symbolen **Tabellarische Ansicht** und **Grafische Ansicht** können Sie sich Arbeitsabläufe
  - im tabellarischen Format ansehen, das auf eine übersichtliche Struktur fokussiert ist und Platz spart.
  - im grafischen Format ansehen, das ggf. besser verständlich ist.
- **Ausrolldatum** zeigt das Datum an, an dem der Arbeitsablauf ausgerollt wurde.
- **Status** zeigt an, ob der Arbeitsablauf an den Controller und die Agenten ausgerollt wurde.
  - **Synchron**: Arbeitsabläufe sind ausgerollt und sind für den Controller und die Agenten verfügbar.
  - **Nicht synchron**: Arbeitsabläufe sind nicht an Controller und Agenten ausgerollt, sondern sind nur im Inventar verfügbar.
  - **Ausgesetzt**: Arbeitsabläufe sind eingefroren, sie nehmen Aufträge an, erlauben aber nicht, dass Aufträge gestartet werden, bis die Arbeitsabläufe wieder aufgenommen werden.
  - **Ausstehend**: Arbeitsabläufe warten auf die Bestätigung durch einen oder mehrere Agenten, dass der Arbeitsablauf ausgesetzt oder wieder aufgenommen wurde.
- **Anzahl Aufträge**: zeigt die Anzahl der Aufträge an, die dem Arbeitsablauf zugewiesen sind. 
  - Bis zu drei Aufträge werden direkt mit dem Arbeitsablauf angezeigt. Sie bieten ein Aktionsmenü für Auftragsoperationen.
    - Sie können auf die jeweilige Auftragskennung klicken, um die Protokollausgabe des Auftrags mittels [Anzeige Auftragsprotokoll](/order-log) darzustellen. Das Protokoll enthält die Ausgaben, die von allen mit dem Arbeitsablauf ausgeführten Jobs erzeugt wurden.
  - Wenn Sie auf *Anzahl der Aufträge* klicken, öffnet sich ein Popup-Fenster, in dem alle zugehörigen Aufträge angezeigt werden und das Operationen für einzelne Aufträge und Massenoperationen für ausgewählte Aufträge bietet.

### Anzeige von Jobs und Arbeitsablauf-Anweisungen

Wenn Sie einen Arbeitsablauf mit Hilfe des Pfeil-nach-unten-Symbols erweitern, werden seine Aufträge und Arbeitsanweisungen angezeigt.

## Bereich: Historie

Der Bereich wird im unteren Teil des Fensters angezeigt, wenn Benutzer auf den Namen des Arbeitsablaufs klicken oder einen Auftrag hinzufügen.

### Auftragshistorie

- **Auftragskennung** ist die eindeutige Kennung, die einem Auftrag zugeordnet ist. Wenn Sie auf das Pfeil-nach-unten-Symbol klicken, werden die Auftragsvariablen und die vom Auftrag verarbeiteten Jobs angezeigt. 
- **Adresse** zeigt die letzte Position des Auftrags im Arbeitsablauf an. Benutzer können den Jobs und Arbeitsablauf-Anweisungen *Kennungen* zuweisen, die angezeigt werden, andernfalls wird die technische Position angezeigt.
- **Status** zeigt das letzte Ergebnis im Leben des Auftrags an.
  - Wenn Aufträge abgeschlossen sind, lautet der *Status der Historie* *Erfolgreich* oder *Fehlgeschlagen*.
  - Wenn Aufträge noch nicht abgeschlossen sind, lautet der *Status der Historie* *in Verarbeitung*.
- **Auftragszustand** zeigt den letzten Zustand des Auftrags an, siehe [Auftragszustände](/order-states).
  - Wenn Aufträge abgeschlossen sind, lautet der *Auftragsstatus* *Erfolgreich* oder *Fehlgeschlagen*.

Für den Zugriff auf die Protokollausgaben stehen Ihnen die folgenden Optionen zur Verfügung:

- **Auftragskennung**: Wenn Sie auf die *Auftragskennung* klicken, wird die Protokollausgabe des Auftrags mittels [Anzeige Auftragsprotokoll](/order-log) dargestellt. Das Protokoll enthält die Ausgabe, die von allen mit dem Arbeitsablauf ausgeführten Jobs erstellt wurde.
- **Herunterladen-Symbol**: Wenn Sie auf das Symbol klicken, wird das Protokoll des Auftrags in eine Datei heruntergeladen.

Standardmäßig ist die Anzeige von Auftragsprotokollen auf eine Größe von 10 MB begrenzt, ansonsten werden die Protokolle in Dateien heruntergeladen. Die Benutzer können das Limit auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) anpassen.

### Prozesshistorie

- **Job** gibt den Namen des Jobs an.
- **Adresse** zeigt die Position des Jobs im Arbeitsablauf an.
- **Status** ist das Ergebnis der Job-Ausführung, eines von *in Verarbeitung*, *erfolgreich* oder *fehlgeschlagen*.
- **Startzeit**, **Endezeit** geben den Beginn und das Ende der Ausführung des Jobs an.
- **Kritikalität** wird mit [Konfiguration - Inventar - Arbeitsablauf - Job-Optionen](/configuration-inventory-workflow-job-options) konfiguriert und zeigt die Relevanz eines Jobs an: *Minor*, *Normal*, *Major*, *Critical*.
- **Rückgabewert** ist der Exit Code eines Shell Jobs oder der Return Code eines JVM Jobs. Der Bereich [Konfiguration - Inventar - Arbeitsablauf - Job-Eigenschaften](/configuration-inventory-workflow-job-properties) bietet die Möglichkeit, Rückgabewerte für die erfolgreiche und fehlgeschlagene Ausführung von Jobs zu konfigurieren.

Für den Zugriff auf Protokollausgaben ist die folgende Aktion verfügbar:

- **Job**: Wenn Sie auf den *Job-Namen* klicken, wird die Protokollausgabe des Jobs auf der Seite [Anzeige Job-Protokoll](/task-log) dargestellt. 

Standardmäßig ist die Anzeige von Job-Protokollen auf 10 MB Protokollgröße beschränkt, ansonsten werden die Protokolle in Dateien heruntergeladen. Die Benutzer können das Limit auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) anpassen.

### Prüfprotokoll

Der Bereich zeigt dieselben Informationen an wie die Seite [Prüfprotokoll](/audit-log) und ist auf den aktuellen Arbeitsablauf fokussiert.

Die Anzahl der angezeigten Protokolleinträge kann über die Einstellung *Max. Anzahl Einträge des Prüfprotokolls pro Objekt* im [Profil - Einstellungen](/profile-preferences) des Benutzers geändert werden.

## Operationen

### Operationen für Arbeitsabläufe

Im oberen Teil des Fensters werden die folgenden Schaltflächen für Arbeitsabläufe angeboten:

- **Alle aussetzen** fungiert als *Notstopp* und setzt alle Arbeitsabläufe aus, unabhängig von der aktuell angezeigten Auswahl an Arbeitsabläufen. Angehaltene Arbeitsabläufe sind eingefroren, sie nehmen Aufträge an, starten aber keine Aufträge, solange der Arbeitsablauf nicht wieder aufgenommen wird. Laufende Aufträge setzen den aktuellen Job oder eine andere Anweisung fort, bevor sie angehalten werden.
- **Alle fortsetzen** setzt alle ausgesetzten Arbeitsabläufe fort, unabhängig von der aktuell angezeigten Auswahl an Arbeitsabläufen.

### Operationen für Jobs und Arbeitsablauf-Anweisungen

Die folgenden Operationen sind für Jobs über das entsprechende Aktionsmenü verfügbar:

- **Job überspringen** verhindert, dass ein Auftrag den Job ausführt und lässt ihn mit der nächsten Arbeitsablauf-Anweisung fortfahren.
- **Job einbeziehen** macht das vorige Überspringen eines Jobs rückgängig.
- **Job stoppen** hält Aufträge an, die bei dem Job ankommen. Aufträge können über eine *Wiederaufnahmen*-Operation fortgesetzt werden, die es ermöglicht, die Verarbeitung von einem anderen Knoten im Arbeitsablauf fortzusetzen oder die Verarbeitung des gestoppten Jobs zu erzwingen.
- **Job entstoppen** macht das vorige Stoppen eines Jobs rückgängig.

### Operationen für Aufträge

Für jeden Auftrag steht Ihnen ein Aktionsmenü zur Verfügung, das die folgenden Operationen enthält:

- **Abbrechen** bricht den Auftrag ab. *Laufende* Aufträge setzen den aktuellen Job oder die aktuelle Arbeitsablauf-Anweisung fort und verlassen den Arbeitsablauf mit dem Status *fehlgeschlagen*.
- **Abbrechen/Prozess beenden** beendet zwangsweise den Job, der einen Auftrag ausführt. Aufträge verlassen den Arbeitsablauf mit dem Status *fehlgeschlagen*.
- **Aussetzen** hält laufende Aufträge an, nachdem sie den aktuellen Job oder die aktuelle Arbeitsablauf-Anweisung abgeschlossen haben.
- **Aussetzen/Prozess beenden** beendet zwangsweise einen *laufenden* Job und versetzt den Auftrag in den Zustand *ausgesetzt*.
- **Aussetzen/Rücksetzen** beendet zwangsweise die aktuelle Arbeitsablauf-Anweisung und versetzt den Auftrag in den Zustand *ausgesetzt*. Diese Option kann mit dem erzwungenen Beenden von Jobs für *laufende* Aufträge kombiniert werden.
- **Fortsetzen** setzt einen *ausgesetzten* oder *fehlgeschlagenen*, wiederaufnehmbaren Auftrag fort.

Es können zusätzliche Operationen verfügbar sein, die spezifisch für den Zustand des Auftrags sind.

## Filter

Benutzer können Filter anwenden, um die Anzeige von Arbeitsabläufen einzuschränken. Filter-Schaltflächen sind oben im Fenster verfügbar:

- **Agenten** ermöglicht das Filtern von Arbeitsabläufen mit Aufträgen, die einem oder mehreren ausgewählten Agenten zugeordnet sind.
- **Synchrone** Arbeitsabläufe sind ausgerollt und sind mit dem Controller und den Agenten verfügbar.
- **Nicht synchrone** Arbeitsabläufe sind nicht an Controller und Agenten ausgerollt, sondern sind nur im Inventar verfügbar.
- **Ausgesetzte** Arbeitsabläufe sind eingefroren, sie nehmen Aufträge an, erlauben aber nicht, dass Aufträge gestartet werden, bis die Arbeitsabläufe wieder aufgenommen werden.
- **Ausstehende** Arbeitsabläufe warten auf die Bestätigung durch einen oder mehrere Agenten, dass der Arbeitsablauf ausgesetzt ist.
- **Auftragsfilter** bietet die Möglichkeit, den Datumsbereich festzulegen, für den *eingeplante* Aufträge für ausgewählte Arbeitsabläufe angezeigt werden sollen.

Der *Erweiterte Filter* bietet detailliertere Kriterien für die Filterung von Arbeitsabläufen.

## Suche

Die [Arbeitsablaufsuche](/workflows-search) bietet Kriterien für die Suche nach Arbeitsabläufen anhand von Abhängigkeiten, z.B. die Suche nach Arbeitsabläufen, die einen bestimmten Job-Namen enthalten, oder nach bestimmten Notizbrettern.

## Referenzen

### Kontext-Hilfe

- [Anzeige Auftragsprotokoll](/order-log)
- [Anzeige Job-Protokoll](/task-log)
- [Arbeitsablaufsuche](/workflows-search)
- [Auftragszustände](/order-states)
- [Aufträge hinzufügen](/workflows-orders-add)
- [Einstellungen - JOC Cockpit](/settings-joc)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
  - [Konfiguration - Inventar - Arbeitsablauf - Job-Eigenschaften](/configuration-inventory-workflow-job-properties)
  - [Konfiguration - Inventar - Arbeitsablauf - Job-Optionen](/configuration-inventory-workflow-job-options)
- [Konfiguration - Inventar - Zeitpläne](/configuration-inventory-schedules)
- [Profil - Einstellungen](/profile-preferences)
- [Tagesplan](/daily-plan)

### Product Knowledge Base

- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
- [JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows)
