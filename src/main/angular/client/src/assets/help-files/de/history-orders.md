# Bestellverlauf

Die Ansicht *Auftragsverlauf* fasst den Verlauf der Ausführung von Aufträgen zusammen. Dazu gehört auch der Verlauf der Ausführung von Aufträgen, die in Workflows verwendet werden, die durch zugehörige Aufträge ausgelöst werden.

Die *Auftragshistorie* unterliegt der Bereinigung der Datenbank, die von [Cleanup Service](/service-cleanup) durchgeführt wird.

Für die Historie von Aufgaben siehe [Task History](/history-tasks).

## Navigationsleiste

Der linke Bereich ermöglicht die Filterung nach Tags aus Workflows und Aufträgen.

- **Workflow-Tags** werden in der Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows) zugewiesen.
- **Auftrags-Tags** werden aus der Ansicht [Konfiguration - Inventar - Zeitpläne](/configuration-inventory-schedules) zugewiesen.

Tags werden über die Symbole + und - ausgewählt und können über das Symbol Schnellsuche nachgeschlagen werden. Die Anzeige von Tags muss auf der Seite [Settings - JOC Cockpit](/settings-joc) aktiviert werden.

## Verlaufspanel

Die Anzeige ist auf maximal 5000 Einträge beschränkt, wenn nicht anders auf [Profile - Preferences](/profile-preferences) angegeben.

### Historie der Aufträge

- die **Auftrags-ID** ist die eindeutige Kennung, die einem Auftrag zugeordnet ist. Wenn Sie auf das Pfeil-nach-unten-Symbol klicken, werden die Auftragsvariablen und die von dem Auftrag übermittelten Aufträge angezeigt. 
- **Workflow** gibt den Workflow an, den die Bestellung durchlaufen hat.
  - Wenn Sie auf den Namen des Workflows klicken, gelangen Sie zur Ansicht [Arbeitsabläufe](/workflows).
  - Wenn Sie auf das Bleistiftsymbol klicken, gelangen Sie zur Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows).
- **Etikett** zeigt die letzte Position einer Order im Workflow an. Benutzer können den Workflow-Anweisungen Etiketten zuweisen, die dann angezeigt werden, andernfalls wird die technische Position angezeigt.
- **Historienstatus** zeigt den *Historienstatus* an, d.h. das letzte Ergebnis im Leben der Bestellung.
  - Wenn Aufträge abgeschlossen werden, lautet der *History Status* *Erfolgreich* oder *Fehlgeschlagen*.
  - Wenn Aufträge nicht abgeschlossen sind, lautet der *History Status* *in Bearbeitung*.
- **Auftragsstatus** zeigt den letzten Status des Auftrags an, siehe [Order States](/order-states).
  - Wenn Aufträge abgeschlossen sind, lautet der *Auftragsstatus* *Erfolgreich* oder *Scheitert*.
  - Wenn Aufträge nicht abgeschlossen sind, lautet der *Auftragsstatus* *in Bearbeitung*.

### Zugriff auf die Log-Ausgabe

- **Auftrags-ID**: Wenn Sie auf die *Auftrags-ID* klicken, wird die Protokollausgabe des Auftrags auf [Order Log View](/order-log) angezeigt. Das Protokoll enthält die Ausgaben, die von allen mit dem Workflow ausgeführten Aufträgen erstellt wurden.
- **Download-Symbol**: Wenn Sie auf das Symbol klicken, wird das Protokoll der Bestellung in eine Datei heruntergeladen.

Standardmäßig ist die Anzeige von Auftragsprotokollen auf eine Größe von 10 MB begrenzt, ansonsten werden die Protokolle in Dateien heruntergeladen. Die Benutzer können das Limit auf der Seite [Settings - JOC Cockpit](/settings-joc) anpassen.

### Operationen in der Aufgabenhistorie

Für jede Aufgabe gibt es ein Aktionsmenü, das die folgenden Operationen bietet:

- **Workflow zur Ignorierliste hinzufügen** blendet die Aufträge des Workflows dauerhaft aus der Anzeige aus. Dies kann für zyklische Workflows nützlich sein, die den *Auftragsverlauf* auffüllen.

Die *Ignorierliste* wird über die entsprechende Schaltfläche in der oberen rechten Ecke des Fensters verwaltet:

- **Ignorierliste bearbeiten** zeigt die Aufträge und Workflows in der *Ignorierliste* an und bietet die Möglichkeit, Einträge einzeln aus der *Ignorierliste* zu entfernen. 
- **Ignorierliste aktivieren** aktiviert die Filterung, um Jobs auszublenden, die einzeln zur *Ignorierliste* hinzugefügt wurden oder die zu einem hinzugefügten Workflow gehören. Eine aktive *Ignorierliste* wird durch die entsprechende Schaltfläche angezeigt.
- mit **Ignorierliste deaktivieren** deaktivieren Sie die Filterung von Aufträgen und Workflows. Die Operation ist für eine aktive *Ignorierliste* verfügbar.
- mit **Ignorierliste zurücksetzen** werden Aufträge und Workflows aus der *Ignorierliste* entfernt, so dass alle Aufträge angezeigt werden.

*Filter

Benutzer können die oben im Fenster verfügbaren Filter anwenden, um die Anzeige von Aufträgen einzuschränken.

- die Filterschaltflächen **Erfolgreich**, **Fehlgeschlagen**, **In Bearbeitung** beschränken die Anzeige auf Aufträge mit dem entsprechenden *Historienstatus*.
- die Filterschaltflächen **Datumsbereich** ermöglichen die Auswahl des Datumsbereichs für die Anzeige der Aufträge.
- das Kontrollkästchen **Aktueller Controller** begrenzt die Anzeige der Aufträge auf den aktuell ausgewählten Controller.

## Referenzen

### Kontexthilfe

- [Cleanup Service](/service-cleanup)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Konfiguration - Inventar - Zeitpläne](/configuration-inventory-schedules)
- [Order Log View](/order-log)
- [Order States](/order-states)
- [Profile - Preferences](/profile-preferences)
- [Settings - JOC Cockpit](/settings-joc)
- [Task History](/history-tasks)
- [Arbeitsabläufe](/workflows)

### Product Knowledge Base

- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Task History](https://kb.sos-berlin.com/display/JS7/JS7+-+Task+History)

