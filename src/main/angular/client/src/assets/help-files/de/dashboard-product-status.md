# Übersicht - Produkt Status

Der Berecih *Produkt Status* enthält Informationen über die folgenden JS7 Produkte:

- **JOC Cockpit** wird zur Überwachung und Steuerung der Umgebung und zur Verwaltung des Inventars verwendet.
- **Controller** orchestriert Agenten und verwaltet die Übermittlung von Aufträgen, Arbeitsabläufen und Jobs.
- **Agenten** führen Aufträge aus. 

JS7 Produkte können im Standalone-Betrieb und im Aktiv-Passiv Clustering eingesetzt werden.

## Komponentenstatus und Verbindungsstatus

### JOC Cockpit

Das JOC Cockpit stellt eine Verbindung zur Datenbank und zu Controller Instanzen her.

- Komponenten-Status
  - Der Status der Komponente wird durch die Farbe der Kachel in der oberen linken Ecke des JOC Cockpit Rechtecks angezeigt.
  - **Eine Kachel in grüner Farbe** zeigt eine gesunde JOC Cockpit Instanz an.
  - **Eine Kachel in roter Farbe** zeigt an, dass der Status unbekannt ist, z.B. mangels Verbindung. 
- Status der Datenbankverbindung
  - **Eine Linie in grüner Farbe** zeigt eine intakte Verbindung an.
  - **Linie in gelber Farbe** zeigt Verbindungsprobleme an, z.B. wenn JOC Cockpit Herzschläge zur Datenbank auslässt.
- Controller Verbindungsstatus
  - **Linie in grüner Farbe** zeigt eine intakte Verbindung zum Controller an.
  - **Linie in roter Farbe** zeigt eine fehlgeschlagene Verbindung zum Controller an.

### Controller

Der Controller stellt eine Verbindung zu Agenten Instanzen her. In einem Controller Cluster halten seine Mitglieder bidirektionale Verbindungen.

- Komponentenstatus
  - Der Status der Komponente wird durch die Farbe der Kachel in der oberen linken Ecke des Controlle Rechtecks angezeigt.
  - **Eine Kachel in grüner Farbe** zeigt eine gesunde Controller Instanz an.
  - **Kachel in gelber Farbe** zeigt eine laufende, ungesunde Controller Instanz an, z.B. wenn die Kopplung in einem Cluster fehlgeschlagen ist. 
  - **Eine Kachel in roter Farbe** zeigt an, dass der Status *unbekannt* ist, z.B. mangels Verbindung. 
- Cluster-Verbindungsstatus
  - **Linie in grüner Farbe** zeigt einen gesunden Cluster an, der aktiv zwischen den Controller Instanzen synchronisiert ist.
  - **Linie in gelber Farbe** weist auf eine Verbindung zwischen den Controller Instanzen ohne erfolgreiche Kopplung hin.
  - **Linie in roter Farbe** zeigt eine fehlgeschlagene Verbindung zwischen den Controller Instanzen an.

## Operationen

### Operationen für JOC Cockpit

Operationen, die für alle sichtbaren, gesunden JOC Cockpit Instanzen angeboten werden:

- **Umschalten** in einem Cluster geht die aktive Rolle an die Standby Instanz über, was 20s bis ca. 60s dauern kann. Die Operation wird für Standby Instanzen angeboten.
- mit **URL aktualisieren** können Sie die Anzeige-URL ändern. JOC Cockpit kann von mehreren URLs aus zugänglich sein und die zuerst verwendete wird angezeigt. Wenn der Benutzer dies nicht wünscht, kann er die URL angeben, die angezeigt werden soll. Die Operation ändert nicht die URL von JOC Cockpit, sondern ihre Anzeige.

Operationen für JOC Cockpit werden für die Instanz angeboten, mit der der Browser verbunden ist:

- **Dienste neu starten** startet alle Dienste wie Cluster-Dienst, Proxy-Dienst, Historiendienst usw. neu. 
- **Dienst neu starten** ermöglicht den Neustart eines bestimmten Dienstes:
  - **Bereinigungsdienst** bereinigt die Datenbank von veralteten Informationen, die ihre Aufbewahrungsfrist überschritten haben.
  - **Tagesplandienst** erstellt Aufträge für den Tagesplan. Der Dienst wird einmal pro Tag ausgeführt, um Aufträge zu erstellen und an Controller und Agenten zu übermitteln.
  - **Historiendienst** empfängt über den *Proxy-Dienst* die Auftragshistorie und die Protokollausgaben von Aufträgen vom Controller.
  - **Protokoll-Benachrichtigungsdienst** ist ein Syslog-Dienst, der Fehler und Warnungen von registrierten Controller und Agenten Instanzen empfängt.
  - **Überwachungsdienst** erstellt Benachrichtigungen für die Ansicht *Überwachung* und versendet optional Warnungen per E-Mail.
  - **Proxy-Dienst** stellt die Verbindung zur aktiven Controller Instanz her. Damit können Sie Befehle an den Controller senden und den Auftragsverlauf und die Protokollausgabe von Aufträgen empfangen.
- **Dienst starten** veranlasst die sofortige Ausführung eines Dienstes:
  - **Bereinigungsdienst** bereinigt die Datenbank.
  - **Tagesplandienst** erstellt Aufträge für den Tagesplan. Der Dienst kann beliebig oft pro Tag ausgeführt werden. Ein einzelner Lauf hindert den Dienst nicht daran, zu dem in seinen Einstellungen festgelegten Zeitpunkt zu laufen.
- **Protokoll herunterladen** bietet die *joc.log* Datei von JOC Cockpit zum Herunterladen an.

### Operationen für Controller

Controller Instanzen bieten die folgenden Operationen über das 3-Punkte Aktionsmenü im Rechteck der jeweiligen Instanz an:

- **Beenden**, **Beenden und neu starten** fährt die Instanz herunter. Für die aktive Instanz in einem Cluster wird das Menü erweitert:
  - **mit Umschaltung**, um die aktive Rolle an die Standby Instanz zu übergeben.
  - **ohne Umschaltung**: um die aktive Rolle bei der aktiven Instanz zu belassen. Benutzer sollten sich bewusst sein, dass keine Aktivierung der Ausfallsichereung erfolgt und dass keine Instanz aktiv ist.
- **Abbrechen**, **Abbrechen und neu starten** beenden die Instanz zwangsweise. Wenn dies auf die aktive Instanz in einem Cluster angewendet wird, wird eine Aktivierung der Ausfallsicherung erzwungen:
  - mit **Ausfallsicherung** wird die aktive Rolle an die Standby Instanz übergeben.
- **Protokoll herunterladen** bietet die Datei *controller.log* des Controller zum Herunterladen aus einer .gz-Datei in komprimiertem Format an.

Das Rechteck *Cluster Status* bietet die folgenden Operationen in seinem 3-Punkte Aktionsmenü an:

- **Umschalten** übergibt die aktive Rolle an die Standby Instanz. Die Operation ist verfügbar, wenn der Cluster gekoppelt ist.
- **Verlust einer Controller Instanz bestätigen** ist anwendbar, wenn keine JOC Cockpit Instanz verfügbar war als eine Controller Instanz in einem Cluster abgebrochen wurde. JOC Cockpit wird als Zeuge im Cluster benötigt. In dieser Situation müssen die Benutzer prüfen, welche Controller Instanz zum Zeitpunkt des Abbrechens im Standby Modus war und bestätigen, dass die Standby Instanz heruntergefahren wurde, damit die aktive Instanz wieder aufgenommen werden kann.
