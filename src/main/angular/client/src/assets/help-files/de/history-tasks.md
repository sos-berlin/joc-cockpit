# Prozesshistorie

Die Ansicht *Prozesshistorie* fasst die Historie von Jobs zusammen, die unabhängig von dem Arbeitsablauf und dem Auftrag, für den sie ausgeführt wurden, angezeigt werden.

Die *Prozesshistorie* unterliegt der Bereinigung der Datenbank, die vom [Bereinigungsdienst](/service-cleanup) durchgeführt wird.

Für die Historie von Aufträgen siehe [Auftragshistorie](/history-orders).

## Bereich: Navigation

Im linken Bereich können Sie nach Kennzeichnungen aus Arbeitsabläufen und Aufträgen filtern, die die Ausführung des Auftrags ausgelöst haben.

- **Kennz. Arbeitsablauf** werden in der Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows) zugewiesen.
- **Kennz. Auftrag** werden in der Ansicht [Konfiguration - Inventar - Zeitpläne](/configuration-inventory-schedules) zugewiesen.

Kennzeichnungen werden über die Symbole + und - ausgewählt und können über das *Suchsymbol* nachgeschlagen werden. Die Anzeige von Kennzeichnungen muss auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) aktiviert werden.

## Bereich: Prozesshistorie

Die Anzeige ist auf maximal 5000 Einträge beschränkt, wenn nicht anders in [Profil - Einstellungen](/profile-preferences) angegeben.

### Historie der Jobs

- **Job** zeigt den entsprechenden Job an.
- **Arbeitsablauf** zeigt den Arbeitsablauf an, für den der Auftrag ausgeführt wurde.
  - Klicken Sie auf den Namen des Arbeitsablaufs, um zur Ansicht [Arbeitsabläufe](/workflows) zu gelangen.
  - Wenn Sie auf das Bleistiftsymbol klicken, gelangen Sie zur Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows).
- **Adresse** zeigt die Position des Jobs im Arbeitsablauf an. Benutzer weisen den Jobs, die angezeigt werden sollen, *Adressen* zu. Wenn derselbe Job mehr als einmal in einem Arbeitsablauf vorkommt, wird er unter verschiedenen *Adressen* angezeigt.
- **Status** zeigt das historische Ergebnis des Jobs an.
  - Wenn Jobs abgeschlossen werden, lautet der *Status* entweder *Erfolgreich* oder *Fehlgeschlagen*.
  - Wenn Jobs nicht abgeschlossen sind, lautet der *Status* *in Verarbeitung*.

### Zugriff auf Protokolle

- **Job Name**: Wenn Sie auf den *Job-Namen* klicken, wird die Protokollausgabe des Jobs mit der [Anzeige Job-Protokoll](/task-log) dargestellt.
- **Herunterladen-Symbol**: Wenn Sie auf das Symbol klicken, wird das Protokoll des Jobs in eine Datei heruntergeladen.

Standardmäßig ist die Anzeige von Job-Protokollen auf eine Größe von 10 MB begrenzt, ansonsten werden die Protokolle in Dateien heruntergeladen. Die Benutzer können das Limit auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) anpassen.

### Operationen der Prozesshistsorie

Für jeden Job gibt es ein Aktionsmenü, das die folgenden Operationen bietet:

- **Job zur Ausschlussliste hinzufügen** blendet den Job dauerhaft aus der Anzeige aus. Dies kann für wiederholt ausgeführte Jobs  nützlich sein, die die *Prozesshistorie* füllen.
- mit **Arbeitsablauf zur Ausschlussliste hinzufügen** werden die Jobs des Arbeitsablaufs dauerhaft ausgeblendet. Dies kann für zyklische Arbeitsabläufe nützlich sein, die die *Prozesshistorie* stark füllen.

Die *Ausschlussliste* wird über die entsprechende Schaltfläche in der oberen rechten Ecke des Fensters verwaltet:

- **Ausschlussliste bearbeiten** zeigt die Jobs und Arbeitsabläufe in der *Ausschlussliste* an und bietet die Möglichkeit, Einträge einzeln aus der *Ausschlussliste* zu entfernen. 
- **Ausschlussliste aktivieren** aktiviert die Filterung, um Jobs auszublenden, die einzeln zur *Ausschlussliste* hinzugefügt wurden oder die zu einem hinzugefügten Arbeitsablauf gehören. Eine aktive *Ausschlussliste* wird durch die entsprechende Schaltfläche angezeigt.
- mit **Ausschlussliste deaktivieren** deaktivieren Sie die Filterung von Jobs und Arbeitsabläufen. Die Operation ist für eine aktive *Ausschlussliste* verfügbar.
- mit **Ausschlussliste zurücksetzen** werden Jobs und Arbeitsabläufe aus der *Ausschlussliste* entfernt, so dass alle Jobs angezeigt werden.

## Filter

Sie können die oben im Fenster verfügbaren Filter anwenden, um die Anzeige von Jobs einzuschränken.

- die Filterschaltflächen **Erfolgreich**, **Fehlgeschlagen**, **In Verarbeitung** beschränken die Anzeige auf Jobs mit dem entsprechenden *Status in der Historie*.
- über die Filterschaltflächen **Datumsbereich** können Sie den Datumsbereich für die Anzeige der Jobs auswählen.
- das Kontrollkästchen **Aktueller Controller** beschränkt die Jobs auf den aktuell ausgewählten Controller.

## Referenzen

### Kontext-Hilfe

- [Anzeige Job-Protokoll](/task-log)
- [Auftragshistorie](/history-orders)
- [Bereinigungsdienst](/service-cleanup)
- [Einstellungen - JOC Cockpit](/settings-joc)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Konfiguration - Inventar - Zeitpläne](/configuration-inventory-schedules)
- [Profil - Einstellungen](/profile-preferences)

### Product Knowledge Base

- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Task History](https://kb.sos-berlin.com/display/JS7/JS7+-+Task+History)
