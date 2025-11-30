# Produktstatus

Das Panel Produktstatus enthält Informationen über die folgenden JS7-Produkte:

- **JOC Cockpit** wird zur Überwachung und Steuerung der Planungsumgebung und zur Verwaltung des Auftragsbestands verwendet.
- **Controller** orchestriert Agenten und verwaltet die Bereitstellung von Aufträgen, Workflows und Jobs.
- **Agenten** führen Aufträge aus. 

JS7-Produkte können im Standalone-Betrieb und im Aktiv-Passiv-Clustering eingesetzt werden.

## Komponentenstatus und Verbindungsstatus

### JOC Cockpit

Das JOC Cockpit stellt eine Verbindung zur Datenbank und zu Controller-Instanzen her.

- Komponenten-Status
  - Der Status der Komponente wird durch die Farbe der Kachel in der oberen linken Ecke des JOC Cockpit-Rechtecks angezeigt.
  - **Eine Kachel in grüner Farbe** zeigt eine gesunde JOC Cockpit-Instanz an.
  - **Eine Kachel in roter Farbe** zeigt einen unbekannten Status an. 
- Status der Datenbankverbindung
  - **Eine Linie in grüner Farbe** zeigt eine intakte Verbindung an.
  - **Linie in gelber Farbe** zeigt Verbindungsprobleme an, z.B. wenn JOC Cockpit Heartbeats zur Datenbank auslässt.
- Controller-Verbindungsstatus
  - **Linie in grüner Farbe** zeigt eine gesunde Verbindung zum Controller an.
  - **Linie in roter Farbe** zeigt eine fehlgeschlagene Verbindung zum Controller an.

### Controller

Der Controller stellt eine Verbindung zu Agent-Instanzen her. In einem Controller-Cluster halten seine Mitglieder bidirektionale Verbindungen.

- Komponenten-Status
  - Der Status der Komponente wird durch die Farbe der Kachel in der oberen linken Ecke des Controller-Rechtecks angezeigt.
  - **Eine Kachel in grüner Farbe** zeigt eine gesunde Controller-Instanz an.
  - **Kachel in gelber Farbe** zeigt eine laufende, ungesunde Controller-Instanz an, z.B. wenn die Kopplung in einem Cluster fehlgeschlagen ist. 
  - **Eine Kachel in roter Farbe** zeigt einen *unbekannten* Status an. 
- Cluster-Verbindungsstatus
  - **Linie in grüner Farbe** zeigt einen gesunden Cluster an, der aktiv zwischen den Controller-Instanzen synchronisiert ist.
  - **Linie in gelber Farbe** weist auf eine Verbindung mit der koppelnden Controller-Instanz ohne erfolgreiche Kopplung hin.
  - **Linie in roter Farbe** zeigt eine fehlgeschlagene Verbindung zwischen den Controller-Instanzen an.

## Vorgänge

### JOC Cockpit Operationen

Operationen, die für alle sichtbaren, gesunden JOC Cockpit-Instanzen angeboten werden:

- **Switch-over** in einem Cluster übergibt die aktive Rolle an die Standby-Instanz, was 20s bis ca. 60s dauern kann. Die Operation wird für Standby-Instanzen angeboten.
- mit **URL aktualisieren** können Sie die Anzeige-URL ändern. JOC Cockpit kann von mehreren URLs aus zugänglich sein und die zuerst verwendete wird angezeigt. Wenn der Benutzer dies nicht wünscht, kann er die URL angeben, die angezeigt werden soll. Die Operation ändert nicht die URL von JOC Cockpit, sondern seine Anzeige.

Operationen auf JOC Cockpit werden für die Instanz angeboten, mit der der Browser verbunden ist:

- **Dienste neu starten** startet alle Dienste wie Cluster Service, Proxy Service, History Service usw. neu. 
- **Dienst neu starten** ermöglicht den Neustart eines bestimmten Dienstes:
  - **Aufräumdienst** bereinigt die Datenbank von veralteten Informationen, die ihre Aufbewahrungsfrist überschritten haben.
  - **Tagesplan-Service** erstellt Aufträge für den Tagesplan. Der Dienst wird einmal pro Tag ausgeführt, um Aufträge zu erstellen und an Controller und Agenten zu übermitteln.
  - **History Service** empfängt über den *Proxy Service* die Auftragshistorie und die Protokollausgabe von Aufträgen vom Controller.
  - **Log Notification Service** ist ein Syslog-Dienst, der Fehler und Warnungen von registrierten Controller- und Agent-Instanzen empfängt.
  - **Monitor Service** erstellt Benachrichtigungen für die Ansicht *Monitor* und versendet optional Warnungen per E-Mail.
  - **Proxy Service** stellt die Verbindung zur aktiven Controller-Instanz her. Damit können Sie Befehle an den Controller senden und den Auftragsverlauf und die Protokollausgabe von Aufträgen empfangen.
- **Run Service** erzwingt die sofortige Ausführung eines Dienstes:
  - **Aufräumdienst** bereinigt die Datenbank.
  - **Tagesplan-Service** erstellt Aufträge für den Tagesplan. Der Dienst kann beliebig oft pro Tag ausgeführt werden. Ein einzelner Lauf hindert den Dienst nicht daran, zu dem in seinen Einstellungen festgelegten Zeitpunkt zu laufen.
- **Download Log** bietet die joc.log-Datei von JOC Cockpit zum Download in einer .gz-Datei im gzipped-Format an.

### Controller-Operationen

Controller-Instanzen bieten die folgenden Operationen über das 3-Punkte-Aktionsmenü im Rechteck der jeweiligen Instanz an:

- **Beenden**, **Beenden und Neustart** fährt die Instanz herunter. Für die aktive Instanz in einem Cluster wird das Menü erweitert:
  - **mit Umschaltung**, um die aktive Rolle an die Standby-Instanz zu übergeben.
  - **ohne Umschaltung**: um die aktive Rolle bei der aktiven Instanz zu belassen. Benutzer sollten sich darüber im Klaren sein, dass kein Failover stattfindet und dass keine Instanz aktiv ist.
- **Abbrechen**, **Abbrechen und Neustart** beenden die Instanz zwangsweise. Wenn dies auf die aktive Instanz in einem Cluster angewendet wird, wird ein Failover erzwungen:
  - mit **Failover** wird die aktive Rolle an die Standby-Instanz übergeben.
- **Download Log** bietet die Datei controller.log des Controllers zum Download aus einer .gz-Datei im gzipped-Format an.

Das Rechteck Cluster-Status bietet die folgenden Operationen in seinem 3-Punkte-Aktionsmenü an:

- **Umschalten** übergibt die aktive Rolle an die Standby-Instanz. Die Operation ist verfügbar, wenn der Cluster gekoppelt ist.
- **Verlust der Controller-Instanz bestätigen** ist anwendbar, wenn keine JOC Cockpit-Instanz verfügbar war, als eine Controller-Instanz in einem Cluster abgestürzt ist. JOC Cockpit wird als Zeuge im Cluster benötigt. In dieser Situation müssen die Benutzer prüfen, welche Controller-Instanz zum Zeitpunkt des Absturzes im Standby-Modus war und bestätigen, dass die Standby-Instanz heruntergefahren wurde, damit die aktive Instanz wieder aufgenommen werden kann.

