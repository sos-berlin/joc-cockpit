# Arbeitsabläufe

Die Ansicht *Workflows* ermöglicht die Überwachung und Steuerung von Arbeitsabläufen.

- Benutzer können Aufträge identifizieren, die für bestimmte Arbeitsabläufe bearbeitet werden.
- Benutzer können Aufträge bei Bedarf zu Arbeitsabläufen hinzufügen. Solche Aufträge werden nicht zu [Tagesplan](/daily-plan) hinzugefügt, sondern werden ad hoc hinzugefügt.

## Navigationsleiste

Der linke Bereich ist in Registerkarten unterteilt, die die Navigation in Ordnern und die Filterung nach Tags für Arbeitsabläufe und Aufträge ermöglichen.

- die **Ordnernavigation** bietet das Symbol mit dem Pfeil nach unten, wenn Sie den Mauszeiger über einen Ordnernamen bewegen. Dadurch werden Arbeitsabläufe aus dem aktuellen Ordner und aus allen Unterordnern angezeigt. Wenn Sie das Symbol mit dem Pfeil nach oben verwenden, wird die Auswahl auf den aktuellen Ordner zurückgesetzt.
- Die Tag-Filterung wird auf den folgenden Registerkarten angeboten:
  - **Arbeitsablauf-Tags** werden in der Ansicht [Configuration - Inventory - Workflows](/configuration-inventory-workflows) zugewiesen.
  - **Auftrags-Tags** werden in der Ansicht [Configuration - Inventory - Schedules](/configuration-inventory-schedules) zugewiesen.

Tags werden über die Symbole + und - ausgewählt und können über das Symbol Schnellsuche nachgeschlagen werden. Die Anzeige von Tags muss auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) aktiviert werden.

## Arbeitsablauf-Panel

### Auftrag Zusammenfassung

Im oberen Teil des Fensters befindet sich die Zusammenfassung der Aufträge, ähnlich wie bei [Übersicht - Aufträge](/dashboard-orders). Sie können auf die angegebene Anzahl von Aufträgen für einen bestimmten Status klicken, um ein Popup-Fenster zu öffnen, in dem die Liste der Aufträge angezeigt wird.

Die Zusammenfassung der Aufträge wird für Aufträge angezeigt, die sich auf Arbeitsabläufe beziehen, die für ausgewählte Ordner oder Tags angezeigt werden.

### Anzeige von Arbeitsabläufen

- **Arbeitsablauf-Name** ist der eindeutige Name, der einem Arbeitsablauf zugewiesen ist.
  - Wenn Sie auf den *Arbeitsablauf-Namen* klicken, öffnet sich im unteren Teil des Fensters das Fenster *Historie*, in dem die jüngste Ausführungsgeschichte des Arbeitsablaufs angezeigt wird.
  - Wenn Sie auf das große Pfeil-nach-unten-Symbol klicken, werden alle Aufträge und Arbeitsabläufe angezeigt.
  - Wenn Sie auf das kleine Pfeil-nach-unten-Symbol klicken, werden die Jobs und Arbeitsabläufe der obersten Ebene angezeigt.
  - Klicken Sie auf das Bleistiftsymbol, um zur Ansicht [Configuration - Inventory - Workflows](/configuration-inventory-workflows) zu gelangen.
  - Wenn Sie auf das +-Symbol klicken, öffnet sich ein Popup-Fenster mit [Add Orders](/workflows-orders-add).
- mit den Symbolen **Tabellenansicht** und **Grafische Ansicht** können Sie sich Arbeitsabläufe
  - im tabellarischen Format, das sich auf eine übersichtliche Struktur konzentriert und Platz im Fenster spart.
  - im grafischen Format, das für eine Reihe von Benutzern besser verständlich ist.
- **Datum der Bereitstellung** zeigt das Datum an, an dem der Arbeitsablauf bereitgestellt wurde.
- **Einsatzstatus** zeigt an, ob der Arbeitsablauf an den Controller und die Agenten verteilt wurde.
  - **Synchronisiert** Arbeitsabläufe werden bereitgestellt und sind für den Controller und die Agenten verfügbar.
  - **Nicht synchronisiert** Arbeitsabläufe werden nicht an Controller und Agenten verteilt, sondern sind nur im Inventar verfügbar.
  - **Suspended** Arbeitsabläufe sind eingefroren, sie nehmen Aufträge an, erlauben aber nicht, dass Aufträge gestartet werden, bis die Arbeitsabläufe wieder aufgenommen werden.
  - **Ausstehend** Arbeitsabläufe warten auf die Bestätigung durch einen oder mehrere Agenten, dass der Arbeitsablauf ausgesetzt oder wieder aufgenommen wurde.
- **Anzahl der Aufträge** zeigt die Anzahl der Aufträge an, die dem Arbeitsablauf zugewiesen sind. 
  - Bis zu drei Aufträge werden direkt mit dem Arbeitsablauf angezeigt. Sie bieten ein Aktionsmenü für Auftragsoperationen.
    - Sie können auf die angegebene Auftrags-ID klicken, um die Protokollausgabe des Auftrags auf [Anzeige Auftragsprotokoll](/order-log) anzuzeigen. Das Protokoll enthält die Ausgaben, die von allen mit dem Arbeitsablauf ausgeführten Aufträgen erstellt wurden.
  - Wenn Sie auf *Anzahl der Aufträge* klicken, öffnet sich ein Popup-Fenster, in dem alle zugehörigen Aufträge angezeigt werden und das Operationen für einzelne Aufträge und Massenoperationen für ausgewählte Aufträge bietet.

### Anzeige von Jobs und Arbeitsablauf-Anweisungen

Wenn Sie einen Arbeitsablauf mit Hilfe des Pfeil-nach-unten-Symbols für einen Arbeitsablauf erweitern, werden seine Aufträge und Arbeitsanweisungen angezeigt.

## Bereich Historie

Das Panel wird im unteren Teil des Fensters angezeigt, wenn Benutzer auf den Namen des Arbeitsablaufs klicken oder einen Auftrag hinzufügen.

### Auftrag Historie

- die **Auftrags-ID** ist die eindeutige Kennung, die einem Auftrag zugeordnet ist. Wenn Sie auf das Pfeil-nach-unten-Symbol klicken, werden die Auftragsvariablen und die vom Auftrag übergebenen Aufträge angezeigt. 
- **Etikett** zeigt die letzte Position eines Auftrags im Arbeitsablauf an. Benutzer können den Arbeitsabläufen *Labels* zuweisen, die dann angezeigt werden, andernfalls wird die technische Position angezeigt.
- der **Status der Historie** zeigt das letzte Ergebnis im Leben des Auftrags an.
  - Wenn Aufträge abgeschlossen sind, lautet der *Historie-Status* *Erfolgreich* oder *Fehlgeschlagen*.
  - Wenn Aufträge noch nicht abgeschlossen sind, lautet der *Status der Historie* *in Bearbeitung*.
- **Auftragsstatus** zeigt den letzten Status des Auftrags an, siehe [Auftragszustände](/order-states).
  - Wenn Aufträge abgeschlossen sind, lautet der *Auftragsstatus* *Erfolgreich* oder *Scheitert*.
  - Wenn Aufträge noch nicht abgeschlossen sind, lautet der *Auftragsstatus* *in Bearbeitung*.

Für den Zugriff auf die Protokollausgabe stehen Ihnen die folgenden Optionen zur Verfügung:

- **Auftrags-ID**: Wenn Sie auf die *Auftrags-ID* klicken, wird die Protokollausgabe des Auftrags auf [Anzeige Auftragsprotokoll](/order-log) angezeigt. Das Protokoll enthält die Ausgabe, die von allen mit dem Arbeitsablauf ausgeführten Aufträgen erstellt wurde.
- **Download-Symbol**: Wenn Sie auf das Symbol klicken, wird das Protokoll des Auftrags in eine Datei heruntergeladen.

Standardmäßig ist die Anzeige von Auftragsprotokollen auf eine Größe von 10 MB begrenzt, ansonsten werden die Protokolle in Dateien heruntergeladen. Die Benutzer können das Limit auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) anpassen.

### Aufgaben Historie

- **Auftrag** gibt den Namen des Auftrags an.
- **Label** zeigt die Position des Auftrags im Arbeitsablauf an.
- **Status** ist das Ergebnis der Job-Ausführung, angegeben durch *in Bearbeitung*, *erfolgreich* oder *gescheitert*.
- **Startzeit**, **Endzeit** geben den Beginn und das Ende der Auftragsausführung an.
- die **Kritikalität** wird mit [Konfiguration - Inventar - Arbeitsabläufe - Job Optionen](/configuration-inventory-workflow-job-options) angegeben und zeigt die Relevanz eines Auftrags an:
  - *Minor*
  - *Normal*
  - *Groß*
  - *Kritisch*
- **Return Code** ist der Exit-Code eines Shell-Jobs oder der Return-Code eines JVM-Jobs. Das Panel [Konfiguration - Inventar - Arbeitsabläufe - Job Eigenschaften](/configuration-inventory-workflow-job-properties) bietet die Möglichkeit, Rückgabewerte für die erfolgreiche und fehlgeschlagene Ausführung von Jobs zu konfigurieren.

Für den Zugriff auf die Protokollausgabe ist die folgende Aktion verfügbar:

- **Job**: Wenn Sie auf den *Job-Namen* klicken, wird die Protokollausgabe des Jobs auf der Seite [Anzeige Job-Protokoll](/task-log) angezeigt. 

Standardmäßig ist die Anzeige von Aufgabenprotokollen auf 10 MB Protokollgröße beschränkt, ansonsten werden die Protokolle in Dateien heruntergeladen. Die Benutzer können das Limit auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) anpassen.

### Audit Log

Das Panel zeigt dieselben Informationen an wie die Seite [Audit Log](/audit-log), die sich auf den aktuellen Arbeitsablauf konzentriert.

Die Anzahl der angezeigten Audit-Protokolleinträge kann über die Einstellung *Max. Anzahl von Audit-Protokolleinträgen pro Objekt* im [Profil - Einstellungen](/profile-preferences) des Benutzers geändert werden.

## Vorgänge

### Operationen in Arbeitsabläufen

Im oberen Teil des Fensters werden die folgenden Schaltflächen für Arbeitsabläufe angeboten:

- **Alle aussetzen** fungiert als *Notstopp* und setzt alle Arbeitsabläufe aus, unabhängig von der aktuell angezeigten Auswahl an Arbeitsabläufen. Angehaltene Arbeitsabläufe sind eingefroren, sie nehmen Aufträge an, starten aber keine Aufträge, solange der Arbeitsablauf nicht wieder aufgenommen wird. Laufende Aufträge setzen den aktuellen Auftrag oder eine andere Anweisung fort, bevor sie unterbrochen werden.
- **Alle fortsetzen** setzt alle unterbrochenen Arbeitsabläufe fort, unabhängig von der aktuell angezeigten Auswahl an Arbeitsabläufen.

### Operationen für Jobs und Arbeitsabläufe

Die folgenden Operationen sind für Jobs über das entsprechende Aktionsmenü verfügbar:

- **Auftrag überspringen** verhindert, dass ein Auftrag den zugehörigen Auftrag ausführt und lässt ihn mit der nächsten Arbeitsablauf-Anweisung fortfahren.
- **Auftrag überspringen** macht einen zuvor übersprungenen Auftrag wieder rückgängig.
- **Auftrag anhalten** hält Aufträge an, die bei dem Auftrag ankommen. Aufträge können über eine *Fortsetzen*-Operation fortgesetzt werden, die es ermöglicht, die Verarbeitung von einem anderen Arbeitsablauf-Knoten aus fortzusetzen oder die Verarbeitung des angehaltenen Auftrags zu erzwingen.
- **Auftrag rückgängig machen** macht einen zuvor angehaltenen Auftrag rückgängig.

### Operationen für Aufträge

Für jeden Auftrag steht Ihnen ein Aktionsmenü zur Verfügung, das die folgenden Operationen enthält:

- **Abbrechen** bricht den Auftrag ab. *Laufende* Aufträge beenden den aktuellen Auftrag oder Arbeitsablauf und verlassen den Arbeitsablauf mit dem Status *gescheitert* *Historie*.
- **Abbrechen/Aufgabe beenden** beendet Aufträge, die einen Auftrag ausführen, zwangsweise. Aufträge verlassen den Arbeitsablauf mit einem *Fehlgeschlagen* *Historie Status*.
- **Aussetzen** setzt den Auftrag aus. Laufende Aufträge werden angehalten, nachdem sie den aktuellen Auftrag oder Arbeitsablauf abgeschlossen haben.
- mit **Aussetzen/Aufgabe beenden** werden *laufende* Aufträge zwangsweise beendet und die Aufträge ausgesetzt.
- **Aussetzen/Zurücksetzen** setzt die aktuelle Arbeitsablauf-Anweisung sofort zurück und versetzt den Auftrag in den Zustand *ausgesetzt*. Diese Option kann mit dem erzwungenen Beenden von Aufgaben für *laufende* Aufträge kombiniert werden.
- **Fortsetzen** setzt einen *ausgesetzten* oder *gescheiterten* wiederaufnehmbaren Auftrag fort.

Es können zusätzliche Operationen verfügbar sein, die für den Zustand des Auftrags spezifisch sind.

## Filter

Benutzer können Filter anwenden, um die Anzeige von Arbeitsabläufen einzuschränken. Filter-Schaltflächen sind oben im Fenster verfügbar:

- **Agenten** ermöglicht das Filtern von Arbeitsabläufen mit Aufträgen, die einem oder mehreren ausgewählten Agenten zugeordnet sind.
- **Synchronisierte** Arbeitsabläufe werden bereitgestellt und sind mit dem Controller und den Agenten verfügbar.
- **Nicht synchronisiert** Arbeitsabläufe werden nicht an Controller und Agenten verteilt, sondern sind nur im Inventar verfügbar.
- **Suspended** Arbeitsabläufe sind eingefroren, sie nehmen Aufträge an, erlauben aber nicht, dass Aufträge gestartet werden, bis die Arbeitsabläufe wieder aufgenommen werden.
- **Outstanding** Arbeitsabläufe warten auf die Bestätigung durch einen oder mehrere Agenten, dass der Arbeitsablauf ausgesetzt ist.
- **Auftragsfilter** bietet die Möglichkeit, den Datumsbereich festzulegen, für den *geplante* Aufträge für ausgewählte Arbeitsabläufe angezeigt werden sollen.

Der *Erweiterte Filter* bietet detailliertere Kriterien für die Filterung von Arbeitsabläufen.

## Suche

Die [Workflows - Search](/workflows-search) bietet Kriterien für die Suche nach Arbeitsabläufen anhand von Abhängigkeiten, z.B. die Suche nach Arbeitsabläufen, die einen bestimmten Jobnamen enthalten, oder nach bestimmten Schwarzen Brettern.

## Referenzen

### Kontext-Hilfe

- [Configuration - Inventory - Schedules](/configuration-inventory-schedules)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  - [Konfiguration - Inventar - Arbeitsabläufe - Job Eigenschaften](/configuration-inventory-workflow-job-properties)
  - [Konfiguration - Inventar - Arbeitsabläufe - Job Optionen](/configuration-inventory-workflow-job-options)
- [Tagesplan](/daily-plan)
- [Anzeige Auftragsprotokoll](/order-log)
- [Auftragszustände](/order-states)
- [Profil - Einstellungen](/profile-preferences)
- [Einstellungen - JOC Cockpit](/settings-joc)
- [Workflows - Add Orders](/workflows-orders-add)
- [Workflows - Search](/workflows-search)

### Product Knowledge Base

- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
- [JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows)

