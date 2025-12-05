# Aufgabenverlauf

Die Ansicht *Aufgabenhistorie* fasst die Ausführungshistorie von Aufträgen zusammen, die unabhängig von dem Workflow und dem Auftrag, für den sie ausgeführt wurden, angezeigt werden.

Die *Aufgabenhistorie* unterliegt der Bereinigung der Datenbank, die von [Bereinigungsdienst](/service-cleanup) durchgeführt wird.

Für die Historie von Aufträgen siehe [Auftragshistorie](/history-orders).

## Navigationsleiste

Im linken Bereich können Sie nach Tags aus Workflows und Aufträgen filtern, die die Ausführung des Auftrags ausgelöst haben.

- **Workflow-Tags** werden in der Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows) zugewiesen.
- **Auftrags-Tags** werden aus der Ansicht [Konfiguration - Inventar - Zeitpläne](/configuration-inventory-schedules) zugewiesen.

Tags werden über die Symbole + und - ausgewählt und können über das Suchsymbol nachgeschlagen werden. Die Anzeige von Tags muss auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) aktiviert werden.

## Verlaufspanel

Die Anzeige ist auf maximal 5000 Einträge beschränkt, wenn nicht anders auf [Profil - Einstellungen](/profile-preferences) angegeben.

### Historie der Aufträge

- **Auftragsname** zeigt den entsprechenden Auftrag an.
- **Workflow** zeigt den Workflow an, für den der Auftrag ausgeführt wurde.
  - Klicken Sie auf den Namen des Workflows, um zur Ansicht [Arbeitsabläufe](/workflows) zu gelangen.
  - Wenn Sie auf das Bleistiftsymbol klicken, gelangen Sie zur Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows).
- **Label** zeigt die Position des Auftrags im Workflow an. Benutzer weisen den Jobs, die angezeigt werden sollen, *Etiketten* zu. Wenn derselbe Auftrag mehr als einmal in einem Workflow vorkommt, wird er unter verschiedenen *Labeln* angezeigt.
- der **History Status** zeigt das Ergebnis des Auftrags an.
  - Wenn Aufträge abgeschlossen werden, lautet der *History Status* entweder *Erfolgreich* oder *Fehlgeschlagen*.
  - Wenn Aufträge nicht abgeschlossen sind, lautet der *History Status* *in Bearbeitung*.

### Zugriff auf die Protokollausgabe

- **Job Name**: Wenn Sie auf den *Job-Namen* klicken, wird die Protokollausgabe des Jobs auf [Task Log View](/task-log) angezeigt.
- **Download-Symbol**: Wenn Sie auf das Symbol klicken, wird das Protokoll des Auftrags in eine Datei heruntergeladen.

Standardmäßig ist die Anzeige von Aufgabenprotokollen auf eine Größe von 10 MB begrenzt, ansonsten werden die Protokolle in Dateien heruntergeladen. Die Benutzer können das Limit auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) anpassen.

### Operationen im Aufgabenprotokoll

Für jede Aufgabe gibt es ein Aktionsmenü, das die folgenden Operationen bietet:

- **Auftrag zur Ignorierliste hinzufügen** blendet den Auftrag dauerhaft aus der Anzeige aus. Dies kann für wiederholt ausgeführte Aufträge nützlich sein, die den *Aufgabenverlauf* füllen.
- mit **Workflow zur Ignorierliste hinzufügen** werden die Aufträge des Workflows dauerhaft ausgeblendet. Dies kann für zyklische Workflows nützlich sein, die den *Aufgabenverlauf* füllen.

Die *Ignorierliste* wird über die entsprechende Schaltfläche in der oberen rechten Ecke des Fensters verwaltet:

- **Ignorierliste bearbeiten** zeigt die Jobs und Workflows in der *Ignorierliste* an und bietet die Möglichkeit, Einträge einzeln aus der *Ignorierliste* zu entfernen. 
- **Ignorierliste aktivieren** aktiviert die Filterung, um Jobs auszublenden, die einzeln zur *Ignorierliste* hinzugefügt wurden oder die zu einem hinzugefügten Workflow gehören. Eine aktive *Ignorierliste* wird durch die entsprechende Schaltfläche angezeigt.
- mit **Ignorierliste deaktivieren** deaktivieren Sie die Filterung von Jobs und Workflows. Die Operation ist für eine aktive *Ignorierliste* verfügbar.
- mit **Ignorierliste zurücksetzen** werden Jobs und Workflows aus der *Ignorierliste* entfernt, so dass alle Jobs angezeigt werden.

*Filter

Sie können die oben im Fenster verfügbaren Filter anwenden, um die Anzeige von Aufträgen einzuschränken.

- die Filterschaltflächen **Erfolgreich**, **Fehlgeschlagen**, **In Bearbeitung** beschränken die Anzeige auf Jobs mit dem entsprechenden *Historienstatus*.
- über die Filterschaltflächen **Datumsbereich** können Sie den Datumsbereich für die Anzeige der Jobs auswählen.
- das Kontrollkästchen **Aktueller Controller** beschränkt die Jobs auf den aktuell ausgewählten Controller.

## Referenzen

### Kontexthilfe

- [Bereinigungsdienst](/service-cleanup)
- [Konfiguration - Inventar - Zeitpläne](/configuration-inventory-schedules)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Auftragshistorie](/history-orders)
- [Profil - Einstellungen](/profile-preferences)
- [Einstellungen - JOC Cockpit](/settings-joc)
- [Task Log View](/task-log)

### Product Knowledge Base

- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Task History](https://kb.sos-berlin.com/display/JS7/JS7+-+Task+History)

