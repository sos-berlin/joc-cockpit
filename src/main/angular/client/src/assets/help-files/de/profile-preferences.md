# Profil - Einstellungen

Die Registerkarte *Profil - Einstellungen* enthält Einstellungen für ein Benutzerkonto.

Wenn sich ein Benutzer zum ersten Mal mit JOC Cockpit verbindet, werden die Einstellungen des *root* Benutzerkontos in die Einstellungen des Benutzers kopiert. Das *root* Benutzerkonto* wird auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) festgelegt.

## Rollen

Die dem Benutzerkonto zugewiesenen Rollen werden angezeigt. Die daraus resultierenden Berechtigungen werden aus den Rollenzuweisungen zusammengeführt und sind auf der Registerkarte [Profil - Berechtigungen](/profile-permissions) verfügbar.

## Einstellungen

Benutzer können Einstellungen nach Belieben ändern.

### Browser-bezogene Einstellungen

Die Einstellungen in diesem Abschnitt verwenden die Standardwerte des verwendeten Browsers:

- **Sprache** ist die Oberflächensprache von JOC Cockpit, die für Englisch, Französisch, Deutsch und Japanisch verfügbar ist.
- **Zeitzone** gibt die Zeitzone an, in die alle in JOC Cockpit angezeigten Zeiten umgerechnet werden.
- **Format Datum/Uhrzeit** bietet die Auswahl aus einer Liste verfügbarer Formate.

### Einstellungen für Listen

Die Einstellungen beziehen sich auf die Anzeige von Listen in JOC Cockpit. Wenn Sie die Werte erhöhen, sollten Sie die folgenden Auswirkungen berücksichtigen:

- Wenn Sie mehr Daten aus JOC Cockpit lesen, wird die Reaktionsgeschwindigkeit der Benutzeroberfläche nicht verbessert.
- Längere Listen erhöhen den Speicher- und CPU-Verbrauch des Browsers für das Rendering.

Die folgenden Einstellungen, können gemeinsam durch das *Limit für Einstellungsgruppe* verwaltet werden:

- **Max. Anzahl Einträge der Historie** gilt für die Ansicht [Auftragshistorie](/history-orders).
- **Max. Anzahl Einträge des Prüfprotokolls** gilt für die Ansicht [Prüfprotokoll](/audit-log).
- **Max. Anzahl Einträge der Benachrichtigungen** gilt für die Ansichten [Überwachung - Auftragsbenachrichtigungen](/monitor-notifications-order) und [Überwachung - Systembenachrichtigungen](/monitor-notifications-system).
- **Max. Anzahl Einträge der Auftragsübersicht** gilt für die Ansicht [Auftragsübersicht](/orders-overview).
- **Max. Anzahl Einträge des Tagesplans** gilt für die Ansicht [Tagesplan](/daily-plan).
- **Max. Anzahl Aufträge pro Arbeitsablauf** begrenzt die Anzahl der Aufträge, die in der Ansicht [Arbeitsabläufe](/workflows) verfügbar sind.
- **Max. Anzahl Einträge für Dateiübertragungen** gilt für die Ansicht [Dateiübertragungshistorie](/history-file-transfers).
- **Max. Anzahl Aufträge pro Ressourcen-Sperre** begrenzt die Anzahl der Aufträge, die in der Ansicht [Ressourcen - Ressourcen-Sperren](/resources-resource-locks) angezeigt werden.
- **Max. Anzahl Aufträge pro Notizbrett** begrenzt die Anzahl der Aufträge, die in der Ansicht [Ressourcen - Notizbretter](/resources-notice-boards) angezeigt werden.

### Einstellungen für Ansicht Arbeitsabläufe

Die Voreinstellungen gelten für die Ansicht [Arbeitsabläufe](/workflows):

- **Max. Anzahl Einträge der Auftragshistorie pro Arbeitsablauf** begrenzt die Anzahl der Einträge im Bereich *Auftragshistorie*.
- **Max. Anzahl Einträge der Prozesshistorie pro Arbeitsablauf** begrenzt die Anzahl der Einträge im Bereich *Prozesshistorie*.
- **Max. Anzahl Einträge des Prüfprotokolls pro Objekt** begrenzt die Anzahl der Einträge im Bereich *Prüfprotokoll*.

### Einstellungen für Ansicht Konfiguration-Inventar

- **Max. Anzahl Einträge für Favoriten** begrenzt die Anzeige von Favoriten, z.B. bei der Zuweisung eines Agenten an einen Job.

### Einstellungen für Paginierung

Die Einstellungen gelten für die Paginierung auf jeder Seite:

- **Max. Anzahl Einträge pro Seite** begrenzt die Anzahl der Einträge, die auf einer einzelnen Seite sichtbar sind.
- **Voreingestellte Einträge pro Seite** gibt den Standardwert an, der einer der Werte 10, 25, 50, 100 oder 1000 sein kann.

### Einstellungen für Schema und Farben

- **Farbschema** bietet die Möglichkeit, zwischen Schemata zu wechseln. Einige Schemata sind für einen höheren Kontrast vorgesehen, der für Benutzer mit Sehbehinderungen besser geeignet sein kann.
  - **Farben der Auftragszustände ändern** ist über ein Symbol rechts neben *Farbschema* verfügbar und bietet die Möglichkeit, die Standardfarben für [Auftragszustände](/order-states) zu ändern. Es könnte verwirrend aussehen, Farben zu ändern, die in der JS7 Dokumentation anders dargestellt sind. Für Benutzer mit Sehbehinderungen könnte dies jedoch hilfreich sein: Sie können RGB-Werte für jede Farbe angeben, die für einen Auftragszustand verwendet wird.
- **Farbe der Menüleiste** ist verfügbar, wenn das Thema *Hell* verwendet wird. Damit können Sie die Hintergrundfarbe der Menüleiste ändern. Die Einstellung kann z.B. verwendet werden, wenn Benutzer mit verschiedenen JS7 Umgebungen (Dev, Test, Prod) arbeiten: Die Verwendung unterschiedlicher Hintergrundfarben hilft bei der Identifizierung der jeweiligen JS7 Umgebung.
- **Titel bei Farbschema** wird direkt unter der Menüleiste angezeigt. Ähnlich wie bei der *Farbe der Menüleiste* kann dies zur Identifizierung der entsprechenden JS7 Umgebung verwendet werden.

### Einstellungen für Editor

- **Tabulatorbreite** wird auf der Registerkarte [Konfiguration - Inventar - Arbeitsablauf - Job-Eigenschaften](/configuration-inventory-workflow-job-properties) verwendet, wenn Sie das *Job-Skript* bearbeiten. Die Einstellung gibt die Anzahl der Leerzeichen an, die der Größe entsprechen, wenn Sie die TAB-Taste drücken.

### Einstellungen für Ansichten

- **Protokolle anzeigen** legt die Anzeige von [Anzeige Auftragsprotokoll](/order-log) und [Anzeige Job-Protokoll](/task-log) fest. Beide Protokollansichten ermöglichen die Anzeige und das Herunterladen von Protokollen.
- **Dokumentationen anzeigen** legt die Anzeige der Benutzerdokumentation für Arbeitsabläufe und Jobs fest.

### Einstellungen für Ansicht Konfiguration-Navigation

- **Ordner und Inhalt der Unterordner anzeigen** regelt das Verhalten beim Klicken auf einen Ordner im *Navigationsbereich* der Ansicht *Konfiguration-&gt;Inventar*, um entweder nur die verfügbaren Objekte oder die verfügbaren Objekte und Unterordner anzuzeigen.

### Gemischte Einstellungen

- **Dateien sofort in der Dateitübertragungsansicht anzeigen** ist nützlich, wenn jede Dateiübertragung eine absehbare Anzahl von Dateien umfasst. Für einzelne Übertragungen, die Tausende von Dateien umfassen können, sollten Sie diese Einstellung deaktivieren.
- **Begründungen für Prüfprotokoll aktivieren** zwingt den Benutzer, einen Grund anzugeben, wenn er Objekte ändert, z.B. Aufträge hinzufügt oder abbricht, Arbeitsabläufe aussetzt usw. Die Einstellung kann über die entsprechende Seite [Einstellungen - JOC Cockpit](/settings-joc) überregelt werden.
- **Zeitzone für Zeitstempel der Protokolle verwenden** ist anwendbar, wenn Agenten auf Servern in verschiedenen Zeitzonen oder in einer anderen Zeitzone als der des Controller Servers laufen. In dieser Situation könnte ein Auftragsprotokoll, das die Protokollausgabe einer Reihe von Jobs enthält, die mit möglicherweise unterschiedlichen Agenten ausgeführt wurden, verwirrend aussehen. Die Einstellung konvertiert die Zeitstempel des Protokolls in die im Benutzerprofil angegebene *Zeitzone*.
- **Aktueller Controller** gilt, wenn mehr als ein Controller mit JOC Cockpit verbunden ist. Die Option wird in einer Reihe von Ansichten angeboten, zum Beispiel in der Ansicht [Auftragshistorie](/history-orders). Wenn diese Option aktiviert ist, wird die Anzeige auf Aufträge beschränkt, die an den aktuell ausgewählten Controller übermittelt wurden, andernfalls werden Aufträge aller verbundenen Controller angezeigt. Die Einstellung bestimmt den Standardwert für verwandte *Aktueller Controller*-Optionen in JOC Cockpit Ansichten.
- **Kurzinfo für Objekte des Inventars ausschalten** bezieht sich auf die Ansicht *Konfiguration-&gt;Inventar*, die Kurzinfos anbietet, zum Beispiel für [Konfiguration - Inventar - Arbeitsablauf - Job-Eigenschaften](/configuration-inventory-workflow-job-properties). Kurzinfos werden eingeblendet, wenn die Maus auf die Beschriftung eines Eingabefeldes bewegt wird, um den Benutzern die möglichen Eingaben zu erläutern. Während dies für Benutzer, die mit JS7 nicht allzu vertraut sind, nützlich ist, sind Kurzinfos für erfahrene Benutzer möglicherweise nicht erforderlich.
- **Lizenzwarnung akzeptiert** bezieht sich auf die Verwendung von Subskriptionslizenzen, die in der Regel auf ein Jahr begrenzt sind. Vor Ablauf der Lizenz werden entsprechende Warnungen von JOC Cockpit angezeigt. Der Benutzer kann die Warnungen zum Ablauf der Lizenz unterdrücken. Details finden Sie unter [JS7 - How to manage License Expiration Warnings](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+manage+License+Expiration+Warnings).
- **Mehr Optionen anzeigen** aktiviert den entsprechenden Schieberegler in der Ansicht *Konfiguration-&gt;Inventar*. Er bietet detailliertere Optionen für die Auftragskonfiguration, zum Beispiel auf der Registerkarte [Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options).
- **Listenvariable einklappen** gilt für die Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows), die die Angabe von Arbeitsablauf-Variablen aus einer Reihe von Datentypen bietet. Wenn der Datentyp *Liste* (Array) verwendet wird, kann er eine größere Anzahl von Einträgen aufnehmen. Die Benutzer möchten möglicherweise nicht sofort sehen, dass die Listenvariablen bei der Bearbeitung eines Arbeitsablaufs erweitert werden.

### Einstellungen für Ansichtstyp

- **Ansicht anzeigen** gilt für eine Reihe von Ansichten, die den entsprechenden Indikator in der oberen rechten Ecke des Fensters anbieten. Die Einstellung legt den Ansichtstyp fest, der standardmäßig verwendet wird. Sie können den Ansichtstyp bei Bedarf in jeder Ansicht ändern. Der Ansichtstyp *Karte* benötigt mehr Platz auf dem Bildschirm als der Ansichtstyp *Liste*. Einige Benutzer bevorzugen jedoch vielleicht die Sichtbarkeit von Karten.
- **Übersicht der Aufträge anzeigen** ähnelt der Einstellung *Ansicht anzeigen*, gilt aber für die Ansicht [Auftragsübersicht](/orders-overview). Zusätzlich bietet die Ansicht den Ansichtstyp *Bulk*, der die Transition von Auftragszuständen durch Massenoperationen ermöglicht.

### Einstellungen für das Layout von Arbeitsabläufen

Die Einstellungen gelten für die Anzeige von Arbeitsablauf-Anweisungen in der Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows):

- mit **Ausrichtung** können Sie die Anzeige von Arbeitsabläufen auf vertikale oder horizontale Darstellung umstellen. Die Verwendung der horizontalen *Orientierung* bringt Vorteile bei der Gestaltung von Arbeitsabläufen mit einer größeren Anzahl von Jobs und anderen Anweisungen.
- mit **Abstände zwischen Anweisungen auf benachbarten Ebenen** können Sie den Abstand zwischen vertikalen Arbeitsablauf-Anweisungen ändern.
- mit **Abstände zwischen Anweisungen derselben Ebene** können Sie den Abstand zwischen horizontalen Arbeitsablauf-Anweisungen ändern.
- **Runde Kanten für Verbindungen** glättet die Kanten bei der Anzeige von Arbeitsablauf-Anweisungen, z.B. von Jobs.

## Referenzen

### Kontext-Hilfe

- [Anzeige Auftragsprotokoll](/order-log)
- [Anzeige Job-Protokoll](/task-log)
- [Arbeitsabläufe](/workflows)
- [Auftragshistorie](/history-orders)
- [Auftragsübersicht](/orders-overview)
- [Auftragszustände](/order-states)
- [Dateiübertragungshistorie](/history-file-transfers)
- [Einstellungen - JOC Cockpit](/settings-joc)
- [Einstellungen - Tagesplan](/settings-daily-plan)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
  - [Konfiguration - Inventar - Arbeitsablauf - Job-Optionen](/configuration-inventory-workflow-job-options)
  - [Konfiguration - Inventar - Arbeitsablauf - Job-Eigenschaften](/configuration-inventory-workflow-job-properties)
- [Profil](/profile)
   - [Profil - Berechtigungen](/profile-permissions)
- [Prüfprotokoll](/audit-log)
- [Ressourcen - Notizbretter](/resources-notice-boards)
- [Ressourcen - Ressourcen-Sperren](/resources-resource-locks)
- [Tagesplan](/daily-plan)

### Product Knowledge Base

- [JS7 - Audit Log](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Log)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - File Transfer History](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Transfer+History)
- [JS7 - How to manage License Expiration Warnings](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+manage+License+Expiration+Warnings)
- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Order State Transitions](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+State+Transitions)
- [JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
