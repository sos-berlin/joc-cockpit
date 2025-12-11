# Auftragshistorie

Die Ansicht *Auftragshistorie* fasst den Verlauf der Ausführung von Aufträgen zusammen. Dazu gehört auch die Ausführung von Jobs, die in Arbeitsabläufen verwendet werden, die durch zugehörige Aufträge ausgelöst werden.

Die *Auftragshistorie* unterliegt der Bereinigung der Datenbank, die vom [Bereinigungsdienst](/service-cleanup) durchgeführt wird.

Für die Historie von Jobs siehe [Prozesshistorie](/history-tasks).

## Bereich: Navigation

Der linke Bereich ermöglicht die Filterung nach Kennzeichnungen aus Arbeitsabläufen und Aufträgen.

- **Kennz. Arbeitsablauf** werden in der Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows) zugewiesen.
- **Kennz. Auftrag** werden in der Ansicht [Konfiguration - Inventar - Zeitpläne](/configuration-inventory-schedules) zugewiesen.

Kennzeichnungen werden über die Symbole + und - ausgewählt und können über das Symbol *Schnellsuche* nachgeschlagen werden. Die Anzeige von Kennzeichnungen muss auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) aktiviert werden.

## Bereich: Auftragshistorie

Die Anzeige ist auf maximal 5000 Einträge beschränkt, wenn nicht anders in [Profil - Einstellungen](/profile-preferences) angegeben.

### Historie der Aufträge

- **Auftragskennung** ist die eindeutige Kennung, die einem Auftrag zugeordnet ist. Wenn Sie auf das Pfeil-nach-unten-Symbol klicken, werden die Auftragsvariablen und die von dem Auftrag durchlaufenen Jobs angezeigt. 
- **Arbeitsablauf** gibt den Arbeitsablauf an, den der Auftrag durchlaufen hat.
  - Wenn Sie auf den Namen des Arbeitsablaufs klicken, gelangen Sie zur Ansicht [Arbeitsabläufe](/workflows).
  - Wenn Sie auf das Bleistiftsymbol klicken, gelangen Sie zur Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows).
- **Adresse** zeigt die letzte Position eines Auftrags im Arbeitsablauf an. Benutzer können den Arbeitsablauf-Anweisungen Adressen zuweisen, die dann angezeigt werden, andernfalls wird die technische Position angezeigt.
- **Status** zeigt den *Status der Historie* an, d.h. das letzte Ergebnis im Leben des Auftrags.
  - Wenn Aufträge abgeschlossen werden, lautet der *Status der Historie* *Erfolgreich* oder *Fehlgeschlagen*.
  - Wenn Aufträge nicht abgeschlossen sind, lautet der *Status der Historie* *in Verarbeitung*.
- **Auftragszustand** zeigt den letzten Zustand des Auftrags an, siehe [Auftragszustände](/order-states).
  - Wenn Aufträge abgeschlossen sind, lautet der *Auftragszustand* *beendet*.
  - Wenn Aufträge nicht abgeschlossen sind, lautet der *Auftragszustand* *in Verarbeitung*.

### Zugriff auf Protokolle

- **Auftragskennung**: Wenn Sie auf die *Auftragskennung* klicken, wird das Protokoll des Auftrags mit der [Anzeige Auftragsprotokoll](/order-log) dargestellt. Das Protokoll enthält die Ausgaben, die von allen mit dem Arbeitsablauf ausgeführten Jobs erstellt wurden.
- **Herunterladen-Symbol**: Wenn Sie auf das Symbol klicken, wird das Protokoll des Auftrags in eine Datei heruntergeladen.

Standardmäßig ist die Anzeige von Auftragsprotokollen auf eine Größe von 10 MB begrenzt, ansonsten werden die Protokolle in Dateien heruntergeladen. Die Benutzer können das Limit auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) anpassen.

### Operationen der Auftragshistorie

Für jeden Auftrag gibt es ein Aktionsmenü, das die folgenden Operationen bietet:

- **Arbeitsablauf zur Ausschlussliste hinzufügen** blendet die Aufträge des Arbeitsablaufs dauerhaft aus der Anzeige aus. Dies kann für zyklische Arbeitsabläufe nützlich sein, die die *Auftragshistorie* stark füllen.

Die *Ausschlussliste* wird über die entsprechende Schaltfläche in der oberen rechten Ecke des Fensters verwaltet:

- **Ausschlussliste bearbeiten** zeigt die Aufträge und Arbeitsablaufe in der *Ausschlussliste* an und bietet die Möglichkeit, Einträge einzeln aus der *Ausschlussliste* zu entfernen. 
- **Ausschlussliste aktivieren** aktiviert die Filterung, um Aufträge auszublenden, deren Arbeitsabläufe einzeln zur *Ausschlussliste* hinzugefügt wurden. Eine aktive *Ausschlussliste* wird durch die entsprechende Schaltfläche angezeigt.
- mit **Ausschlussliste deaktivieren** deaktivieren Sie die Filterung von Aufträgen durch Arbeitsabläufe. Die Operation ist für eine aktive *Ausschlussliste* verfügbar.
- mit **Ausschlussliste zurücksetzen** werden Arbeitsabläufe aus der *Ausschlussliste* entfernt, so dass alle Aufträge angezeigt werden.

## Filter

Benutzer können die oben im Fenster verfügbaren Filter anwenden, um die Anzeige von Aufträgen einzuschränken.

- die Filterschaltflächen **Erfolgreich**, **Fehlgeschlagen**, **Fortschreitend** beschränken die Anzeige auf Aufträge mit dem entsprechenden *Status der Historie*.
- die Filterschaltflächen **Datumsbereich** ermöglichen die Auswahl des Datumsbereichs für die Anzeige der Aufträge.
- das Kontrollkästchen **Aktueller Controller** begrenzt die Anzeige der Aufträge auf den aktuell ausgewählten Controller.

## Referenzen

### Kontext-Hilfe

- [Anzeige Auftragsprotokoll](/order-log)
- [Arbeitsabläufe](/workflows)
- [Auftragszustände](/order-states)
- [Bereinigungsdienst](/service-cleanup)
- [Einstellungen - JOC Cockpit](/settings-joc)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Konfiguration - Inventar - Zeitpläne](/configuration-inventory-schedules)
- [Profil - Einstellungen](/profile-preferences)
- [Prozesshistorie](/history-tasks)

### Product Knowledge Base

- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Task History](https://kb.sos-berlin.com/display/JS7/JS7+-+Task+History)
